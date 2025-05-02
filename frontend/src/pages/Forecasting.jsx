import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { useData } from '../context/DataContext';
import { generateForecast } from '../api/services';
import { FINANCIAL_METRICS, FORECASTING_MODELS } from '../utils/constants';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { chartColors } from '../utils/chartConfig';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
);

const Forecasting = () => {
  const { selectedCurrency } = useData();
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [selectedModel, setSelectedModel] = useState('arima');
  const [forecastData, setForecastData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chartOptions, setChartOptions] = useState({});
  
  // Generate forecast when metric or model changes
  useEffect(() => {
    const generateForecastData = async () => {
      try {
        setIsLoading(true);
        
        const params = {
          metric: selectedMetric,
          model: selectedModel,
          currency: selectedCurrency
        };
        
        const data = await generateForecast(params);
        setForecastData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error generating forecast:', error);
        setIsLoading(false);
      }
    };
    
    generateForecastData();
  }, [selectedMetric, selectedModel, selectedCurrency]);
  
  // Update chart options when currency changes
  useEffect(() => {
    const formatter = selectedMetric.includes('margin') || selectedMetric.includes('percentage') 
      ? (value) => formatPercentage(value) 
      : (value) => formatCurrency(value, selectedCurrency);
    
    setChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            padding: 20,
            boxWidth: 10,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#666',
          bodyColor: '#333',
          borderColor: '#ccc',
          borderWidth: 1,
          cornerRadius: 4,
          boxPadding: 8,
          usePointStyle: true,
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              return `${label}: ${formatter(context.raw)}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Year'
          },
          grid: {
            display: false
          }
        },
        y: {
          title: {
            display: true,
            text: getMetricLabel(selectedMetric)
          },
          grid: {
            drawBorder: false
          },
          ticks: {
            callback: (value) => formatter(value)
          }
        }
      }
    });
  }, [selectedMetric, selectedCurrency]);
  
  // Get formatted metric label
  const getMetricLabel = (metricKey) => {
    const metric = FINANCIAL_METRICS.find(m => m.value === metricKey);
    
    if (!metric) return '';
    
    const isCurrency = !metricKey.includes('margin') && !metricKey.includes('percentage');
    
    return isCurrency 
      ? `${metric.label} (${selectedCurrency})` 
      : metric.label;
  };
  
  // Prepare chart data
  const prepareChartData = () => {
    if (!forecastData) return null;
    
    const actualYears = forecastData.actualData.map(item => item.year);
    const forecastYears = forecastData.forecastData.map(item => item.year);
    const allYears = [...new Set([...actualYears, ...forecastYears])].sort();
    
    const datasets = [
      {
        label: 'Historical Data',
        data: allYears.map(year => {
          const match = forecastData.actualData.find(item => item.year === year);
          return match ? match.value : null;
        }),
        borderColor: chartColors.revenue,
        backgroundColor: 'rgba(45, 85, 255, 0.1)',
        pointBackgroundColor: 'white',
        pointBorderColor: chartColors.revenue,
        pointBorderWidth: 2,
        tension: 0.1,
        fill: true
      },
      {
        label: 'Forecasted Data',
        data: allYears.map(year => {
          const match = forecastData.forecastData.find(item => item.year === year);
          return match ? match.value : null;
        }),
        borderColor: chartColors.eps,
        borderDash: [5, 5],
        backgroundColor: 'rgba(153, 102, 255, 0.1)',
        pointBackgroundColor: 'white',
        pointBorderColor: chartColors.eps,
        pointBorderWidth: 2,
        tension: 0.1,
        fill: true
      }
    ];
    
    // Add confidence intervals
    if (forecastData.confidenceInterval) {
      datasets.push(
        {
          label: 'Upper Confidence',
          data: allYears.map(year => {
            const match = forecastData.confidenceInterval.upper.find(item => item.year === year);
            return match ? match.value : null;
          }),
          borderColor: 'rgba(153, 102, 255, 0.3)',
          backgroundColor: 'transparent',
          pointRadius: 0,
          borderWidth: 1,
          borderDash: [3, 3],
          fill: '+1'
        },
        {
          label: 'Lower Confidence',
          data: allYears.map(year => {
            const match = forecastData.confidenceInterval.lower.find(item => item.year === year);
            return match ? match.value : null;
          }),
          borderColor: 'rgba(153, 102, 255, 0.3)',
          backgroundColor: 'rgba(153, 102, 255, 0.1)',
          pointRadius: 0,
          borderWidth: 1,
          borderDash: [3, 3],
          fill: false
        }
      );
    }
    
    return {
      labels: allYears,
      datasets
    };
  };
  
  const chartData = prepareChartData();
  
  // Get metric display info
  const getMetricInfo = () => {
    return FINANCIAL_METRICS.find(m => m.value === selectedMetric) || {};
  };
  
  const metricInfo = getMetricInfo();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Forecasting</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Predictive analytics for future financial performance
          </p>
        </div>
      </div>
      
      <div className="card">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="w-full md:w-1/3 space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Metric
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="input-field"
            >
              {FINANCIAL_METRICS.map((metric) => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-1/3 space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Forecasting Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="input-field"
            >
              {FORECASTING_MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-1/3 md:text-right"></div>
        </div>
        
        <div className="h-[400px]">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jk-blue"></div>
            </div>
          ) : chartData ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              No forecast data available
            </div>
          )}
        </div>
        
        {forecastData && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model Accuracy</h3>
              <p className="text-lg font-semibold text-jk-blue dark:text-blue-400">
                {formatPercentage(forecastData.accuracy * 100)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Based on historical predictive performance
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">3-Year Growth</h3>
              {forecastData.forecastData.length > 0 && forecastData.actualData.length > 0 && (
                <p className="text-lg font-semibold text-jk-blue dark:text-blue-400">
                  {formatPercentage(
                    ((forecastData.forecastData[forecastData.forecastData.length - 1].value - 
                    forecastData.actualData[forecastData.actualData.length - 1].value) / 
                    forecastData.actualData[forecastData.actualData.length - 1].value) * 100
                  )}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Projected change over the next 3 years
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confidence Range</h3>
              {forecastData.confidenceInterval && forecastData.forecastData.length > 0 && (
                <p className="text-lg font-semibold text-jk-blue dark:text-blue-400">
                  {metricInfo.category === 'valuation' || metricInfo.category === 'income'
                    ? `${formatCurrency(forecastData.confidenceInterval.lower[0].value, selectedCurrency, 1)} - ${formatCurrency(forecastData.confidenceInterval.upper[0].value, selectedCurrency, 1)}`
                    : `${formatPercentage(forecastData.confidenceInterval.lower[0].value)} - ${formatPercentage(forecastData.confidenceInterval.upper[0].value)}`}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                For {forecastData.forecastData[0]?.year || ''}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {forecastData && (
        <div className="card">
          <h2 className="text-lg font-semibold text-jk-blue dark:text-white mb-4">
            Forecast Details
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Forecasted Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lower Bound</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Upper Bound</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">YoY Change</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {forecastData.forecastData.map((item, index) => {
                  const formatter = selectedMetric.includes('margin') || selectedMetric.includes('percentage')
                    ? formatPercentage
                    : (value) => formatCurrency(value, selectedCurrency);
                  
                  const previousValue = index > 0 
                    ? forecastData.forecastData[index - 1].value 
                    : forecastData.actualData[forecastData.actualData.length - 1]?.value;
                  
                  const percentChange = previousValue 
                    ? ((item.value - previousValue) / Math.abs(previousValue)) * 100
                    : 0;
                  
                  const lowerBound = forecastData.confidenceInterval?.lower[index]?.value || null;
                  const upperBound = forecastData.confidenceInterval?.upper[index]?.value || null;
                  
                  return (
                    <tr key={item.year} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatter(item.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {lowerBound !== null ? formatter(lowerBound) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {upperBound !== null ? formatter(upperBound) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`${percentChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {percentChange >= 0 ? '+' : ''}{formatPercentage(percentChange)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {forecastData.factors && forecastData.factors.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Key Factors Influencing the Forecast
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {forecastData.factors.map((factor, index) => (
                  <li key={index}>{factor}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p>
              <strong>Note:</strong> This forecast is generated using {forecastData.modelType} modeling based on historical data. 
              Actual results may vary due to unforeseen market conditions, regulatory changes, or other external factors.
            </p>
          </div>
        </div>
      )}
      
      <div className="card">
        <h2 className="text-lg font-semibold text-jk-blue dark:text-white mb-4">
          About Financial Forecasting
        </h2>
        
        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <p>
            Financial forecasting uses historical data and statistical algorithms to predict future financial 
            performance. These models analyze patterns, trends, and relationships in past data to make 
            educated projections about future outcomes.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">ARIMA Model</h3>
              <p className="text-sm">
                Autoregressive Integrated Moving Average (ARIMA) models analyze time-dependent data by 
                accounting for correlations, trends, and seasonal patterns.
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">ETS Model</h3>
              <p className="text-sm">
                Error, Trend, Seasonality (ETS) models decompose time series data into these three 
                components to make predictions about future values.
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">LSTM Model</h3>
              <p className="text-sm">
                Long Short-Term Memory (LSTM) neural networks can learn long-term dependencies in sequential 
                data, making them powerful for complex financial forecasting.
              </p>
            </div>
          </div>
          
          <p className="mt-4 text-sm">
            <strong>Limitations:</strong> Financial forecasts are subject to uncertainty and should be used as guidance 
            rather than definitive predictions. Regular updates are recommended as new data becomes available.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Forecasting;