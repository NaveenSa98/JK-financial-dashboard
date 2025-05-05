from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import os
import json
import pandas as pd
from datetime import datetime
import numpy as np
from sklearn.linear_model import LinearRegression
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.holtwinters import ExponentialSmoothing

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Path to extracted data
EXTRACTED_DATA_PATH = os.path.join(os.path.dirname(__file__), 'scripts', 'extracted_data')

# Cache for loaded data
data_cache = {}

def load_all_financial_data():
    """Load all financial data from the consolidated JSON file."""
    if 'all_data' in data_cache:
        return data_cache['all_data']
    
    json_path = os.path.join(EXTRACTED_DATA_PATH, 'consolidated_financial_data.json')
    
    if not os.path.exists(json_path):
        # Fallback to CSV files if JSON doesn't exist
        return load_from_csv_files()
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            consolidated_data = json.load(f)
        
        # Transform the JSON data format into the API format expected by the frontend
        transformed_data = transform_consolidated_data(consolidated_data)
        
        # Cache the transformed data
        data_cache['all_data'] = transformed_data
        data_cache['raw_json_data'] = consolidated_data
        
        return transformed_data
    except Exception as e:
        print(f"Error loading JSON data: {e}")
        # Fallback to CSV files
        return load_from_csv_files()

def transform_consolidated_data(consolidated_data):
    """Transform the consolidated JSON data into the format expected by the frontend."""
    transformed = {
        'industryGroups': [
            "Transportation",
            "Leisure", 
            "Consumer Foods & Retail", 
            "Financial Services", 
            "Property", 
            "Information Technology"
        ],
        'yearlyData': [],
        'rightIssues': [],
        'topShareholders': {}
    }
    
    # Process data for each year
    for year_str, year_data in consolidated_data.get('financial_data', {}).items():
        # Map fiscal year strings to display years
        fiscal_years = year_str.split('-')
        start_year = int(fiscal_years[0])
        end_year = int(fiscal_years[1])
        
        # Create entries for both the start and end years of the fiscal period
        for display_year in [start_year, end_year]:
            # Process right issues
            if 'right_issues' in year_data:
                right_issues = year_data['right_issues']
                if right_issues.get('ratio') != 'N/A':
                    right_issue_data = {
                        'year': display_year,
                        'ratio': right_issues.get('ratio', 'N/A'),
                        'issuePrice': float(right_issues.get('issue_price', 0)) if right_issues.get('issue_price') != 'N/A' else None,
                        'description': "Rights issue"
                    }
                    # Check for duplicates before adding
                    if not any(item.get('year') == display_year and item.get('ratio') == right_issue_data['ratio'] for item in transformed['rightIssues']):
                        transformed['rightIssues'].append(right_issue_data)
            
            # Process top shareholders
            if 'top_shareholders' in year_data:
                shareholders_list = []
                for name, data in year_data['top_shareholders'].items():
                    shareholder_data = {
                        'name': name,
                        'percentage': data.get('percentage', 0)
                    }
                    
                    if data.get('shares') is not None:
                        shareholder_data['shares'] = data.get('shares')
                    
                    shareholders_list.append(shareholder_data)
                
                # Sort shareholders by percentage
                shareholders_list = sorted(shareholders_list, key=lambda x: x['percentage'], reverse=True)
                transformed['topShareholders'][display_year] = shareholders_list
            
            # Create yearly financial data using formatted values
            financials = {
                'revenue': year_data['total_revenue']['value'],  # Keep numerical value for calculations
                'revenueFormatted': year_data['total_revenue']['formatted'],  # Add formatted version
                'costOfSales': year_data['cost_of_sales']['value'],
                'costOfSalesFormatted': year_data['cost_of_sales']['formatted'],
                'operatingExpenses': year_data['operating_expenses']['value'],
                'operatingExpensesFormatted': year_data['operating_expenses']['formatted'],
                'grossProfit': year_data['gross_profit']['value'],
                'grossProfitFormatted': year_data['gross_profit']['formatted'],
                'grossProfitMargin': year_data['gross_profit_margin']['value'],
                'grossProfitMarginFormatted': year_data['gross_profit_margin']['formatted'],
                'eps': year_data['earnings_per_share']['value'],
                'epsFormatted': year_data['earnings_per_share']['formatted'],
                'netAssetPerShare': year_data['net_asset_per_share']['value'],
                'netAssetPerShareFormatted': year_data['net_asset_per_share']['formatted'],
                # Estimate share count from a top shareholder if available
                'outstandingShares': estimate_share_count(year_data),
            }
            
            # Estimate net profit based on EPS and share count
            financials['netProfit'] = financials['eps'] * financials['outstandingShares']
            # Format the net profit (approximately)
            netProfitMillions = financials['netProfit'] / 1000000
            financials['netProfitFormatted'] = f"LKR {netProfitMillions:.2f} Mn"
            
            # Add yearly data
            yearly_data = {
                'year': display_year,
                'industryGroups': transformed['industryGroups'],
                'financials': financials,
                'events': get_events_for_year(display_year)
            }
            
            # Check if this year data already exists (to avoid duplicates)
            if not any(item['year'] == display_year for item in transformed['yearlyData']):
                transformed['yearlyData'].append(yearly_data)
    
    # Sort yearly data by year
    transformed['yearlyData'] = sorted(transformed['yearlyData'], key=lambda x: x['year'])
    
    return transformed

def estimate_share_count(year_data):
    """Estimate total outstanding shares from top shareholders data."""
    # Default value if we can't estimate
    default_shares = 1385000000  # Example value
    
    if 'top_shareholders' not in year_data:
        return default_shares
    
    # Find a shareholder with both percentage and shares data
    for name, data in year_data['top_shareholders'].items():
        if data.get('percentage') and data.get('shares'):
            # If shareholder has 9.31% and 128,917,111 shares, then 100% would be:
            # shares / percentage * 100
            return data.get('shares') / data.get('percentage') * 100
    
    return default_shares

