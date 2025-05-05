import { useState, useEffect, useCallback } from 'react';
import { generateForecast, generateIndustryForecast } from '../api/services';

/**
 * Custom hook for generating and managing forecast data
 * @param {string} initialMetric - Initial metric to forecast
 * @param {string} initialModel - Initial forecasting model
 * @param {string|null} initialIndustryGroup - Initial industry group to filter
 * @returns {Object} - Forecast state and functions to update it
 */
const useForecasting = (initialMetric = 'revenue', initialModel = 'arima', initialIndustryGroup = null) => {
  const [metric, setMetric] = useState(initialMetric);
  const [model, setModel] = useState(initialModel);
  const [industryGroup, setIndustryGroup] = useState(initialIndustryGroup);
  const [forecastData, setForecastData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Generate forecast
  const generateForecastData = useCallback(async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const mergedParams = {
        metric,
        model,
        ...params
      };
      
      // Determine if we need to use industry-specific forecasting
      const apiFunc = mergedParams.industryGroup 
        ? generateIndustryForecast 
        : generateForecast;
      
      // Call the appropriate forecast service
      const data = await apiFunc(mergedParams);
      setForecastData(data);
      
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'An error occurred while generating forecast');
      console.error('Forecast generation error:', err);
      return null;
    }
  }, [metric, model, industryGroup]);
  
  // Change metric
  const changeMetric = useCallback((newMetric) => {
    if (newMetric !== metric) {
      setMetric(newMetric);
    }
  }, [metric]);
  
  // Change model
  const changeModel = useCallback((newModel) => {
    if (newModel !== model) {
      setModel(newModel);
    }
  }, [model]);
  
  // Change industry group
  const changeIndustryGroup = useCallback((newIndustryGroup) => {
    if (newIndustryGroup !== industryGroup) {
      setIndustryGroup(newIndustryGroup);
    }
  }, [industryGroup]);
  
  return {
    metric,
    model,
    industryGroup,
    forecastData,
    isLoading,
    error,
    generateForecastData,
    changeMetric,
    changeModel,
    changeIndustryGroup
  };
};

export default useForecasting;