import { useState } from 'react';
import FilterPanel from '../common/FilterPanel';
import FinancialSummary from './FinancialSummary';
import ComparisonTool from './ComparisonTool';
import AIInsights from './AIInsights';
import ForecastingModule from '../advanced/ForecastingModule';

const Dashboard = () => {
  const [forecastMetric, setForecastMetric] = useState('revenue');
  const [forecastModel, setForecastModel] = useState('arima');
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Key financial metrics for John Keells Holdings PLC (2019-2024)
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-2">
            <a 
              href="/visualizations" 
              className="btn btn-primary flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              All Visualizations
            </a>
            
            <a
              href="/forecasting"
              className="btn btn-outline flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              Forecasting
            </a>
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-6 space-y-6">
        <FilterPanel />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FinancialSummary />
          </div>
          
          <div>
            <AIInsights limit={2} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <ComparisonTool />
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-jk-blue dark:text-white">
              Revenue Forecast
            </h2>
            
            <div className="flex space-x-2">
              <select
                className="text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1 focus:border-jk-blue dark:focus:border-jk-light-blue focus:ring focus:ring-jk-light-blue focus:ring-opacity-50"
                value={forecastModel}
                onChange={(e) => setForecastModel(e.target.value)}
              >
                <option value="arima">ARIMA Model</option>
                <option value="ets">ETS Model</option>
                <option value="lstm">LSTM Model</option>
              </select>
            </div>
          </div>
          
          <div className="h-80">
            <ForecastingModule 
              metricKey={forecastMetric} 
              modelType={forecastModel}
            />
          </div>
          
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            <p>
              <strong>Note:</strong> This forecast is based on historical data and market trends.
              Actual results may vary due to market conditions and other factors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;