import React, { useState } from 'react';
import PortfolioAnalysis from '../components/PortfolioAnalysis';
import { apiService } from '../services/api';

const PortfolioPage = () => {
  const [assets, setAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [weights, setWeights] = useState({});

  React.useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await apiService.getAssets();
        setAssets(data);
      } catch (err) {
        setAssets([]);
      }
    };
    fetchAssets();
  }, []);

  const handleAssetChange = (e) => {
    const { options } = e.target;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedAssets(selected);
    // Remove weights for unselected assets
    setWeights((prev) => {
      const newWeights = { ...prev };
      Object.keys(newWeights).forEach((k) => {
        if (!selected.includes(k)) delete newWeights[k];
      });
      return newWeights;
    });
  };

  const handleWeightChange = (asset, value) => {
    setWeights((prev) => ({ ...prev, [asset]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Portfolio Analysis</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">Select two or more assets to analyze portfolio risk, return, and correlations.</p>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Assets (Ctrl+Click for multiple)
        </label>
        <select
          multiple
          value={selectedAssets}
          onChange={handleAssetChange}
          className="block w-full max-w-lg px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          size={Math.min(assets.length, 6)}
        >
          {assets.map((asset) => (
            <option key={asset} value={asset} className="dark:bg-gray-700">
              {asset}
            </option>
          ))}
        </select>
      </div>
      {/* Custom Weights Inputs */}
      {selectedAssets.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Set Custom Weights (sum should be 1.0 or 100%)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedAssets.map((asset) => (
              <div key={asset} className="flex items-center">
                <span className="text-gray-900 dark:text-white w-24">{asset}</span>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={weights[asset] || ''}
                  onChange={e => handleWeightChange(asset, e.target.value)}
                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ml-4"
                  placeholder="Weight"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      <PortfolioAnalysis selectedAssets={selectedAssets} weights={weights} />
    </div>
  );
};

export default PortfolioPage; 