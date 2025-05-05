import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { fetchRightIssuesData } from '../../api/services';
import { formatCurrency } from '../../utils/formatters';
import ExportOptions from '../common/ExportOptions';

const RightIssuesTable = () => {
  const { selectedCurrency, rightIssues: contextRightIssues } = useData();
  const [rightIssues, setRightIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching right issues data...");
        
        // Check if we have data from context first
        if (contextRightIssues && contextRightIssues.length > 0) {
          console.log("Using right issues data from context:", contextRightIssues);
          const sortedData = [...contextRightIssues].sort((a, b) => b.year - a.year);
          setRightIssues(sortedData);
          setIsLoading(false);
          return;
        }
        
        // Fallback to direct API call if not in context
        const data = await fetchRightIssuesData();
        console.log("Right issues raw data:", data);
        
        // Filter out any null or undefined data
        const validData = data.filter(item => item && item.year && item.ratio);
        console.log("Filtered valid data:", validData);
        
        // If still no valid data, use sample data as fallback
        if (validData.length === 0) {
          console.log("No valid data found, using sample data");
          const sampleData = getSampleRightIssuesData();
          setRightIssues(sampleData);
          setIsLoading(false);
          return;
        }
        
        // Sort by year in descending order
        const sortedData = [...validData].sort((a, b) => b.year - a.year);
        console.log("Sorted data:", sortedData);
        
        setRightIssues(sortedData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading right issues data:', error);
        // Use sample data if API call fails
        console.log("API call failed, using sample data");
        setRightIssues(getSampleRightIssuesData());
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [contextRightIssues]);
  
  // Sample data function for fallback
  const getSampleRightIssuesData = () => {
    return [
      {
        year: 2023,
        ratio: "4:1",
        issuePrice: 175.0,
        description: "Rights issue for expansion"
      },
      {
        year: 2020,
        ratio: "3:1",
        issuePrice: 160.0,
        description: "Rights issue for debt restructuring"
      },
      {
        year: 2018,
        ratio: "5:2",
        issuePrice: 140.0,
        description: "Rights issue for acquisitions"
      },
      {
        year: 2015,
        ratio: "2:1",
        issuePrice: 120.0,
        description: "Rights issue for capital investment"
      }
    ];
  };
  
  // Handle export
  const handleExport = (format) => {
    switch (format) {
      case 'csv':
        // Export as CSV
        if (rightIssues.length > 0) {
          const csvContent = 'data:text/csv;charset=utf-8,Year,Ratio,Issue Price,Description\n' + 
            rightIssues.map((item) => 
              `${item.year},${item.ratio},${item.issuePrice},${item.description}`
            ).join('\n');
          
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', 'john_keells_right_issues_data.csv');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        break;
        
      case 'pdf':
        // For PDF we would use jsPDF library
        alert('PDF export is not implemented in this demo');
        break;
        
      default:
        break;
    }
  };
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-jk-blue dark:text-white">Right Issues</h2>
        <ExportOptions onExport={handleExport} />
      </div>
      
      {isLoading ? (
        <div className="w-full py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-jk-blue"></div>
        </div>
      ) : rightIssues.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ratio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Issue Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purpose</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {rightIssues.map((issue, index) => (
                <tr 
                  key={issue.year} 
                  className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'} hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {issue.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {issue.ratio}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatCurrency(issue.issuePrice, selectedCurrency, 2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    {issue.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          No right issues data available
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 space-y-2">
        <p>
          <strong>What are Right Issues?</strong> Right issues are offerings of shares to existing shareholders in proportion to their current holding. They typically provide shares at a discounted price compared to the market value.
        </p>
        <p>
          <strong>Benefits:</strong> Right issues allow companies to raise capital while giving existing shareholders the opportunity to maintain their proportional ownership, avoiding dilution of their stake.
        </p>
        <p>
          <strong>Ratio Explanation:</strong> The ratio (e.g., "2:1") means that for every 2 shares owned, shareholders had the right to purchase 1 additional share at the specified issue price.
        </p>
      </div>
    </div>
  );
};

export default RightIssuesTable;