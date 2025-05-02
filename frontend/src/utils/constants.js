// App constants

// Years for filtering
export const AVAILABLE_YEARS = [2019, 2020, 2021, 2022, 2023, 2024];

// Currency options
export const CURRENCY_OPTIONS = [
  { value: 'LKR', label: 'Sri Lankan Rupee (LKR)' },
  { value: 'USD', label: 'US Dollar (USD)' }
];

// Industry groups
export const INDUSTRY_GROUPS = [
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Leisure', label: 'Leisure' },
  { value: 'Consumer Foods & Retail', label: 'Consumer Foods & Retail' },
  { value: 'Financial Services', label: 'Financial Services' },
  { value: 'Property', label: 'Property' },
  { value: 'Information Technology', label: 'Information Technology' }
];

// Financial metrics
export const FINANCIAL_METRICS = [
  { value: 'revenue', label: 'Revenue', category: 'income' },
  { value: 'costOfSales', label: 'Cost of Sales', category: 'expense' },
  { value: 'operatingExpenses', label: 'Operating Expenses', category: 'expense' },
  { value: 'grossProfit', label: 'Gross Profit', category: 'income' },
  { value: 'netProfit', label: 'Net Profit', category: 'income' },
  { value: 'eps', label: 'Earnings Per Share (EPS)', category: 'valuation' },
  { value: 'netAssetPerShare', label: 'Net Asset Per Share', category: 'valuation' }
];

// Forecasting models
export const FORECASTING_MODELS = [
  { value: 'arima', label: 'ARIMA', description: 'Autoregressive Integrated Moving Average' },
  { value: 'ets', label: 'ETS', description: 'Error, Trend, Seasonality' },
  { value: 'lstm', label: 'LSTM', description: 'Long Short-Term Memory Neural Network' }
];

// Event categories
export const EVENT_CATEGORIES = [
  { value: 'positive', label: 'Positive', color: 'green' },
  { value: 'negative', label: 'Negative', color: 'red' },
  { value: 'neutral', label: 'Neutral', color: 'blue' }
];

// Nav items
export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'HomeIcon' },
  { path: '/visualizations', label: 'Visualizations', icon: 'ChartBarIcon' },
  { path: '/forecasting', label: 'Forecasting', icon: 'ArrowTrendingUpIcon' },
  { path: '/ai-insights', label: 'AI Insights', icon: 'LightBulbIcon' },
  { path: '/settings', label: 'Settings', icon: 'Cog6ToothIcon' }
];

// Chart types for navigation
export const CHART_TYPES = [
  { value: 'revenue', label: 'Revenue', icon: 'CurrencyDollarIcon' },
  { value: 'costVsExpenses', label: 'Cost vs Expenses', icon: 'ReceiptPercentIcon' },
  { value: 'grossProfitMargin', label: 'Gross Profit Margin', icon: 'PresentationChartLineIcon' },
  { value: 'eps', label: 'EPS', icon: 'BanknotesIcon' },
  { value: 'netAssetPerShare', label: 'Net Asset Per Share', icon: 'ScaleIcon' },
  { value: 'rightIssues', label: 'Right Issues', icon: 'DocumentTextIcon' },
  { value: 'shareholders', label: 'Top Shareholders', icon: 'UsersIcon' }
];

// Export options
export const EXPORT_OPTIONS = [
  { value: 'csv', label: 'CSV', icon: 'DocumentTextIcon' },
  { value: 'pdf', label: 'PDF', icon: 'DocumentIcon' },
  { value: 'image', label: 'Image (PNG)', icon: 'PhotoIcon' }
];

// Theme options
export const THEME_OPTIONS = [
  { value: 'light', label: 'Light Theme', icon: 'SunIcon' },
  { value: 'dark', label: 'Dark Theme', icon: 'MoonIcon' },
  { value: 'system', label: 'System Theme', icon: 'ComputerDesktopIcon' }
];

// Insight types
export const INSIGHT_TYPES = [
  { value: 'trend', label: 'Trend Analysis', color: 'blue' },
  { value: 'efficiency', label: 'Efficiency', color: 'green' },
  { value: 'profitability', label: 'Profitability', color: 'purple' },
  { value: 'ownership', label: 'Ownership', color: 'orange' },
  { value: 'risk', label: 'Risk Assessment', color: 'red' }
];

// Key events to highlight
export const KEY_EVENTS = [
  {
    date: '2019-04-21',
    title: 'Easter Sunday Attacks',
    description: 'Easter Sunday Attacks impacted tourism and leisure sectors significantly',
    impact: 'negative'
  },
  {
    date: '2020-03-15',
    title: 'COVID-19 Pandemic',
    description: 'Global pandemic led to lockdowns affecting operations across all sectors',
    impact: 'negative'
  },
  {
    date: '2021-04-05',
    title: 'Vaccination Programs',
    description: 'Vaccination programs improved business sentiment and operations',
    impact: 'positive'
  },
  {
    date: '2022-03-31',
    title: 'Economic Crisis',
    description: 'Sri Lanka economic crisis impacted operations and supply chains',
    impact: 'negative'
  },
  {
    date: '2023-02-10',
    title: 'Tourism Resurgence',
    description: 'Strong recovery in tourism sector boosted leisure revenue',
    impact: 'positive'
  },
  {
    date: '2024-01-22',
    title: 'Strategic Acquisitions',
    description: 'Expansion in IT and retail sectors through strategic acquisitions',
    impact: 'positive'
  }
];

// Exchange rates (for currency conversion)
export const EXCHANGE_RATES = {
  '2019': 180.5,
  '2020': 200.3,
  '2021': 220.6,
  '2022': 265.8,
  '2023': 285.2,
  '2024': 300.0
};