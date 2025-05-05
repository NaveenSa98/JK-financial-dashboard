import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { AVAILABLE_YEARS, CURRENCY_OPTIONS, INDUSTRY_GROUPS } from '../../utils/constants';

const FilterPanel = () => {
  const {
    selectedYears,
    selectedCurrency,
    selectedIndustryGroups,
    isMultiYearSelection,
    toggleYearSelection,
    toggleMultiYearSelection,
    selectAllYears,
    changeCurrency,
    toggleIndustryGroup,
  } = useData();

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="card mb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-jk-blue dark:text-white">
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filters
          </span>
        </h2>
        <button
          onClick={toggleExpanded}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full transition-transform duration-200"
        >
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      <div className={`mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-200 dark:border-gray-700 pt-5 transition-all duration-300 ease-in-out overflow-hidden ${
        isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 pt-0 mt-0 border-t-0'
      }`}>
        {/* Year Filter */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Time Period
            </label>
            <div className="flex items-center">
              <button
                onClick={toggleMultiYearSelection}
                className={`text-xs font-medium px-2 py-1 rounded mr-2 ${
                  isMultiYearSelection 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {isMultiYearSelection ? 'Multi-Select: ON' : 'Multi-Select: OFF'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {/* Select All Button */}
            <button
              onClick={selectAllYears}
              className={`w-full px-3 py-1.5 mb-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                selectedYears.length === AVAILABLE_YEARS.length
                  ? 'bg-jk-blue text-white shadow-sm'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/50'
              }`}
            >
              Select All Years
            </button>
            
            {AVAILABLE_YEARS.map((year) => (
              <button
                key={year}
                onClick={() => toggleYearSelection(year)}
                className={`w-16 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                  selectedYears.includes(year)
                    ? 'bg-jk-blue text-white shadow-sm'
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            {isMultiYearSelection 
              ? 'Select multiple years for visualizations'
              : 'Select a single year to view its financial data'}
          </p>
        </div>

        {/* Currency Filter */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            Currency
          </label>
          <div className="flex justify-center space-x-4">
            {CURRENCY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => changeCurrency(option.value)}
                className={`w-24 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  selectedCurrency === option.value
                    ? 'bg-jk-blue text-white shadow-sm'
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {option.value}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            Change the currency for all financial values.
          </p>
        </div>

        {/* Industry Group Filter */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Industry Groups
          </label>
          <div className="flex flex-wrap gap-2 justify-center">
            {INDUSTRY_GROUPS.map((group) => (
              <button
                key={group.value}
                onClick={() => toggleIndustryGroup(group.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                  selectedIndustryGroups.includes(group.value)
                    ? 'bg-jk-blue text-white shadow-sm'
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {group.value}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            Filter data by specific industry segments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;