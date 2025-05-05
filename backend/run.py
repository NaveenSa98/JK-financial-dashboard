#!/usr/bin/env python
"""
Run script for the JK Financial Dashboard backend API.
This script starts the Flask server to serve the financial data API.
"""

from app import app

if __name__ == "__main__":
    print("Starting JK Financial Dashboard API server...")
    app.run(host="0.0.0.0", port=5000, debug=True) 