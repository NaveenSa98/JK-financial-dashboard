import { useState, useEffect, useRef } from 'react';
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
import { fetchCostVsExpensesData } from '../../api/services';
import { getChartOptions, prepareBarChartData, chartColors } from '../../utils/chartConfig';
import { formatCurrency } from '../../utils/formatters';
import ExportOptions from '../common/ExportOptions';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CostVsExpensesChart = () => {
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
        
        const costExpensesData = await fetchCostVsExpensesData(params);
        
        // Prepare data for chart
        const data = prepareBarChartData(costExpensesData, {
          xKey: 'year',
          yKeys: ['costOfSales', 'operatingExpenses'],
          labels: ['Cost of Sales', 'Operating Expenses'],
          colors: [chartColors.costOfSales, chartColors.operatingExpenses]
        });
        
        setChartData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading cost vs expenses data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [selectedYears, selectedCurrency, selectedIndustryGroups]);
  
  // Chart options
  const options = {
    ...getChartOptions('costVsExpenses', selectedCurrency),
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
          const csvContent = 'data:text/csv;charset=utf-8,Year,Cost of Sales,Operating Expenses\n' + 
            chartData.labels.map((year, i) => 
              `${year},${chartData.datasets[0].data[i]},${chartData.datasets[1].data[i]}`
            ).join('\n');
          
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', 'john_keells_cost_vs_expenses_data.csv');
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
        link.download = 'john_keells_cost_vs_expenses_chart.png';
        link.click();
        break;
        
      default:
        break;
    }
  };
  
  // Calculate cost to revenue ratio
  const calculateCostRatio = (costIndex) => {
    if (!chartData || !chartData.datasets) return [];
    
    const costs = chartData.datasets[costIndex].data;
    const totalCosts = chartData.datasets.reduce((sum, dataset, index) => {
      return index === 0 || index === 1 
        ? sum.map((value, i) => value + dataset.data[i])
        : sum;
    }, Array(costs.length).fill(0));
    
    return costs.map((cost, index) => ({
      year: chartData.labels[index],
      ratio: (cost / totalCosts[index]) * 100,
      cost
    }));
  };
  
  const costOfSalesRatio = calculateCostRatio(0);
  const operatingExpensesRatio = calculateCostRatio(1);
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-jk-blue dark:text-white">Cost of Sales vs. Operating Expenses</h2>
        <ExportOptions onExport={handleExport} />
      </div>
      
      <div className="chart-container">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jk-blue"></div>
          </div>
        ) : chartData ? (
          <Bar ref={chartRef} data={chartData} options={options} />
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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {chartData.datasets[selectedPoint.datasetIndex].label}
              </p>
              <p className="font-semibold">
                {formatCurrency(chartData.datasets[selectedPoint.datasetIndex].data[selectedPoint.index], selectedCurrency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Percentage of Total Costs
              </p>
              <p className="font-semibold">
                {selectedPoint.datasetIndex === 0 
                  ? costOfSalesRatio[selectedPoint.index].ratio.toFixed(1)
                  : operatingExpensesRatio[selectedPoint.index].ratio.toFixed(1)
                }%
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cost Structure Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost of Sales</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">% of Total</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Operating Expenses</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {chartData && chartData.labels.map((year, index) => (
                <tr key={year} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{year}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                    {formatCurrency(chartData.datasets[0].data[index], selectedCurrency)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                    {costOfSalesRatio[index].ratio.toFixed(1)}%
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                    {formatCurrency(chartData.datasets[1].data[index], selectedCurrency)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                    {operatingExpensesRatio[index].ratio.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>
          <strong>Note:</strong> Cost of Sales represents direct costs attributable to the production of goods sold, 
          while Operating Expenses cover administrative, sales, and other operational costs.
        </p>
      </div>
    </div>
  );
};

export default CostVsExpensesChart;