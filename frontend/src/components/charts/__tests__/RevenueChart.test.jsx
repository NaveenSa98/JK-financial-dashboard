import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RevenueChart from '../RevenueChart';
import { fetchRevenueData } from '../../../api/apiService';

// Mock the API service
jest.mock('../../../api/apiService');

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-revenue-chart">MockRevenueChart</div>
}));

describe('RevenueChart Component', () => {
  const mockRevenueData = [
    { year: 2019, revenue: 100000, currency: 'LKR' },
    { year: 2020, revenue: 90000, currency: 'LKR' },
    { year: 2021, revenue: 120000, currency: 'LKR' },
    { year: 2022, revenue: 150000, currency: 'LKR' },
    { year: 2023, revenue: 180000, currency: 'LKR' },
  ];

  beforeEach(() => {
    // Reset mocks
    fetchRevenueData.mockReset();
  });

  test('renders loading state initially', () => {
    // Mock the API to delay response
    fetchRevenueData.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve(mockRevenueData), 100);
    }));

    render(<RevenueChart />);
    
    // Should show loading state
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  test('renders chart when data is loaded', async () => {
    // Mock API response
    fetchRevenueData.mockResolvedValue(mockRevenueData);

    render(<RevenueChart />);
    
    // Wait for chart to appear
    await waitFor(() => {
      expect(screen.getByTestId('mock-revenue-chart')).toBeInTheDocument();
    });
    
    // Loading indicator should be gone
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
  });
  
  test('applies year filter when specified', async () => {
    // Mock API response
    fetchRevenueData.mockResolvedValue(mockRevenueData);

    // Render with year filter
    render(<RevenueChart years="2021,2022,2023" />);
    
    // Check that the API was called with the correct filter
    expect(fetchRevenueData).toHaveBeenCalledWith({ years: '2021,2022,2023' });
    
    // Wait for chart to appear
    await waitFor(() => {
      expect(screen.getByTestId('mock-revenue-chart')).toBeInTheDocument();
    });
  });
  
  test('applies industry group filter when specified', async () => {
    // Mock API response
    fetchRevenueData.mockResolvedValue(mockRevenueData);

    // Render with industry group filter
    render(<RevenueChart industryGroups="Leisure,Transportation" />);
    
    // Check that the API was called with the correct filter
    expect(fetchRevenueData).toHaveBeenCalledWith({ industryGroups: 'Leisure,Transportation' });
    
    // Wait for chart to appear
    await waitFor(() => {
      expect(screen.getByTestId('mock-revenue-chart')).toBeInTheDocument();
    });
  });
  
  test('shows error message on API failure', async () => {
    // Mock API error
    fetchRevenueData.mockRejectedValue(new Error('API error'));

    render(<RevenueChart />);
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
    
    // Loading indicator should be gone
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
  });

  test('displays correct chart title', async () => {
    // Mock API response
    fetchRevenueData.mockResolvedValue(mockRevenueData);

    render(<RevenueChart title="Custom Revenue Chart Title" />);
    
    // Wait for chart to appear
    await waitFor(() => {
      expect(screen.getByTestId('mock-revenue-chart')).toBeInTheDocument();
    });
    
    // Check title
    expect(screen.getByText('Custom Revenue Chart Title')).toBeInTheDocument();
  });
}); 