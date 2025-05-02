import { useState } from 'react';
import { generateForecast } from '../api/services';

/**
 * Custom hook for generating and managing forecast data
 * @param {string} initialMetric - Initial metric to forecast
 * @param {string} initialModel - Initial forecasting model
 * @returns {Object} - Forecast state and functions to update it
 */
const useForecasting = (initialMetric = 'revenue', initialModel = 'arima') => {
  const [metric, setMetric] = useState(initialMetric);
  const [model, setModel] = useState(initialModel);
  const [forecastData, setForecastData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Generate forecast
  const generateForecastData = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Merge params with current state
      const mergedParams = {
        metric: metric,
        model: model,
        ...params
      };
      
      // Call the generate forecast service
      const data = await generateForecast(mergedParams);
      setForecastData(data);
      
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err.message || 'An error occurred while generating forecast');
      setIsLoading(false);
      return null;
    }
  };
  
  // Change metric
  const changeMetric = (newMetric) => {
    setMetric(newMetric);
    return metric;
  };
  
  // Change model
  const changeModel = (newModel) => {
    setModel(newModel);
    return model;
  };
  
  return {
    metric,
    model,
    forecastData,
    isLoading,
    error,
    generateForecastData,
    changeMetric,
    changeModel
  };
};

export default useForecasting;