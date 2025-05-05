import { createContext, useContext, useState, useEffect } from 'react';
import { fetchFinancialData, fetchRightIssuesData } from '../api/services';
import { AVAILABLE_YEARS } from '../utils/constants';

const DataContext = createContext();

export const useData = () => {
  return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
  const [financialData, setFinancialData] = useState(null);
  const [rightIssuesData, setRightIssuesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Default to most recent year (this will be updated when data loads)
  const mostRecentYear = Math.max(...AVAILABLE_YEARS);
  
  // Filter states
  const [selectedYears, setSelectedYears] = useState([mostRecentYear]);
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
        setError(null);
        
        console.log("Fetching financial data from API...");
        const data = await fetchFinancialData();
        console.log("Financial data received:", data);
        
        if (!data) {
          throw new Error("No data received from the API");
        }
        
        // Normalize the data structure if needed
        const normalizedData = {
          ...data,
          // Ensure yearlyData is an array
          yearlyData: Array.isArray(data.yearlyData) ? data.yearlyData : []
        };
        
        setFinancialData(normalizedData);
        
        // Load right issues data separately
        try {
          console.log("Fetching right issues data separately...");
          const rightIssues = await fetchRightIssuesData();
          console.log("Right issues data received:", rightIssues);
          setRightIssuesData(rightIssues || []);
        } catch (rightIssuesError) {
          console.error("Error loading right issues data:", rightIssuesError);
          // Don't fail the whole data load if right issues fails
        }
        
        // Determine the most recent year
        if (normalizedData.yearlyData && normalizedData.yearlyData.length > 0) {
          const availableYears = normalizedData.yearlyData.map(item => item.year);
          const mostRecentYear = Math.max(...availableYears);
          setSelectedYears([mostRecentYear]);
          
          // Set available industry groups if they exist in the data
          if (normalizedData.industryGroups && normalizedData.industryGroups.length > 0) {
            setSelectedIndustryGroups(normalizedData.industryGroups);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading financial data:", err);
        setError(err.message || "Failed to load financial data");
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
    rightIssues: rightIssuesData,
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