import { formatCurrency, formatPercentage, formatNumber } from './formatters';

// Default chart colors
export const chartColors = {
  revenue: 'rgb(45, 85, 255)',
  costOfSales: 'rgb(255, 99, 132)',
  operatingExpenses: 'rgb(255, 159, 64)',
  grossProfit: 'rgb(75, 192, 192)',
  netProfit: 'rgb(54, 162, 235)',
  eps: 'rgb(153, 102, 255)',
  netAssetPerShare: 'rgb(201, 203, 207)',
  industryBenchmark: 'rgb(138, 43, 226)',
  positive: 'rgb(75, 192, 192)',
  negative: 'rgb(255, 99, 132)',
  neutral: 'rgb(201, 203, 207)'
};

// Default chart options by chart type
export const getChartOptions = (chartType, currency = 'LKR') => {
  // Common options across chart types
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          boxWidth: 10,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: false,
        text: ''
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#666',
        bodyColor: '#333',
        borderColor: '#ccc',
        borderWidth: 1,
        cornerRadius: 4,
        boxPadding: 8,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          drawBorder: false
        },
        ticks: {
          padding: 10
        }
      }
    }
  };

  // Chart-specific options
  switch (chartType) {
    case 'revenue':
      return {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          title: {
            display: true,
            text: 'Total Revenue (5-Year Trend)',
            padding: {
              top: 10,
              bottom: 20
            }
          },
          tooltip: {
            ...commonOptions.plugins.tooltip,
            callbacks: {
              label: (context) => {
                return `Revenue: ${formatCurrency(context.raw, currency)}`;
              }
            }
          }
        },
        scales: {
          ...commonOptions.scales,
          y: {
            ...commonOptions.scales.y,
            title: {
              display: true,
              text: currency === 'LKR' ? 'Revenue (Rs. Thousands)' : 'Revenue ($ Thousands)'
            },
            ticks: {
              callback: (value) => formatCurrency(value, currency, 0)
            }
          }
        }
      };
      
    case 'costVsExpenses':
      return {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          title: {
            display: true,
            text: 'Cost of Sales vs. Operating Expenses',
            padding: {
              top: 10,
              bottom: 20
            }
          },
          tooltip: {
            ...commonOptions.plugins.tooltip,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                return `${label}: ${formatCurrency(context.raw, currency)}`;
              }
            }
          }
        },
        scales: {
          ...commonOptions.scales,
          y: {
            ...commonOptions.scales.y,
            title: {
              display: true,
              text: currency === 'LKR' ? 'Amount (Rs. Thousands)' : 'Amount ($ Thousands)'
            },
            ticks: {
              callback: (value) => formatCurrency(value, currency, 0)
            }
          }
        }
      };
      
    case 'grossProfitMargin':
      return {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          title: {
            display: true,
            text: 'Gross Profit Margin (5-Year Trend)',
            padding: {
              top: 10,
              bottom: 20
            }
          },
          tooltip: {
            ...commonOptions.plugins.tooltip,
            callbacks: {
              label: (context) => {
                return `Margin: ${formatPercentage(context.raw)}`;
              }
            }
          }
        },
        scales: {
          ...commonOptions.scales,
          y: {
            ...commonOptions.scales.y,
            title: {
              display: true,
              text: 'Gross Profit Margin (%)'
            },
            ticks: {
              callback: (value) => formatPercentage(value)
            }
          }
        }
      };
      
    case 'eps':
      return {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          title: {
            display: true,
            text: 'Earnings Per Share (EPS)',
            padding: {
              top: 10,
              bottom: 20
            }
          },
          tooltip: {
            ...commonOptions.plugins.tooltip,
            callbacks: {
              label: (context) => {
                return `EPS: ${formatCurrency(context.raw, currency, 2)}`;
              },
              afterLabel: (context) => {
                const dataIndex = context.dataIndex;
                const datasetIndex = context.datasetIndex;
                const chart = context.chart;
                const dataset = chart.data.datasets[datasetIndex];
                
                if (dataset.netProfit && dataset.shareCount) {
                  return [
                    `Net Profit: ${formatCurrency(dataset.netProfit[dataIndex], currency, 0)}`,
                    `Share Count: ${formatNumber(dataset.shareCount[dataIndex], 0)}`
                  ];
                }
                return '';
              }
            }
          }
        },
        scales: {
          ...commonOptions.scales,
          y: {
            ...commonOptions.scales.y,
            title: {
              display: true,
              text: currency === 'LKR' ? 'EPS (Rs.)' : 'EPS ($)'
            },
            ticks: {
              callback: (value) => formatCurrency(value, currency, 2)
            }
          }
        }
      };
      
    case 'netAssetPerShare':
      return {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          title: {
            display: true,
            text: 'Net Asset Per Share',
            padding: {
              top: 10,
              bottom: 20
            }
          },
          tooltip: {
            ...commonOptions.plugins.tooltip,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                return `${label}: ${formatCurrency(context.raw, currency, 2)}`;
              }
            }
          }
        },
        scales: {
          ...commonOptions.scales,
          y: {
            ...commonOptions.scales.y,
            title: {
              display: true,
              text: currency === 'LKR' ? 'NAPS (Rs.)' : 'NAPS ($)'
            },
            ticks: {
              callback: (value) => formatCurrency(value, currency, 2)
            }
          }
        }
      };
      
    case 'shareholders':
      return {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          title: {
            display: true,
            text: 'Top Shareholders Distribution',
            padding: {
              top: 10,
              bottom: 20
            }
          },
          tooltip: {
            ...commonOptions.plugins.tooltip,
            callbacks: {
              label: (context) => {
                return `${context.label}: ${formatPercentage(context.raw)}`;
              }
            }
          }
        }
      };
      
    default:
      return commonOptions;
  }
};

