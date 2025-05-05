import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import FilterPanel from '../components/common/FilterPanel';
import DataCard from '../components/common/DataCard';
import { fetchFinancialData } from '../api/services';
import { 
  formatCurrency, 
  formatPercentage, 
  calculateGrowthRate,
  convertLKRtoUSD
} from '../utils/formatters';
import { EXCHANGE_RATES } from '../utils/constants';

const Home = () => {
  const { selectedYears, selectedCurrency, selectedIndustryGroups, isMultiYearSelection } = useData();
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Fetch summary data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // In a real application, we would fetch a summary endpoint
        // For this demo, we'll use the mock data
        const data = await fetchFinancialData();
        
        // Filter by selected years and industry groups
        const filteredData = {
          ...data,
          yearlyData: data.yearlyData.filter(item => 
            selectedYears.includes(item.year) && 
            (selectedIndustryGroups.length === 0 || 
              selectedIndustryGroups.some(group => 
                item.industryGroups && item.industryGroups.includes(group)
              )
            )
          )
        };
        
        setSummaryData(filteredData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading financial summary data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [selectedYears, selectedIndustryGroups]);
  
  // Get selected year data
  const getYearData = () => {
    if (!summaryData || !summaryData.yearlyData || summaryData.yearlyData.length === 0) {
      return null;
    }
    
    // If in multi-year mode and multiple years selected, get the most recent
    if (isMultiYearSelection && selectedYears.length > 1) {
      const mostRecentYear = Math.max(...selectedYears);
      return summaryData.yearlyData.find(data => data.year === mostRecentYear);
    }
    
    // Otherwise just return the first (and only) year's data
    return summaryData.yearlyData[0];
  };
  
  // Convert LKR values to USD if needed
  const getAdjustedFinancials = (yearData) => {
    if (!yearData || selectedCurrency === 'LKR') {
      return yearData?.financials;
    }
    
    const exchangeRate = EXCHANGE_RATES[yearData.year] || 300;
    const financials = {...yearData.financials};
    
    // Handle both raw values and formatted values
    if (selectedCurrency === 'USD') {
      // Convert raw numeric values - preserve sign (negative/positive)
      financials.revenue = convertLKRtoUSD(financials.revenue, exchangeRate);
      financials.costOfSales = convertLKRtoUSD(financials.costOfSales, exchangeRate);
      
      // Fix for operating expenses - make sure we preserve the negative value
      financials.operatingExpenses = convertLKRtoUSD(financials.operatingExpenses, exchangeRate);
      // Check if the value is too small and display it properly
      if (Math.abs(financials.operatingExpenses) < 0.01) {
        financials.operatingExpenses = financials.operatingExpenses < 0 ? -0.01 : 0.01;
      }
      
      financials.grossProfit = convertLKRtoUSD(financials.grossProfit, exchangeRate);
      financials.netProfit = convertLKRtoUSD(financials.netProfit, exchangeRate);
      financials.eps = convertLKRtoUSD(financials.eps, exchangeRate);
      financials.netAssetPerShare = convertLKRtoUSD(financials.netAssetPerShare, exchangeRate);
      
      // Create USD formatted values
      if (financials.revenueFormatted) {
        const revMillions = financials.revenue / 1000000;
        financials.revenueFormatted = `$ ${revMillions.toFixed(2)} Mn`;
        
        const costMillions = Math.abs(financials.costOfSales) / 1000000;
        financials.costOfSalesFormatted = `$ ${costMillions.toFixed(2)} Mn`;
        
        // Fix for operating expenses formatting - use absolute value for display
        const opExMillions = Math.abs(financials.operatingExpenses) / 1000000;
        // Use more decimal places for very small values
        const decimals = opExMillions < 0.01 ? 4 : 2;
        financials.operatingExpensesFormatted = `$ ${opExMillions.toFixed(decimals)} Mn`;
        
        const grossProfitMillions = financials.grossProfit / 1000000;
        financials.grossProfitFormatted = `$ ${grossProfitMillions.toFixed(2)} Mn`;
        
        const netProfitMillions = financials.netProfit / 1000000;
        financials.netProfitFormatted = `$ ${netProfitMillions.toFixed(2)} Mn`;
        
        financials.epsFormatted = `$ ${financials.eps.toFixed(2)}`;
        financials.netAssetPerShareFormatted = `$ ${financials.netAssetPerShare.toFixed(2)}`;
      }
    }
    
    // Add debug information to help diagnose issues
    console.log(`Operating Expenses (${yearData.year}): LKR ${yearData.financials.operatingExpenses} → USD ${financials.operatingExpenses}`);
    
    return financials;
  };
  
  const yearData = getYearData();
  const financials = getAdjustedFinancials(yearData);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Key financial metrics for John Keells Holdings PLC
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Link
            to="/visualizations"
            className="btn btn-primary flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            All Visualizations
          </Link>
          
          <Link
            to="/forecasting"
            className="btn btn-outline flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            Forecasting
          </Link>
        </div>
      </div>
      
      <FilterPanel />
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <DataCard key={index} loading={true} />
          ))}
        </div>
      ) : yearData ? (
        <>
          <div className="bg-jk-blue/5 dark:bg-jk-blue/10 border border-jk-blue/10 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-jk-blue mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <h2 className="text-lg font-medium text-jk-blue">Financial Data for FY {yearData.year}</h2>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded">
                {isMultiYearSelection && selectedYears.length > 1 ? (
                  <span>
                    Multiple years selected - Showing <span className="font-semibold text-jk-blue dark:text-blue-300">{yearData.year}</span> data
                  </span>
                ) : (
                  <span>
                    Selected period: <span className="font-semibold text-jk-blue dark:text-blue-300">{yearData.year}</span>
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              In {yearData.year}, John Keells Holdings had a total revenue of {financials.revenueFormatted || formatCurrency(financials.revenue, selectedCurrency)} 
              with a gross profit margin of {formatPercentage((financials.revenue - financials.costOfSales) / financials.revenue)}.
              Net profit for the year was {financials.netProfitFormatted || formatCurrency(financials.netProfit, selectedCurrency)}.
            </p>
            {isMultiYearSelection && selectedYears.length > 1 && (
              <div className="mt-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md text-sm">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Visualization Mode Active:</span>
                </div>
                <p className="ml-7 mt-1">
                  You have selected {selectedYears.length} years. For detailed visualizations comparing across years, 
                  visit the <Link to="/visualizations" className="text-jk-blue dark:text-blue-300 underline font-medium">Visualizations</Link> page.
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 rounded-lg p-5 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-jk-blue dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Key Metrics
            </h2>
          
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Revenue Card */}
              <DataCard
                title="Total Revenue"
                value={financials.revenueFormatted ? financials.revenueFormatted : financials.revenue}
                isFormatted={!!financials.revenueFormatted}
                currency={selectedCurrency}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" clipRule="evenodd" />
                  </svg>
                }
                onClick={() => navigate('/visualizations#revenue')}
              />
              
              {/* Gross Profit Margin Card */}
              <DataCard
                title="Gross Profit Margin"
                value={financials.grossProfitMarginFormatted ? financials.grossProfitMarginFormatted : ((financials.revenue - financials.costOfSales) / financials.revenue * 100)}
                isFormatted={!!financials.grossProfitMarginFormatted}
                isPercentage={!financials.grossProfitMarginFormatted}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
                  </svg>
                }
                onClick={() => navigate('/visualizations#grossProfitMargin')}
              />
              
              {/* EPS Card */}
              <DataCard
                title="Earnings Per Share"
                value={financials.epsFormatted ? financials.epsFormatted : financials.eps}
                isFormatted={!!financials.epsFormatted}
                currency={!financials.epsFormatted ? selectedCurrency : null}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                }
                onClick={() => navigate('/visualizations#eps')}
              />
              
              {/* Net Asset Per Share Card */}
              <DataCard
                title="Net Asset Per Share"
                value={financials.netAssetPerShareFormatted ? financials.netAssetPerShareFormatted : financials.netAssetPerShare}
                isFormatted={!!financials.netAssetPerShareFormatted}
                currency={!financials.netAssetPerShareFormatted ? selectedCurrency : null}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
                  </svg>
                }
                onClick={() => navigate('/visualizations#netAssetPerShare')}
              />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-900/20 rounded-lg p-5 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Financial Performance
            </h2>
          
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cost of Sales Card */}
              <DataCard
                title="Cost of Sales"
                value={financials.costOfSalesFormatted ? financials.costOfSalesFormatted : financials.costOfSales}
                isFormatted={!!financials.costOfSalesFormatted}
                currency={!financials.costOfSalesFormatted ? selectedCurrency : null}
                inverse={true} // Lower is better
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                }
                footer={`${formatPercentage(financials.costOfSales / financials.revenue)} of revenue`}
                onClick={() => navigate('/visualizations#costVsExpenses')}
              />
              
              {/* Operating Expenses Card */}
              <DataCard
                title="Operating Expenses"
                value={financials.operatingExpensesFormatted ? financials.operatingExpensesFormatted : financials.operatingExpenses}
                isFormatted={!!financials.operatingExpensesFormatted}
                currency={!financials.operatingExpensesFormatted ? selectedCurrency : null}
                inverse={true} // Lower is better
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                }
                footer={`${formatPercentage(financials.operatingExpenses / financials.revenue)} of revenue`}
                onClick={() => navigate('/visualizations#costVsExpenses')}
              />
              
              {/* Net Profit Card */}
              <DataCard
                title="Net Profit"
                value={financials.netProfitFormatted ? financials.netProfitFormatted : financials.netProfit}
                isFormatted={!!financials.netProfitFormatted}
                currency={!financials.netProfitFormatted ? selectedCurrency : null}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
                  </svg>
                }
                footer={`${formatPercentage(financials.netProfit / financials.revenue)} net margin`}
                onClick={() => navigate('/visualizations#eps')}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Key Events */}
            <div className="card">
              <h3 className="text-lg font-semibold text-jk-blue dark:text-white mb-4">
                Key Events ({yearData.year})
              </h3>
              
              {yearData.events && yearData.events.length > 0 ? (
                <div className="space-y-3">
                  {yearData.events.map((event, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-md border-l-4 ${
                        event.impact === 'positive' 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                          : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                      }`}
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">{event.title}</h4>
                        <span className="text-xs text-gray-500">{event.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No major events recorded for this year.</p>
              )}
              
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Link 
                  to="/visualizations"
                  className="text-jk-blue hover:underline text-sm font-medium flex items-center"
                >
                  View all historical events
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {/* Future Outlook */}
            <div className="card">
              <h3 className="text-lg font-semibold text-jk-blue dark:text-white mb-4">
                Future Outlook
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-1 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Revenue Growth</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Projected to increase by 5-8% in the next fiscal year, driven by recovery in the leisure sector and digital initiatives.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-1 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Profitability</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Gross profit margin expected to improve to 32-34% through cost optimization and higher-margin service offerings.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-1 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium">Strategic Initiatives</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Focus on digital transformation and expansion in IT services to drive long-term growth and improve operational efficiency.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Link 
                  to="/forecasting"
                  className="text-jk-blue hover:underline text-sm font-medium flex items-center"
                >
                  Explore detailed forecasts
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No data available for the selected filters.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 btn btn-primary"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;