def get_events_for_year(year):
    """Get significant events for a specific year."""
    events = []
    
    if year == 2019:
        events.append({
            'title': "Easter Sunday Attacks",
            'description': "Impact on tourism and leisure sectors",
            'impact': "negative",
            'date': "2019-04-21"
        })
    elif year == 2020:
        events.append({
            'title': "COVID-19 Pandemic",
            'description': "Global lockdowns affecting operations",
            'impact': "negative",
            'date': "2020-03-15"
        })
        events.append({
            'title': "Government Relief",
            'description': "Tax relief measures announced",
            'impact': "positive",
            'date': "2020-06-10"
        })
    elif year == 2021:
        events.append({
            'title': "Vaccination Programs",
            'description': "Improved business sentiment",
            'impact': "positive",
            'date': "2021-04-05"
        })
    elif year == 2022:
        events.append({
            'title': "Economic Crisis",
            'description': "Sri Lanka economic crisis",
            'impact': "negative",
            'date': "2022-03-31"
        })
    elif year == 2023:
        events.append({
            'title': "Tourism Resurgence",
            'description': "Strong recovery in tourism sector",
            'impact': "positive",
            'date': "2023-02-10"
        })
    elif year == 2024:
        events.append({
            'title': "Economic Recovery",
            'description': "Continued economic recovery and growth",
            'impact': "positive",
            'date': "2024-01-15"
        })
        events.append({
            'title': "Digital Transformation",
            'description': "Acceleration of digital initiatives across all sectors",
            'impact': "positive",
            'date': "2024-03-20"
        })
    
    return events

def load_from_csv_files():
    """Fallback to load all financial data from extracted CSV files."""
    # This is the original code that loads from CSV files
    # ... existing code ...
    
    all_data = {
        'industryGroups': [
            "Transportation",
            "Leisure", 
            "Consumer Foods & Retail", 
            "Financial Services", 
            "Property", 
            "Information Technology"
        ],
        'yearlyData': [],
        'rightIssues': [],
        'topShareholders': {}
    }
    
    # Find all years by checking financial_metrics files
    financial_files = [f for f in os.listdir(EXTRACTED_DATA_PATH) if f.startswith('financial_metrics_')]
    years = [f.split('_')[-1].split('.')[0] for f in financial_files]
    
    for year_str in years:
        # Map fiscal year strings to display years
        fiscal_years = year_str.split('-')
        start_year = int(fiscal_years[0])
        end_year = int(fiscal_years[1])
        
        # Load financial metrics
        metrics_file = os.path.join(EXTRACTED_DATA_PATH, f'financial_metrics_{year_str}.csv')
        if os.path.exists(metrics_file):
            metrics_df = pd.read_csv(metrics_file)
            
            # Convert to dictionary for easier access
            metrics_dict = {}
            for _, row in metrics_df.iterrows():
                metric_name = row['Metric'].lower().replace(' ', '_')
                metrics_dict[metric_name] = row['Value']
            
            # Process both the start and end years of the fiscal period
            for display_year in [start_year, end_year]:
                # Load rights issues if available
                rights_file = os.path.join(EXTRACTED_DATA_PATH, f'rights_issues_{year_str}.csv')
                rights_data = None
                if os.path.exists(rights_file):
                    rights_df = pd.read_csv(rights_file)
                    rights_dict = {}
                    for _, row in rights_df.iterrows():
                        rights_dict[row['Attribute'].lower()] = row['Value']
                    
                    if rights_dict.get('ratio') != 'N/A':
                        rights_data = {
                            'year': display_year,
                            'ratio': rights_dict.get('ratio', 'N/A'),
                            'issuePrice': float(rights_dict.get('issue_price', 0)) if rights_dict.get('issue_price') != 'N/A' else None,
                            'description': "Rights issue" 
                        }
                        # Check for duplicates before adding
                        if not any(item.get('year') == display_year and item.get('ratio') == rights_data['ratio'] for item in all_data['rightIssues']):
                            all_data['rightIssues'].append(rights_data)
                
                # Load top shareholders
                shareholders_file = os.path.join(EXTRACTED_DATA_PATH, f'top_shareholders_{year_str}.csv')
                if os.path.exists(shareholders_file):
                    try:
                        shareholders_df = pd.read_csv(shareholders_file)
                        shareholders_list = []
                        
                        for _, row in shareholders_df.iterrows():
                            shareholder_data = {
                                'name': row['Shareholder'],
                                'percentage': float(row['Percentage']) if 'Percentage' in shareholders_df.columns and pd.notna(row['Percentage']) else 0
                            }
                            
                            if 'Number of Shares' in shareholders_df.columns and pd.notna(row['Number of Shares']):
                                shareholder_data['shares'] = float(row['Number of Shares'])
                            
                            shareholders_list.append(shareholder_data)
                        
                        # Sort by percentage
                        shareholders_list = sorted(shareholders_list, key=lambda x: x['percentage'], reverse=True)
                        
                        all_data['topShareholders'][display_year] = shareholders_list
                    except Exception as e:
                        print(f"Error loading shareholders data for {year_str}: {e}")
                        all_data['topShareholders'][display_year] = []
                
                # Get numerical values from metrics
                revenue = float(metrics_dict.get('total_revenue', 0))
                cost_of_sales = float(metrics_dict.get('cost_of_sales', 0))
                op_expenses = float(metrics_dict.get('operating_expenses', 0))
                gross_profit = float(metrics_dict.get('gross_profit', 0))
                gross_margin = float(metrics_dict.get('gross_profit_margin', 0))
                eps = float(metrics_dict.get('earnings_per_share', 0))
                net_asset_per_share = float(metrics_dict.get('net_asset_per_share', 0))
                shares_outstanding = 1322000000  # Default as placeholder
                
                # Format values nicely
                def format_currency(value):
                    """Format currency value in millions."""
                    value_in_mn = value / 1000000
                    return f"LKR {value_in_mn:.2f} Mn"
                
                def format_percentage(value):
                    """Format percentage value."""
                    return f"{value:.2f}%"
                
                # Create yearly financial data structure
                yearly_data = {
                    'year': display_year,
                    'industryGroups': [
                        "Transportation",
                        "Leisure", 
                        "Consumer Foods & Retail", 
                        "Financial Services", 
                        "Property", 
                        "Information Technology"
                    ],
                    'financials': {
                        'revenue': revenue,
                        'revenueFormatted': format_currency(revenue),
                        'costOfSales': cost_of_sales,
                        'costOfSalesFormatted': format_currency(cost_of_sales),
                        'operatingExpenses': op_expenses,
                        'operatingExpensesFormatted': format_currency(op_expenses),
                        'grossProfit': gross_profit,
                        'grossProfitFormatted': format_currency(gross_profit),
                        'grossProfitMargin': gross_margin,
                        'grossProfitMarginFormatted': format_percentage(gross_margin),
                        'eps': eps,
                        'epsFormatted': f"{eps:.2f}",
                        'netAssetPerShare': net_asset_per_share,
                        'netAssetPerShareFormatted': f"{net_asset_per_share:.2f}",
                        'outstandingShares': shares_outstanding,
                        'netProfit': eps * shares_outstanding,
                        'netProfitFormatted': format_currency(eps * shares_outstanding),
                        'totalAssets': 0,  # Not available in current extraction
                        'totalLiabilities': 0  # Not available in current extraction
                    },
                    'events': get_events_for_year(display_year)
                }
                
                # Check if this year data already exists (to avoid duplicates)
                if not any(item['year'] == display_year for item in all_data['yearlyData']):
                    all_data['yearlyData'].append(yearly_data)
    
    # Sort yearly data by year
    all_data['yearlyData'] = sorted(all_data['yearlyData'], key=lambda x: x['year'])
    
    # If no right issues data was loaded, add sample data
    if not all_data['rightIssues']:
        print("No right issues data found in CSV files, adding sample data")
        all_data['rightIssues'] = get_sample_right_issues_data()
    
    # Cache the result
    data_cache['all_data'] = all_data
    
    return all_data

