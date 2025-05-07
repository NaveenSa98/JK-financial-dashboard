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
import { FINANCIAL_METRICS, INDUSTRY_GROUPS } from '../utils/constants';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { chartColors } from '../utils/chartConfig';
import ComparativeForecast from '../components/advanced/ComparativeForecast';
import IndustryForecastComparison from '../components/advanced/IndustryForecastComparison';

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

// Simplified forecasting models - only LSTM
const FORECASTING_MODELS = [
  { value: 'lstm', label: 'LSTM', description: 'Neural network for complex patterns' },
];

// Forecast view types
const FORECAST_VIEWS = [
  { id: 'single', label: 'Single Metric' },
  { id: 'multi', label: 'Multi-Metric Comparison' },
  { id: 'industry', label: 'Industry Comparison' }
];

const Forecasting = () => {
  const { selectedCurrency } = useData();
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [selectedModel, setSelectedModel] = useState('lstm');
  const [forecastYears, setForecastYears] = useState(3);
  const [forecastData, setForecastData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chartOptions, setChartOptions] = useState({});
  
  // New state for the advanced visualizations
  const [activeView, setActiveView] = useState('single');
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'eps']);
  const [selectedIndustries, setSelectedIndustries] = useState(['Leisure', 'Transportation', 'Financial Services']);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  
  // Generate forecast when metric, model changes
  useEffect(() => {
    const generateForecastData = async () => {
      // Only load single metric data when that view is active
      if (activeView !== 'single') return;
      
      try {
        setIsLoading(true);
        
        const params = {
          metric: selectedMetric,
          model: selectedModel,
          currency: selectedCurrency,
          forecastYears: forecastYears
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
  }, [selectedMetric, selectedModel, selectedCurrency, forecastYears, activeView]);
  
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
  
  // Prepare chart data for forecast
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

  // Handle metric selection for multi-metric view
  const handleMultiMetricToggle = (metricValue) => {
    if (selectedMetrics.includes(metricValue)) {
      // Remove if already selected
      if (selectedMetrics.length > 1) { // Ensure at least one remains selected
        setSelectedMetrics(selectedMetrics.filter(m => m !== metricValue));
      }
    } else {
      // Add if not already selected (limit to 4 metrics)
      if (selectedMetrics.length < 4) {
        setSelectedMetrics([...selectedMetrics, metricValue]);
      }
    }
  };
  
  // Handle industry selection for industry comparison view
  const handleIndustryToggle = (industry) => {
    if (selectedIndustries.includes(industry)) {
      // Remove if already selected
      if (selectedIndustries.length > 1) { // Ensure at least one remains selected
        setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
      }
    } else {
      // Add if not already selected (limit to 4 industries)
      if (selectedIndustries.length < 4) {
        setSelectedIndustries([...selectedIndustries, industry]);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Forecasting</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Predictive analytics for future financial performance
          </p>
        </div>
      </div>
      
      {/* View selector tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6">
          {FORECAST_VIEWS.map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === view.id
                  ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {view.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Filter panel */}
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
        <h3 className="text-lg font-medium text-white mb-6 text-center">Forecast Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metric selector */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
              Select Metric
            </label>
            <div className="relative">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="block w-full rounded-md bg-gray-800 border-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-4 shadow-sm appearance-none"
                disabled={activeView === 'multi'}
              >
                {FINANCIAL_METRICS.map((metric) => (
                  <option key={metric.value} value={metric.value}>
                    {metric.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Model selector */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
              Model Type
            </label>
            <div className="flex justify-center">
              {FORECASTING_MODELS.map(model => (
                <button
                  key={model.value}
                  onClick={() => setSelectedModel(model.value)}
                  className={`py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                    selectedModel === model.value
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  {model.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Year selector */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
              Forecast Period
            </label>
            <div className="flex h-10">
              <input
                type="number"
                min="1"
                max="10"
                value={forecastYears}
                onChange={(e) => setForecastYears(parseInt(e.target.value))}
                className="w-full rounded-l-md bg-gray-800 border-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500 text-center"
              />
              <span className="inline-flex items-center justify-center px-4 rounded-r-md border border-l-0 border-gray-700 bg-gray-800 text-gray-300">
                Years
              </span>
            </div>
          </div>
        </div>
        
        {/* View-specific metric selectors */}
        {activeView === 'multi' && (
          <div className="mt-6">
            <h3 className="text-base font-semibold text-white mb-3">
              Compare Multiple Metrics
            </h3>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select up to 4 metrics to compare
              </label>
              <div className="flex flex-wrap gap-2">
                {FINANCIAL_METRICS.map((metric) => (
                  <button
                    key={metric.value}
                    onClick={() => handleMultiMetricToggle(metric.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedMetrics.includes(metric.value)
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-300 dark:ring-indigo-700'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {metric.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeView === 'industry' && (
          <div className="mt-6">
            <h3 className="text-base font-semibold text-white mb-3">
              Compare Industry Performance
            </h3>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select up to 4 industries to compare
              </label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRY_GROUPS.map((industry) => (
                  <button
                    key={industry.value}
                    onClick={() => handleIndustryToggle(industry.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedIndustries.includes(industry.value)
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-300 dark:ring-indigo-700'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {industry.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Loading states */}
      {activeView === 'single' && isLoading && (
        <div className="py-12 flex justify-center items-center">
          <div className="animate-pulse text-gray-500">Loading forecast data...</div>
        </div>
      )}
      
      {activeView === 'single' && !isLoading && !forecastData && (
        <div className="py-12 flex justify-center items-center text-gray-500">
          No forecast data available
        </div>
      )}
      
      {/* Visualization Area */}
      {(activeView === 'single' && forecastData) && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-100 dark:border-gray-700">
              <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Forecast Accuracy</span>
              <span className="block text-2xl font-bold text-gray-900 dark:text-white">{formatPercentage(forecastData.accuracy * 100)}</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-2">Model confidence score</span>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-100 dark:border-gray-700">
              <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Projected Change</span>
              <span className={`block text-2xl font-bold ${
                forecastData.forecastData.length > 0 && forecastData.actualData.length > 0 &&
                ((forecastData.forecastData[forecastData.forecastData.length - 1].value -
                forecastData.actualData[forecastData.actualData.length - 1].value) /
                forecastData.actualData[forecastData.actualData.length - 1].value) * 100 > 0
                ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {forecastData.forecastData.length > 0 && forecastData.actualData.length > 0 &&
                  formatPercentage(
                  ((forecastData.forecastData[forecastData.forecastData.length - 1].value -
                  forecastData.actualData[forecastData.actualData.length - 1].value) /
                  forecastData.actualData[forecastData.actualData.length - 1].value) * 100
                )}
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-2">From {forecastData.actualData[forecastData.actualData.length - 1]?.year || ''} to {forecastData.forecastData[forecastData.forecastData.length - 1]?.year || ''}</span>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-100 dark:border-gray-700">
              <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Forecast Range</span>
              <span className="block text-2xl font-bold text-gray-900 dark:text-white">
                {forecastData.confidenceInterval && forecastData.forecastData.length > 0 && (
                  selectedMetric.includes('margin') || selectedMetric.includes('percentage')
                  ? `${formatPercentage(forecastData.confidenceInterval.lower[0].value)} - ${formatPercentage(forecastData.confidenceInterval.upper[0].value)}`
                  : `${formatCurrency(forecastData.confidenceInterval.lower[0].value, selectedCurrency, 1)} - ${formatCurrency(forecastData.confidenceInterval.upper[0].value, selectedCurrency, 1)}`
                )}
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-2">For {forecastData.forecastData[0]?.year || ''}</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
            <div className="h-96">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
          
          {forecastData && forecastData.factors && forecastData.factors.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Key Factors Influencing the Forecast
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {forecastData.factors.map((factor, index) => (
                  <div key={index} className="p-5 bg-white rounded-lg shadow dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white">{factor.name}</h4>
                    <div className={`mt-2 text-xs font-medium px-2.5 py-1 rounded-full inline-block ${
                      factor.impact === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      factor.impact === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {factor.impact.charAt(0).toUpperCase() + factor.impact.slice(1)} Impact
                    </div>
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{factor.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Multi-Metric Comparison View */}
      {activeView === 'multi' && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <ComparativeForecast 
            selectedMetrics={selectedMetrics}
            modelType={selectedModel}
            forecastYears={forecastYears}
            height={500}
          />
        </div>
      )}
      
      {/* Industry Comparison View */}
      {activeView === 'industry' && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <IndustryForecastComparison 
            selectedMetric={selectedMetric}
            modelType={selectedModel}
            forecastYears={forecastYears}
            selectedIndustries={selectedIndustries}
            height={500}
          />
        </div>
      )}
      
      {/* Forecasting information */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          About Financial Forecasting
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>
            Financial forecasting uses historical data and statistical algorithms to predict future financial
            performance. This forecast represents our best estimate based on available data, but actual
            results may vary.
          </p>
          <p>
            <strong>Methodology:</strong> We use the following forecasting models:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>LSTM (Long Short-Term Memory): Neural network approach for complex pattern recognition and non-linear relationships.</li>
          </ul>
          <p>
            <strong>Limitations:</strong> Financial forecasts are subject to uncertainty and should be used as guidance
            rather than definitive predictions. Market disruptions, regulatory changes, and other external factors
            can significantly impact actual results.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Forecasting;