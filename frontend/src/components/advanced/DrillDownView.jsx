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
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { chartColors } from '../../utils/chartConfig';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DrillDownView = ({ 
  data, 
  year, 
  metric = 'revenue', 
  category = 'industryGroup',
  onClose = null 
}) => {
  const { selectedCurrency } = useData();
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Prepare chart data when inputs change
  useEffect(() => {
    if (!data) {
      setChartData(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    // Get the data for the selected year
    const yearData = data.find(item => item.year === year);
    
    if (!yearData || !yearData[category]) {
      setChartData(null);
      setIsLoading(false);
      return;
    }
    
    // Prepare data based on category
    const categoryData = yearData[category];
    
    const labels = Object.keys(categoryData);
    const values = Object.values(categoryData);
    
    const datasets = [
      {
        label: getMetricLabel(metric),
        data: values,
        backgroundColor: Object.keys(categoryData).map((_, index) => {
          // Generate colors based on index using HSL for even distribution
          const hue = (index * 137.5) % 360; // Golden angle approximation
          return `hsl(${hue}, 70%, 60%)`;
        }),
        borderWidth: 1,
        borderRadius: 4
      }
    ];
    
    setChartData({
      labels,
      datasets
    });
    
    setIsLoading(false);
  }, [data, year, metric, category, selectedCurrency]);
  
  // Get formatted metric label
  const getMetricLabel = (metricKey) => {
    const metricLabels = {
      revenue: 'Revenue',
      costOfSales: 'Cost of Sales',
      operatingExpenses: 'Operating Expenses',
      grossProfit: 'Gross Profit',
      netProfit: 'Net Profit',
      eps: 'Earnings Per Share'
    };
    
    return metricLabels[metricKey] || metricKey;
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `${getMetricLabel(metric)} by ${getCategoryLabel(category)} (${year})`,
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
            const label = context.dataset.label || '';
            const value = context.raw;
            
            if (metric === 'grossProfitMargin' || metric.includes('percentage')) {
              return `${label}: ${formatPercentage(value)}`;
            } else {
              return `${label}: ${formatCurrency(value, selectedCurrency)}`;
            }
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
          callback: (value) => {
            if (metric === 'grossProfitMargin' || metric.includes('percentage')) {
              return formatPercentage(value);
            } else {
              return formatCurrency(value, selectedCurrency, 0);
            }
          }
        }
      }
    }
  };
  
  // Get category label
  const getCategoryLabel = (categoryKey) => {
    const categoryLabels = {
      industryGroup: 'Industry Group',
      quarter: 'Quarter',
      region: 'Region',
      product: 'Product'
    };
    
    return categoryLabels[categoryKey] || categoryKey;
  };
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-jk-blue dark:text-white">
          {getMetricLabel(metric)} Breakdown - {year}
        </h2>
        
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="h-96">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jk-blue"></div>
          </div>
        ) : chartData ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <p>No breakdown data available</p>
          </div>
        )}
      </div>
      
      {chartData && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {getCategoryLabel(category)} Contribution Analysis
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getCategoryLabel(category)}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getMetricLabel(metric)}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {chartData && chartData.labels.map((label, index) => {
                  const value = chartData.datasets[0].data[index];
                  const total = chartData.datasets[0].data.reduce((sum, val) => sum + val, 0);
                  const percentage = (value / total) * 100;
                  
                  return (
                    <tr key={label} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {label}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {metric === 'grossProfitMargin' || metric.includes('percentage')
                          ? formatPercentage(value)
                          : formatCurrency(value, selectedCurrency)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatPercentage(percentage)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrillDownView;