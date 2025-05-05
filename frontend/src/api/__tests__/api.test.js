import axios from 'axios';
import { 
  fetchFinancialData,
  fetchRevenueData,
  fetchCostVsExpenses,
  fetchGrossProfitMargin,
  fetchEPS,
  fetchNetAssetPerShare,
  fetchRightIssues,
  fetchShareholders,
  fetchDashboardOverview,
  fetchYearlyComparison,
  fetchFinancialRatios,
  fetchIndustryBreakdown,
  generateForecast,
  generateIndustryForecast,
  generateMultiMetricForecast
} from '../apiService';

// Mock axios
jest.mock('axios');

describe('API Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
  });

  const mockApiUrl = 'http://localhost:5000/api';
  
  // Mock successful response
  const mockSuccessResponse = { data: {} };
  
  test('fetchFinancialData makes correct API call', async () => {
    axios.get.mockResolvedValueOnce(mockSuccessResponse);
    
    await fetchFinancialData();
    
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(`${mockApiUrl}/financial-data`);
  });
  
  test('fetchRevenueData with no filters makes correct API call', async () => {
    axios.get.mockResolvedValueOnce(mockSuccessResponse);
    
    await fetchRevenueData();
    
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(`${mockApiUrl}/revenue`);
  });
  
  test('fetchRevenueData with filters makes correct API call', async () => {
    axios.get.mockResolvedValueOnce(mockSuccessResponse);
    
    const filters = { years: '2020,2021', industryGroups: 'Leisure,Transportation' };
    await fetchRevenueData(filters);
    
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      `${mockApiUrl}/revenue?years=2020,2021&industryGroups=Leisure,Transportation`
    );
  });
  
  test('fetchCostVsExpenses makes correct API call', async () => {
    axios.get.mockResolvedValueOnce(mockSuccessResponse);
    
    await fetchCostVsExpenses();
    
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(`${mockApiUrl}/cost-vs-expenses`);
  });
  
  test('fetchGrossProfitMargin makes correct API call', async () => {
    axios.get.mockResolvedValueOnce(mockSuccessResponse);
    
    await fetchGrossProfitMargin();
    
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(`${mockApiUrl}/gross-profit-margin`);
  });
  
  test('fetchEPS makes correct API call', async () => {
    axios.get.mockResolvedValueOnce(mockSuccessResponse);
    
    await fetchEPS();
    
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(`${mockApiUrl}/eps`);
  });
  
  test('fetchNetAssetPerShare makes correct API call', async () => {
    axios.get.mockResolvedValueOnce(mockSuccessResponse);
    
    await fetchNetAssetPerShare();
    
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(`${mockApiUrl}/net-asset-per-share`);
  });
  
  test('fetchRightIssues makes correct API call', async () => {
    axios.get.mockResolvedValueOnce(mockSuccessResponse);
    
    await fetchRightIssues();
    
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(`${mockApiUrl}/right-issues`);
  });
  
  test('fetchShareholders makes correct API call', async () => {
    axios.get.mockResolvedValueOnce(mockSuccessResponse);
    
    await fetchShareholders(2021);
    
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(`${mockApiUrl}/shareholders?year=2021`);
  });
  
  test('fetchDashboardOverview makes correct API call', async () => {
    axios.get.mockResolvedValueOnce(mockSuccessResponse);
    
    await fetchDashboardOverview();
    
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(`${mockApiUrl}/dashboard-overview`);
  });
  
  test('fetchYearlyComparison makes correct API call', async () => {
    axios.get.mockResolvedValueOnce(mockSuccessResponse);
    
    await fetchYearlyComparison();
    
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(`${mockApiUrl}/yearly-comparison`);
  });
  
  test('fetchYearlyComparison with metrics makes correct API call', async () => {
    axios.get.mockResolvedValueOnce(mockSuccessResponse);
    
    const metrics = 'revenue,eps,netAssetPerShare';
    await fetchYearlyComparison(metrics);
    
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(`${mockApiUrl}/yearly-comparison?metrics=${metrics}`);
  });
  
  test('fetchFinancialRatios makes correct API call', async () => {
    axios.get.mockResolvedValueOnce(mockSuccessResponse);
    
    await fetchFinancialRatios();
    
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(`${mockApiUrl}/financial-ratios`);
  });
  
  test('fetchIndustryBreakdown makes correct API call', async () => {
    axios.get.mockResolvedValueOnce(mockSuccessResponse);
    
    await fetchIndustryBreakdown(2021);
    
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(`${mockApiUrl}/industry-breakdown?year=2021`);
  });
  
  test('generateForecast makes correct API call', async () => {
    axios.post.mockResolvedValueOnce(mockSuccessResponse);
    
    const params = {
      metric: 'revenue',
      model: 'arima',
      forecastYears: 3
    };
    
    await generateForecast(params);
    
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(`${mockApiUrl}/forecast`, params);
  });
  
  test('generateIndustryForecast makes correct API call', async () => {
    axios.post.mockResolvedValueOnce(mockSuccessResponse);
    
    const params = {
      metric: 'revenue',
      industryGroup: 'Leisure',
      model: 'arima',
      forecastYears: 3
    };
    
    await generateIndustryForecast(params);
    
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(`${mockApiUrl}/industry-forecast`, params);
  });
  
  test('generateMultiMetricForecast makes correct API call', async () => {
    axios.post.mockResolvedValueOnce(mockSuccessResponse);
    
    const params = {
      metrics: ['revenue', 'eps'],
      model: 'arima',
      forecastYears: 3
    };
    
    await generateMultiMetricForecast(params);
    
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(`${mockApiUrl}/multi-metric-forecast`, params);
  });
  
  test('API call error handling', async () => {
    const errorMessage = 'Network Error';
    axios.get.mockRejectedValueOnce(new Error(errorMessage));
    
    await expect(fetchFinancialData()).rejects.toThrow(errorMessage);
  });
}); 