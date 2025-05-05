import unittest
import json
import sys
import os
import pandas as pd
import numpy as np
from datetime import datetime
from unittest.mock import patch, MagicMock

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app

class TestFinancialDashboardAPI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        
        # Mock data for testing
        self.mock_data = {
            'industryGroups': [
                "Transportation",
                "Leisure", 
                "Consumer Foods & Retail", 
                "Financial Services", 
                "Property", 
                "Information Technology"
            ],
            'yearlyData': [
                {
                    'year': 2020,
                    'financials': {
                        'revenue': 100000,
                        'revenueFormatted': 'LKR 100.00 Mn',
                        'costOfSales': 70000,
                        'costOfSalesFormatted': 'LKR 70.00 Mn',
                        'operatingExpenses': 15000,
                        'operatingExpensesFormatted': 'LKR 15.00 Mn',
                        'grossProfit': 30000,
                        'grossProfitFormatted': 'LKR 30.00 Mn',
                        'grossProfitMargin': 30.0,
                        'grossProfitMarginFormatted': '30.00%',
                        'eps': 10.5,
                        'epsFormatted': '10.50',
                        'netAssetPerShare': 75.25,
                        'netAssetPerShareFormatted': '75.25',
                        'outstandingShares': 1000000,
                        'netProfit': 10500000,
                        'netProfitFormatted': 'LKR 10.50 Mn'
                    },
                    'events': [
                        {
                            'title': 'COVID-19 Pandemic',
                            'description': 'Global lockdowns affecting operations',
                            'impact': 'negative',
                            'date': '2020-03-15'
                        }
                    ],
                    'industryGroups': [
                        "Transportation",
                        "Leisure", 
                        "Consumer Foods & Retail", 
                        "Financial Services", 
                        "Property", 
                        "Information Technology"
                    ]
                },
                {
                    'year': 2021,
                    'financials': {
                        'revenue': 120000,
                        'revenueFormatted': 'LKR 120.00 Mn',
                        'costOfSales': 80000,
                        'costOfSalesFormatted': 'LKR 80.00 Mn',
                        'operatingExpenses': 18000,
                        'operatingExpensesFormatted': 'LKR 18.00 Mn',
                        'grossProfit': 40000,
                        'grossProfitFormatted': 'LKR 40.00 Mn',
                        'grossProfitMargin': 33.33,
                        'grossProfitMarginFormatted': '33.33%',
                        'eps': 12.5,
                        'epsFormatted': '12.50',
                        'netAssetPerShare': 80.0,
                        'netAssetPerShareFormatted': '80.00',
                        'outstandingShares': 1000000,
                        'netProfit': 12500000,
                        'netProfitFormatted': 'LKR 12.50 Mn'
                    },
                    'events': [
                        {
                            'title': 'Vaccination Programs',
                            'description': 'Improved business sentiment',
                            'impact': 'positive',
                            'date': '2021-04-05'
                        }
                    ],
                    'industryGroups': [
                        "Transportation",
                        "Leisure", 
                        "Consumer Foods & Retail", 
                        "Financial Services", 
                        "Property", 
                        "Information Technology"
                    ]
                }
            ],
            'rightIssues': [
                {
                    'year': 2020,
                    'ratio': '1:5',
                    'issuePrice': 80.0,
                    'description': 'Rights issue'
                }
            ],
            'topShareholders': {
                '2020': [
                    {
                        'name': 'John Keells Holdings PLC',
                        'percentage': 35.5,
                        'shares': 355000000
                    },
                    {
                        'name': 'Employee Provident Fund',
                        'percentage': 12.5,
                        'shares': 125000000
                    }
                ],
                '2021': [
                    {
                        'name': 'John Keells Holdings PLC',
                        'percentage': 36.0,
                        'shares': 360000000
                    },
                    {
                        'name': 'Employee Provident Fund',
                        'percentage': 12.8,
                        'shares': 128000000
                    }
                ]
            }
        }

    @patch('app.load_all_financial_data')
    def test_health_check(self, mock_load_data):
        """Test health check endpoint."""
        response = self.app.get('/api/health')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
        self.assertTrue('timestamp' in data)

    @patch('app.load_all_financial_data')
    def test_get_financial_data(self, mock_load_data):
        """Test getting all financial data."""
        mock_load_data.return_value = self.mock_data
        response = self.app.get('/api/financial-data')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data['yearlyData']), 2)
        self.assertEqual(data['yearlyData'][0]['year'], 2020)
        self.assertEqual(data['yearlyData'][1]['year'], 2021)

    @patch('app.load_all_financial_data')
    def test_get_revenue_data(self, mock_load_data):
        """Test getting revenue data."""
        mock_load_data.return_value = self.mock_data
        response = self.app.get('/api/revenue')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['year'], 2020)
        self.assertEqual(data[0]['revenue'], 100000)
        self.assertEqual(data[1]['year'], 2021)
        self.assertEqual(data[1]['revenue'], 120000)

    @patch('app.load_all_financial_data')
    def test_get_revenue_data_with_filters(self, mock_load_data):
        """Test getting revenue data with year filter."""
        mock_load_data.return_value = self.mock_data
        response = self.app.get('/api/revenue?years=2021')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['year'], 2021)
        self.assertEqual(data[0]['revenue'], 120000)

    @patch('app.load_all_financial_data')
    def test_get_cost_vs_expenses(self, mock_load_data):
        """Test getting cost vs expenses data."""
        mock_load_data.return_value = self.mock_data
        response = self.app.get('/api/cost-vs-expenses')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['costOfSales'], 70000)
        self.assertEqual(data[0]['operatingExpenses'], 15000)
        self.assertEqual(data[1]['costOfSales'], 80000)
        self.assertEqual(data[1]['operatingExpenses'], 18000)

    @patch('app.load_all_financial_data')
    def test_get_gross_profit_margin(self, mock_load_data):
        """Test getting gross profit margin data."""
        mock_load_data.return_value = self.mock_data
        response = self.app.get('/api/gross-profit-margin')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['grossProfitMargin'], 30.0)
        self.assertEqual(data[1]['grossProfitMargin'], 33.33)

    @patch('app.load_all_financial_data')
    def test_get_eps_data(self, mock_load_data):
        """Test getting EPS data."""
        mock_load_data.return_value = self.mock_data
        response = self.app.get('/api/eps')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['eps'], 10.5)
        self.assertEqual(data[1]['eps'], 12.5)

    @patch('app.load_all_financial_data')
    def test_get_net_asset_per_share(self, mock_load_data):
        """Test getting net asset per share data."""
        mock_load_data.return_value = self.mock_data
        response = self.app.get('/api/net-asset-per-share')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['netAssetPerShare'], 75.25)
        self.assertEqual(data[1]['netAssetPerShare'], 80.0)

    @patch('app.load_all_financial_data')
    def test_get_right_issues(self, mock_load_data):
        """Test getting right issues data."""
        mock_load_data.return_value = self.mock_data
        response = self.app.get('/api/right-issues')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['year'], 2020)
        self.assertEqual(data[0]['ratio'], '1:5')
        self.assertEqual(data[0]['issuePrice'], 80.0)

    @patch('app.load_all_financial_data')
    def test_get_shareholders(self, mock_load_data):
        """Test getting shareholders data."""
        mock_load_data.return_value = self.mock_data
        response = self.app.get('/api/shareholders?year=2020')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['name'], 'John Keells Holdings PLC')
        self.assertEqual(data[0]['percentage'], 35.5)
        self.assertEqual(data[1]['name'], 'Employee Provident Fund')

    @patch('app.load_all_financial_data')
    def test_get_shareholders_no_year(self, mock_load_data):
        """Test getting shareholders data without year parameter."""
        mock_load_data.return_value = self.mock_data
        response = self.app.get('/api/shareholders')
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.data)
        self.assertEqual(data['error'], 'Year parameter is required')

    @patch('app.load_all_financial_data')
    def test_get_dashboard_overview(self, mock_load_data):
        """Test getting dashboard overview."""
        mock_load_data.return_value = self.mock_data
        response = self.app.get('/api/dashboard-overview')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['latestYear'], 2021)
        self.assertEqual(data['revenue'], 120000)
        self.assertEqual(data['grossProfit'], 40000)
        self.assertTrue('growthRates' in data)
        self.assertTrue('revenueGrowth' in data['growthRates'])

    @patch('app.load_all_financial_data')
    def test_get_yearly_comparison(self, mock_load_data):
        """Test getting yearly comparison data."""
        mock_load_data.return_value = self.mock_data
        response = self.app.get('/api/yearly-comparison')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['year'], 2020)
        self.assertEqual(data[1]['year'], 2021)
        self.assertTrue('revenue' in data[0])
        self.assertTrue('grossProfit' in data[0])
        self.assertTrue('eps' in data[0])

    @patch('app.load_all_financial_data')
    def test_get_financial_ratios(self, mock_load_data):
        """Test getting financial ratios."""
        mock_load_data.return_value = self.mock_data
        response = self.app.get('/api/financial-ratios')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertTrue('grossProfitMargin' in data[0])
        self.assertTrue('operatingProfitMargin' in data[0])
        self.assertTrue('returnOnEquity' in data[0])

    @patch('app.load_all_financial_data')
    def test_get_industry_breakdown(self, mock_load_data):
        """Test getting industry breakdown."""
        mock_load_data.return_value = self.mock_data
        response = self.app.get('/api/industry-breakdown?year=2021')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertTrue(len(data) > 0)
        self.assertTrue('name' in data[0])
        self.assertTrue('revenue' in data[0])
        self.assertTrue('percentage' in data[0])

    @patch('app.linear_regression_forecast')
    @patch('app.load_all_financial_data')
    def test_generate_forecast(self, mock_load_data, mock_forecast):
        """Test generating forecast."""
        mock_load_data.return_value = self.mock_data
        
        # Mock forecast result
        mock_forecast.return_value = {
            'forecast': [
                {'year': 2022, 'value': 140000},
                {'year': 2023, 'value': 160000}
            ],
            'confidence_interval': {
                'upper': [
                    {'year': 2022, 'value': 154000},
                    {'year': 2023, 'value': 176000}
                ],
                'lower': [
                    {'year': 2022, 'value': 126000},
                    {'year': 2023, 'value': 144000}
                ]
            },
            'accuracy': 0.95
        }
        
        request_data = {
            'metric': 'revenue',
            'model': 'linear',
            'forecastYears': 2
        }
        
        response = self.app.post('/api/forecast', json=request_data)
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['metric'], 'revenue')
        self.assertEqual(data['modelType'], 'linear')
        self.assertTrue('actualData' in data)
        self.assertTrue('forecastData' in data)
        self.assertTrue('confidenceInterval' in data)
        self.assertTrue('accuracy' in data)
        self.assertTrue('factors' in data)

    @patch('app.linear_regression_forecast')
    @patch('app.load_all_financial_data')
    def test_generate_industry_forecast(self, mock_load_data, mock_forecast):
        """Test generating industry forecast."""
        mock_load_data.return_value = self.mock_data
        
        # Mock forecast result
        mock_forecast.return_value = {
            'forecast': [
                {'year': 2022, 'value': 50000},
                {'year': 2023, 'value': 60000}
            ],
            'confidence_interval': {
                'upper': [
                    {'year': 2022, 'value': 55000},
                    {'year': 2023, 'value': 66000}
                ],
                'lower': [
                    {'year': 2022, 'value': 45000},
                    {'year': 2023, 'value': 54000}
                ]
            },
            'accuracy': 0.9
        }
        
        request_data = {
            'metric': 'revenue',
            'industryGroup': 'Leisure',
            'model': 'linear',
            'forecastYears': 2
        }
        
        response = self.app.post('/api/industry-forecast', json=request_data)
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['metric'], 'revenue')
        self.assertEqual(data['industryGroup'], 'Leisure')
        self.assertEqual(data['modelType'], 'linear')
        self.assertTrue('actualData' in data)
        self.assertTrue('forecastData' in data)
        self.assertTrue('confidenceInterval' in data)
        self.assertTrue('accuracy' in data)
        self.assertTrue('factors' in data)

    @patch('app.linear_regression_forecast')
    @patch('app.load_all_financial_data')
    def test_generate_multi_metric_forecast(self, mock_load_data, mock_forecast):
        """Test generating multi-metric forecast."""
        mock_load_data.return_value = self.mock_data
        
        # Mock forecast result
        mock_forecast.return_value = {
            'forecast': [
                {'year': 2022, 'value': 140000},
                {'year': 2023, 'value': 160000}
            ],
            'confidence_interval': {
                'upper': [
                    {'year': 2022, 'value': 154000},
                    {'year': 2023, 'value': 176000}
                ],
                'lower': [
                    {'year': 2022, 'value': 126000},
                    {'year': 2023, 'value': 144000}
                ]
            },
            'accuracy': 0.95
        }
        
        request_data = {
            'metrics': ['revenue', 'eps'],
            'model': 'linear',
            'forecastYears': 2
        }
        
        response = self.app.post('/api/multi-metric-forecast', json=request_data)
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertTrue('forecasts' in data)
        self.assertTrue('correlations' in data)
        self.assertTrue('revenue' in data['forecasts'])
        self.assertTrue('eps' in data['forecasts'])

if __name__ == '__main__':
    unittest.main() 