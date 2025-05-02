// Format currency values with appropriate symbol
export const formatCurrency = (value, currency = 'LKR', decimals = 0) => {
    const symbols = {
      LKR: 'Rs.',
      USD: '$'
    };
  
    const symbol = symbols[currency] || '';
    
    return `${symbol} ${Number(value).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  };
  
  // Format percentage values
  export const formatPercentage = (value, decimals = 2) => {
    return `${Number(value).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}%`;
  };
  
  // Format decimal values
  export const formatNumber = (value, decimals = 2) => {
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  
  // Convert LKR to USD
  export const convertLKRtoUSD = (value, exchangeRate = 300) => {
    return value / exchangeRate;
  };
  
  // Convert USD to LKR
  export const convertUSDtoLKR = (value, exchangeRate = 300) => {
    return value * exchangeRate;
  };
  
  // Format date values
  export const formatDate = (date, format = 'short') => {
    const dateObj = new Date(date);
    
    switch (format) {
      case 'full':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'medium':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      case 'year':
        return dateObj.getFullYear().toString();
      case 'short':
      default:
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric'
        });
    }
  };
  
  // Calculate growth rate between two values
  export const calculateGrowthRate = (currentValue, previousValue) => {
    if (previousValue === 0) return 0;
    return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
  };
  
  // Format growth rate with a + or - sign
  export const formatGrowthRate = (rate, decimals = 1) => {
    const sign = rate >= 0 ? '+' : '';
    return `${sign}${Number(rate).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}%`;
  };
  
  // Generate color for growth trends (positive/negative)
  export const getGrowthColor = (value, inverse = false) => {
    if (value === 0) return 'text-gray-500';
    
    if (!inverse) {
      return value > 0 ? 'text-green-600' : 'text-red-600';
    } else {
      return value > 0 ? 'text-red-600' : 'text-green-600';
    }
  };
  
  // Convert a large number to a more readable format (K, M, B)
  export const abbreviateNumber = (value) => {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(1)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(1)}M`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(1)}K`;
    } else {
      return value.toString();
    }
  };