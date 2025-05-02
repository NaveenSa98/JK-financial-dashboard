import { convertLKRtoUSD } from './formatters';
import { EXCHANGE_RATES } from './constants';

// Process raw data for revenue chart
export const processRevenueData = (data, currency = 'LKR') => {
  if (!data || !data.length) return [];
  
  return data.map(item => {
    const exchangeRate = EXCHANGE_RATES[item.year] || 300;
    return {
      year: item.year,
      revenue: currency === 'USD' 
        ? convertLKRtoUSD(item.financials.revenue, exchangeRate)
        : item.financials.revenue
    };
  }).sort((a, b) => a.year - b.year);
};

// Process raw data for cost vs expenses chart
export const processCostVsExpensesData = (data, currency = 'LKR') => {
  if (!data || !data.length) return [];
  
  return data.map(item => {
    const exchangeRate = EXCHANGE_RATES[item.year] || 300;
    return {
      year: item.year,
      costOfSales: currency === 'USD' 
        ? convertLKRtoUSD(item.financials.costOfSales, exchangeRate)
        : item.financials.costOfSales,
      operatingExpenses: currency === 'USD' 
        ? convertLKRtoUSD(item.financials.operatingExpenses, exchangeRate)
        : item.financials.operatingExpenses
    };
  }).sort((a, b) => a.year - b.year);
};

// Process raw data for gross profit margin chart
export const processGrossProfitMarginData = (data) => {
  if (!data || !data.length) return [];
  
  return data.map(item => {
    const revenue = item.financials.revenue;
    const costOfSales = item.financials.costOfSales;
    const grossProfit = revenue - costOfSales;
    const grossProfitMargin = (grossProfit / revenue) * 100;
    
    return {
      year: item.year,
      grossProfitMargin: parseFloat(grossProfitMargin.toFixed(2)),
      events: item.events || []
    };
  }).sort((a, b) => a.year - b.year);
};

// Process raw data for EPS chart
export const processEPSData = (data, currency = 'LKR') => {
  if (!data || !data.length) return [];
  
  return data.map(item => {
    const exchangeRate = EXCHANGE_RATES[item.year] || 300;
    return {
      year: item.year,
      eps: currency === 'USD' 
        ? convertLKRtoUSD(item.financials.eps, exchangeRate)
        : item.financials.eps,
      netProfit: currency === 'USD' 
        ? convertLKRtoUSD(item.financials.netProfit, exchangeRate)
        : item.financials.netProfit,
      shareCount: item.financials.outstandingShares
    };
  }).sort((a, b) => a.year - b.year);
};

// Process raw data for net asset per share chart
export const processNetAssetPerShareData = (data, currency = 'LKR') => {
  if (!data || !data.length) return [];
  
  return data.map(item => {
    const exchangeRate = EXCHANGE_RATES[item.year] || 300;
    return {
      year: item.year,
      netAssetPerShare: currency === 'USD' 
        ? convertLKRtoUSD(item.financials.netAssetPerShare, exchangeRate)
        : item.financials.netAssetPerShare,
      industryBenchmark: item.financials.industryBenchmarkNAPS
        ? (currency === 'USD' 
          ? convertLKRtoUSD(item.financials.industryBenchmarkNAPS, exchangeRate)
          : item.financials.industryBenchmarkNAPS)
        : null
    };
  }).sort((a, b) => a.year - b.year);
};

// Process shareholder data for specific year
export const processShareholderData = (data, year) => {
  if (!data || !data.shareholders) return [];
  
  const yearData = data.shareholders.find(item => item.year === year);
  if (!yearData) return [];
  
  return yearData.data;
};

// Process right issues data
export const processRightIssuesData = (data, currency = 'LKR') => {
  if (!data || !data.rightIssues) return [];
  
  return data.rightIssues.map(item => {
    const exchangeRate = EXCHANGE_RATES[item.year] || 300;
    return {
      ...item,
      issuePrice: currency === 'USD' 
        ? convertLKRtoUSD(item.issuePrice, exchangeRate)
        : item.issuePrice
    };
  });
};

// Calculate year-over-year growth rates
export const calculateGrowthRates = (data, metricKey) => {
  if (!data || data.length < 2) return [];
  
  const sortedData = [...data].sort((a, b) => a.year - b.year);
  
  return sortedData.map((item, index) => {
    if (index === 0) {
      return {
        year: item.year,
        [metricKey]: item[metricKey],
        growthRate: null
      };
    }
    
    const previousValue = sortedData[index - 1][metricKey];
    const currentValue = item[metricKey];
    const growthRate = previousValue !== 0 
      ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100
      : 0;
    
    return {
      year: item.year,
      [metricKey]: currentValue,
      growthRate: parseFloat(growthRate.toFixed(2))
    };
  });
};

// Extract events for annotations
export const extractEvents = (data) => {
  if (!data || !data.length) return [];
  
  const events = [];
  
  data.forEach(yearData => {
    if (yearData.events && yearData.events.length) {
      yearData.events.forEach(event => {
        events.push({
          ...event,
          year: yearData.year
        });
      });
    }
  });
  
  return events;
};

// Generate basic stats from financial data
export const generateBasicStats = (data, metricKey) => {
  if (!data || !data.length) return {};
  
  const values = data.map(item => item[metricKey]);
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  
  const minYear = data.find(item => item[metricKey] === min)?.year;
  const maxYear = data.find(item => item[metricKey] === max)?.year;
  
  const latestValue = data[data.length - 1]?.[metricKey];
  const previousValue = data[data.length - 2]?.[metricKey];
  const recentGrowth = previousValue 
    ? ((latestValue - previousValue) / Math.abs(previousValue)) * 100
    : null;
  
  return {
    min,
    max,
    avg: parseFloat(avg.toFixed(2)),
    minYear,
    maxYear,
    latestValue,
    recentGrowth: recentGrowth !== null ? parseFloat(recentGrowth.toFixed(2)) : null
  };
};

// Prepare data for comparison
export const prepareComparisonData = (data, metrics = [], currency = 'LKR') => {
  if (!data || !data.length || !metrics.length) return [];
  
  return data.map(yearData => {
    const exchangeRate = EXCHANGE_RATES[yearData.year] || 300;
    
    const result = {
      year: yearData.year
    };
    
    metrics.forEach(metric => {
      let value = yearData.financials[metric];
      
      // Apply currency conversion if needed
      if (currency === 'USD' && typeof value === 'number') {
        value = convertLKRtoUSD(value, exchangeRate);
      }
      
      result[metric] = value;
    });
    
    return result;
  }).sort((a, b) => a.year - b.year);
};