import React, { useState, useEffect } from 'react';
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
import { fetchRevenueData } from '../../api/apiService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart = ({ 
  title = "Revenue Trends", 
  years = null,
  industryGroups = null,
  height = 300
}) => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Prepare filters
        const filters = {};
        if (years) filters.years = years;
        if (industryGroups) filters.industryGroups = industryGroups;
        
        // Fetch data
        const data = await fetchRevenueData(filters);
        setRevenueData(data);
      } catch (err) {
        console.error('Failed to load revenue data:', err);
        setError('Failed to load revenue data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [years, industryGroups]);

  const prepareChartData = () => {
    const sortedData = [...revenueData].sort((a, b) => a.year - b.year);
    
    return {
      labels: sortedData.map(item => item.year),
      datasets: [
        {
          label: 'Revenue',
          data: sortedData.map(item => item.revenue / 1000000), // Convert to millions
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            return `Revenue: LKR ${value.toFixed(2)} Mn`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue (LKR Millions)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Year'
        }
      }
    }
  };

  if (loading) {
    return <div data-testid="loading-indicator" className="chart-loading">Loading data...</div>;
  }

  if (error) {
    return <div data-testid="error-message" className="chart-error">{error}</div>;
  }

  return (
    <div className="chart-container" style={{ height: `${height}px` }}>
      {revenueData.length > 0 ? (
        <Bar data={prepareChartData()} options={chartOptions} />
      ) : (
        <div className="no-data-message">No revenue data available</div>
      )}
    </div>
  );
};

export default RevenueChart;