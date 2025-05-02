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
import annotationPlugin from 'chartjs-plugin-annotation';
import { useData } from '../../context/DataContext';
import { fetchGrossProfitMarginData } from '../../api/services';
import { getChartOptions, prepareLineChartData, chartColors } from '../../utils/chartConfig';
import { formatPercentage } from '../../utils/formatters';
import { KEY_EVENTS } from '../../utils/constants';
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
  Filler,
  annotationPlugin
);

const GrossProfitMarginChart = () => {
  const { selectedYears, selectedIndustryGroups } = useData();
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const chartRef = useRef(null);
  
  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const params = {
          years: selectedYears,
          industryGroups: selectedIndustryGroups
        };
        
        const marginData = await fetchGrossProfitMarginData(params);
        
        // Collect annotations from the data
        const eventAnnotations = [];
        marginData.forEach((item, index) => {
          if (item.events && item.events.length > 0) {
            item.events.forEach(event => {
              const matchingKeyEvent = KEY_EVENTS.find(keyEvent => 
                keyEvent.title === event.title || 
                keyEvent.date === event.date
              );
              
              if (matchingKeyEvent) {
                eventAnnotations.push({
                  type: 'line',
                  scaleID: 'x',
                  value: item.year,
                  borderColor: matchingKeyEvent.impact === 'positive' 
                    ? 'rgba(75, 192, 192, 0.7)' 
                    : 'rgba(255, 99, 132, 0.7)',
                  borderWidth: 2,
                  borderDash: [6, 6],
                  label: {
                    display: true,
                    content: matchingKeyEvent.title,
                    position: 'start',
                    backgroundColor: matchingKeyEvent.impact === 'positive' 
                      ? 'rgba(75, 192, 192, 0.7)' 
                      : 'rgba(255, 99, 132, 0.7)',
                    color: 'white',
                    font: {
                      size: 10
                    },
                    padding: 4
                  }
                });
              }
            });
          }
        });
        
        setAnnotations(eventAnnotations);
        
        // Prepare data for chart
        const data = prepareLineChartData(marginData, {
          xKey: 'year',
          yKey: 'grossProfitMargin',
          label: 'Gross Profit Margin',
          borderColor: chartColors.grossProfit,
          backgroundColor: 'rgba(75, 192, 192, 0.1)'
        });
        
        setChartData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading gross profit margin data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [selectedYears, selectedIndustryGroups]);
  
  // Chart options with annotations
  const options = {
    ...getChartOptions('grossProfitMargin'),
    onClick: (_, elements) => {
      if (elements.length > 0) {
        const { datasetIndex, index } = elements[0];
        setSelectedPoint({ datasetIndex, index });
      } else {
        setSelectedPoint(null);
      }
    },
    plugins: {
      ...getChartOptions('grossProfitMargin').plugins,
      annotation: {
        annotations
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
          const csvContent = 'data:text/csv;charset=utf-8,Year,Gross Profit Margin (%)\n' + 
            chartData.labels.map((year, i) => 
              `${year},${chartData.datasets[0].data[i]}`
            ).join('\n');
          
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', 'john_keells_gross_profit_margin_data.csv');
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
        link.download = 'john_keells_gross_profit_margin_chart.png';
        link.click();
        break;
        
      default:
        break;
    }
  };
  
  // Find min, max, avg values
  const getStatistics = () => {
    if (!chartData || !chartData.datasets[0].data || chartData.datasets[0].data.length === 0) {
      return { min: 0, max: 0, avg: 0 };
    }
    
    const data = chartData.datasets[0].data;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const avg = data.reduce((sum, value) => sum + value, 0) / data.length;
    
    return { min, max, avg };
  };
  
  const stats = getStatistics();
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-jk-blue dark:text-white">Gross Profit Margin (5-Year Trend)</h2>
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Gross Profit Margin</p>
              <p className="font-semibold">
                {formatPercentage(chartData.datasets[selectedPoint.datasetIndex].data[selectedPoint.index])}
              </p>
            </div>
            {selectedPoint.index > 0 && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Change from Previous Year</p>
                <p className={`font-semibold ${
                  chartData.datasets[selectedPoint.datasetIndex].data[selectedPoint.index] > 
                  chartData.datasets[selectedPoint.datasetIndex].data[selectedPoint.index - 1]
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {formatPercentage(
                    chartData.datasets[selectedPoint.datasetIndex].data[selectedPoint.index] - 
                    chartData.datasets[selectedPoint.datasetIndex].data[selectedPoint.index - 1]
                  )}
                </p>
              </div>
            )}
          </div>
          
          {/* Display events for the selected year */}
          {annotations.some(a => a.value === chartData.labels[selectedPoint.index]) && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium mb-1">Key Events:</h4>
              <ul className="text-sm">
                {annotations
                  .filter(a => a.value === chartData.labels[selectedPoint.index])
                  .map((a, i) => (
                    <li key={i} className="flex items-center">
                      <span 
                        className={`h-2 w-2 rounded-full mr-2 ${
                          a.borderColor.includes('192') ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      ></span>
                      {a.label.content}
                    </li>
                  ))
                }
              </ul>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <div className="text-sm text-gray-600 dark:text-gray-400">Maximum</div>
          <div className="text-lg font-semibold text-blue-700 dark:text-blue-400">
            {formatPercentage(stats.max)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {chartData && chartData.labels[chartData.datasets[0].data.indexOf(stats.max)]}
          </div>
        </div>
        
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <div className="text-sm text-gray-600 dark:text-gray-400">Average</div>
          <div className="text-lg font-semibold text-blue-700 dark:text-blue-400">
            {formatPercentage(stats.avg)}
          </div>
        </div>
        
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <div className="text-sm text-gray-600 dark:text-gray-400">Minimum</div>
          <div className="text-lg font-semibold text-blue-700 dark:text-blue-400">
            {formatPercentage(stats.min)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {chartData && chartData.labels[chartData.datasets[0].data.indexOf(stats.min)]}
          </div>
        </div>
      </div>
      
      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Events Impact</h3>
        <div className="space-y-2">
          {KEY_EVENTS.filter(event => selectedYears.includes(parseInt(event.date.substring(0, 4)))).map(event => (
            <div 
              key={event.date} 
              className={`p-2 rounded-md flex items-start ${
                event.impact === 'positive' 
                  ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' 
                  : 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500'
              }`}
            >
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{event.title}</span>
                  <span className="text-xs text-gray-500">{event.date}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>
          <strong>Note:</strong> Gross Profit Margin is calculated as (Revenue - Cost of Sales) / Revenue × 100. 
          The annotations on the chart highlight key events that impacted the company's profitability.
        </p>
      </div>
    </div>
  );
};

export default GrossProfitMarginChart;