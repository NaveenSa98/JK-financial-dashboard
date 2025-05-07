import api from './index';

// Fetch all financial data
export const fetchFinancialData = async () => {
  try {
    const response = await api.get('/financial-data');
    return response;
  } catch (error) {
    console.error('Error fetching financial data:', error);
    throw error;
  }
};

// Fetch revenue data
export const fetchRevenueData = async (params) => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params.years) {
      queryParams.append('years', params.years.join(','));
    }
    if (params.industryGroups) {
      queryParams.append('industryGroups', params.industryGroups.join(','));
    }
    
    const response = await api.get(`/revenue?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    throw error;
  }
};

// Fetch cost vs expenses data
export const fetchCostVsExpensesData = async (params) => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params.years) {
      queryParams.append('years', params.years.join(','));
    }
    if (params.industryGroups) {
      queryParams.append('industryGroups', params.industryGroups.join(','));
    }
    
    const response = await api.get(`/cost-vs-expenses?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching cost vs expenses data:', error);
    throw error;
  }
};

// Fetch gross profit margin data
export const fetchGrossProfitMarginData = async (params) => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params.years) {
      queryParams.append('years', params.years.join(','));
    }
    if (params.industryGroups) {
      queryParams.append('industryGroups', params.industryGroups.join(','));
    }
    
    const response = await api.get(`/gross-profit-margin?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching gross profit margin data:', error);
    throw error;
  }
};

// Fetch EPS data
export const fetchEPSData = async (params) => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params.years) {
      queryParams.append('years', params.years.join(','));
    }
    if (params.industryGroups) {
      queryParams.append('industryGroups', params.industryGroups.join(','));
    }
    
    const response = await api.get(`/eps?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching EPS data:', error);
    throw error;
  }
};

// Fetch net asset per share data
export const fetchNetAssetPerShareData = async (params) => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params.years) {
      queryParams.append('years', params.years.join(','));
    }
    if (params.industryGroups) {
      queryParams.append('industryGroups', params.industryGroups.join(','));
    }
    
    const response = await api.get(`/net-asset-per-share?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching net asset per share data:', error);
    throw error;
  }
};

// Fetch right issues data
export const fetchRightIssuesData = async () => {
  try {
    console.log("Making API request to /right-issues");
    const response = await api.get('/right-issues');
    console.log("API response:", response);
    
    // Validate the response data
    if (!Array.isArray(response)) {
      console.error('Invalid right issues data format received:', response);
      // Try to extract data if it's wrapped in an object
      if (response && Array.isArray(response.rightIssues)) {
        console.log("Found rightIssues array within response");
        return response.rightIssues;
      }
      return [];
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching right issues data:', error);
    return [];
  }
};

// Fetch shareholders data
export const fetchShareholdersData = async (params) => {
  try {
    const year = params?.year;
    const queryParams = year ? `?year=${year}` : '';
    const response = await api.get(`/shareholders${queryParams}`);
    return response;
  } catch (error) {
    console.error('Error fetching shareholders data:', error);
    throw error;
  }
};

// Fetch dashboard overview data
export const fetchDashboardOverview = async () => {
  try {
    console.log("Calling dashboard-overview API endpoint");
    const response = await api.get('/dashboard-overview');
    console.log("Dashboard overview API response:", response);
    
    // Validate the response
    if (!response || (response.error && !response.latestYear)) {
      console.error("Invalid dashboard overview response:", response);
      throw new Error(response.error || "Invalid dashboard data received");
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    throw error;
  }
};

// Fetch yearly comparison data
export const fetchYearlyComparison = async (params) => {
  try {
    const metrics = params?.metrics || 'revenue,grossProfit,eps';
    const queryParams = `?metrics=${metrics}`;
    const response = await api.get(`/yearly-comparison${queryParams}`);
    return response;
  } catch (error) {
    console.error('Error fetching yearly comparison data:', error);
    throw error;
  }
};

// Fetch financial ratios
export const fetchFinancialRatios = async (params) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.years) {
      queryParams.append('years', params.years.join(','));
    }
    
    const response = await api.get(`/financial-ratios?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching financial ratios:', error);
    throw error;
  }
};

