import { Routes, Route } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import { useEffect } from 'react';
import Layout from './components/common/Layout';
import './App.css';

// Import pages
import Home from './pages/Home';
import Visualizations from './pages/Visualizations';
import Forecasting from './pages/Forecasting';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';

function App() {
  const { darkMode } = useTheme();

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/visualizations" element={<Visualizations />} />
          <Route path="/forecasting" element={<Forecasting />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;