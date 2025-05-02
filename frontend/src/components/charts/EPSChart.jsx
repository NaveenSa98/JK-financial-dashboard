import { useState, useEffect, useRef } from 'react';
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
import { useData } from '../../context/DataContext';
import { fetchEPSData } from '../../api/services';
import { getChartOptions, prepareLineChartData, chartColors } from '../../utils/chartConfig';
import { formatCurrency, formatPercentage, calculateGrowthRate, formatGrowthRate } from '../../utils/formatters';
import ExportOptions from '../common/ExportOptions';

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

const EPSChart = () => {
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
        
        const epsData = await fetchEPSData(params);
        
        // Prepare data for chart
        const data = prepareLineChartData(epsData, {
          xKey: 'year',
          yKey: 'eps',
          label: 'Earnings Per Share',
          borderColor: chartColors.eps,
          backgroundColor: 'rgba(153, 102, 255, 0.1)',
          additionalDataKeys: ['netProfit', 'shareCount']
        });
        
        setChartData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading EPS data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [selectedYears, selectedCurrency, selectedIndustryGroups]);
  
  // Chart options
  const options = {
    ...getChartOptions('eps', selectedCurrency),
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
          const csvContent = 'data:text/csv;charset=utf-8,Year,EPS,Net Profit,Share Count\n' + 
            chartData.labels.map((year, i) => 
              `${year},${chartData.datasets[0].data[i]},${chartData.datasets[0].netProfit[i]},${chartData.datasets[0].shareCount[i]}`
            ).join('\n');
          
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', 'john_keells_eps_data.csv');
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
        link.download = 'john_keells_eps_chart.png';
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
    const netProfits = chartData.datasets[0].netProfit;
    const growthRates = [];
    
    for (let i = 1; i < data.length; i++) {
      const currentEPS = data[i];
      const previousEPS = data[i-1];
      const epsGrowthRate = calculateGrowthRate(currentEPS, previousEPS);
      
      const currentNetProfit = netProfits[i];
      const previousNetProfit = netProfits[i-1];
      const netProfitGrowthRate = calculateGrowthRate(currentNetProfit, previousNetProfit);
      
      growthRates.push({
        year: chartData.labels[i],
        epsGrowthRate,
        epsFormatted: formatGrowthRate(epsGrowthRate),
        netProfitGrowthRate,
        netProfitFormatted: formatGrowthRate(netProfitGrowthRate)
      });
    }
    
    return growthRates;
  };
  
  const growthRates = calculateGrowthRates();
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-jk-blue dark:text-white">Earnings Per Share (EPS)</h2>
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">EPS</p>
              <p className="font-semibold">
                {formatCurrency(chartData.datasets[selectedPoint.datasetIndex].data[selectedPoint.index], selectedCurrency, 2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
              <p className="font-semibold">
                {formatCurrency(chartData.datasets[selectedPoint.datasetIndex].netProfit[selectedPoint.index], selectedCurrency, 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding Shares</p>
              <p className="font-semibold">
                {chartData.datasets[selectedPoint.datasetIndex].shareCount[selectedPoint.index].toLocaleString()}
              </p>
            </div>
          </div>
          
          {selectedPoint.index > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">EPS Growth</p>
                <p className={`font-semibold ${
                  growthRates[selectedPoint.index - 1].epsGrowthRate >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {growthRates[selectedPoint.index - 1].epsFormatted}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit Growth</p>
                <p className={`font-semibold ${
                  growthRates[selectedPoint.index - 1].netProfitGrowthRate >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {growthRates[selectedPoint.index - 1].netProfitFormatted}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {growthRates.length > 0 && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">EPS Growth Analysis</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">EPS</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">EPS Growth</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Net Profit Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {chartData && chartData.labels.map((year, index) => (
                  <tr key={year} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{year}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                      {formatCurrency(chartData.datasets[0].data[index], selectedCurrency, 2)}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {index > 0 ? (
                        <span className={
                          growthRates[index - 1].epsGrowthRate >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }>
                          {growthRates[index - 1].epsFormatted}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {index > 0 ? (
                        <span className={
                          growthRates[index - 1].netProfitGrowthRate >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }>
                          {growthRates[index - 1].netProfitFormatted}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>
          <strong>Note:</strong> Earnings Per Share (EPS) is calculated as Net Profit divided by Outstanding Shares. 
          It's a key indicator of the company's profitability on a per-share basis.
        </p>
      </div>
    </div>
  );
};

export default EPSChart;