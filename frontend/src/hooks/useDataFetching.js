import { useState, useEffect } from 'react';

/**
 * Custom hook for fetching data with loading and error states
 * @param {Function} fetchFunction - The fetch function to call
 * @param {Object} params - Parameters to pass to the fetch function
 * @param {boolean} immediate - Whether to fetch immediately or wait for manual trigger
 * @returns {Object} - The data, loading state, error state, and a function to trigger the fetch
 */
const useDataFetching = (fetchFunction, params = {}, immediate = true) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Function to fetch data
  const fetchData = async (customParams = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Merge default params with custom params
      const mergedParams = { ...params, ...customParams };
      
      // Call the fetch function
      const result = await fetchFunction(mergedParams);
      setData(result);
      
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
      setIsLoading(false);
      return null;
    }
  };
  
  // Fetch data immediately if immediate is true
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate]);
  
  return { data, isLoading, error, fetchData };
};

export default useDataFetching;