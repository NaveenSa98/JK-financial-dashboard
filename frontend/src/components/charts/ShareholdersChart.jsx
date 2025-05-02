import { useState, useEffect, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useData } from '../../context/DataContext';
import { fetchShareholdersData } from '../../api/services';
import { getChartOptions, preparePieChartData } from '../../utils/chartConfig';
import { formatPercentage } from '../../utils/formatters';
import { AVAILABLE_YEARS } from '../../utils/constants';
import ExportOptions from '../common/ExportOptions';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const ShareholdersChart = () => {
  const { selectedYears } = useData();
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(Math.max(...selectedYears));
  const [shareholders, setShareholders] = useState([]);
  const [selectedSlice, setSelectedSlice] = useState(null);
  const chartRef = useRef(null);
  
  // Fetch data
  useEffect(() => {
    if (!selectedYear) return;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const params = {
          year: selectedYear
        };
        
        const shareholdersData = await fetchShareholdersData(params);
        setShareholders(shareholdersData);
        
        // Prepare data for chart
        const data = preparePieChartData(shareholdersData, {
          labelKey: 'name',
          valueKey: 'percentage',
          maxSlices: 5,
          otherLabel: 'Other Shareholders'
        });
        
        setChartData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading shareholders data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [selectedYear]);
  
  // Update selected year when selected years change
  useEffect(() => {
    if (selectedYears.length > 0) {
      const maxYear = Math.max(...selectedYears);
      if (maxYear !== selectedYear && selectedYears.includes(maxYear)) {
        setSelectedYear(maxYear);
      } else if (!selectedYears.includes(selectedYear)) {
        setSelectedYear(selectedYears[0]);
      }
    }
  }, [selectedYears]);
  
  // Chart options
  const options = {
    ...getChartOptions('shareholders'),
    onClick: (_, elements) => {
      if (elements.length > 0) {
        const { index } = elements[0];
        setSelectedSlice(index);
      } else {
        setSelectedSlice(null);
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
        if (shareholders.length > 0) {
          const csvContent = 'data:text/csv;charset=utf-8,Rank,Shareholder,Percentage\n' + 
            shareholders.map((item, index) => 
              `${index + 1},${item.name},${item.percentage}`
            ).join('\n');
          
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', `john_keells_shareholders_${selectedYear}.csv`);
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
        link.download = `john_keells_shareholders_chart_${selectedYear}.png`;
        link.click();
        break;
        
      default:
        break;
    }
  };
  
  // Calculate concentration metrics
  const calculateConcentrationMetrics = () => {
    if (!shareholders || shareholders.length === 0) return null;
    
    const top5Percentage = shareholders.slice(0, 5).reduce((sum, item) => sum + item.percentage, 0);
    const top10Percentage = shareholders.slice(0, 10).reduce((sum, item) => sum + item.percentage, 0);
    const top20Percentage = shareholders.reduce((sum, item) => sum + item.percentage, 0);
    
    return {
      top5Percentage,
      top10Percentage,
      top20Percentage
    };
  };
  
  const concentrationMetrics = calculateConcentrationMetrics();
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-jk-blue dark:text-white">Top Shareholders Distribution</h2>
        <ExportOptions onExport={handleExport} />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Year</label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_YEARS.filter(year => selectedYears.includes(year)).map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedYear === year
                  ? 'bg-jk-blue text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="chart-container md:h-80">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jk-blue"></div>
            </div>
          ) : chartData ? (
            <Pie ref={chartRef} data={chartData} options={options} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              No data available
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Ownership Concentration</h3>
          
          {concentrationMetrics && (
            <div className="space-y-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                <div className="text-sm text-gray-500 dark:text-gray-400">Top 5 Shareholders</div>
                <div className="text-xl font-semibold text-jk-blue dark:text-blue-400">
                  {formatPercentage(concentrationMetrics.top5Percentage)}
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                <div className="text-sm text-gray-500 dark:text-gray-400">Top 10 Shareholders</div>
                <div className="text-xl font-semibold text-jk-blue dark:text-blue-400">
                  {formatPercentage(concentrationMetrics.top10Percentage)}
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                <div className="text-sm text-gray-500 dark:text-gray-400">Top 20 Shareholders</div>
                <div className="text-xl font-semibold text-jk-blue dark:text-blue-400">
                  {formatPercentage(concentrationMetrics.top20Percentage)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {selectedSlice !== null && chartData && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
          <h3 className="font-medium mb-2">
            Selected Shareholder:
          </h3>
          <div className="flex items-center">
            <span 
              className="h-4 w-4 rounded-full mr-2" 
              style={{ backgroundColor: chartData.datasets[0].backgroundColor[selectedSlice] }}
            ></span>
            <div>
              <span className="font-medium">{chartData.labels[selectedSlice]}</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {formatPercentage(chartData.datasets[0].data[selectedSlice])}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top 10 Shareholders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shareholder</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ownership</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {shareholders.slice(0, 10).map((item, index) => (
                <tr 
                  key={item.name} 
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedSlice === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  onClick={() => {
                    if (index < 5) {
                      setSelectedSlice(index);
                    } else if (index >= 5) {
                      setSelectedSlice(5); // "Others" slice
                    }
                  }}
                >
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatPercentage(item.percentage)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>
          <strong>Note:</strong> Shareholder data represents ownership as of the end of each financial year. 
          High ownership concentration may impact corporate governance and decision-making processes.
        </p>
      </div>
    </div>
  );
};

export default ShareholdersChart;