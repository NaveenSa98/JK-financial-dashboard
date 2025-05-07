import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { analyzeReportContent } from '../../api/services';
import KeywordTrendChart from './KeywordTrendChart';

const ReportAnalysis = () => {
  const { selectedYears } = useData();
  const [reportInsights, setReportInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportOptions, setReportOptions] = useState([]);
  const [activeView, setActiveView] = useState('insights'); // 'insights' or 'trends'

  // Get available reports based on selected years
  useEffect(() => {
    if (selectedYears.length > 0) {
      const reports = selectedYears.map(year => ({
        id: year,
        name: `Annual Report ${year}`,
        year: year
      }));
      setReportOptions(reports);
      // Auto-select the most recent report
      if (reports.length > 0 && !selectedReport) {
        setSelectedReport(reports[reports.length - 1].id);
      }
    }
  }, [selectedYears, selectedReport]);

  // Load report insights when a report is selected
  useEffect(() => {
    if (selectedReport) {
      loadReportInsights(selectedReport);
    }
  }, [selectedReport]);

  const loadReportInsights = async (reportId) => {
    setIsLoading(true);
    try {
      console.log("Analyzing report content for year:", reportId);
      const data = await analyzeReportContent({ reportYear: reportId });
      console.log("Report analysis response:", data);
      
      if (data && Array.isArray(data.insights)) {
        setReportInsights(data.insights);
      } else {
        console.error("Invalid report insights format received:", data);
        setReportInsights([]);
      }
    } catch (error) {
      console.error('Error analyzing report content:', error);
      setReportInsights([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'risk':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'strategic':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
        );
      case 'strength':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
          </svg>
        );
      case 'opportunity':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
          </svg>
        );
      case 'esg':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'risk': return 'red';
      case 'strategic': return 'blue';
      case 'strength': return 'green';
      case 'opportunity': return 'purple';
      case 'esg': return 'teal';
      default: return 'gray';
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Annual Report Analysis
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          AI-powered analysis of textual data from annual reports, highlighting key insights, trends, and strategic focus areas.
        </p>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="w-full md:w-1/2">
            <label htmlFor="reportSelector" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Report
            </label>
            <select
              id="reportSelector"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={selectedReport || ''}
              onChange={(e) => setSelectedReport(e.target.value)}
            >
              <option value="">Select a report</option>
              {reportOptions.map(report => (
                <option key={report.id} value={report.id}>
                  {report.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex rounded-md shadow-sm mt-2" role="group">
            <button
              type="button"
              onClick={() => setActiveView('insights')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                activeView === 'insights'
                  ? 'bg-jk-blue text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              Report Insights
            </button>
            <button
              type="button"
              onClick={() => setActiveView('trends')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                activeView === 'trends'
                  ? 'bg-jk-blue text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              Keyword Trends
            </button>
          </div>
        </div>
      </div>
      
      {activeView === 'insights' ? (
        isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-jk-blue"></div>
          </div>
        ) : reportInsights.length > 0 ? (
          <div className="space-y-4">
            {reportInsights.map((insight, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-lg border-l-4 border-${getCategoryColor(insight.category)}-500 bg-${getCategoryColor(insight.category)}-50 dark:bg-${getCategoryColor(insight.category)}-900/20`}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-md bg-${getCategoryColor(insight.category)}-100 dark:bg-${getCategoryColor(insight.category)}-800/30 text-${getCategoryColor(insight.category)}-600 dark:text-${getCategoryColor(insight.category)}-300 mr-3 flex-shrink-0`}>
                    {getCategoryIcon(insight.category)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{insight.title}</h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">{insight.description}</p>
                    
                    {insight.textExcerpt && (
                      <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 italic">
                        "{insight.textExcerpt}"
                      </div>
                    )}
                    
                    {insight.keywords && insight.keywords.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {insight.keywords.map((keyword, kidx) => (
                          <span 
                            key={kidx} 
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No report insights available</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {selectedReport 
                ? "Select a different report or try refreshing the page."
                : "Please select a report to view AI-generated insights."}
            </p>
          </div>
        )
      ) : (
        <div className="card bg-white dark:bg-gray-800 rounded-lg shadow p-0 overflow-hidden">
          <KeywordTrendChart />
        </div>
      )}
    </div>
  );
};

export default ReportAnalysis; 