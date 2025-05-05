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
import { generateIndustryForecast } from '../../api/services';
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

const IndustryForecastComparison = ({ 
  selectedMetric = 'revenue', 
  modelType = 'arima',
  forecastYears = 3,
  selectedIndustries = ['Leisure', 'Transportation', 'Financial Services'],
  height = 400
}) => {
  const { selectedCurrency } = useData();
  const [forecastData, setForecastData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Generate forecast for each industry when parameters change
  useEffect(() => {
    const generateForecasts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const forecasts = {};
        
        // Generate forecast for each selected industry
        for (const industry of selectedIndustries) {
          const params = {
            metric: selectedMetric,
            model: modelType,
            forecastYears: forecastYears,
            industryGroup: industry
          };
          
          try {
            const data = await generateIndustryForecast(params);
            forecasts[industry] = data;
          } catch (err) {
            console.error(`Error generating forecast for ${industry}:`, err);
            forecasts[industry] = { error: err.message || 'Forecast generation failed' };
          }
        }
        
        setForecastData(forecasts);
        setIsLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to generate industry comparisons');
        setIsLoading(false);
        console.error('Error generating industry forecasts:', err);
      }
    };
    
    generateForecasts();
  }, [selectedMetric, modelType, forecastYears, selectedIndustries.join(','), selectedCurrency]);
  
  // Update chart options
  useEffect(() => {
    // Get metric info for chart labels
    const metricInfo = FINANCIAL_METRICS.find(m => m.value === selectedMetric) || {};
    const isPercentage = selectedMetric.includes('margin') || selectedMetric.includes('percentage');
    
    const formatter = isPercentage
      ? (value) => formatPercentage(value) 
      : (value) => formatCurrency(value, selectedCurrency, 1);
    
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
          text: `Industry Comparison: ${metricInfo.label || selectedMetric}`
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
              
              return `${label}: ${formatter(value)}`;
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
            text: isPercentage 
              ? metricInfo.label || 'Percentage'
              : `${metricInfo.label || 'Value'} (${selectedCurrency})`
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
  
  // Prepare chart data
  const prepareChartData = () => {
    if (!forecastData || Object.keys(forecastData).length === 0) return null;
    
    // Collect all years from all industries
    const allYears = new Set();
    
    Object.keys(forecastData).forEach(industry => {
      const data = forecastData[industry];
      
      if (data.error) return;
      
      if (data.actualData) {
        data.actualData.forEach(item => {
          allYears.add(item.year);
        });
      }
      
      if (data.forecastData) {
        data.forecastData.forEach(item => {
          allYears.add(item.year);
        });
      }
    });
    
    // Sort years
    const years = [...allYears].sort();
    
    // Prepare datasets
    const datasets = [];
    
    // Create industry colors (for consistent coloring)
    const industryColors = {};
    selectedIndustries.forEach((industry, index) => {
      const colorKeys = Object.keys(chartColors);
      industryColors[industry] = chartColors[colorKeys[index % colorKeys.length]];
    });
    
    // Add datasets for each industry
    Object.keys(forecastData).forEach(industry => {
      const data = forecastData[industry];
      
      // Skip industries with errors
      if (data.error) return;
      
      const baseColor = industryColors[industry] || chartColors.default;
      
      // Historical data
      datasets.push({
        label: `${industry} (Historical)`,
        data: years.map(year => {
          const match = data.actualData.find(item => item.year === year);
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
        fill: false
      });
      
      // Forecast data
      datasets.push({
        label: `${industry} (Forecast)`,
        data: years.map(year => {
          const match = data.forecastData.find(item => item.year === year);
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
        fill: false
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
  
  // Display industry growth comparison
  const getIndustryGrowthComparison = () => {
    if (!forecastData || Object.keys(forecastData).length === 0) return null;
    
    const growthData = [];
    
    Object.keys(forecastData).forEach(industry => {
      const data = forecastData[industry];
      
      // Skip industries with errors
      if (data.error) return;
      
      // Get the last historical point and last forecast point
      if (data.actualData && data.actualData.length > 0 && 
          data.forecastData && data.forecastData.length > 0) {
          
        const lastHistorical = data.actualData[data.actualData.length - 1];
        const lastForecast = data.forecastData[data.forecastData.length - 1];
        
        // Calculate growth percentage
        const growthPercentage = ((lastForecast.value - lastHistorical.value) / lastHistorical.value) * 100;
        
        growthData.push({
          industry,
          startYear: lastHistorical.year,
          endYear: lastForecast.year,
          startValue: lastHistorical.value,
          endValue: lastForecast.value,
          growthPercentage
        });
      }
    });
    
    // Sort by growth percentage (descending)
    growthData.sort((a, b) => b.growthPercentage - a.growthPercentage);
    
    if (growthData.length === 0) return null;
    
    const isPercentage = selectedMetric.includes('margin') || selectedMetric.includes('percentage');
    const formatter = isPercentage 
      ? formatPercentage 
      : (value) => formatCurrency(value, selectedCurrency, 1);
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">Industry Growth Comparison</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Industry
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Period
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Starting Value
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Forecast Value
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {growthData.map((item) => (
                <tr key={item.industry}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {item.industry}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.startYear} - {item.endYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {formatter(item.startValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {formatter(item.endValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.growthPercentage > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.growthPercentage > 0 ? '+' : ''}{item.growthPercentage.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Prepared data
  const chartData = prepareChartData();
  
  return (
    <div className="industry-forecast-comparison">
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-pulse text-gray-500">Loading industry forecasts...</div>
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
          
          {getIndustryGrowthComparison()}
          
          <div className="mt-4 text-xs text-gray-500">
            <p className="mb-1">
              Model: {FORECASTING_MODELS.find(m => m.value === modelType)?.description || modelType}
            </p>
            <p>
              Forecast generated for {forecastYears} year{forecastYears !== 1 ? 's' : ''} across {selectedIndustries.length} industries
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustryForecastComparison; 