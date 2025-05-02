import { createContext, useContext, useState, useEffect } from 'react';
import { fetchFinancialData } from '../api/services';
import { AVAILABLE_YEARS } from '../utils/constants';

const DataContext = createContext();

export const useData = () => {
  return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
  const [financialData, setFinancialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states - only select the most recent year by default
  const [selectedYears, setSelectedYears] = useState([2024]);
  const [selectedCurrency, setSelectedCurrency] = useState('LKR');
  const [selectedIndustryGroups, setSelectedIndustryGroups] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonMetrics, setComparisonMetrics] = useState([]);
  const [isMultiYearSelection, setIsMultiYearSelection] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchFinancialData();
        setFinancialData(data);
        
        // Initialize industry groups from data
        if (data && data.industryGroups) {
          setSelectedIndustryGroups(data.industryGroups);
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle year selection based on mode
  const toggleYearSelection = (year) => {
    if (isMultiYearSelection) {
      // Multi-year selection mode
      setSelectedYears(prev => {
        // If clicking an already selected year, deselect it
        if (prev.includes(year)) {
          // But don't allow deselecting all years
          if (prev.length === 1) {
            return prev;
          }
          return prev.filter(y => y !== year);
        }
        // Otherwise add the year
        return [...prev, year].sort();
      });
    } else {
      // Single year selection mode
      setSelectedYears(prev => {
        // If the year is already selected, don't allow deselection
        if (prev.includes(year) && prev.length === 1) {
          return prev;
        }
        // Otherwise, select only this year
        return [year];
      });
    }
  };

  // Toggle selection mode
  const toggleMultiYearSelection = () => {
    setIsMultiYearSelection(prev => {
      const newMode = !prev;
      // If switching to single year mode, keep only the most recent selected year
      if (!newMode && selectedYears.length > 1) {
        const mostRecentYear = [...selectedYears].sort((a, b) => b - a)[0];
        setSelectedYears([mostRecentYear]);
      }
      return newMode;
    });
  };

  // Select all years
  const selectAllYears = () => {
    setSelectedYears([...AVAILABLE_YEARS]);
    // If not in multi-year mode, switch to it
    if (!isMultiYearSelection) {
      setIsMultiYearSelection(true);
    }
  };

  // Handle currency change
  const changeCurrency = (currency) => {
    setSelectedCurrency(currency);
  };

  // Handle industry group selection
  const toggleIndustryGroup = (group) => {
    setSelectedIndustryGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group) 
        : [...prev, group]
    );
  };

  // Toggle comparison mode
  const toggleComparisonMode = () => {
    setComparisonMode(prev => !prev);
  };

  // Update comparison metrics
  const updateComparisonMetrics = (metrics) => {
    setComparisonMetrics(metrics);
  };

  // Filter data based on selected filters
  const filteredData = financialData ? {
    ...financialData,
    yearlyData: financialData.yearlyData.filter(item => 
      selectedYears.includes(item.year) && 
      (selectedIndustryGroups.length === 0 || 
        selectedIndustryGroups.some(group => 
          item.industryGroups && item.industryGroups.includes(group)
        )
      )
    )
  } : null;

  const value = {
    data: filteredData,
    isLoading,
    error,
    selectedYears,
    selectedCurrency,
    selectedIndustryGroups,
    comparisonMode,
    comparisonMetrics,
    isMultiYearSelection,
    toggleYearSelection,
    toggleMultiYearSelection,
    selectAllYears,
    changeCurrency,
    toggleIndustryGroup,
    toggleComparisonMode,
    updateComparisonMetrics
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};