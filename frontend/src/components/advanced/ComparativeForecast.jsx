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
import { generateMultiMetricForecast } from '../../api/services';
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

const ComparativeForecast = ({ 
  selectedMetrics = ['revenue', 'eps'], 
  modelType = 'arima',
  forecastYears = 3,
  industryGroup = null,
  showCorrelations = true,
  height = 400
}) => {
  const { selectedCurrency } = useData();
  const [forecastData, setForecastData] = useState(null);
  const [chartOptions, setChartOptions] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Generate forecast when parameters change
  useEffect(() => {
    const generateForecast = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const params = {
          metrics: selectedMetrics,
          model: modelType,
          forecastYears: forecastYears,
          industryGroup: industryGroup
        };
        
        const data = await generateMultiMetricForecast(params);
        setForecastData(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to generate forecast');
        setIsLoading(false);
        console.error('Error generating comparative forecast:', err);
      }
    };
    
    generateForecast();
  }, [selectedMetrics, modelType, forecastYears, industryGroup, selectedCurrency]);
  
  // Update chart options
  useEffect(() => {
    setChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      stacked: false,
      plugins: {
        title: {
          display: true,
          text: industryGroup 
            ? `${industryGroup} - Comparative Forecast` 
            : 'Comparative Forecast Analysis'
        },
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            boxWidth: 10,
            boxHeight: 10
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
              const value = context.raw;
              const metric = context.dataset.metric;
              
              if (!metric) return `${label}: ${value}`;
              
              // Format value based on metric type
              const formattedValue = metric === 'grossProfitMargin' || metric.includes('percentage')
                ? formatPercentage(value)
                : formatCurrency(value, selectedCurrency, 1);
              
              return `${label}: ${formattedValue}`;
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
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Value'
          },
          grid: {
            drawBorder: false
          }
        }
      }
    });
  }, [industryGroup, selectedCurrency]);
  
  // Prepare chart data
  const prepareChartData = () => {
    if (!forecastData || !forecastData.forecasts) return null;
    
    // Collect all years from all metrics
    const allYears = new Set();
    
    Object.keys(forecastData.forecasts).forEach(metric => {
      if (forecastData.forecasts[metric].actualData) {
        forecastData.forecasts[metric].actualData.forEach(item => {
          allYears.add(item.year);
        });
      }
      
      if (forecastData.forecasts[metric].forecastData) {
        forecastData.forecasts[metric].forecastData.forEach(item => {
          allYears.add(item.year);
        });
      }
    });
    
    // Sort years
    const years = [...allYears].sort();
    
    // Prepare datasets
    const datasets = [];
    
    // Add datasets for each metric
    Object.keys(forecastData.forecasts).forEach((metric, index) => {
      const metricData = forecastData.forecasts[metric];
      const baseColor = chartColors[metric] || Object.values(chartColors)[index % Object.values(chartColors).length];
      
      // Skip metrics with errors
      if (metricData.error) return;
      
      // Historical data
      datasets.push({
        label: `${getMetricLabel(metric)} (Historical)`,
        data: years.map(year => {
          const match = metricData.actualData.find(item => item.year === year);
          return match ? match.value : null;
        }),
        borderColor: baseColor,
        backgroundColor: `rgba(${hexToRgb(baseColor)}, 0.1)`,
        borderWidth: 2,
        pointBackgroundColor: 'white',
        pointBorderColor: baseColor,
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.1,
        fill: false,
        metric: metric
      });
      
      // Forecast data
      datasets.push({
        label: `${getMetricLabel(metric)} (Forecast)`,
        data: years.map(year => {
          const match = metricData.forecastData.find(item => item.year === year);
          return match ? match.value : null;
        }),
        borderColor: baseColor,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointBackgroundColor: 'white',
        pointBorderColor: baseColor,
        pointRadius: 4,
        pointStyle: 'triangle',
        tension: 0.1,
        fill: false,
        metric: metric
      });
    });
    
    return {
      labels: years,
      datasets
    };
  };
  
  // Helper to convert hex color to rgb
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '75, 192, 192';
  };
  
  // Get metric label
  const getMetricLabel = (metricKey) => {
    const metric = FINANCIAL_METRICS.find(m => m.value === metricKey);
    return metric ? metric.label : metricKey;
  };
  
  // Prepare correlation data for display
  const getCorrelationMatrix = () => {
    if (!forecastData || !forecastData.correlations) return null;
    
    return Object.keys(forecastData.correlations).map(metric1 => {
      return (
        <div key={metric1} className="flex items-center mb-2">
          <div className="w-1/4 text-sm font-medium pr-2">{getMetricLabel(metric1)}</div>
          <div className="flex-1 flex">
            {Object.keys(forecastData.correlations[metric1]).map(metric2 => {
              const correlation = forecastData.correlations[metric1][metric2];
              let bgColor = 'bg-gray-200';
              let textColor = 'text-gray-700';
              
              if (correlation !== null) {
                if (correlation > 0.7) {
                  bgColor = 'bg-green-100';
                  textColor = 'text-green-800';
                } else if (correlation > 0.3) {
                  bgColor = 'bg-blue-100';
                  textColor = 'text-blue-800';
                } else if (correlation > -0.3) {
                  bgColor = 'bg-gray-100';
                  textColor = 'text-gray-800';
                } else if (correlation > -0.7) {
                  bgColor = 'bg-orange-100';
                  textColor = 'text-orange-800';
                } else {
                  bgColor = 'bg-red-100';
                  textColor = 'text-red-800';
                }
              }
              
              return (
                <div 
                  key={`${metric1}-${metric2}`} 
                  className={`flex-1 mx-1 p-2 text-center text-xs rounded ${bgColor} ${textColor}`}
                  title={`Correlation between ${getMetricLabel(metric1)} and ${getMetricLabel(metric2)}`}
                >
                  {correlation !== null ? correlation.toFixed(2) : 'N/A'}
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };
  
  // Prepared data
  const chartData = prepareChartData();
  
  return (
    <div className="comparative-forecast">
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-pulse text-gray-500">Loading forecasts...</div>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          <p className="font-medium">Error loading forecast data</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {chartData && (
        <div className="space-y-6">
          <div style={{ height: `${height}px` }}>
            <Line data={chartData} options={chartOptions} />
          </div>
          
          {showCorrelations && forecastData.correlations && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Metric Correlations</h3>
              <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="flex items-center mb-2">
                  <div className="w-1/4"></div>
                  <div className="flex-1 flex">
                    {Object.keys(forecastData.correlations).map(metric => (
                      <div key={metric} className="flex-1 mx-1 p-2 text-center text-xs font-medium">
                        {getMetricLabel(metric)}
                      </div>
                    ))}
                  </div>
                </div>
                {getCorrelationMatrix()}
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>
                  <span className="inline-block w-3 h-3 bg-green-100 mr-1"></span> Strong positive ({'>'}0.7)
                  <span className="inline-block w-3 h-3 bg-blue-100 mx-3 mr-1"></span> Moderate positive (0.3-0.7)
                  <span className="inline-block w-3 h-3 bg-gray-100 mx-3 mr-1"></span> Weak/No correlation (-0.3-0.3)
                  <span className="inline-block w-3 h-3 bg-orange-100 mx-3 mr-1"></span> Moderate negative (-0.7--0.3)
                  <span className="inline-block w-3 h-3 bg-red-100 mx-3 mr-1"></span> Strong negative ({'<'}-0.7)
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-xs text-gray-500">
            <p className="mb-1">
              Model: {FORECASTING_MODELS.find(m => m.value === modelType)?.description || modelType}
            </p>
            <p>
              Forecast generated for {forecastYears} year{forecastYears !== 1 ? 's' : ''} 
              {industryGroup ? ` in ${industryGroup} sector` : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparativeForecast; 