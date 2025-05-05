#!/usr/bin/env python
"""
Test runner for JK Financial Dashboard backend tests.
This script discovers and runs all tests in the 'tests' directory.
"""

import unittest
import os
import sys

def run_tests():
    """Discover and run all tests."""
    # Get the directory containing this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Set up the test loader
    loader = unittest.TestLoader()
    
    # Discover test modules in the 'tests' directory
    test_dir = os.path.join(script_dir, 'tests')
    suite = loader.discover(test_dir)
    
    # Create a test runner
    runner = unittest.TextTestRunner(verbosity=2)
    
    # Run the tests
    result = runner.run(suite)
    
    # Return appropriate exit code
    return 0 if result.wasSuccessful() else 1

if __name__ == "__main__":
    sys.exit(run_tests()) 