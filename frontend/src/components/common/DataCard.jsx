import { formatCurrency, formatPercentage, formatGrowthRate, getGrowthColor } from '../../utils/formatters';

const DataCard = ({
  title,
  value,
  previousValue,
  percentageChange,
  icon,
  currency = 'LKR',
  isPercentage = false,
  isFormatted = false,  // New prop to indicate if value is already formatted
  inverse = false,
  loading = false,
  footer = null,
  onClick = null,
  className = ''
}) => {
  // Calculate percentage change if not provided
  const change = percentageChange !== undefined 
    ? percentageChange 
    : previousValue !== undefined && previousValue !== 0
      ? ((value - previousValue) / Math.abs(previousValue)) * 100
      : null;
  
  // Format value based on type, unless it's already formatted
  const formattedValue = isFormatted 
    ? value 
    : isPercentage 
      ? formatPercentage(value) 
      : formatCurrency(value, currency);
  
  // Format percentage change
  const formattedChange = change !== null 
    ? formatGrowthRate(change) 
    : null;
  
  // Determine color for change
  const changeColorClass = change !== null 
    ? getGrowthColor(change, inverse)
    : '';
    
  // Get gradient class based on presence of change
  const getGradientClass = () => {
    if (change === null) {
      return 'from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900';
    }
    
    if ((change > 0 && !inverse) || (change < 0 && inverse)) {
      return 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20';
    }
    
    return 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20';
  };
  
  return (
    <div 
      className={`relative rounded-xl border border-gray-200 dark:border-gray-700/50 bg-gradient-to-br ${getGradientClass()} p-5 hover:shadow-xl transition-all duration-300 ${className} ${onClick ? 'cursor-pointer hover:border-jk-blue dark:hover:border-blue-500 transform hover:-translate-y-1' : ''}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              {title}
            </h3>
            {icon && (
              <div className="p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-sm text-jk-blue dark:text-blue-300 border border-blue-100 dark:border-blue-900/30">
                {icon}
              </div>
            )}
          </div>
          
          <div className="mb-3">
            <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              {formattedValue}
            </div>
            
            {formattedChange && (
              <div className={`text-sm font-medium flex items-center mt-2 ${changeColorClass}`}>
                <span className="flex items-center bg-white dark:bg-gray-800 rounded-full py-1 px-2 shadow-sm">
                  {change > 0 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{formattedChange}</span>
                </span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  {inverse ? 'decrease' : 'increase'} from previous year
                </span>
              </div>
            )}
          </div>
          
          {footer && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700/50 text-xs text-gray-500 dark:text-gray-400 font-medium">
              {footer}
            </div>
          )}
          
          {onClick && (
            <div className="absolute bottom-2 right-2 text-gray-300 dark:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DataCard;