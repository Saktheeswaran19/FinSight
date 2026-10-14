import React, { useState } from 'react';
import SentimentAnalysis from '../components/SentimentAnalysis';
import { apiService } from '../services/api';

const SentimentPage = () => {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState('');

  React.useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await apiService.getAssets();
        setAssets(data);
        if (data.length > 0) setSelectedAsset(data[0]);
      } catch (err) {
        setAssets([]);
      }
    };
    fetchAssets();
  }, []);

  const handleAssetChange = (e) => {
    setSelectedAsset(e.target.value);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Market Sentiment Analysis</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">Select an asset to view technical indicators and sentiment signals.</p>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Asset
        </label>
        <select
          value={selectedAsset}
          onChange={handleAssetChange}
          className="block w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {assets.map((asset) => (
            <option key={asset} value={asset} className="dark:bg-gray-700">
              {asset}
            </option>
          ))}
        </select>
      </div>
      <SentimentAnalysis ticker={selectedAsset} />
    </div>
  );
};

export default SentimentPage; 