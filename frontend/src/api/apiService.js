import axios from 'axios';

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch all financial data
 * @returns {Promise} Promise that resolves to the financial data
 */
export const fetchFinancialData = async () => {
  try {
    const response = await axios.get(`${API_URL}/financial-data`);
    return response.data;
  } catch (error) {
    console.error('Error fetching financial data:', error);
    throw error;
  }
};

/**
 * Fetch revenue data with optional filters
 * @param {Object} filters - Optional filters (years, industryGroups)
 * @returns {Promise} Promise that resolves to the revenue data
 */
export const fetchRevenueData = async (filters = {}) => {
  try {
    let url = `${API_URL}/revenue`;
    
    // Add query parameters if filters are provided
    if (filters.years || filters.industryGroups) {
      const params = new URLSearchParams();
      
      if (filters.years) {
        params.append('years', filters.years);
      }
      
      if (filters.industryGroups) {
        params.append('industryGroups', filters.industryGroups);
      }
      
      url = `${url}?${params.toString()}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    throw error;
  }
};

/**
 * Fetch cost vs expenses data
 * @param {Object} filters - Optional filters (years, industryGroups)
 * @returns {Promise} Promise that resolves to the cost vs expenses data
 */
export const fetchCostVsExpenses = async (filters = {}) => {
  try {
    let url = `${API_URL}/cost-vs-expenses`;
    
    // Add query parameters if filters are provided
    if (filters.years || filters.industryGroups) {
      const params = new URLSearchParams();
      
      if (filters.years) {
        params.append('years', filters.years);
      }
      
      if (filters.industryGroups) {
        params.append('industryGroups', filters.industryGroups);
      }
      
      url = `${url}?${params.toString()}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching cost vs expenses data:', error);
    throw error;
  }
};

/**
 * Fetch gross profit margin data
 * @param {Object} filters - Optional filters (years, industryGroups)
 * @returns {Promise} Promise that resolves to the gross profit margin data
 */
export const fetchGrossProfitMargin = async (filters = {}) => {
  try {
    let url = `${API_URL}/gross-profit-margin`;
    
    // Add query parameters if filters are provided
    if (filters.years || filters.industryGroups) {
      const params = new URLSearchParams();
      
      if (filters.years) {
        params.append('years', filters.years);
      }
      
      if (filters.industryGroups) {
        params.append('industryGroups', filters.industryGroups);
      }
      
      url = `${url}?${params.toString()}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching gross profit margin data:', error);
    throw error;
  }
};

/**
 * Fetch EPS data
 * @param {Object} filters - Optional filters (years, industryGroups)
 * @returns {Promise} Promise that resolves to the EPS data
 */
export const fetchEPS = async (filters = {}) => {
  try {
    let url = `${API_URL}/eps`;
    
    // Add query parameters if filters are provided
    if (filters.years || filters.industryGroups) {
      const params = new URLSearchParams();
      
      if (filters.years) {
        params.append('years', filters.years);
      }
      
      if (filters.industryGroups) {
        params.append('industryGroups', filters.industryGroups);
      }
      
      url = `${url}?${params.toString()}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching EPS data:', error);
    throw error;
  }
};

/**
 * Fetch net asset per share data
 * @param {Object} filters - Optional filters (years, industryGroups)
 * @returns {Promise} Promise that resolves to the net asset per share data
 */
export const fetchNetAssetPerShare = async (filters = {}) => {
  try {
    let url = `${API_URL}/net-asset-per-share`;
    
    // Add query parameters if filters are provided
    if (filters.years || filters.industryGroups) {
      const params = new URLSearchParams();
      
      if (filters.years) {
        params.append('years', filters.years);
      }
      
      if (filters.industryGroups) {
        params.append('industryGroups', filters.industryGroups);
      }
      
      url = `${url}?${params.toString()}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching net asset per share data:', error);
    throw error;
  }
};

/**
 * Fetch right issues data
 * @returns {Promise} Promise that resolves to the right issues data
 */
export const fetchRightIssues = async () => {
  try {
    const response = await axios.get(`${API_URL}/right-issues`);
    return response.data;
  } catch (error) {
    console.error('Error fetching right issues data:', error);
    throw error;
  }
};

/**
 * Fetch shareholders data for a specific year
 * @param {number} year - The year to fetch shareholders data for
 * @returns {Promise} Promise that resolves to the shareholders data
 */
export const fetchShareholders = async (year) => {
  try {
    const response = await axios.get(`${API_URL}/shareholders?year=${year}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching shareholders data:', error);
    throw error;
  }
};

/**
 * Fetch dashboard overview data
 * @returns {Promise} Promise that resolves to the dashboard overview data
 */
export const fetchDashboardOverview = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard-overview`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard overview data:', error);
    throw error;
  }
};

/**
 * Fetch yearly comparison data
 * @param {string} metrics - Comma-separated metrics to compare (default: 'revenue,grossProfit,eps')
 * @returns {Promise} Promise that resolves to the yearly comparison data
 */
export const fetchYearlyComparison = async (metrics) => {
  try {
    let url = `${API_URL}/yearly-comparison`;
    
    if (metrics) {
      url = `${url}?metrics=${metrics}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching yearly comparison data:', error);
    throw error;
  }
};

/**
 * Fetch financial ratios data
 * @param {Object} filters - Optional filters (years)
 * @returns {Promise} Promise that resolves to the financial ratios data
 */
export const fetchFinancialRatios = async (filters = {}) => {
  try {
    let url = `${API_URL}/financial-ratios`;
    
    if (filters.years) {
      url = `${url}?years=${filters.years}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching financial ratios data:', error);
    throw error;
  }
};

/**
 * Fetch industry breakdown data for a specific year
 * @param {number} year - The year to fetch industry breakdown for
 * @returns {Promise} Promise that resolves to the industry breakdown data
 */
export const fetchIndustryBreakdown = async (year) => {
  try {
    const response = await axios.get(`${API_URL}/industry-breakdown?year=${year}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching industry breakdown data:', error);
    throw error;
  }
};

/**
 * Generate a forecast
 * @param {Object} params - Parameters for the forecast
 * @param {string} params.metric - The metric to forecast (e.g. 'revenue')
 * @param {string} params.model - The model to use (e.g. 'linear', 'arima')
 * @param {number} params.forecastYears - Number of years to forecast
 * @returns {Promise} Promise that resolves to the forecast data
 */
export const generateForecast = async (params) => {
  try {
    const response = await axios.post(`${API_URL}/forecast`, params);
    return response.data;
  } catch (error) {
    console.error('Error generating forecast:', error);
    throw error;
  }
};

/**
 * Generate an industry-specific forecast
 * @param {Object} params - Parameters for the forecast
 * @param {string} params.metric - The metric to forecast (e.g. 'revenue')
 * @param {string} params.industryGroup - The industry group to forecast for
 * @param {string} params.model - The model to use (e.g. 'linear', 'arima')
 * @param {number} params.forecastYears - Number of years to forecast
 * @returns {Promise} Promise that resolves to the forecast data
 */
export const generateIndustryForecast = async (params) => {
  try {
    const response = await axios.post(`${API_URL}/industry-forecast`, params);
    return response.data;
  } catch (error) {
    console.error('Error generating industry forecast:', error);
    throw error;
  }
};

/**
 * Generate a multi-metric forecast
 * @param {Object} params - Parameters for the forecast
 * @param {Array<string>} params.metrics - Array of metrics to forecast (e.g. ['revenue', 'eps'])
 * @param {string} params.model - The model to use (e.g. 'linear', 'arima')
 * @param {number} params.forecastYears - Number of years to forecast
 * @param {string} params.industryGroup - Optional industry group to forecast for
 * @returns {Promise} Promise that resolves to the multi-metric forecast data
 */
export const generateMultiMetricForecast = async (params) => {
  try {
    const response = await axios.post(`${API_URL}/multi-metric-forecast`, params);
    return response.data;
  } catch (error) {
    console.error('Error generating multi-metric forecast:', error);
    throw error;
  }
}; 