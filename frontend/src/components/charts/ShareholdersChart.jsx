import { useState, useEffect, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useData } from '../../context/DataContext';
import { fetchShareholdersData } from '../../api/services';
import { formatPercentage } from '../../utils/formatters';
import ExportOptions from '../common/ExportOptions';
import { chartColors } from '../../utils/chartConfig';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

// Create a pie chart color array since it's not defined in chartColors
const pieChartColors = [
  'rgba(54, 162, 235, 0.7)',
  'rgba(255, 99, 132, 0.7)',
  'rgba(255, 206, 86, 0.7)',
  'rgba(75, 192, 192, 0.7)',
  'rgba(153, 102, 255, 0.7)',
  'rgba(255, 159, 64, 0.7)',
  'rgba(199, 199, 199, 0.7)',
  'rgba(83, 102, 255, 0.7)',
  'rgba(255, 99, 71, 0.7)',
  'rgba(107, 142, 35, 0.7)'
];

const ShareholdersChart = () => {
  const { selectedYears } = useData();
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(selectedYears[0] || new Date().getFullYear());
  const chartRef = useRef(null);

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Fetching shareholders data for year:", year);
        const shareholdersData = await fetchShareholdersData({ year });
        console.log("Shareholders data received:", shareholdersData);
        
        if (!shareholdersData || !Array.isArray(shareholdersData)) {
          console.error("Invalid shareholders data format:", shareholdersData);
          setError("Invalid data format received from API");
          setIsLoading(false);
          return;
        }

        if (shareholdersData.length === 0) {
          console.warn("No shareholders data returned from API");
          setChartData(null);
          setIsLoading(false);
          return;
        }

        // Validate the data structure
        const isValidStructure = shareholdersData.every(item => 
          typeof item === 'object' && 
          item !== null && 
          'name' in item && 
          'percentage' in item
        );
        
        if (!isValidStructure) {
          console.error("Invalid shareholders data structure:", shareholdersData);
          setError("The data received from the API has an invalid structure");
          setIsLoading(false);
          return;
        }
        
        // Sort data by percentage (descending)
        const sortedData = [...shareholdersData].sort((a, b) => b.percentage - a.percentage);
        
        // If we have more than 10 shareholders, show top 9 and combine the rest
        let chartDataItems = sortedData;
        let othersPercentage = 0;
        
        if (sortedData.length > 10) {
          chartDataItems = sortedData.slice(0, 9);
          
          // Calculate the sum of the rest
          othersPercentage = sortedData
            .slice(9)
            .reduce((sum, item) => sum + (item.percentage || 0), 0);
          
          // Add 'Others' item
          chartDataItems.push({ 
            name: 'Others', 
            percentage: othersPercentage,
            isOthers: true
          });
        }
        
        // Prepare data for chart
        const data = {
          labels: chartDataItems.map(item => item.name),
          datasets: [
            {
              data: chartDataItems.map(item => item.percentage),
              backgroundColor: pieChartColors.slice(0, chartDataItems.length),
              borderColor: pieChartColors.map(color => color.replace('0.7', '1')),
              borderWidth: 1,
            },
          ],
        };
        
        setChartData({
          chartData: data,
          rawData: chartDataItems
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading shareholders data:', error);
        setError(error.message || "Failed to load shareholders data");
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [year]);
  
  // Update year when selectedYears changes
  useEffect(() => {
    if (selectedYears.length > 0 && !selectedYears.includes(year)) {
      setYear(selectedYears[0]);
    }
  }, [selectedYears, year]);
  
  // Chart options
  const options = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 15,
          color: 'rgb(74, 85, 104)',
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `${context.label}: ${formatPercentage(value)}`;
          }
        }
      }
    },
    maintainAspectRatio: false,
    layout: {
      padding: 20
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
          const csvContent = 'data:text/csv;charset=utf-8,Shareholder,Percentage\n' + 
            chartData.rawData.map(item => 
              `${item.name},${item.percentage}`
            ).join('\n');
          
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', `john_keells_shareholders_${year}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        break;
        
      case 'pdf':
        alert('PDF export is not implemented in this demo');
        break;
        
      case 'image':
        const link = document.createElement('a');
        link.href = chart.toBase64Image();
        link.download = `john_keells_shareholders_${year}.png`;
        link.click();
        break;
        
      default:
        break;
    }
  };
  
  // Year selector options
  const yearOptions = [...selectedYears].sort((a, b) => b - a);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-jk-blue dark:text-white mr-4">Top Shareholders</h2>
          <select 
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2 text-sm"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <ExportOptions onExport={handleExport} />
      </div>
      
      <div className="chart-container h-80">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jk-blue"></div>
          </div>
        ) : error ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-red-500 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-center">{error}</p>
          </div>
        ) : chartData ? (
          <Pie ref={chartRef} data={chartData.chartData} options={options} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            No shareholders data available for {year}
          </div>
        )}
      </div>
      
      {chartData && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                <th className="py-2 px-4 text-xs font-medium text-gray-600 dark:text-gray-300">Shareholder</th>
                <th className="py-2 px-4 text-xs font-medium text-gray-600 dark:text-gray-300 text-right">Ownership</th>
                {chartData.rawData[0].shares && (
                  <th className="py-2 px-4 text-xs font-medium text-gray-600 dark:text-gray-300 text-right">Shares</th>
                )}
              </tr>
            </thead>
            <tbody>
              {chartData.rawData.map((shareholder, index) => (
                <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="py-2 px-4 text-xs text-gray-800 dark:text-gray-200">{shareholder.name}</td>
                  <td className="py-2 px-4 text-xs text-gray-800 dark:text-gray-200 text-right">{formatPercentage(shareholder.percentage)}</td>
                  {chartData.rawData[0].shares && (
                    <td className="py-2 px-4 text-xs text-gray-800 dark:text-gray-200 text-right">
                      {shareholder.shares ? shareholder.shares.toLocaleString() : 'N/A'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>
          <strong>Note:</strong> Data shows the percentage of ownership by major shareholders.
          {chartData && chartData.rawData.some(item => item.isOthers) && (
            <> 'Others' category represents smaller shareholders with combined holding of {formatPercentage(chartData.rawData.find(item => item.isOthers)?.percentage || 0)}.</>
          )}
        </p>
      </div>
    </div>
  );
};

export default ShareholdersChart;