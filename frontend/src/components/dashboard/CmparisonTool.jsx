import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { useData } from '../../context/DataContext';
import { FINANCIAL_METRICS } from '../../utils/constants';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { prepareComparisonData } from '../../utils/dataProcessor';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ComparisonTool = () => {
  const { 
    data, 
    selectedYears, 
    selectedCurrency, 
    selectedIndustryGroups,
    comparisonMode,
    comparisonMetrics,
    toggleComparisonMode,
    updateComparisonMetrics
  } = useData();
  
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'grossProfit']);
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Update comparison metrics when selection changes
  useEffect(() => {
    updateComparisonMetrics(selectedMetrics);
  }, [selectedMetrics, updateComparisonMetrics]);
  
  // Prepare chart data when inputs change
  useEffect(() => {
    if (!data || !data.yearlyData || data.yearlyData.length === 0) {
      setChartData(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    // Prepare the data for comparison
    const comparisonData = prepareComparisonData(data.yearlyData, selectedMetrics, selectedCurrency);
    
    // Generate colors for each metric
    const generateColors = () => {
      return selectedMetrics.map((metric, index) => {
        const hue = (index * 137.5) % 360; // Golden angle approximation
        return `hsl(${hue}, 70%, 60%)`;
      });
    };
    
    const colors = generateColors();
    
    // Prepare data for chart
    const chartData = {
      labels: comparisonData.map(item => item.year),
      datasets: selectedMetrics.map((metric, index) => ({
        label: getMetricLabel(metric),
        data: comparisonData.map(item => item[metric]),
        backgroundColor: colors[index],
        borderColor: colors[index],
        borderWidth: 1,
        borderRadius: 4
      }))
    };
    
    setChartData(chartData);
    
    // Update chart options
    const formatter = (value, metricKey) => {
      const isPercentage = metricKey.includes('margin') || metricKey.includes('percentage');
      return isPercentage 
        ? formatPercentage(value) 
        : formatCurrency(value, selectedCurrency);
    };
    
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
        title: {
          display: true,
          text: 'Metrics Comparison',
          font: {
            size: 16
          },
          padding: {
            top: 10,
            bottom: 20
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const datasetIndex = context.datasetIndex;
              const metric = selectedMetrics[datasetIndex];
              return `${context.dataset.label}: ${formatter(context.raw, metric)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false
          },
          ticks: {
            callback: (value) => formatCurrency(value, selectedCurrency, 0)
          }
        }
      }
    });
    
    setIsLoading(false);
  }, [data, selectedMetrics, selectedCurrency, selectedYears, selectedIndustryGroups]);
  
  // Get formatted metric label
  const getMetricLabel = (metricKey) => {
    const metric = FINANCIAL_METRICS.find(m => m.value === metricKey);
    return metric ? metric.label : metricKey;
  };
  
  // Toggle metric selection
  const toggleMetricSelection = (metricKey) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metricKey)) {
        // Don't allow deselecting all metrics
        if (prev.length > 1) {
          return prev.filter(m => m !== metricKey);
        }
        return prev;
      } else {
        // Don't allow more than 4 metrics for readability
        if (prev.length < 4) {
          return [...prev, metricKey];
        }
        return prev;
      }
    });
  };
  
  return (
    <div className="card">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-4 md:space-y-0">
        <h2 className="text-lg font-semibold text-jk-blue dark:text-white">
          Metrics Comparison
        </h2>
        
        <div className="flex">
          <button
            onClick={() => toggleComparisonMode()}
            className={`btn ${
              comparisonMode ? 'btn-primary' : 'btn-outline'
            } flex items-center mr-2`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
            </svg>
            Compare Mode
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Metrics to Compare
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {FINANCIAL_METRICS.map((metric) => (
            <button
              key={metric.value}
              onClick={() => toggleMetricSelection(metric.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                selectedMetrics.includes(metric.value)
                  ? 'bg-jk-blue text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-80">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jk-blue"></div>
          </div>
        ) : chartData ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <p>No comparison data available</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>
          <strong>Note:</strong> This tool allows you to compare different financial metrics side by side.
          Some metrics may have significantly different scales, which can make visual comparison challenging.
        </p>
      </div>
    </div>
  );
};

export default ComparisonTool;