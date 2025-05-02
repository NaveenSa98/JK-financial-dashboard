import api from './index';

// For development, we'll use mock data until the backend is ready
import mockData from '../utils/mockData';

// Fetch all financial data
export const fetchFinancialData = async () => {
  try {
    // Comment this for development with mock data
    // const response = await api.get('/financial-data');
    // return response;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockData;
  } catch (error) {
    console.error('Error fetching financial data:', error);
    throw error;
  }
};

// Fetch revenue data
export const fetchRevenueData = async (params) => {
  try {
    // const response = await api.get('/revenue', { params });
    // return response;
    
    // Filter mock data based on params
    await new Promise(resolve => setTimeout(resolve, 600));
    const filteredData = mockData.yearlyData
      .filter(item => 
        (!params.years || params.years.includes(item.year)) &&
        (!params.industryGroups || 
          params.industryGroups.some(group => 
            item.industryGroups && item.industryGroups.includes(group)
          )
        )
      )
      .map(item => ({
        year: item.year,
        revenue: item.financials.revenue,
        currency: params.currency || 'LKR'
      }));
      
    return filteredData;
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    throw error;
  }
};

// Fetch cost vs expenses data
export const fetchCostVsExpensesData = async (params) => {
  try {
    // const response = await api.get('/cost-vs-expenses', { params });
    // return response;
    
    // Filter mock data
    await new Promise(resolve => setTimeout(resolve, 700));
    const filteredData = mockData.yearlyData
      .filter(item => 
        (!params.years || params.years.includes(item.year)) &&
        (!params.industryGroups || 
          params.industryGroups.some(group => 
            item.industryGroups && item.industryGroups.includes(group)
          )
        )
      )
      .map(item => ({
        year: item.year,
        costOfSales: item.financials.costOfSales,
        operatingExpenses: item.financials.operatingExpenses,
        currency: params.currency || 'LKR'
      }));
      
    return filteredData;
  } catch (error) {
    console.error('Error fetching cost vs expenses data:', error);
    throw error;
  }
};

// Fetch gross profit margin data
export const fetchGrossProfitMarginData = async (params) => {
  try {
    // const response = await api.get('/gross-profit-margin', { params });
    // return response;
    
    // Calculate from mock data
    await new Promise(resolve => setTimeout(resolve, 650));
    const filteredData = mockData.yearlyData
      .filter(item => 
        (!params.years || params.years.includes(item.year)) &&
        (!params.industryGroups || 
          params.industryGroups.some(group => 
            item.industryGroups && item.industryGroups.includes(group)
          )
        )
      )
      .map(item => {
        const revenue = item.financials.revenue;
        const costOfSales = item.financials.costOfSales;
        const grossProfit = revenue - costOfSales;
        const grossProfitMargin = (grossProfit / revenue) * 100;
        
        return {
          year: item.year,
          grossProfitMargin: parseFloat(grossProfitMargin.toFixed(2)),
          annotations: item.events || []
        };
      });
      
    return filteredData;
  } catch (error) {
    console.error('Error fetching gross profit margin data:', error);
    throw error;
  }
};

// Fetch EPS data
export const fetchEPSData = async (params) => {
  try {
    // const response = await api.get('/eps', { params });
    // return response;
    
    // Get from mock data
    await new Promise(resolve => setTimeout(resolve, 550));
    const filteredData = mockData.yearlyData
      .filter(item => 
        (!params.years || params.years.includes(item.year)) &&
        (!params.industryGroups || 
          params.industryGroups.some(group => 
            item.industryGroups && item.industryGroups.includes(group)
          )
        )
      )
      .map(item => ({
        year: item.year,
        eps: item.financials.eps,
        netProfit: item.financials.netProfit,
        shareCount: item.financials.outstandingShares,
        currency: params.currency || 'LKR'
      }));
      
    return filteredData;
  } catch (error) {
    console.error('Error fetching EPS data:', error);
    throw error;
  }
};

// Fetch net asset per share data
export const fetchNetAssetPerShareData = async (params) => {
  try {
    // const response = await api.get('/net-asset-per-share', { params });
    // return response;
    
    // Calculate from mock data
    await new Promise(resolve => setTimeout(resolve, 750));
    const filteredData = mockData.yearlyData
      .filter(item => 
        (!params.years || params.years.includes(item.year)) &&
        (!params.industryGroups || 
          params.industryGroups.some(group => 
            item.industryGroups && item.industryGroups.includes(group)
          )
        )
      )
      .map(item => ({
        year: item.year,
        netAssetPerShare: item.financials.netAssetPerShare,
        totalAssets: item.financials.totalAssets,
        totalLiabilities: item.financials.totalLiabilities,
        shareCount: item.financials.outstandingShares,
        industryBenchmark: item.financials.industryBenchmarkNAPS || null,
        currency: params.currency || 'LKR'
      }));
      
    return filteredData;
  } catch (error) {
    console.error('Error fetching net asset per share data:', error);
    throw error;
  }
};