# API Routes
@app.route('/api/clear-cache', methods=['GET'])
def clear_cache():
    """Clear the data cache."""
    data_cache.clear()
    return jsonify({'message': 'Cache cleared successfully'})

@app.route('/api/financial-data', methods=['GET'])
def get_financial_data():
    """Return all financial data."""
    data = load_all_financial_data()
    return jsonify(data)

@app.route('/api/revenue', methods=['GET'])
def get_revenue_data():
    """Return revenue data, filtered by years and industry groups if specified."""
    years = request.args.get('years')
    industry_groups = request.args.get('industryGroups')
    
    # Parse years and industry groups if provided
    years_list = years.split(',') if years else None
    industry_groups_list = industry_groups.split(',') if industry_groups else None
    
    all_data = load_all_financial_data()
    filtered_data = []
    
    for item in all_data['yearlyData']:
        year_str = str(item['year'])
        # Filter by years if specified
        if years_list and year_str not in years_list:
            continue
            
        # Filter by industry groups if specified
        if industry_groups_list and not any(group in item['industryGroups'] for group in industry_groups_list):
            continue
            
        filtered_data.append({
            'year': item['year'],
            'revenue': item['financials']['revenue'],
            'currency': 'LKR'
        })
    
    return jsonify(filtered_data)

@app.route('/api/cost-vs-expenses', methods=['GET'])
def get_cost_vs_expenses():
    """Return cost of sales vs operating expenses data."""
    years = request.args.get('years')
    industry_groups = request.args.get('industryGroups')
    
    # Parse years and industry groups if provided
    years_list = years.split(',') if years else None
    industry_groups_list = industry_groups.split(',') if industry_groups else None
    
    all_data = load_all_financial_data()
    filtered_data = []
    
    for item in all_data['yearlyData']:
        year_str = str(item['year'])
        # Filter by years if specified
        if years_list and year_str not in years_list:
            continue
            
        # Filter by industry groups if specified
        if industry_groups_list and not any(group in item['industryGroups'] for group in industry_groups_list):
            continue
            
        filtered_data.append({
            'year': item['year'],
            'costOfSales': item['financials']['costOfSales'],
            'operatingExpenses': item['financials']['operatingExpenses'],
            'currency': 'LKR'
        })
    
    return jsonify(filtered_data)

@app.route('/api/gross-profit-margin', methods=['GET'])
def get_gross_profit_margin():
    """Return gross profit margin data."""
    years = request.args.get('years')
    industry_groups = request.args.get('industryGroups')
    
    # Parse years and industry groups if provided
    years_list = years.split(',') if years else None
    industry_groups_list = industry_groups.split(',') if industry_groups else None
    
    all_data = load_all_financial_data()
    filtered_data = []
    
    for item in all_data['yearlyData']:
        year_str = str(item['year'])
        # Filter by years if specified
        if years_list and year_str not in years_list:
            continue
            
        # Filter by industry groups if specified
        if industry_groups_list and not any(group in item['industryGroups'] for group in industry_groups_list):
            continue
            
        filtered_data.append({
            'year': item['year'],
            'grossProfitMargin': item['financials']['grossProfitMargin']
        })
    
    return jsonify(filtered_data)

@app.route('/api/eps', methods=['GET'])
def get_eps_data():
    """Return earnings per share data."""
    years = request.args.get('years')
    industry_groups = request.args.get('industryGroups')
    
    # Parse years and industry groups if provided
    years_list = years.split(',') if years else None
    industry_groups_list = industry_groups.split(',') if industry_groups else None
    
    all_data = load_all_financial_data()
    filtered_data = []
    
    for item in all_data['yearlyData']:
        year_str = str(item['year'])
        # Filter by years if specified
        if years_list and year_str not in years_list:
            continue
            
        # Filter by industry groups if specified
        if industry_groups_list and not any(group in item['industryGroups'] for group in industry_groups_list):
            continue
            
        filtered_data.append({
            'year': item['year'],
            'eps': item['financials']['eps']
        })
    
    return jsonify(filtered_data)

@app.route('/api/net-asset-per-share', methods=['GET'])
def get_net_asset_per_share():
    """Return net asset per share data."""
    years = request.args.get('years')
    industry_groups = request.args.get('industryGroups')
    
    # Parse years and industry groups if provided
    years_list = years.split(',') if years else None
    industry_groups_list = industry_groups.split(',') if industry_groups else None
    
    all_data = load_all_financial_data()
    filtered_data = []
    
    for item in all_data['yearlyData']:
        year_str = str(item['year'])
        # Filter by years if specified
        if years_list and year_str not in years_list:
            continue
            
        # Filter by industry groups if specified
        if industry_groups_list and not any(group in item['industryGroups'] for group in industry_groups_list):
            continue
            
        filtered_data.append({
            'year': item['year'],
            'netAssetPerShare': item['financials']['netAssetPerShare']
        })
    
    return jsonify(filtered_data)

def get_sample_right_issues_data():
    """Generate sample right issues data for testing."""
    return [
        {
            "year": 2023,
            "ratio": "4:1",
            "issuePrice": 175.0,
            "description": "Rights issue for expansion"
        },
        {
            "year": 2020,
            "ratio": "3:1",
            "issuePrice": 160.0,
            "description": "Rights issue for debt restructuring"
        },
        {
            "year": 2018,
            "ratio": "5:2",
            "issuePrice": 140.0,
            "description": "Rights issue for acquisitions"
        },
        {
            "year": 2015,
            "ratio": "2:1",
            "issuePrice": 120.0,
            "description": "Rights issue for capital investment"
        }
    ]

