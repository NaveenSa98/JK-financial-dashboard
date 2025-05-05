// Import Jest DOM extensions
import '@testing-library/jest-dom';

// Mock the environment variables
window.ENV = {
  VITE_API_URL: 'http://localhost:5000/api'
};

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {
    return null;
  }
  
  unobserve() {
    return null;
  }
  
  disconnect() {
    return null;
  }
}

window.IntersectionObserver = MockIntersectionObserver;

// Mock Chart.js to avoid canvas issues
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  registerables: [],
}));

// Mock import.meta.env
import.meta = { 
  env: { 
    VITE_API_URL: 'http://localhost:5000/api',
    MODE: 'test'
  } 
}; 