// Fetch right issues data
export const fetchRightIssuesData = async () => {
  try {
    // const response = await api.get('/right-issues');
    // return response;
    
    // Get from mock data
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData.rightIssues || [];
  } catch (error) {
    console.error('Error fetching right issues data:', error);
    throw error;
  }
};

// Fetch shareholders data
export const fetchShareholdersData = async (params) => {
  try {
    // const response = await api.get('/shareholders', { params });
    // return response;
    
    // Filter from mock data
    await new Promise(resolve => setTimeout(resolve, 850));
    if (!params.year || !mockData.shareholders) {
      return [];
    }
    
    const yearData = mockData.shareholders.find(item => item.year === params.year);
    return yearData ? yearData.data : [];
  } catch (error) {
    console.error('Error fetching shareholders data:', error);
    throw error;
  }
};

// Generate AI insights
export const generateAIInsights = async (params) => {
  try {
    // const response = await api.post('/ai-insights', params);
    // return response;
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Mock response
    return {
      insights: [
        {
          id: 1,
          title: "Revenue Growth Analysis",
          description: "The company experienced a significant revenue decline of 22.3% in 2020 compared to 2019, primarily due to COVID-19 impact on the Leisure sector, which contributed 56% to the overall decline.",
          type: "trend",
          metrics: ["revenue"],
          importance: "high"
        },
        {
          id: 2,
          title: "Operating Expense Efficiency",
          description: "Despite revenue challenges, cost optimization strategies have reduced the operating expense to revenue ratio by 3.2% since 2021, indicating improved operational efficiency.",
          type: "efficiency",
          metrics: ["operatingExpenses", "revenue"],
          importance: "medium"
        },
        {
          id: 3,
          title: "Profitability Recovery",
          description: "Gross profit margins have shown steady recovery from 24.1% in 2020 to 31.7% in 2024, surpassing pre-pandemic levels and indicating successful pricing strategies and cost management.",
          type: "profitability",
          metrics: ["grossProfitMargin"],
          importance: "high"
        },
        {
          id: 4,
          title: "Shareholder Concentration Shift",
          description: "The top 5 shareholders now control 47.3% of shares, up from 42.1% in 2019, indicating increased ownership concentration that may impact future corporate governance.",
          type: "ownership",
          metrics: ["topShareholders"],
          importance: "medium"
        }
      ]
    };
  } catch (error) {
    console.error('Error generating AI insights:', error);
    throw error;
  }
};

// Forecast future trends
export const generateForecast = async (params) => {
  try {
    // const response = await api.post('/forecast', params);
    // return response;
    
    // Simulate forecasting time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock forecast response
    return {
      metric: params.metric,
      actualData: mockData.yearlyData.map(item => ({
        year: item.year,
        value: item.financials[params.metric] || 0
      })),
      forecastData: [
        { year: 2025, value: params.metric === 'revenue' ? 131875 : params.metric === 'eps' ? 14.27 : 45.92 },
        { year: 2026, value: params.metric === 'revenue' ? 142625 : params.metric === 'eps' ? 15.18 : 48.35 },
        { year: 2027, value: params.metric === 'revenue' ? 156500 : params.metric === 'eps' ? 16.45 : 51.24 }
      ],
      confidenceInterval: {
        upper: [
          { year: 2025, value: params.metric === 'revenue' ? 138500 : params.metric === 'eps' ? 15.32 : 47.85 },
          { year: 2026, value: params.metric === 'revenue' ? 154250 : params.metric === 'eps' ? 16.75 : 51.20 },
          { year: 2027, value: params.metric === 'revenue' ? 172500 : params.metric === 'eps' ? 18.67 : 55.42 }
        ],
        lower: [
          { year: 2025, value: params.metric === 'revenue' ? 125250 : params.metric === 'eps' ? 13.22 : 43.99 },
          { year: 2026, value: params.metric === 'revenue' ? 131000 : params.metric === 'eps' ? 13.61 : 45.50 },
          { year: 2027, value: params.metric === 'revenue' ? 140500 : params.metric === 'eps' ? 14.23 : 47.06 }
        ]
      },
      modelType: "ARIMA",
      accuracy: 0.87,
      factors: [
        "Historical performance", 
        "Economic indicators",
        "Industry trends",
        "Seasonal patterns"
      ]
    };
  } catch (error) {
    console.error('Error generating forecast:', error);
    throw error;
  }
};