import React from 'react';
import { formatPercentage, formatNumber, getChangeColor, getChangeIcon } from '../utils/riskUtils';

const MetricCard = ({ title, value, change, format = 'number', subtitle, icon: Icon, className = '' }) => {
  const formatValue = (val) => {
    if (format === 'percentage') return formatPercentage(val);
    if (format === 'currency') return `$${formatNumber(val)}`;
    return formatNumber(val);
  };

  return (
    <div className={`metric-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatValue(value)}
              </p>
              {change !== undefined && (
                <span className={`text-sm font-medium ${getChangeColor(change)} dark:opacity-90`}>
                  {getChangeIcon(change)} {Math.abs(change).toFixed(2)}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard; 