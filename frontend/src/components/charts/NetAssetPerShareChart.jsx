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
import { fetchNetAssetPerShareData } from '../../api/services';
import { getChartOptions, prepareLineChartData, chartColors } from '../../utils/chartConfig';
import { formatCurrency, calculateGrowthRate, formatGrowthRate } from '../../utils/formatters';
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

const NetAssetPerShareChart = () => {
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
        
        const napsData = await fetchNetAssetPerShareData(params);
        
        // Prepare data for chart
        const datasets = [];
        
        // Add NAPS dataset
        datasets.push({
          label: 'Net Asset Per Share',
          data: napsData.map(item => item.netAssetPerShare),
          borderColor: chartColors.netAssetPerShare,
          backgroundColor: 'rgba(201, 203, 207, 0.1)',
          tension: 0.1,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: 'white',
          pointBorderColor: chartColors.netAssetPerShare,
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          fill: true
        });
        
        // Add industry benchmark if available
        if (napsData.some(item => item.industryBenchmark !== null)) {
          datasets.push({
            label: 'Industry Benchmark',
            data: napsData.map(item => item.industryBenchmark),
            borderColor: chartColors.industryBenchmark,
            backgroundColor: 'transparent',
            tension: 0.1,
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 3,
            pointBackgroundColor: 'white',
            pointBorderColor: chartColors.industryBenchmark,
            pointBorderWidth: 2,
            pointHoverRadius: 5,
            fill: false
          });
        }
        
        setChartData({
          labels: napsData.map(item => item.year),
          datasets
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading net asset per share data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [selectedYears, selectedCurrency, selectedIndustryGroups]);
  
  // Chart options
  const options = {
    ...getChartOptions('netAssetPerShare', selectedCurrency),
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
          let csvContent = 'data:text/csv;charset=utf-8,Year,Net Asset Per Share';
          
          if (chartData.datasets.length > 1) {
            csvContent += ',Industry Benchmark';
          }
          
          csvContent += '\n';
          
          csvContent += chartData.labels.map((year, i) => {
            let row = `${year},${chartData.datasets[0].data[i]}`;
            
            if (chartData.datasets.length > 1) {
              row += `,${chartData.datasets[1].data[i] || ''}`;
            }
            
            return row;
          }).join('\n');
          
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', 'john_keells_naps_data.csv');
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
        link.download = 'john_keells_naps_chart.png';
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
  
  // Calculate comparison with industry benchmark
  const calculateBenchmarkComparison = () => {
    if (
      !chartData || 
      chartData.datasets.length < 2 || 
      !chartData.datasets[1].data || 
      chartData.datasets[1].data.length === 0
    ) {
      return [];
    }
    
    const napsData = chartData.datasets[0].data;
    const benchmarkData = chartData.datasets[1].data;
    const comparisons = [];
    
    for (let i = 0; i < napsData.length; i++) {
      if (benchmarkData[i] === null || benchmarkData[i] === undefined) continue;
      
      const naps = napsData[i];
      const benchmark = benchmarkData[i];
      const difference = naps - benchmark;
      const percentDifference = (difference / benchmark) * 100;
      
      comparisons.push({
        year: chartData.labels[i],
        naps,
        benchmark,
        difference,
        percentDifference,
        formattedDifference: formatCurrency(difference, selectedCurrency, 2),
        formattedPercentDifference: formatGrowthRate(percentDifference)
      });
    }
    
    return comparisons;
  };
  
  const benchmarkComparisons = calculateBenchmarkComparison();
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-jk-blue dark:text-white">Net Asset Per Share</h2>
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
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {chartData.datasets[selectedPoint.datasetIndex].label}
              </p>
              <p className="font-semibold">
                {formatCurrency(chartData.datasets[selectedPoint.datasetIndex].data[selectedPoint.index], selectedCurrency, 2)}
              </p>
            </div>
            
            {selectedPoint.datasetIndex === 0 && selectedPoint.index > 0 && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Growth from Previous Year</p>
                <p className={`font-semibold ${
                  growthRates[selectedPoint.index - 1].rate >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {growthRates[selectedPoint.index - 1].formatted}
                </p>
              </div>
            )}
            
            {selectedPoint.datasetIndex === 0 && chartData.datasets.length > 1 && chartData.datasets[1].data[selectedPoint.index] && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Comparison to Industry</p>
                <p className={`font-semibold ${
                  chartData.datasets[0].data[selectedPoint.index] >= chartData.datasets[1].data[selectedPoint.index]
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatGrowthRate((chartData.datasets[0].data[selectedPoint.index] - chartData.datasets[1].data[selectedPoint.index]) / chartData.datasets[1].data[selectedPoint.index] * 100)} vs Benchmark
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {growthRates.length > 0 && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">NAPS Growth Trend</h3>
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
      
      {benchmarkComparisons.length > 0 && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Industry Benchmark Comparison</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">NAPS</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Industry Benchmark</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Difference</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">% Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {benchmarkComparisons.map((item) => (
                  <tr key={item.year} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{item.year}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.naps, selectedCurrency, 2)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.benchmark, selectedCurrency, 2)}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={item.difference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {item.formattedDifference}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={item.percentDifference >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {item.formattedPercentDifference}
                      </span>
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
          <strong>Note:</strong> Net Asset Per Share (NAPS) is calculated as (Total Assets - Total Liabilities) / Outstanding Shares. 
          It represents the book value of the company's equity on a per-share basis. A higher NAPS compared to the industry 
          benchmark indicates stronger financial position relative to peers.
        </p>
      </div>
    </div>
  );
};

export default NetAssetPerShareChart;