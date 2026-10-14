import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const RiskAlerts = ({ alerts, onAssetClick }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="card bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Alerts</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">No high-risk assets detected</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Alerts</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{alerts.length} high-risk assets detected</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {alerts.map((asset, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            onClick={() => onAssetClick && onAssetClick(asset)}
          >
            <div className="flex items-center space-x-3">
              <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="font-medium text-red-900 dark:text-red-200">{asset}</span>
            </div>
            <span className="risk-indicator risk-high dark:text-red-200 dark:bg-red-900/50">High Risk</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskAlerts; 