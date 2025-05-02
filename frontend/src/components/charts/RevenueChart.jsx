import { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useData } from '../../context/DataContext';
import { fetchRevenueData } from '../../api/services';
import { getChartOptions, prepareLineChartData, chartColors } from '../../utils/chartConfig';
import { formatCurrency, calculateGrowthRate, formatGrowthRate } from '../../utils/formatters';
import ExportOptions from '../common/ExportOptions';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const RevenueChart = () => {
  const { selectedYears, selectedCurrency, selectedIndustryGroups } = useData();
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const chartRef = useRef(null);
  
  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const params = {
          years: selectedYears,
          currency: selectedCurrency,
          industryGroups: selectedIndustryGroups
        };
        
        const revenueData = await fetchRevenueData(params);
        
        // Prepare data for chart
        const data = prepareLineChartData(revenueData, {
          xKey: 'year',
          yKey: 'revenue',
          label: 'Total Revenue',
          borderColor: chartColors.revenue
        });
        
        setChartData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading revenue data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [selectedYears, selectedCurrency, selectedIndustryGroups]);
  
  // Chart options
  const options = {
    ...getChartOptions('revenue', selectedCurrency),
    onClick: (_, elements) => {
      if (elements.length > 0) {
        const { datasetIndex, index } = elements[0];
        setSelectedPoint({ datasetIndex, index });
      } else {
        setSelectedPoint(null);
      }
    }
  };
  
  // Handle export
  const handleExport = (format) => {
    if (!chartRef.current) return;
    
    const chart = chartRef.current;
    
    switch (format) {
      case 'csv':
        // Export as CSV
        if (chartData) {
          const csvContent = 'data:text/csv;charset=utf-8,Year,Revenue\n' + 
            chartData.labels.map((year, i) => 
              `${year},${chartData.datasets[0].data[i]}`
            ).join('\n');
          
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', 'john_keells_revenue_data.csv');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        break;
        
      case 'pdf':
        // For PDF we would use jsPDF library
        alert('PDF export is not implemented in this demo');
        break;
        
      case 'image':
        // Export as PNG
        const link = document.createElement('a');
        link.href = chart.toBase64Image();
        link.download = 'john_keells_revenue_chart.png';
        link.click();
        break;
        
      default:
        break;
    }
  };
  
  // Calculate growth rates
  const calculateGrowthRates = () => {
    if (!chartData || !chartData.datasets[0].data || chartData.datasets[0].data.length < 2) {
      return [];
    }
    
    const data = chartData.datasets[0].data;
    const growthRates = [];
    
    for (let i = 1; i < data.length; i++) {
      const currentValue = data[i];
      const previousValue = data[i-1];
      const growthRate = calculateGrowthRate(currentValue, previousValue);
      
      growthRates.push({
        year: chartData.labels[i],
        rate: growthRate,
        formatted: formatGrowthRate(growthRate)
      });
    }
    
    return growthRates;
  };
  
  const growthRates = calculateGrowthRates();
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-jk-blue dark:text-white">Total Revenue (5-Year Trend)</h2>
        <ExportOptions onExport={handleExport} />
      </div>
      
      <div className="chart-container">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jk-blue"></div>
          </div>
        ) : chartData ? (
          <Line ref={chartRef} data={chartData} options={options} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            No data available
          </div>
        )}
      </div>
      
      {selectedPoint && chartData && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
          <h3 className="font-medium mb-2">
            {chartData.labels[selectedPoint.index]} Details:
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
              <p className="font-semibold">
                {formatCurrency(chartData.datasets[selectedPoint.datasetIndex].data[selectedPoint.index], selectedCurrency)}
              </p>
            </div>
            {selectedPoint.index > 0 && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate (YoY)</p>
                <p className="font-semibold">
                  {growthRates[selectedPoint.index - 1].formatted}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {growthRates.length > 0 && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year-over-Year Growth Rates</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {growthRates.map((item) => (
              <div key={item.year} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.year}</div>
                <div className={`text-sm font-semibold ${item.rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.formatted}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>
          <strong>Note:</strong> The revenue figures include all business segments. 
          {chartData && chartData.datasets[0].data.length > 0 && (
            <>
              {' '}The most recent year ({chartData.labels[chartData.labels.length - 1]}) 
              shows a revenue of {formatCurrency(chartData.datasets[0].data[chartData.datasets[0].data.length - 1], selectedCurrency)}.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default RevenueChart;