import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import DataCard from '../common/DataCard';
import { fetchFinancialData } from '../../api/services';
import { 
  formatCurrency, 
  formatPercentage, 
  calculateGrowthRate 
} from '../../utils/formatters';

const FinancialSummary = () => {
  const { selectedYears, selectedCurrency, selectedIndustryGroups } = useData();
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
        
        // Sort by year ascending
        filteredData.yearlyData.sort((a, b) => a.year - b.year);
        
        setSummaryData(filteredData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading financial summary data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [selectedYears, selectedIndustryGroups]);
  
  // Get latest year and previous year data
  const getLatestYearData = () => {
    if (!summaryData || !summaryData.yearlyData || summaryData.yearlyData.length === 0) {
      return { latest: null, previous: null };
    }
    
    const sortedData = [...summaryData.yearlyData].sort((a, b) => b.year - a.year);
    const latest = sortedData[0];
    const previous = sortedData.length > 1 ? sortedData[1] : null;
    
    return { latest, previous };
  };
  
  const { latest, previous } = getLatestYearData();
  
  // Calculate key metrics
  const calculateMetrics = () => {
    if (!latest) return null;
    
    const revenue = latest.financials.revenue;
    const costOfSales = latest.financials.costOfSales;
    const operatingExpenses = latest.financials.operatingExpenses;
    const grossProfit = revenue - costOfSales;
    const netProfit = latest.financials.netProfit;
    
    const grossProfitMargin = (grossProfit / revenue) * 100;
    const netProfitMargin = (netProfit / revenue) * 100;
    const operatingExpenseRatio = (operatingExpenses / revenue) * 100;
    
    return {
      revenue,
      costOfSales,
      operatingExpenses,
      grossProfit,
      netProfit,
      grossProfitMargin,
      netProfitMargin,
      operatingExpenseRatio,
      eps: latest.financials.eps,
      netAssetPerShare: latest.financials.netAssetPerShare
    };
  };
  
  const metrics = calculateMetrics();
  
  // Calculate year-over-year growth
  const calculateYoYGrowth = () => {
    if (!latest || !previous) return null;
    
    return {
      revenue: calculateGrowthRate(latest.financials.revenue, previous.financials.revenue),
      costOfSales: calculateGrowthRate(latest.financials.costOfSales, previous.financials.costOfSales),
      operatingExpenses: calculateGrowthRate(latest.financials.operatingExpenses, previous.financials.operatingExpenses),
      grossProfit: calculateGrowthRate(
        latest.financials.revenue - latest.financials.costOfSales, 
        previous.financials.revenue - previous.financials.costOfSales
      ),
      netProfit: calculateGrowthRate(latest.financials.netProfit, previous.financials.netProfit),
      eps: calculateGrowthRate(latest.financials.eps, previous.financials.eps),
      netAssetPerShare: calculateGrowthRate(latest.financials.netAssetPerShare, previous.financials.netAssetPerShare)
    };
  };
  
  const growth = calculateYoYGrowth();
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Financial Summary</h2>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <DataCard key={index} loading={true} />
          ))}
        </div>
      ) : latest ? (
        <>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <h2 className="text-lg font-medium text-blue-700 dark:text-blue-300">Summary for FY {latest.year}</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {latest.year} was a {
                growth && growth.revenue > 0 
                  ? 'growth year' 
                  : 'challenging year'
              } for John Keells Holdings, with {
                growth && growth.revenue > 0
                  ? `revenue growth of ${formatPercentage(growth.revenue)}`
                  : `a revenue decline of ${formatPercentage(Math.abs(growth ? growth.revenue : 0))}`
              }. The gross profit margin was {formatPercentage(metrics ? metrics.grossProfitMargin : 0)}, 
              {
                previous && 
                ((latest.financials.revenue - latest.financials.costOfSales) / latest.financials.revenue) > 
                ((previous.financials.revenue - previous.financials.costOfSales) / previous.financials.revenue)
                  ? ' an improvement'
                  : ' a decrease'
              } compared to the previous year.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue Card */}
            <DataCard
              title="Total Revenue"
              value={metrics ? metrics.revenue : 0}
              previousValue={previous ? previous.financials.revenue : null}
              currency={selectedCurrency}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" clipRule="evenodd" />
                </svg>
              }
              onClick={() => window.location.href = '/visualizations#revenue'}
            />
            
            {/* Gross Profit Margin Card */}
            <DataCard
              title="Gross Profit Margin"
              value={metrics ? metrics.grossProfitMargin : 0}
              previousValue={previous ? 
                ((previous.financials.revenue - previous.financials.costOfSales) / previous.financials.revenue) * 100 
                : null
              }
              isPercentage={true}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
                </svg>
              }
              onClick={() => window.location.href = '/visualizations#grossProfitMargin'}
            />
            
            {/* EPS Card */}
            <DataCard
              title="Earnings Per Share"
              value={metrics ? metrics.eps : 0}
              previousValue={previous ? previous.financials.eps : null}
              currency={selectedCurrency}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              }
              onClick={() => window.location.href = '/visualizations#eps'}
            />
            
            {/* Net Asset Per Share Card */}
            <DataCard
              title="Net Asset Per Share"
              value={metrics ? metrics.netAssetPerShare : 0}
              previousValue={previous ? previous.financials.netAssetPerShare : null}
              currency={selectedCurrency}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              }
              onClick={() => window.location.href = '/visualizations#netAssetPerShare'}
            />
          </div>
          
          {latest.events && latest.events.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Key Events ({latest.year})
              </h3>
              
              <div className="space-y-3">
                {latest.events.map((event, index) => (
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
            </div>
          )}
          
          <div className="mt-4 text-right">
            <Link 
              to="/visualizations"
              className="text-blue-600 hover:underline text-sm font-medium flex items-center justify-end"
            >
              View detailed charts
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
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

export default FinancialSummary;