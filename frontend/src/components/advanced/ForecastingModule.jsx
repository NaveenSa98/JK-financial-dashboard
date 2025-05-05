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
import { useForecasting } from '../../hooks/useForecasting';
import { useData } from '../../context/DataContext';
import { FINANCIAL_METRICS, FORECASTING_MODELS, INDUSTRY_GROUPS } from '../../utils/constants';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { chartColors } from '../../utils/chartConfig';

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

const ForecastingModule = ({ 
  metricKey = 'revenue', 
  modelType = 'arima', 
  industryGroup = null,
  showIndustrySelector = false,
  onUpdateComplete = null 
}) => {
  const { selectedCurrency } = useData();
  const {
    metric,
    model,
    forecastData,
    isLoading,
    error,
    generateForecastData,
    changeMetric,
    changeModel,
    changeIndustryGroup
  } = useForecasting(metricKey, modelType, industryGroup);
  
  const [chartOptions, setChartOptions] = useState({});
  const [selectedIndustry, setSelectedIndustry] = useState(industryGroup);
  
  // Update metric and model when props change
  useEffect(() => {
    if (metric !== metricKey) {
      changeMetric(metricKey);
    }
    
    if (model !== modelType) {
      changeModel(modelType);
    }
    
    if (industryGroup !== selectedIndustry) {
      setSelectedIndustry(industryGroup);
      changeIndustryGroup(industryGroup);
    }
  }, [metricKey, modelType, industryGroup]);
  
  // Generate forecast when metric, model, or industry changes
  useEffect(() => {
    const generateForecast = async () => {
      await generateForecastData({ 
        currency: selectedCurrency,
        industryGroup: selectedIndustry 
      });
      
      if (onUpdateComplete) {
        onUpdateComplete();
      }
    };
    
    generateForecast();
  }, [metric, model, selectedCurrency, selectedIndustry]);
  
  // Handle industry change
  const handleIndustryChange = (e) => {
    const newIndustry = e.target.value || null;
    setSelectedIndustry(newIndustry);
    changeIndustryGroup(newIndustry);
  };
  
  // Update chart options when currency changes
  useEffect(() => {
    const formatter = metric.includes('margin') || metric.includes('percentage') 
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
            text: getMetricLabel(metric)
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
  }, [metric, selectedCurrency]);
  
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
        label: selectedIndustry ? `${selectedIndustry} Historical Data` : 'Historical Data',
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
        label: selectedIndustry ? `${selectedIndustry} Forecast` : 'Forecasted Data',
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
  
  return (
    <div className="flex flex-col h-full">
      {showIndustrySelector && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Industry Group
          </label>
          <select
            value={selectedIndustry || ''}
            onChange={handleIndustryChange}
            className="input-field"
          >
            <option value="">All Industry Groups</option>
            {INDUSTRY_GROUPS.map((industry) => (
              <option key={industry.value} value={industry.value}>
                {industry.label}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div className="flex-grow">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jk-blue"></div>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center text-red-500">
            <p>Error: {error}</p>
          </div>
        ) : chartData ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <p>No forecast data available</p>
          </div>
        )}
      </div>
      
      {forecastData && forecastData.factors && forecastData.factors.length > 0 && (
        <div className="mt-4 text-sm">
          <h4 className="font-semibold text-gray-700 dark:text-gray-300">Key Factors:</h4>
          <ul className="mt-1 space-y-1 text-gray-600 dark:text-gray-400">
            {forecastData.factors.slice(0, 2).map((factor, index) => (
              <li key={index} className="flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${factor.impact === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                {factor.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ForecastingModule;