import unittest
import sys
import os
import json
import pandas as pd
import numpy as np
from unittest.mock import patch, MagicMock, mock_open

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import app

class TestDataProcessing(unittest.TestCase):
    def setUp(self):
        # Create sample data for testing
        self.sample_consolidated_data = {
            'financial_data': {
                '2020-2021': {
                    'total_revenue': {'value': 120000, 'formatted': 'LKR 120.00 Mn'},
                    'cost_of_sales': {'value': 80000, 'formatted': 'LKR 80.00 Mn'},
                    'operating_expenses': {'value': 18000, 'formatted': 'LKR 18.00 Mn'},
                    'gross_profit': {'value': 40000, 'formatted': 'LKR 40.00 Mn'},
                    'gross_profit_margin': {'value': 33.33, 'formatted': '33.33%'},
                    'earnings_per_share': {'value': 12.5, 'formatted': '12.50'},
                    'net_asset_per_share': {'value': 80.0, 'formatted': '80.00'},
                    'right_issues': {
                        'ratio': '1:5',
                        'issue_price': '80.0'
                    },
                    'top_shareholders': {
                        'John Keells Holdings PLC': {
                            'percentage': 36.0,
                            'shares': 360000000
                        },
                        'Employee Provident Fund': {
                            'percentage': 12.8,
                            'shares': 128000000
                        }
                    }
                },
                '2019-2020': {
                    'total_revenue': {'value': 100000, 'formatted': 'LKR 100.00 Mn'},
                    'cost_of_sales': {'value': 70000, 'formatted': 'LKR 70.00 Mn'},
                    'operating_expenses': {'value': 15000, 'formatted': 'LKR 15.00 Mn'},
                    'gross_profit': {'value': 30000, 'formatted': 'LKR 30.00 Mn'},
                    'gross_profit_margin': {'value': 30.0, 'formatted': '30.00%'},
                    'earnings_per_share': {'value': 10.5, 'formatted': '10.50'},
                    'net_asset_per_share': {'value': 75.25, 'formatted': '75.25'},
                    'right_issues': {
                        'ratio': 'N/A',
                        'issue_price': 'N/A'
                    },
                    'top_shareholders': {
                        'John Keells Holdings PLC': {
                            'percentage': 35.5,
                            'shares': 355000000
                        },
                        'Employee Provident Fund': {
                            'percentage': 12.5,
                            'shares': 125000000
                        }
                    }
                }
            }
        }

    def test_transform_consolidated_data(self):
        """Test transforming consolidated JSON data."""
        transformed_data = app.transform_consolidated_data(self.sample_consolidated_data)
        
        # Check structure
        self.assertTrue('industryGroups' in transformed_data)
        self.assertTrue('yearlyData' in transformed_data)
        self.assertTrue('rightIssues' in transformed_data)
        self.assertTrue('topShareholders' in transformed_data)
        
        # Check yearly data
        yearly_data = transformed_data['yearlyData']
        self.assertEqual(len(yearly_data), 4)  # 2 fiscal years × 2 display years
        
        # Check years are extracted correctly
        years = sorted([item['year'] for item in yearly_data])
        self.assertEqual(years, [2019, 2020, 2020, 2021])
        
        # Check right issues data
        right_issues = transformed_data['rightIssues']
        # Should only have one right issue (for 2020 and 2021)
        self.assertTrue(any(issue['year'] == 2020 and issue['ratio'] == '1:5' for issue in right_issues))
        
        # Check shareholders data
        self.assertTrue('2020' in transformed_data['topShareholders'])
        self.assertTrue('2021' in transformed_data['topShareholders'])
        
        # Check shareholder data for 2021
        shareholders_2021 = transformed_data['topShareholders']['2021']
        self.assertEqual(len(shareholders_2021), 2)
        self.assertEqual(shareholders_2021[0]['name'], 'John Keells Holdings PLC')
        self.assertEqual(shareholders_2021[0]['percentage'], 36.0)

    def test_estimate_share_count(self):
        """Test estimating share count from shareholder data."""
        year_data = {
            'top_shareholders': {
                'Major Investor': {
                    'percentage': 10.0,
                    'shares': 100000000
                }
            }
        }
        
        share_count = app.estimate_share_count(year_data)
        self.assertEqual(share_count, 1000000000)  # 100M shares / 10% * 100%
        
        # Test with no shareholder data
        empty_data = {}
        share_count = app.estimate_share_count(empty_data)
        self.assertEqual(share_count, 1385000000)  # Default value

    def test_get_events_for_year(self):
        """Test getting events for a specific year."""
        events_2020 = app.get_events_for_year(2020)
        self.assertTrue(len(events_2020) > 0)
        self.assertEqual(events_2020[0]['title'], 'COVID-19 Pandemic')
        
        events_2022 = app.get_events_for_year(2022)
        self.assertTrue(len(events_2022) > 0)
        self.assertEqual(events_2022[0]['title'], 'Economic Crisis')
        
        # Test year with no events
        events_2018 = app.get_events_for_year(2018)
        self.assertEqual(len(events_2018), 0)

    @patch('app.os.path.exists')
    @patch('builtins.open', new_callable=mock_open, read_data='{}')
    @patch('app.json.load')
    def test_load_all_financial_data_from_json(self, mock_json_load, mock_file, mock_exists):
        """Test loading all financial data from JSON."""
        # Setup mocks
        mock_exists.return_value = True
        mock_json_load.return_value = self.sample_consolidated_data
        
        # Clear cache
        app.data_cache.clear()
        
        # Call function
        result = app.load_all_financial_data()
        
        # Check cache is populated
        self.assertTrue('all_data' in app.data_cache)
        self.assertTrue('raw_json_data' in app.data_cache)
        
        # Check result structure
        self.assertTrue('industryGroups' in result)
        self.assertTrue('yearlyData' in result)
        self.assertTrue('rightIssues' in result)
        self.assertTrue('topShareholders' in result)

    @patch('app.os.path.exists')
    @patch('app.load_from_csv_files')
    def test_load_all_financial_data_fallback(self, mock_load_csv, mock_exists):
        """Test loading data falls back to CSV if JSON unavailable."""
        # Setup mocks
        mock_exists.return_value = False
        mock_load_csv.return_value = {'yearlyData': []}
        
        # Clear cache
        app.data_cache.clear()
        
        # Call function
        app.load_all_financial_data()
        
        # Check CSV loader was called
        mock_load_csv.assert_called_once()

    @patch('app.linear_regression_forecast')
    def test_arima_forecast_fallback(self, mock_linear):
        """Test ARIMA forecast falls back to linear regression if it fails."""
        # Setup mock
        mock_linear.return_value = {
            'forecast': [],
            'confidence_interval': {'upper': [], 'lower': []},
            'accuracy': 0.9
        }
        
        # Create test data
        years = np.array([2018, 2019, 2020, 2021]).reshape(-1, 1)
        values = np.array([100, 110, 120, 130])
        
        # Call with data that might cause ARIMA to fail
        # (small time series often problematic for ARIMA)
        forecast_result = app.arima_forecast(years, values, 2)
        
        # Check linear regression fallback was used
        mock_linear.assert_called_once()

    def test_linear_regression_forecast(self):
        """Test linear regression forecast function."""
        # Create test data
        years = np.array([2018, 2019, 2020, 2021]).reshape(-1, 1)
        values = np.array([100, 110, 120, 130])
        
        # Call function
        result = app.linear_regression_forecast(years, values, 2)
        
        # Check structure
        self.assertTrue('forecast' in result)
        self.assertTrue('confidence_interval' in result)
        self.assertTrue('accuracy' in result)
        
        # Check forecast years
        forecast_years = [point['year'] for point in result['forecast']]
        self.assertEqual(forecast_years, [2022, 2023])
        
        # Check values trend upward (should continue the linear pattern)
        forecast_values = [point['value'] for point in result['forecast']]
        self.assertTrue(forecast_values[1] > forecast_values[0])
        
        # Check confidence intervals
        self.assertEqual(len(result['confidence_interval']['upper']), 2)
        self.assertEqual(len(result['confidence_interval']['lower']), 2)

    def test_apply_industry_factor(self):
        """Test applying industry-specific adjustment factors."""
        # Test known industry and year
        result = app.apply_industry_factor(100000, 'Leisure', 2020)
        self.assertEqual(result, 40000)  # Leisure in 2020 had 0.4 factor (COVID impact)
        
        # Test recovery in later year
        result = app.apply_industry_factor(100000, 'Leisure', 2023)
        self.assertEqual(result, 90000)  # Leisure in 2023 had 0.9 factor (recovery)
        
        # Test industry with growth during COVID
        result = app.apply_industry_factor(100000, 'Information Technology', 2020)
        self.assertEqual(result, 110000)  # IT in 2020 had 1.1 factor (growth)
        
        # Test unknown industry
        result = app.apply_industry_factor(100000, 'Unknown Industry', 2020)
        self.assertEqual(result, 100000)  # Default factor is 1.0

    def test_apply_industry_future_factor(self):
        """Test applying industry-specific future adjustment factors."""
        # Test known industry and future year
        result = app.apply_industry_future_factor(100000, 'Leisure', 2024)
        self.assertEqual(result, 110000)  # Leisure in 2024 has 1.1 factor
        
        # Test high growth industry
        result = app.apply_industry_future_factor(100000, 'Information Technology', 2025)
        self.assertEqual(result, 125000)  # IT in 2025 has 1.25 factor
        
        # Test unknown industry or year
        result = app.apply_industry_future_factor(100000, 'Unknown', 2030)
        self.assertEqual(result, 100000)  # Default factor is 1.0

    def test_get_forecast_factors(self):
        """Test getting factors that influence forecasts."""
        # Test revenue factors
        revenue_factors = app.get_forecast_factors('revenue')
        self.assertTrue(len(revenue_factors) > 0)
        self.assertTrue(any(factor['name'] == 'Tourism Growth' for factor in revenue_factors))
        
        # Test EPS factors
        eps_factors = app.get_forecast_factors('eps')
        self.assertTrue(len(eps_factors) > 0)
        self.assertTrue(any(factor['name'] == 'Operational Efficiency' for factor in eps_factors))
        
        # Test unknown metric
        unknown_factors = app.get_forecast_factors('unknown_metric')
        self.assertTrue(len(unknown_factors) > 0)  # Should return default factors
        self.assertTrue(any(factor['name'] == 'Industry Trends' for factor in unknown_factors))

if __name__ == '__main__':
    unittest.main() 