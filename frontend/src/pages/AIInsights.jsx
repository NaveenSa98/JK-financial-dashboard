import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { generateAIInsights } from '../api/services';
import { INSIGHT_TYPES } from '../utils/constants';

const AIInsights = () => {
  const { selectedYears, selectedCurrency, selectedIndustryGroups } = useData();
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  
  // Fetch AI insights
  useEffect(() => {
    const loadInsights = async () => {
      try {
        setIsLoading(true);
        
        const params = {
          years: selectedYears,
          currency: selectedCurrency,
          industryGroups: selectedIndustryGroups
        };
        
        const data = await generateAIInsights(params);
        setInsights(data.insights || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading AI insights:', error);
        setIsLoading(false);
      }
    };
    
    loadInsights();
  }, [selectedYears, selectedCurrency, selectedIndustryGroups]);
  
  // Filter insights by type
  const filteredInsights = selectedType === 'all' 
    ? insights 
    : insights.filter(insight => insight.type === selectedType);
  
  // Get icon for insight type
  const getInsightIcon = (type) => {
    switch (type) {
      case 'trend':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
          </svg>
        );
      case 'efficiency':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
          </svg>
        );
      case 'profitability':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
        );
      case 'ownership':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        );
      case 'risk':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  // Get color for insight type
  const getInsightColor = (type) => {
    const insightType = INSIGHT_TYPES.find(i => i.value === type);
    return insightType ? insightType.color : 'blue';
  };
  
  // Get importance badge style
  const getImportanceBadge = (importance) => {
    switch (importance) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI-Generated Insights</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Automated analysis and key findings from financial data
          </p>
        </div>
      </div>
      
      <div className="card">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-jk-blue dark:text-white mb-4">
            Filter by Insight Type
          </h2>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                selectedType === 'all'
                  ? 'bg-jk-blue text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All Insights
            </button>
            
            {INSIGHT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
                  selectedType === type.value
                    ? `bg-${type.color}-600 text-white`
                    : `bg-${type.color}-100 text-${type.color}-800 dark:bg-${type.color}-800/30 dark:text-${type.color}-300 hover:bg-${type.color}-200 dark:hover:bg-${type.color}-800/40`
                }`}
              >
                <span className={`h-2 w-2 rounded-full bg-${type.color}-500 mr-2`}></span>
                {type.label}
              </button>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jk-blue"></div>
          </div>
        ) : filteredInsights.length > 0 ? (
          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <div 
                key={insight.id} 
                className={`p-4 rounded-md border-l-4 border-${getInsightColor(insight.type)}-500 bg-${getInsightColor(insight.type)}-50 dark:bg-${getInsightColor(insight.type)}-900/20`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-md bg-${getInsightColor(insight.type)}-100 dark:bg-${getInsightColor(insight.type)}-800/30 text-${getInsightColor(insight.type)}-600 dark:text-${getInsightColor(insight.type)}-300 mr-3 flex-shrink-0`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{insight.title}</h3>
                      <p className="mt-1 text-gray-600 dark:text-gray-300">{insight.description}</p>
                      
                      {insight.metrics && insight.metrics.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {insight.metrics.map((metric, idx) => (
                            <span 
                              key={idx} 
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            >
                              {metric}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {insight.importance && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImportanceBadge(insight.importance)}`}>
                      {insight.importance}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No insights available</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Try changing your filters or selecting different years to generate new insights.
            </p>
          </div>
        )}
      </div>
      
      <div className="card">
        <h2 className="text-lg font-semibold text-jk-blue dark:text-white mb-4">
          About AI-Generated Insights
        </h2>
        
        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <p>
            These insights are automatically generated through advanced analytics and machine learning algorithms 
            that analyze the financial data of John Keells Holdings PLC. The system identifies patterns, 
            anomalies, and significant trends that might not be immediately apparent through traditional analysis.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">How It Works</h3>
              <p className="text-sm">
                The insights engine analyzes historical financial data, identifies patterns, and applies 
                statistical algorithms to detect significant changes, correlations, and potential future 
                trends. It prioritizes findings based on their business impact and relevance.
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Types of Insights</h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                  <span><strong>Trend Analysis:</strong> Identifies significant changes over time</span>
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  <span><strong>Efficiency:</strong> Highlights operational performance metrics</span>
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
                  <span><strong>Profitability:</strong> Focuses on profit margins and revenue growth</span>
                </li>
              </ul>
            </div>
          </div>
          
          <p className="mt-4 text-sm">
            <strong>Note:</strong> These insights are meant to serve as a starting point for further analysis 
            and should be validated with additional research and human judgment. The AI system continues to 
            learn and improve with more data and feedback.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;