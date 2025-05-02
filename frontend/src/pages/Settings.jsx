import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { THEME_OPTIONS } from '../utils/constants';

const Settings = () => {
  const { darkMode, themePreference, setTheme, THEMES } = useTheme();
  const [savedStatus, setSavedStatus] = useState('');
  
  // Handle theme change
  const handleThemeChange = (themeValue) => {
    setTheme(themeValue);
  };
  
  // Check if theme is selected
  const isThemeSelected = (themeValue) => {
    return themePreference === themeValue;
  };
  
  // Save settings
  const saveSettings = () => {
    // In a real application, we would save these to user preferences in the backend
    // For this demo, we'll just show a success message
    setSavedStatus('success');
    
    // Clear the status after 3 seconds
    setTimeout(() => {
      setSavedStatus('');
    }, 3000);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Manage your dashboard preferences
        </p>
      </div>
      
      <div className="card">
        <h2 className="text-lg font-semibold text-jk-blue dark:text-white mb-4">
          Appearance
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {THEME_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`p-4 rounded-lg border cursor-pointer flex items-center ${
                    isThemeSelected(option.value)
                      ? 'border-jk-blue bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className={`p-2 rounded-md text-gray-600 dark:text-gray-400 ${
                    isThemeSelected(option.value)
                      ? 'bg-blue-100 dark:bg-blue-800 text-jk-blue dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {option.icon === 'SunIcon' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                    ) : option.icon === 'MoonIcon' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</div>
                    {option.value === 'system' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Uses your device settings
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-lg font-semibold text-jk-blue dark:text-white mb-4">
          Data & Privacy
        </h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-gray-600 dark:text-gray-400">
              This dashboard uses publicly available financial data from John Keells Holdings PLC annual reports.
              No personal data is collected or stored.
            </p>
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            For more information, please review our <a href="#" className="text-jk-blue hover:underline">Privacy Policy</a> and <a href="#" className="text-jk-blue hover:underline">Terms of Service</a>.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          className="btn btn-primary"
        >
          Save Settings
        </button>
      </div>
      
      {savedStatus === 'success' && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Settings saved successfully!</span>
        </div>
      )}
    </div>
  );
};

export default Settings;