// Chart data transformation helpers
export const prepareLineChartData = (data, options = {}) => {
  const { 
    xKey = 'year', 
    yKey, 
    label, 
    borderColor = chartColors.revenue,
    backgroundColor = 'rgba(45, 85, 255, 0.1)',
    additionalDataKeys = []
  } = options;
  
  return {
    labels: data.map(item => item[xKey]),
    datasets: [
      {
        label: label || yKey,
        data: data.map(item => item[yKey]),
        borderColor: borderColor,
        backgroundColor: backgroundColor,
        tension: 0.1,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: 'white',
        pointBorderColor: borderColor,
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        fill: true,
        ...additionalDataKeys.reduce((acc, key) => {
          acc[key] = data.map(item => item[key]);
          return acc;
        }, {})
      }
    ]
  };
};

export const prepareBarChartData = (data, options = {}) => {
  const { 
    xKey = 'year', 
    yKeys = [], 
    labels = [], 
    colors = []
  } = options;
  
  return {
    labels: data.map(item => item[xKey]),
    datasets: yKeys.map((key, index) => ({
      label: labels[index] || key,
      data: data.map(item => item[key]),
      backgroundColor: colors[index] || Object.values(chartColors)[index % Object.values(chartColors).length],
      borderColor: 'rgba(255, 255, 255, 0.5)',
      borderWidth: 1,
      borderRadius: 4
    }))
  };
};

export const preparePieChartData = (data, options = {}) => {
  const { 
    labelKey = 'name', 
    valueKey = 'percentage', 
    maxSlices = 5,
    otherLabel = 'Others'
  } = options;
  
  // Sort data by value in descending order
  const sortedData = [...data].sort((a, b) => b[valueKey] - a[valueKey]);
  
  // Prepare data for pie chart
  let labels = [];
  let values = [];
  let backgroundColor = [];
  
  // Take top N slices
  for (let i = 0; i < Math.min(maxSlices, sortedData.length); i++) {
    labels.push(sortedData[i][labelKey]);
    values.push(sortedData[i][valueKey]);
    
    // Generate color based on index
    const hue = (i * 137.5) % 360; // Golden angle approximation for nice distribution
    backgroundColor.push(`hsl(${hue}, 70%, 60%)`);
  }
  
  // Combine the rest into "Others"
  if (sortedData.length > maxSlices) {
    const othersValue = sortedData
      .slice(maxSlices)
      .reduce((sum, item) => sum + item[valueKey], 0);
    
    labels.push(otherLabel);
    values.push(othersValue);
    backgroundColor.push('#999999');
  }
  
  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor,
        borderColor: 'white',
        borderWidth: 1
      }
    ]
  };
};