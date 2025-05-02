import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FilterPanel from '../components/common/FilterPanel';
import RevenueChart from '../components/charts/RevenueChart';
import CostVsExpensesChart from '../components/charts/CostVsExpensesChart';
import GrossProfitMarginChart from '../components/charts/GrossProfitMarginChart';
import EPSChart from '../components/charts/EPSChart';
import NetAssetPerShareChart from '../components/charts/NetAssetPerShareChart';
import RightIssuesTable from '../components/charts/RightIssuesTable';
import ShareholdersChart from '../components/charts/ShareholdersChart';
import { CHART_TYPES } from '../utils/constants';

const Visualizations = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState(null);
  
  // Parse the category filter from URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const category = queryParams.get('category');
    
    if (category) {
      setCategoryFilter(category);
    } else {
      setCategoryFilter(null);
    }
  }, [location.search]);
  
  // Handle hash navigation when the component mounts
  useEffect(() => {
    // Check if we have a hash in the URL
    if (location.hash) {
      // Extract the ID from the hash (remove the #)
      const id = location.hash.substring(1);
      
      // Map from URL fragment to chart ID
      const fragmentToChartId = {
        'revenue': 'revenue',
        'cost-vs-expenses': 'costVsExpenses',
        'gross-profit-margin': 'grossProfitMargin',
        'eps': 'eps',
        'net-asset-per-share': 'netAssetPerShare',
        'right-issues': 'rightIssues',
        'shareholders': 'shareholders'
      };
      
      // Get the corresponding chart ID
      const chartId = fragmentToChartId[id] || id;
      
      // Set the active tab to the chart ID
      setActiveTab(chartId);
      
      // Wait for the component to fully render before scrolling
      setTimeout(() => {
        const element = document.getElementById(chartId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location.hash]);
  
  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Scroll to the section if it exists
    if (tabId !== 'all') {
      const element = document.getElementById(tabId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  
  // Filter charts based on category
  const getFilteredCharts = () => {
    // Define the category for each chart
    const chartCategories = {
      revenue: 'income',
      costVsExpenses: 'expense',
      grossProfitMargin: 'income',
      eps: 'valuation',
      netAssetPerShare: 'valuation',
      rightIssues: 'ownership',
      shareholders: 'ownership'
    };
    
    if (!categoryFilter) return Object.keys(chartCategories);
    
    return Object.entries(chartCategories)
      .filter(([_, category]) => category === categoryFilter)
      .map(([chartId]) => chartId);
  };
  
  const filteredCharts = getFilteredCharts();
  
  return (
          <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Visualizations</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Interactive charts and tables showing key metrics and trends
          </p>
        </div>
      </div>
      
      <FilterPanel />
      
      <div className="card overflow-x-auto">
        <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleTabChange('all')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'all'
                ? 'border-jk-blue text-jk-blue dark:text-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            All Charts
          </button>
          
          {CHART_TYPES.map((chart) => (
            <button
              key={chart.value}
              onClick={() => handleTabChange(chart.value)}
              className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === chart.value
                  ? 'border-jk-blue text-jk-blue dark:text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {chart.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-8">
        {/* Revenue Chart */}
        {(activeTab === 'all' || activeTab === 'revenue') && filteredCharts.includes('revenue') && (
          <div id="revenue">
            <RevenueChart />
          </div>
        )}
        
        {/* Cost vs Expenses Chart */}
        {(activeTab === 'all' || activeTab === 'costVsExpenses') && filteredCharts.includes('costVsExpenses') && (
          <div id="costVsExpenses">
            <CostVsExpensesChart />
          </div>
        )}
        
        {/* Gross Profit Margin Chart */}
        {(activeTab === 'all' || activeTab === 'grossProfitMargin') && filteredCharts.includes('grossProfitMargin') && (
          <div id="grossProfitMargin">
            <GrossProfitMarginChart />
          </div>
        )}
        
        {/* EPS Chart */}
        {(activeTab === 'all' || activeTab === 'eps') && filteredCharts.includes('eps') && (
          <div id="eps">
            <EPSChart />
          </div>
        )}
        
        {/* Net Asset Per Share Chart */}
        {(activeTab === 'all' || activeTab === 'netAssetPerShare') && filteredCharts.includes('netAssetPerShare') && (
          <div id="netAssetPerShare">
            <NetAssetPerShareChart />
          </div>
        )}
        
        {/* Right Issues Table */}
        {(activeTab === 'all' || activeTab === 'rightIssues') && filteredCharts.includes('rightIssues') && (
          <div id="rightIssues">
            <RightIssuesTable />
          </div>
        )}
        
        {/* Shareholders Chart */}
        {(activeTab === 'all' || activeTab === 'shareholders') && filteredCharts.includes('shareholders') && (
          <div id="shareholders">
            <ShareholdersChart />
          </div>
        )}
      </div>
      
      {filteredCharts.length === 0 && (
        <div className="card py-8">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No charts match the current filter</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Try changing your category filter or selecting different years.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Visualizations;