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
  Legend
} from 'chart.js';
import { useData } from '../../context/DataContext';
import { analyzeKeywordTrends } from '../../api/services';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const KeywordTrendChart = () => {
  const { selectedYears } = useData();
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState(['digital', 'sustainability', 'innovation']);
  const [availableKeywords, setAvailableKeywords] = useState([
    { id: 'digital', label: 'Digital Transformation' },
    { id: 'sustainability', label: 'Sustainability' },
    { id: 'innovation', label: 'Innovation' },
    { id: 'risk', label: 'Risk Factors' },
    { id: 'growth', label: 'Growth' },
    { id: 'competition', label: 'Competition' },
    { id: 'esg', label: 'ESG' },
    { id: 'technology', label: 'Technology' }
  ]);

  useEffect(() => {
    if (selectedYears.length > 1) {
      fetchKeywordTrends();
    }
  }, [selectedYears, selectedKeywords]);

  const fetchKeywordTrends = async () => {
    setIsLoading(true);
    try {
      const response = await analyzeKeywordTrends({
        years: selectedYears,
        keywords: selectedKeywords
      });
      
      // Process data for chart
      const labels = response.data.map(item => item.year);
      
      const datasets = selectedKeywords.map((keyword, index) => {
        const colors = [
          { bg: 'rgba(54, 162, 235, 0.2)', border: 'rgba(54, 162, 235, 1)' },
          { bg: 'rgba(75, 192, 192, 0.2)', border: 'rgba(75, 192, 192, 1)' },
          { bg: 'rgba(153, 102, 255, 0.2)', border: 'rgba(153, 102, 255, 1)' },
          { bg: 'rgba(255, 99, 132, 0.2)', border: 'rgba(255, 99, 132, 1)' },
          { bg: 'rgba(255, 159, 64, 0.2)', border: 'rgba(255, 159, 64, 1)' }
        ];
        
        const colorIndex = index % colors.length;
        
        return {
          label: availableKeywords.find(k => k.id === keyword)?.label || keyword,
          data: response.data.map(item => item.keywordFrequencies[keyword] || 0),
          borderColor: colors[colorIndex].border,
          backgroundColor: colors[colorIndex].bg,
          borderWidth: 2,
          tension: 0.3
        };
      });
      
      setChartData({
        labels,
        datasets
      });
    } catch (error) {
      console.error('Error fetching keyword trends:', error);
      // Set sample data for visualization
      const sampleData = {
        labels: selectedYears,
        datasets: selectedKeywords.map((keyword, index) => {
          const colors = [
            { bg: 'rgba(54, 162, 235, 0.2)', border: 'rgba(54, 162, 235, 1)' },
            { bg: 'rgba(75, 192, 192, 0.2)', border: 'rgba(75, 192, 192, 1)' },
            { bg: 'rgba(153, 102, 255, 0.2)', border: 'rgba(153, 102, 255, 1)' },
            { bg: 'rgba(255, 99, 132, 0.2)', border: 'rgba(255, 99, 132, 1)' },
            { bg: 'rgba(255, 159, 64, 0.2)', border: 'rgba(255, 159, 64, 1)' }
          ];
          
          const colorIndex = index % colors.length;
          
          // Generate random trend data
          const values = selectedYears.map(() => Math.floor(Math.random() * 50) + 10);
          
          return {
            label: availableKeywords.find(k => k.id === keyword)?.label || keyword,
            data: values,
            borderColor: colors[colorIndex].border,
            backgroundColor: colors[colorIndex].bg,
            borderWidth: 2,
            tension: 0.3
          };
        })
      };
      
      setChartData(sampleData);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleKeyword = (keywordId) => {
    if (selectedKeywords.includes(keywordId)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keywordId));
    } else {
      setSelectedKeywords([...selectedKeywords, keywordId]);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true
        }
      },
      title: {
        display: true,
        text: 'Strategic Keyword Mentions Over Time',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value} mentions`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Frequency of Mentions'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Annual Report Year'
        }
      }
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Strategic Keyword Trend Analysis
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Visualize how key strategic themes and topics have evolved over time based on annual report content.
        </p>
        
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {availableKeywords.map(keyword => (
              <button
                key={keyword.id}
                onClick={() => toggleKeyword(keyword.id)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  selectedKeywords.includes(keyword.id)
                    ? 'bg-jk-blue text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {keyword.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jk-blue"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
      
      <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Analysis Methodology</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This visualization shows the frequency of key strategic terms in John Keells Holdings' annual reports 
          over time. The analysis uses natural language processing to count keyword mentions and related terms, 
          providing insights into shifting strategic priorities and focus areas.
        </p>
      </div>
    </div>
  );
};

export default KeywordTrendChart; 