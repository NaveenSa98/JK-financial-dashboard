import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FilterPanel from '../common/FilterPanel';
import FinancialSummary from './FinancialSummary';
import ComparisonTool from './ComparisonTool';
import AIInsights from './AIInsights';
import ForecastingModule from '../advanced/ForecastingModule';
import RevenueChart from '../common/RevenueChart';
import ShareholdersChart from '../common/ShareholdersChart';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [forecastMetric, setForecastMetric] = useState('revenue');
  const [dashboardError, setDashboardError] = useState(null);
  
  // If there's an error in FinancialSummary, we can catch it here
  const handleError = (error) => {
    console.error("Dashboard error:", error);
    setDashboardError(error);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h1>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Period:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="all">All Years</option>
            <option value="last3">Last 3 Years</option>
            <option value="last5">Last 5 Years</option>
          </select>
        </div>
      </div>
      
      {dashboardError ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">Dashboard Error</h2>
          <p className="text-red-700 dark:text-red-300 mb-4">{dashboardError.message || "An error occurred loading the dashboard"}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Reload Dashboard
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FinancialSummary period={selectedPeriod} onError={handleError} />
            </div>
            
            <div className="lg:col-span-1">
              <div className="card h-full">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Latest Insights</h2>
                <AIInsights />
              </div>
            </div>
          </div>
          
          {/* Forecasting module */}
          <div className="card">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Forecast</h2>
              <div className="mt-2 md:mt-0 flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Metric:</span>
                <select
                  value={forecastMetric}
                  onChange={(e) => setForecastMetric(e.target.value)}
                  className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="revenue">Revenue</option>
                  <option value="grossProfit">Gross Profit</option>
                  <option value="eps">EPS</option>
                </select>
              </div>
            </div>
            
            <div className="h-80">
              <ForecastingModule 
                metricKey={forecastMetric} 
                modelType="lstm"
                showIndustrySelector={true}
              />
            </div>
            
            <div className="mt-2 text-right">
              <Link to="/forecasting" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                View detailed forecasts →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;