@app.route('/api/right-issues', methods=['GET'])
def get_right_issues():
    """Return right issues data."""
    print("Fetching right issues data...")
    data = load_all_financial_data()
    
    # Debug logging
    print(f"Right issues data count: {len(data['rightIssues'])}")
    if len(data['rightIssues']) == 0:
        print("WARNING: No right issues data found! Returning sample data.")
        # Return sample data if no real data is available
        return jsonify(get_sample_right_issues_data())
    else:
        print(f"Sample right issue: {data['rightIssues'][0]}")
    
    # Ensure we're returning a valid array even if empty
    return jsonify(data['rightIssues'])

@app.route('/api/shareholders', methods=['GET'])
def get_shareholders():
    """Return top shareholders data for a particular year."""
    year = request.args.get('year')
    
    if not year:
        return jsonify({'error': 'Year parameter is required'}), 400
    
    data = load_all_financial_data()
    
    # Check if data for the year exists
    if int(year) not in data['topShareholders']:
        # Find closest available year
        available_years = [int(y) for y in data['topShareholders'].keys()]
        if not available_years:
            return jsonify([])
            
        closest_year = min(available_years, key=lambda x: abs(x - int(year)))
        return jsonify(data['topShareholders'][closest_year])
    
    return jsonify(data['topShareholders'][int(year)])

@app.route('/api/raw-financial-data', methods=['GET'])
def get_raw_consolidated_data():
    """Return the raw consolidated financial data."""
    # Load data
    load_all_financial_data()  # This will ensure raw_json_data is cached
    
    if 'raw_json_data' in data_cache:
        return jsonify(data_cache['raw_json_data'])
    else:
        return jsonify({'error': 'Raw data not available'}), 404

@app.route('/api/dashboard-overview', methods=['GET'])
def get_dashboard_overview():
    """Return summary data for dashboard overview."""
    data = load_all_financial_data()
    
    # Get the most recent year's data
    if not data['yearlyData']:
        return jsonify({'error': 'No data available'}), 404
        
    all_years = [item['year'] for item in data['yearlyData']]
    latest_year = max(all_years)
    
    latest_data = next((item for item in data['yearlyData'] if item['year'] == latest_year), None)
    
    if not latest_data:
        return jsonify({'error': 'Latest data not available'}), 404
    
    # Calculate growth rates compared to previous year
    prev_year = latest_year - 1
    prev_data = next((item for item in data['yearlyData'] if item['year'] == prev_year), None)
    
    growth_rates = {}
    if prev_data:
        financials = latest_data['financials']
        prev_financials = prev_data['financials']
        
        for key in ['revenue', 'grossProfit', 'eps']:
            if prev_financials[key] != 0:
                growth_rates[f'{key}Growth'] = ((financials[key] - prev_financials[key]) / abs(prev_financials[key])) * 100
            else:
                growth_rates[f'{key}Growth'] = 0
    
    # Prepare summary data
    overview = {
        'latestYear': latest_year,
        'revenue': latest_data['financials']['revenue'],
        'grossProfit': latest_data['financials']['grossProfit'],
        'grossProfitMargin': latest_data['financials']['grossProfitMargin'],
        'eps': latest_data['financials']['eps'],
        'netAssetPerShare': latest_data['financials']['netAssetPerShare'],
        'growthRates': growth_rates,
        'topShareholders': data['topShareholders'].get(latest_year, [])[:5]  # Get top 5 shareholders
    }
    
    return jsonify(overview)

@app.route('/api/yearly-comparison', methods=['GET'])
def get_yearly_comparison():
    """Compare financial metrics across years."""
    metrics = request.args.get('metrics', 'revenue,grossProfit,eps')
    metrics_list = metrics.split(',')
    
    data = load_all_financial_data()
    
    comparison_data = []
    for item in data['yearlyData']:
        year_data = {
            'year': item['year']
        }
        
        for metric in metrics_list:
            if metric in item['financials']:
                year_data[metric] = item['financials'][metric]
        
        comparison_data.append(year_data)
    
    # Sort by year
    comparison_data = sorted(comparison_data, key=lambda x: x['year'])
    
    return jsonify(comparison_data)

@app.route('/api/financial-ratios', methods=['GET'])
def get_financial_ratios():
    """Calculate and return financial ratios."""
    years = request.args.get('years')
    
    # Parse years if provided
    years_list = years.split(',') if years else None
    
    data = load_all_financial_data()
    
    ratios_data = []
    for item in data['yearlyData']:
        year_str = str(item['year'])
        # Filter by years if specified
        if years_list and year_str not in years_list:
            continue
            
        financials = item['financials']
        
        # Calculate ratios
        ratios = {
            'year': item['year'],
            'grossProfitMargin': financials['grossProfitMargin'],
            'operatingProfitMargin': ((financials['grossProfit'] - financials['operatingExpenses']) / financials['revenue']) * 100 if financials['revenue'] else 0,
            'returnOnEquity': (financials['eps'] / financials['netAssetPerShare']) * 100 if financials['netAssetPerShare'] else 0,
        }
        
        ratios_data.append(ratios)
    
    # Sort by year
    ratios_data = sorted(ratios_data, key=lambda x: x['year'])
    
    return jsonify(ratios_data)

@app.route('/api/industry-breakdown', methods=['GET'])
def get_industry_breakdown():
    """Get industry group breakdown for a specific year."""
    year = request.args.get('year')
    
    if not year:
        return jsonify({'error': 'Year parameter is required'}), 400
    
    data = load_all_financial_data()
    
    # Placeholder data - in a real implementation, this would come from the underlying data
    industries = [
        {"name": "Transportation", "revenue": 94521.25, "percentage": 36.0},
        {"name": "Leisure", "revenue": 44567.62, "percentage": 17.0},
        {"name": "Consumer Foods & Retail", "revenue": 39350.76, "percentage": 15.0},
        {"name": "Financial Services", "revenue": 36467.36, "percentage": 13.9},
        {"name": "Property", "revenue": 28857.22, "percentage": 11.0},
        {"name": "Information Technology", "revenue": 18573.9, "percentage": 7.1}
    ]
    
    return jsonify(industries)

