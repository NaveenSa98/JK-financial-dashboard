import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import DataCard from '../common/DataCard';
import { fetchDashboardOverview } from '../../api/services';
import { 
  formatCurrency, 
  formatPercentage, 
  calculateGrowthRate 
} from '../../utils/formatters';

const FinancialSummary = () => {
  const { selectedYears, selectedCurrency, selectedIndustryGroups } = useData();
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch summary data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Fetching dashboard overview data...");
        const overviewData = await fetchDashboardOverview();
        console.log("Dashboard overview data received:", overviewData);
        
        if (!overviewData) {
          throw new Error("No overview data received from API");
        }
        
        // Check if data has the expected structure
        if (typeof overviewData !== 'object') {
          console.error("Invalid data format received:", overviewData);
          throw new Error("Invalid data format received from API");
        }
        
        setSummaryData(overviewData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading financial summary data:', error);
        setError(error.message || "Failed to load financial summary");
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Check data before rendering
  useEffect(() => {
    if (summaryData) {
      console.log("Summary data loaded:", summaryData);
      
      // Check if data has expected properties
      if (!summaryData.latestYear) {
        console.warn("Summary data is missing latestYear property:", summaryData);
      }
      
      if (!summaryData.growthRates) {
        console.warn("Summary data is missing growthRates property:", summaryData);
      }
      
      // Check if we have top shareholders data
      if (!summaryData.topShareholders || !Array.isArray(summaryData.topShareholders)) {
        console.warn("Summary data is missing topShareholders array:", summaryData);
      }
    }
  }, [summaryData]);
  
  // Default growth rates if missing from API
  const defaultGrowthRates = { revenueGrowth: 0, grossProfitGrowth: 0, epsGrowth: 0 };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Financial Summary</h2>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <DataCard key={index} loading={true} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-red-800 dark:text-red-400 font-medium">Error Loading Data</h3>
          </div>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      ) : summaryData ? (
        <>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <h2 className="text-lg font-medium text-blue-700 dark:text-blue-300">Summary for FY {summaryData.latestYear || "N/A"}</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {summaryData.latestYear || "The current fiscal year"} was a {
                (summaryData.growthRates && summaryData.growthRates.revenueGrowth > 0) 
                  ? 'growth year' 
                  : 'challenging year'
              } for John Keells Holdings, with {
                (summaryData.growthRates && summaryData.growthRates.revenueGrowth > 0)
                  ? `revenue growth of ${formatPercentage(summaryData.growthRates.revenueGrowth)}`
                  : `a revenue ${summaryData.growthRates?.revenueGrowth < 0 ? 'decline' : 'change'} of ${formatPercentage(Math.abs(summaryData.growthRates?.revenueGrowth || 0))}`
              }. {summaryData.grossProfitMargin !== undefined ? `The gross profit margin was ${formatPercentage(summaryData.grossProfitMargin)}, 
              ${
                (summaryData.growthRates && summaryData.growthRates.grossProfitGrowth > 0)
                  ? ' an improvement'
                  : ' a change'
              } compared to the previous year.` : ''}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue Card */}
            <DataCard
              title="Total Revenue"
              value={summaryData.revenue}
              growthRate={summaryData.growthRates?.revenueGrowth || 0}
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
              value={summaryData.grossProfitMargin}
              growthRate={summaryData.growthRates?.grossProfitGrowth || 0}
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
              value={summaryData.eps}
              growthRate={summaryData.growthRates?.epsGrowth || 0}
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
              value={summaryData.netAssetPerShare}
              growthRate={null} // We don't have growth rate for this from the API
              currency={selectedCurrency}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              }
              onClick={() => window.location.href = '/visualizations#netAssetPerShare'}
            />
          </div>
          
          {/* Top 5 Shareholders */}
          {summaryData.topShareholders && Array.isArray(summaryData.topShareholders) && summaryData.topShareholders.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Top 5 Shareholders ({summaryData.latestYear || "Latest Year"})
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                      <th className="py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Shareholder</th>
                      <th className="py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 text-right">Ownership</th>
                      <th className="py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 text-right">Shares</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.topShareholders.map((shareholder, index) => (
                      <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">{shareholder.name}</td>
                        <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200 text-right">{formatPercentage(shareholder.percentage)}</td>
                        <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200 text-right">
                          {shareholder.shares ? shareholder.shares.toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-right">
            <Link 
              to="/visualizations"
              className="text-blue-600 hover:underline text-sm font-medium flex items-center justify-end"
            >
              <span>View detailed financial analysis</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">No financial data available</p>
        </div>
      )}
    </div>
  );
};

export default FinancialSummary;