// Fetch industry breakdown
export const fetchIndustryBreakdown = async (params) => {
  try {
    const year = params?.year || new Date().getFullYear();
    const response = await api.get(`/industry-breakdown?year=${year}`);
    return response;
  } catch (error) {
    console.error('Error fetching industry breakdown:', error);
    throw error;
  }
};

// Generate AI insights
export const generateAIInsights = async (params) => {
  try {
    console.log("Making API request to /ai-insights with params:", params);
    const response = await api.post('/ai-insights', params);
    console.log("API response from /ai-insights:", response);
    return response;
  } catch (error) {
    console.error('Error generating AI insights:', error);
    throw error;
  }
};

// Analyze report content for text-based insights
export const analyzeReportContent = async (params) => {
  try {
    console.log("Making API request to /analyze-report with params:", params);
    const response = await api.post('/analyze-report', params);
    console.log("API response from /analyze-report:", response);
    return response;
  } catch (error) {
    console.error('Error analyzing report content:', error);
    throw error;
  }
};

// Analyze keyword trends across multiple reports
export const analyzeKeywordTrends = async (params) => {
  try {
    const response = await api.post('/keyword-trends', params);
    return response;
  } catch (error) {
    console.error('Error analyzing keyword trends:', error);
    throw error;
  }
};

// Forecast future trends
export const generateForecast = async (params) => {
  try {
    console.log("Generating forecast with params:", params);
    const response = await api.post('/forecast', params);
    return response;
  } catch (error) {
    console.error('Error generating forecast:', error);
    if (error.message.includes('timeout')) {
      throw new Error('Forecast generation timed out. Please try with fewer years or a different metric.');
    }
    throw error;
  }
};

// Generate industry-specific forecasts with retry logic
export const generateIndustryForecast = async (params) => {
  const MAX_RETRIES = 2;
  let retries = 0;
  
  const attemptForecast = async () => {
    try {
      console.log(`Generating industry forecast (attempt ${retries + 1}/${MAX_RETRIES + 1})`, params);
      const response = await api.post('/industry-forecast', params);
      return response;
    } catch (error) {
      console.error(`Error generating industry forecast (attempt ${retries + 1}):`, error);
      
      // If we haven't exceeded max retries and it's a timeout error, retry
      if (retries < MAX_RETRIES && error.message.includes('timeout')) {
        retries++;
        console.log(`Retrying industry forecast (attempt ${retries + 1}/${MAX_RETRIES + 1})...`);
        return attemptForecast();
      }
      
      // Format more specific error messages
      if (error.message.includes('timeout')) {
        throw new Error('Industry comparison timed out. LSTM processing is resource-intensive for multiple industries. Try selecting fewer industries or a simpler metric.');
      }
      throw error;
    }
  };
  
  return attemptForecast();
};

// Generate multi-metric forecasts with retry logic
export const generateMultiMetricForecast = async (params) => {
  const MAX_RETRIES = 2;
  let retries = 0;
  
  const attemptForecast = async () => {
    try {
      console.log(`Generating multi-metric forecast (attempt ${retries + 1}/${MAX_RETRIES + 1})`, params);
      const response = await api.post('/multi-metric-forecast', params);
      return response;
    } catch (error) {
      console.error(`Error generating multi-metric forecast (attempt ${retries + 1}):`, error);
      
      // If we haven't exceeded max retries and it's a timeout error, retry
      if (retries < MAX_RETRIES && error.message.includes('timeout')) {
        retries++;
        console.log(`Retrying multi-metric forecast (attempt ${retries + 1}/${MAX_RETRIES + 1})...`);
        return attemptForecast();
      }
      
      // Format more specific error messages
      if (error.message.includes('timeout')) {
        throw new Error('Multi-metric comparison timed out. LSTM processing is resource-intensive for multiple metrics. Try selecting fewer metrics or reducing the forecast period.');
      }
      throw error;
    }
  };
  
  return attemptForecast();
};