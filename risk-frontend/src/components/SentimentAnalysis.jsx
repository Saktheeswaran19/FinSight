import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
import { apiService } from '../services/api';
import { formatPercentage, formatCurrency } from '../utils/riskUtils';

const SentimentAnalysis = ({ ticker }) => {
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ticker) {
      loadSentimentData();
    }
  }, [ticker]);

  const loadSentimentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSentiment(ticker);
      setSentimentData(data);
    } catch (err) {
      setError(err.message || 'Failed to load sentiment data');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (score) => {
    if (score > 0) return 'text-green-600 dark:text-green-400';
    if (score === 0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getSentimentLabel = (score) => {
    if (score > 0) return 'Bullish';
    if (score === 0) return 'Neutral';
    return 'Bearish';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Analyzing sentiment...</span>
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
          <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sentiment Analysis Error</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{errorMessage}</p>
          {errorSuggestion && (
            <p className="text-gray-500 dark:text-gray-400 mb-2">Suggestion: {errorSuggestion}</p>
          )}
          <button 
            onClick={loadSentimentData}
            className="btn-primary dark:bg-primary-600 dark:hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!sentimentData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sentiment Analysis</h3>
          <p className="text-gray-600 dark:text-gray-400">Select an asset to analyze market sentiment</p>
        </div>
      </div>
    );
  }

  const { current_price, moving_averages, technical_indicators, volatility_trend, signals, sentiment_score } = sentimentData;

  return (
    <div className="space-y-6">
      {/* Overall Sentiment */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overall Sentiment</h3>
        <div className="text-center">
          <div className={`text-4xl font-bold mb-2 ${getSentimentColor(sentiment_score)}`}>
            {getSentimentLabel(sentiment_score)}
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Current Price: {formatCurrency(current_price)}
          </div>
        </div>
      </div>

      {/* Technical Indicators */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Technical Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {technical_indicators.rsi.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">RSI</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {(technical_indicators.momentum_5d * 100).toFixed(2)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">5D Momentum</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {(technical_indicators.momentum_20d * 100).toFixed(2)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">20D Momentum</div>
          </div>
        </div>
      </div>

      {/* Moving Averages */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Moving Averages</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">20-Day MA</span>
            <span className="text-gray-900 dark:text-white font-semibold">{formatCurrency(moving_averages.ma_20)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">50-Day MA</span>
            <span className="text-gray-900 dark:text-white font-semibold">{formatCurrency(moving_averages.ma_50)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Volatility Trend</span>
            <span className="text-gray-900 dark:text-white font-semibold capitalize">{volatility_trend}</span>
          </div>
        </div>
      </div>

      {/* Signals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Market Signals</h3>
        <div className="space-y-3">
          {signals.map((signal, index) => (
            <div key={index} className="flex items-center space-x-3">
              {signal.includes('bullish') ? (
                <TrendingUp className="w-5 h-5 text-green-500 dark:text-green-400" />
              ) : signal.includes('bearish') ? (
                <TrendingDown className="w-5 h-5 text-red-500 dark:text-red-400" />
              ) : (
                <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {signal.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
          {signals.length === 0 && (
            <div className="text-center text-gray-600 dark:text-gray-400">
              No significant signals detected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysis; 