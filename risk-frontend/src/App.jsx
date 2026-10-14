import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import PortfolioPage from './pages/PortfolioPage';
import SentimentPage from './pages/SentimentPage';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/sentiment" element={<SentimentPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