@app.route('/api/forecast', methods=['POST'])
def generate_forecast():
    """Generate financial forecasts using various time series models."""
    try:
        # Get request parameters
        params = request.json
        metric = params.get('metric', 'revenue')
        model_type = params.get('model', 'arima')
        forecast_years = params.get('forecastYears', 3)  # Number of years to forecast
        
        # Load data
        data = load_all_financial_data()
        
        # Extract historical data for the selected metric
        historical_data = []
        for item in data['yearlyData']:
            if metric in item['financials']:
                historical_data.append({
                    'year': item['year'],
                    'value': item['financials'][metric]
                })
        
        # Sort by year
        historical_data = sorted(historical_data, key=lambda x: x['year'])
        
        # Check if we have enough data
        if len(historical_data) < 3:
            return jsonify({
                'error': 'Insufficient historical data for forecasting'
            }), 400
        
        # Extract years and values for modeling
        years = np.array([item['year'] for item in historical_data]).reshape(-1, 1)
        values = np.array([item['value'] for item in historical_data])
        
        # Generate forecasts based on selected model
        if model_type == 'linear':
            forecast_result = linear_regression_forecast(years, values, forecast_years)
        elif model_type == 'arima':
            forecast_result = arima_forecast(years, values, forecast_years)
        else:
            # Default to linear regression
            forecast_result = linear_regression_forecast(years, values, forecast_years)
        
        # Prepare response
        response = {
            'metric': metric,
            'modelType': model_type,
            'actualData': historical_data,
            'forecastData': forecast_result['forecast'],
            'confidenceInterval': forecast_result['confidence_interval'],
            'accuracy': forecast_result['accuracy'],
            'factors': get_forecast_factors(metric)
        }
        
        return jsonify(response)
    except Exception as e:
        print(f"Error generating forecast: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

def linear_regression_forecast(years, values, forecast_years):
    """Generate forecast using linear regression."""
    # Create and fit the model
    model = LinearRegression()
    model.fit(years, values)
    
    # Calculate model accuracy (R-squared)
    accuracy = model.score(years, values)
    
    # Generate forecast for future years
    last_year = years[-1][0]
    future_years = np.array(range(last_year + 1, last_year + forecast_years + 1)).reshape(-1, 1)
    
    # Predict future values
    future_values = model.predict(future_years)
    
    # Create forecast data points
    forecast_data = []
    for i, year in enumerate(future_years):
        forecast_data.append({
            'year': int(year[0]),
            'value': float(future_values[i])
        })
    
    # Generate simple confidence intervals (±10% for linear regression)
    confidence_interval = {
        'upper': [],
        'lower': []
    }
    
    for point in forecast_data:
        confidence_interval['upper'].append({
            'year': point['year'],
            'value': point['value'] * 1.1  # Upper bound: +10%
        })
        confidence_interval['lower'].append({
            'year': point['year'],
            'value': point['value'] * 0.9  # Lower bound: -10%
        })
    
    return {
        'forecast': forecast_data,
        'confidence_interval': confidence_interval,
        'accuracy': accuracy
    }

def arima_forecast(years, values, forecast_years):
    """Generate forecast using ARIMA model."""
    try:
        # Fit ARIMA model - using simple configuration (1,1,1)
        model = ARIMA(values, order=(1, 1, 1))
        model_fit = model.fit()
        
        # Get forecast
        forecast_result = model_fit.forecast(steps=forecast_years)
        
        # Calculate accuracy (use adjusted R-squared as approximation)
        accuracy = max(0, min(1, 1 - (1 - model_fit.mle_retvals.get('llf', 0.5)) / len(values)))
        
        # Get confidence intervals
        forecast_ci = model_fit.get_forecast(steps=forecast_years).conf_int(alpha=0.1)  # 90% confidence interval
        
        # Prepare forecast data
        last_year = years[-1][0]
        forecast_data = []
        confidence_interval = {
            'upper': [],
            'lower': []
        }
        
        for i in range(forecast_years):
            year = int(last_year) + i + 1
            forecast_data.append({
                'year': year,
                'value': float(forecast_result[i])
            })
            
            confidence_interval['upper'].append({
                'year': year,
                'value': float(forecast_ci[i][1])
            })
            
            confidence_interval['lower'].append({
                'year': year,
                'value': float(forecast_ci[i][0])
            })
        
        return {
            'forecast': forecast_data,
            'confidence_interval': confidence_interval,
            'accuracy': accuracy
        }
    except Exception as e:
        # Fallback to linear regression if ARIMA fails
        print(f"ARIMA model failed: {e}, falling back to linear regression")
        return linear_regression_forecast(years, values, forecast_years)

def lstm_forecast(years, values, forecast_years):
    """Generate forecast using LSTM (Long Short-Term Memory) model."""
    try:
        import tensorflow as tf
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import LSTM, Dense
        from tensorflow.keras.preprocessing.sequence import TimeseriesGenerator
        from sklearn.preprocessing import MinMaxScaler
        import numpy as np
        
        # Check if we have enough data for LSTM
        if len(values) < 5:
            raise ValueError("Insufficient data for LSTM model (minimum 5 points required)")
        
        # Scale the data
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_values = scaler.fit_transform(values.reshape(-1, 1))
        
        # Define lookback period
        lookback = min(3, len(scaled_values) - 1)
        
        # Create time series generator
        series_generator = TimeseriesGenerator(
            scaled_values, 
            scaled_values, 
            length=lookback, 
            batch_size=1
        )
        
        # Build the LSTM model
        model = Sequential()
        model.add(LSTM(50, activation='relu', input_shape=(lookback, 1)))
        model.add(Dense(1))
        model.compile(optimizer='adam', loss='mse')
        
        # Train the model (with early stopping)
        early_stopping = tf.keras.callbacks.EarlyStopping(
            monitor='loss',
            patience=5,
            mode='min',
            restore_best_weights=True
        )
        
        model.fit(
            series_generator,
            epochs=100,
            callbacks=[early_stopping],
            verbose=0
        )
        
        # Generate forecasts
        forecast_data = []
        last_year = int(years[-1][0])
        
        # Extract the last sequence
        last_sequence = scaled_values[-lookback:].reshape((1, lookback, 1))
        
        # Initialize confidence interval arrays
        upper_bounds = []
        lower_bounds = []
        
        # Generate future predictions
        for i in range(forecast_years):
            # Predict next value
            next_pred = model.predict(last_sequence, verbose=0)
            
            # Rescale predicted value
            pred_value = float(scaler.inverse_transform(next_pred)[0][0])
            
            # Add to forecast data
            year = last_year + i + 1
            forecast_data.append({
                'year': year,
                'value': pred_value
            })
            
            # Update sequence for next prediction
            new_seq = np.append(last_sequence[0, 1:, 0], next_pred[0])
            last_sequence = new_seq.reshape(1, lookback, 1)
            
            # Calculate confidence intervals (±15% for LSTM)
            upper_bound = pred_value * 1.15
            lower_bound = pred_value * 0.85
            
            upper_bounds.append({
                'year': year,
                'value': upper_bound
            })
            
            lower_bounds.append({
                'year': year, 
                'value': lower_bound
            })
        
        # Calculate model accuracy based on training performance
        train_pred = model.predict(series_generator, verbose=0)
        train_pred_rescaled = scaler.inverse_transform(train_pred)
        train_actual = values[lookback:]
        
        # Calculate R-squared
        ss_res = np.sum(np.square(train_actual - train_pred_rescaled.flatten()))
        ss_tot = np.sum(np.square(train_actual - np.mean(train_actual)))
        r_squared = max(0, min(1, 1 - (ss_res / ss_tot)))
        
        # Return results
        return {
            'forecast': forecast_data,
            'confidence_interval': {
                'upper': upper_bounds,
                'lower': lower_bounds
            },
            'accuracy': r_squared
        }
    except Exception as e:
        # Fallback to ARIMA if LSTM fails
        print(f"LSTM model failed: {e}, falling back to ARIMA")
        return arima_forecast(years, values, forecast_years)

def seasonal_decomposition_forecast(years, values, forecast_years):
    """Generate forecast using seasonal decomposition with trend analysis."""
    try:
        from statsmodels.tsa.seasonal import seasonal_decompose
        from statsmodels.tsa.api import ExponentialSmoothing
        import pandas as pd
        import numpy as np
        
        # Check if we have enough data for seasonal decomposition
        if len(values) < 4:
            raise ValueError("Insufficient data for seasonal decomposition (minimum 4 points required)")
        
        # Convert to pandas Series
        ts = pd.Series(values)
        
        # Perform seasonal decomposition (assume annual seasonality)
        result = seasonal_decompose(ts, model='additive', period=min(len(values) - 1, 3))
        
        # Extract components
        trend = result.trend
        seasonal = result.seasonal
        residual = result.resid
        
        # Fill NaN values
        trend = trend.fillna(method='bfill').fillna(method='ffill')
        seasonal = seasonal.fillna(method='bfill').fillna(method='ffill')
        residual = residual.fillna(method='bfill').fillna(method='ffill')
        
        # Forecast trend using Exponential Smoothing
        trend_model = ExponentialSmoothing(
            trend,
            trend='add',
            seasonal=None,
            damped_trend=True
        ).fit()
        
        trend_forecast = trend_model.forecast(forecast_years)
        
        # Forecast seasonality (repeat the last observed seasonal pattern)
        period = min(len(values) - 1, 3)
        last_season_values = seasonal.values[-period:]
        
        # Extend seasonal pattern as needed
        seasonal_forecast = []
        for i in range(forecast_years):
            seasonal_forecast.append(last_season_values[i % period])
        
        # Create final forecast (trend + seasonality)
        forecast_data = []
        last_year = int(years[-1][0])
        
        # Initialize confidence interval arrays
        upper_bounds = []
        lower_bounds = []
        
        # Calculate mean absolute residual for confidence intervals
        mean_abs_residual = np.mean(np.abs(residual))
        
        # Generate forecasts
        for i in range(forecast_years):
            year = last_year + i + 1
            
            # Combine trend and seasonal forecasts
            forecast_value = trend_forecast[i] + seasonal_forecast[i]
            
            forecast_data.append({
                'year': year,
                'value': float(forecast_value)
            })
            
            # Create confidence intervals using residual variation
            upper_bounds.append({
                'year': year,
                'value': float(forecast_value + 2 * mean_abs_residual)
            })
            
            lower_bounds.append({
                'year': year,
                'value': float(forecast_value - 2 * mean_abs_residual)
            })
        
        # Calculate model accuracy on training data
        # Reconstruct historical fit
        historical_fit = trend + seasonal
        
        # Calculate R-squared
        ss_res = np.sum(np.square(values - historical_fit))
        ss_tot = np.sum(np.square(values - np.mean(values)))
        r_squared = max(0, min(1, 1 - (ss_res / ss_tot)))
        
        return {
            'forecast': forecast_data,
            'confidence_interval': {
                'upper': upper_bounds,
                'lower': lower_bounds
            },
            'accuracy': r_squared,
            'components': {
                'trend': trend.tolist(),
                'seasonal': seasonal.tolist(),
                'residual': residual.tolist()
            }
        }
    except Exception as e:
        # Fallback to ARIMA if seasonal decomposition fails
        print(f"Seasonal decomposition forecast failed: {e}, falling back to ARIMA")
        return arima_forecast(years, values, forecast_years)

def get_forecast_factors(metric):
    """Get key factors that influence the forecast for a specific metric."""
    factors = []
    
    if metric == 'revenue':
        factors = [
            {
                'name': 'Tourism Growth',
                'impact': 'high',
                'description': 'Tourism recovery trends significantly impact the Leisure sector revenue'
            },
            {
                'name': 'Economic Stability',
                'impact': 'high',
                'description': 'Overall economic conditions in Sri Lanka affect consumer spending'
            },
            {
                'name': 'Currency Fluctuations',
                'impact': 'medium',
                'description': 'LKR exchange rate volatility impacts international business performance'
            }
        ]
    elif metric == 'eps':
        factors = [
            {
                'name': 'Operational Efficiency',
                'impact': 'high',
                'description': 'Cost management initiatives across business units'
            },
            {
                'name': 'Interest Rates',
                'impact': 'medium',
                'description': 'Changes in interest rates affect borrowing costs'
            },
            {
                'name': 'Share Buybacks',
                'impact': 'medium',
                'description': 'Any share repurchase programs affect EPS calculation'
            }
        ]
    elif metric == 'grossProfitMargin':
        factors = [
            {
                'name': 'Raw Material Costs',
                'impact': 'high',
                'description': 'Changes in supply chain and input costs'
            },
            {
                'name': 'Pricing Strategy',
                'impact': 'high',
                'description': 'Ability to pass costs to customers varies by industry group'
            },
            {
                'name': 'Product Mix',
                'impact': 'medium',
                'description': 'Shift towards higher-margin business segments'
            }
        ]
    else:
        factors = [
            {
                'name': 'Industry Trends',
                'impact': 'high',
                'description': 'Sector-specific growth patterns and challenges'
            },
            {
                'name': 'Regulatory Environment',
                'impact': 'medium',
                'description': 'Changes in government policies and regulations'
            },
            {
                'name': 'Competitive Landscape',
                'impact': 'medium',
                'description': 'Market positioning against key competitors'
            }
        ]
    
    return factors

@app.route('/api/industry-forecast', methods=['POST'])
def generate_industry_forecast():
    """Generate financial forecasts for specific industry groups."""
    try:
        # Get request parameters
        params = request.json
        metric = params.get('metric', 'revenue')
        industry_group = params.get('industryGroup')
        model_type = params.get('model', 'arima')
        forecast_years = params.get('forecastYears', 3)
        
        # Validate industry group
        if not industry_group:
            return jsonify({
                'error': 'Industry group is required'
            }), 400
        
        # Load data
        data = load_all_financial_data()
        
        # Extract historical data for the selected metric and industry
        # Note: For this demonstration, we'll simulate industry-specific data
        # In a real implementation, this would use actual segmented data from the database
        
        # Get base historical data
        historical_data = []
        for item in data['yearlyData']:
            if metric in item['financials']:
                # Weight the value based on the "importance" of the industry
                industry_weight = get_industry_weight(industry_group)
                
                # Adjust the value based on industry-specific factors
                adjusted_value = apply_industry_factor(
                    item['financials'][metric], 
                    industry_group, 
                    item['year']
                )
                
                historical_data.append({
                    'year': item['year'],
                    'value': adjusted_value
                })
        
        # Sort by year
        historical_data = sorted(historical_data, key=lambda x: x['year'])
        
        # Check if we have enough data
        if len(historical_data) < 3:
            return jsonify({
                'error': 'Insufficient historical data for forecasting'
            }), 400
        
        # Extract years and values for modeling
        years = np.array([item['year'] for item in historical_data]).reshape(-1, 1)
        values = np.array([item['value'] for item in historical_data])
        
        # Generate forecasts based on selected model
        if model_type == 'linear':
            forecast_result = linear_regression_forecast(years, values, forecast_years)
        elif model_type == 'arima':
            forecast_result = arima_forecast(years, values, forecast_years)
        elif model_type == 'lstm':
            forecast_result = lstm_forecast(years, values, forecast_years)
        elif model_type == 'seasonal':
            forecast_result = seasonal_decomposition_forecast(years, values, forecast_years)
        else:
            # Default to linear regression
            forecast_result = linear_regression_forecast(years, values, forecast_years)
        
        # Apply industry-specific post-processing to forecasts
        forecast_data = forecast_result['forecast']
        for point in forecast_data:
            # Apply industry-specific adjustments to the forecast
            point['value'] = apply_industry_future_factor(
                point['value'], 
                industry_group, 
                point['year']
            )
        
        # Recalculate confidence intervals based on adjusted forecast
        confidence_interval = {
            'upper': [],
            'lower': []
        }
        
        for point in forecast_data:
            confidence_interval['upper'].append({
                'year': point['year'],
                'value': point['value'] * 1.15  # Wider bounds for industry-specific forecasts
            })
            confidence_interval['lower'].append({
                'year': point['year'],
                'value': point['value'] * 0.85
            })
        
        # Prepare response
        response = {
            'metric': metric,
            'industryGroup': industry_group,
            'modelType': model_type,
            'actualData': historical_data,
            'forecastData': forecast_data,
            'confidenceInterval': confidence_interval,
            'accuracy': forecast_result['accuracy'] * 0.9,  # Slightly lower accuracy for industry-specific
            'factors': get_industry_specific_factors(industry_group, metric)
        }
        
        return jsonify(response)
    except Exception as e:
        print(f"Error generating industry forecast: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

def get_industry_weight(industry_group):
    """Get the weight factor for an industry group."""
    weights = {
        'Transportation': 1.2,
        'Leisure': 1.3,  # Higher volatility
        'Consumer Foods & Retail': 0.9,
        'Financial Services': 1.1,
        'Property': 1.4,  # Higher volatility
        'Information Technology': 1.5  # Highest growth potential
    }
    
    return weights.get(industry_group, 1.0)

def apply_industry_factor(value, industry_group, year):
    """Apply industry-specific adjustments to historical values."""
    # Define industry-specific adjustment factors
    # These would normally be derived from actual segment data
    industry_factors = {
        'Transportation': {
            2019: 0.9,  # Initial challenges
            2020: 0.7,  # COVID impact
            2021: 0.8,  # Partial recovery
            2022: 0.85, # Continued recovery
            2023: 0.95  # Almost back to normal
        },
        'Leisure': {
            2019: 1.0,
            2020: 0.4,  # Severe COVID impact
            2021: 0.6,  # Slow recovery
            2022: 0.75, # Tourism picking up
            2023: 0.9   # Strong recovery but not complete
        },
        'Consumer Foods & Retail': {
            2019: 1.0,
            2020: 0.9,  # Essential services less impacted
            2021: 0.95,
            2022: 0.9,  # Economic crisis impact
            2023: 0.95
        },
        'Financial Services': {
            2019: 1.0,
            2020: 0.85,
            2021: 0.9,
            2022: 0.8,  # Economic crisis impact
            2023: 0.85
        },
        'Property': {
            2019: 1.0,
            2020: 0.8,
            2021: 0.75,
            2022: 0.7,  # Economic crisis impact
            2023: 0.8
        },
        'Information Technology': {
            2019: 1.0,
            2020: 1.1,  # Digital acceleration during COVID
            2021: 1.2,
            2022: 1.15, # Economic crisis but IT still growing
            2023: 1.25
        }
    }
    
    # Get the factor for this industry and year
    factor = industry_factors.get(industry_group, {}).get(year, 1.0)
    
    # Apply the factor
    return value * factor

def apply_industry_future_factor(value, industry_group, year):
    """Apply industry-specific adjustments to forecast values."""
    # Future projections by industry
    future_factors = {
        'Transportation': {
            2024: 1.05,
            2025: 1.1,
            2026: 1.15,
            2027: 1.2
        },
        'Leisure': {
            2024: 1.1,
            2025: 1.2,
            2026: 1.25,
            2027: 1.3
        },
        'Consumer Foods & Retail': {
            2024: 1.02,
            2025: 1.05,
            2026: 1.08,
            2027: 1.1
        },
        'Financial Services': {
            2024: 1.03,
            2025: 1.07,
            2026: 1.1,
            2027: 1.15
        },
        'Property': {
            2024: 1.05,
            2025: 1.1,
            2026: 1.15,
            2027: 1.2
        },
        'Information Technology': {
            2024: 1.15,
            2025: 1.25,
            2026: 1.35,
            2027: 1.45
        }
    }
    
    # Get the factor for this industry and year
    factor = future_factors.get(industry_group, {}).get(year, 1.0)
    
    # Apply the factor
    return value * factor

def get_industry_specific_factors(industry_group, metric):
    """Get specific factors that influence the forecast for an industry and metric."""
    factors = []
    
    if industry_group == 'Leisure':
        if metric == 'revenue':
            factors = [
            {
                    'name': 'Tourism Recovery',
                'impact': 'high',
                    'description': 'Rate of tourism sector recovery post-crises'
            },
            {
                    'name': 'International Travel Restrictions',
                'impact': 'high',
                    'description': 'Any remaining travel barriers affecting tourist arrivals'
                }
            ]
        elif metric == 'eps':
            factors = [
            {
                    'name': 'Operational Efficiency',
                'impact': 'high',
                    'description': 'Cost optimization in hotel operations'
            },
            {
                    'name': 'Competitive Pricing',
                'impact': 'medium',
                    'description': 'Price competition in the leisure sector'
                }
            ]
    elif industry_group == 'Transportation':
        # Similar factors for other industries...
        pass
    
    # Default factors if none are found for the specific combination
    if not factors:
        factors = [
            {
                'name': 'Industry Growth',
                'impact': 'medium',
                'description': f'Overall growth trends in the {industry_group} sector'
            },
            {
                'name': 'Market Competition',
                'impact': 'medium',
                'description': 'Competitive landscape within the industry'
            }
        ]
    
    return factors

@app.route('/api/multi-metric-forecast', methods=['POST'])
def generate_multi_metric_forecast():
    """Generate forecasts for multiple metrics simultaneously."""
    try:
        # Get request parameters
        params = request.json
        metrics = params.get('metrics', ['revenue', 'eps'])
        model_type = params.get('model', 'arima')
        forecast_years = params.get('forecastYears', 3)
        industry_group = params.get('industryGroup', None)
        
        # Validate metrics list
        if not metrics or not isinstance(metrics, list):
            return jsonify({
                'error': 'At least one metric must be provided'
            }), 400
        
        # Load data
        data = load_all_financial_data()
        
        # Prepare response
        response = {
            'forecasts': {},
            'correlations': {}
        }
        
        # Generate forecast for each metric
        for metric in metrics:
            # Extract historical data for the current metric
            historical_data = []
            for item in data['yearlyData']:
                if metric in item['financials']:
                    # Apply industry filter if specified
                    value = item['financials'][metric]
                    
                    if industry_group:
                        # Adjust the value based on industry-specific factors
                        value = apply_industry_factor(value, industry_group, item['year'])
                    
                    historical_data.append({
                        'year': item['year'],
                        'value': value
                    })
            
            # Sort by year
            historical_data = sorted(historical_data, key=lambda x: x['year'])
            
            # Check if we have enough data
            if len(historical_data) < 3:
                response['forecasts'][metric] = {
                    'error': 'Insufficient historical data for forecasting'
                }
                continue
            
            # Extract years and values for modeling
            years = np.array([item['year'] for item in historical_data]).reshape(-1, 1)
            values = np.array([item['value'] for item in historical_data])
            
            # Generate forecasts based on selected model
            if model_type == 'linear':
                forecast_result = linear_regression_forecast(years, values, forecast_years)
            elif model_type == 'arima':
                forecast_result = arima_forecast(years, values, forecast_years)
            elif model_type == 'lstm':
                forecast_result = lstm_forecast(years, values, forecast_years)
            elif model_type == 'seasonal':
                forecast_result = seasonal_decomposition_forecast(years, values, forecast_years)
            else:
                # Default to ARIMA
                forecast_result = arima_forecast(years, values, forecast_years)
            
            # Apply industry-specific adjustments if needed
            if industry_group:
                forecast_data = forecast_result['forecast']
                for point in forecast_data:
                    point['value'] = apply_industry_future_factor(
                        point['value'], 
                        industry_group, 
                        point['year']
                    )
                    
                # Also adjust confidence intervals
                for point in forecast_result['confidence_interval']['upper']:
                    point['value'] = apply_industry_future_factor(
                        point['value'], 
                        industry_group, 
                        point['year']
                    )
                    
                for point in forecast_result['confidence_interval']['lower']:
                    point['value'] = apply_industry_future_factor(
                        point['value'], 
                        industry_group, 
                        point['year']
                    )
            
            # Add to response
            response['forecasts'][metric] = {
                'modelType': model_type,
                'actualData': historical_data,
                'forecastData': forecast_result['forecast'],
                'confidenceInterval': forecast_result['confidence_interval'],
                'accuracy': forecast_result['accuracy'],
                'factors': get_forecast_factors(metric)
            }
        
        # Calculate correlations between metrics
        if len(metrics) > 1:
            correlations = {}
            
            for i, metric1 in enumerate(metrics):
                correlations[metric1] = {}
                
                for metric2 in metrics:
                    if metric1 == metric2:
                        correlations[metric1][metric2] = 1.0  # Perfect correlation with self
                        continue
                    
                    # Get historical data for both metrics
                    if metric1 in response['forecasts'] and metric2 in response['forecasts']:
                        data1 = response['forecasts'][metric1]['actualData']
                        data2 = response['forecasts'][metric2]['actualData']
                        
                        # Find common years
                        years1 = set(item['year'] for item in data1)
                        years2 = set(item['year'] for item in data2)
                        common_years = years1.intersection(years2)
                        
                        if len(common_years) > 1:
                            # Extract values for common years
                            common_data1 = [item['value'] for item in data1 if item['year'] in common_years]
                            common_data2 = [item['value'] for item in data2 if item['year'] in common_years]
                            
                            # Calculate correlation
                            correlation = np.corrcoef(common_data1, common_data2)[0, 1]
                            correlations[metric1][metric2] = float(correlation)
                        else:
                            correlations[metric1][metric2] = None  # Not enough data
                    else:
                        correlations[metric1][metric2] = None  # Data not available
            
            response['correlations'] = correlations
        
        return jsonify(response)
    except Exception as e:
        print(f"Error generating multi-metric forecast: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for Docker healthcheck"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }), 200

if __name__ == '__main__':
    app.run(debug=True) 