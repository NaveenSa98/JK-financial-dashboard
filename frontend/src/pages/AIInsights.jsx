import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import ReportAnalysis from '../components/insights/ReportAnalysis';

const AIInsights = () => {
  const { selectedYears, selectAllYears } = useData();
  
  // Auto-select all years when the component mounts
  useEffect(() => {
    // Only select all years if fewer than 3 years are currently selected
    if (selectedYears.length < 3) {
      selectAllYears();
    }
  }, [selectedYears.length, selectAllYears]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Annual Report Analysis</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            AI-powered analysis of textual data from annual reports
          </p>
        </div>
      </div>
      
      <div className="card">
        <ReportAnalysis />
      </div>
      
      <div className="card">
        <h2 className="text-lg font-semibold text-jk-blue dark:text-white mb-4">
          About Annual Report Analysis
        </h2>
        
        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <p>
            These insights are automatically generated through advanced analytics and machine learning algorithms 
            that analyze the annual reports of John Keells Holdings PLC. The system identifies key themes, 
            strategic priorities, and important disclosures that might not be immediately apparent through traditional reading.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">How It Works</h3>
              <p className="text-sm">
                The analysis engine processes annual report text, extracts key information, and uses 
                natural language processing to identify important themes, sentiment, and strategic focus areas.
                It highlights patterns and changes across different reporting periods.
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Types of Insights</h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                  <span><strong>Strategic Focus:</strong> Identifies key strategic priorities</span>
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                  <span><strong>Risk Assessment:</strong> Highlights disclosed risks and mitigation strategies</span>
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  <span><strong>Strengths:</strong> Identifies reported strengths and competitive advantages</span>
                </li>
                <li className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-teal-500 mr-2"></span>
                  <span><strong>ESG Focus:</strong> Extracts ESG commitments and initiatives</span>
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