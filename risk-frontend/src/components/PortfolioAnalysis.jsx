import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { apiService } from '../services/api';
import { formatPercentage, formatNumber } from '../utils/riskUtils';

const PortfolioAnalysis = ({ selectedAssets, weights, onAssetChange }) => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedAssets && selectedAssets.length >= 2) {
      loadPortfolioData();
    }
  }, [selectedAssets, weights]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getPortfolioAnalysis(selectedAssets, weights);
      setPortfolioData(data);
    } catch (err) {
      setError(err.message || 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const getCorrelationColor = (value) => {
    if (value >= 0.7) return 'text-red-600 dark:text-red-400';
    if (value >= 0.3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getCorrelationStrength = (value) => {
    if (value >= 0.7) return 'High';
    if (value >= 0.3) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Analyzing portfolio...</span>
        </div>
      </div>
    );
  }

  if (error) {
    // Support for new backend error format
    let errorMessage = 'An error occurred.';
    let errorSuggestion = '';
    if (typeof error === 'object' && error !== null && error.error) {
      errorMessage = error.error.message || errorMessage;
      errorSuggestion = error.error.suggestion || '';
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Portfolio Analysis Error</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{errorMessage}</p>
          {errorSuggestion && (
            <p className="text-gray-500 dark:text-gray-400 mb-2">Suggestion: {errorSuggestion}</p>
          )}
          <button 
            onClick={loadPortfolioData}
            className="btn-primary dark:bg-primary-600 dark:hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!portfolioData || !portfolioData.portfolio_metrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Portfolio Analysis</h3>
          <p className="text-gray-600 dark:text-gray-400">Select at least 2 assets to analyze portfolio performance</p>
        </div>
      </div>
    );
  }

  const { portfolio_metrics, correlation_matrix, assets, data_points, weights: usedWeights } = portfolioData;

  return (
    <div className="space-y-6">
      {/* Weights Summary */}
      {usedWeights && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Weights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset) => (
              <div key={asset} className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white">{asset}</span>
                <span className="text-gray-700 dark:text-gray-300 font-mono">{((usedWeights[asset] || 0) * 100).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Portfolio Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatPercentage(portfolio_metrics.volatility)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Volatility</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatNumber(portfolio_metrics.sharpe_ratio)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sharpe Ratio</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {formatPercentage(portfolio_metrics.var_99)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">VaR (99%)</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatPercentage(portfolio_metrics.annual_return)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Annual Return</div>
          </div>
        </div>
      </div>

      {/* Correlation Matrix */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Correlation Matrix</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Asset</th>
                {assets.map((asset) => (
                  <th key={asset} className="px-4 py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {asset}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map((asset1) => (
                <tr key={asset1}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white border-b dark:border-gray-700">
                    {asset1}
                  </td>
                  {assets.map((asset2) => {
                    const correlation = correlation_matrix[asset1]?.[asset2] || 0;
                    return (
                      <td key={asset2} className="px-4 py-2 text-center border-b dark:border-gray-700">
                        <div className={`text-sm font-medium ${getCorrelationColor(correlation)}`}>
                          {formatNumber(correlation)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {getCorrelationStrength(correlation)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>Data points: {data_points} | Assets: {assets.join(', ')}</p>
        </div>
      </div>

      {/* Portfolio Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Insights</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-green-500 dark:text-green-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Portfolio Sharpe Ratio: {formatNumber(portfolio_metrics.sharpe_ratio)} 
              {portfolio_metrics.sharpe_ratio > 1 ? ' (Excellent)' : portfolio_metrics.sharpe_ratio > 0.5 ? ' (Good)' : ' (Poor)'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Annualized Volatility: {formatPercentage(portfolio_metrics.volatility)}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <TrendingDown className="w-5 h-5 text-red-500 dark:text-red-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Value at Risk (99%): {formatPercentage(portfolio_metrics.var_99)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAnalysis; 