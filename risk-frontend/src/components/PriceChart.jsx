import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatCurrency } from '../utils/riskUtils';
import { useTheme } from '../context/ThemeContext';

const PriceChart = ({ data, comparisonData, title, height = 300 }) => {
  const { isDarkMode } = useTheme();
  
  // Combine main data with comparison data
  const combinedData = useMemo(() => {
    if (!comparisonData || comparisonData.length === 0) {
      console.log('No comparison data available');
      return data;
    }
    
    console.log('Combining data:', { 
      mainDataLength: data.length, 
      comparisonDataLength: comparisonData.length,
      mainDataSample: data.slice(0, 2),
      comparisonDataSample: comparisonData.slice(0, 2)
    });
    
    // Create a map of comparison dates to prices for quick lookup
    const comparisonMap = new Map();
    comparisonData.forEach(item => {
      comparisonMap.set(item.date, item.comparison);
    });
    
    // Add comparison prices to main data where dates match
    const result = data.map(item => {
      const comparisonPrice = comparisonMap.get(item.date);
      return comparisonPrice !== undefined
        ? { ...item, comparison: comparisonPrice }
        : item;
    });
    
    // Check if we found any matches
    const matchCount = result.filter(item => item.comparison !== undefined).length;
    console.log(`Found ${matchCount} matching dates between main and comparison data`);
    
    // If no matches were found, add comparison data directly
    if (matchCount === 0 && comparisonData.length > 0) {
      console.log('No matching dates found, adding comparison data directly');
      return [...data, ...comparisonData];
    }
    
    return result;
  }, [data, comparisonData]);

  const formatTooltip = (value, name) => {
    if (name === 'price') return [formatCurrency(value), 'Price'];
    if (name === 'predicted') return [formatCurrency(value), 'Predicted'];
    if (name === 'comparison') return [formatCurrency(value), 'Comparison'];
    return [value, name];
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-3 border rounded-lg shadow-lg`}>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={combinedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#f0f0f0'} />
          <XAxis 
            dataKey="date" 
            stroke={isDarkMode ? '#9CA3AF' : '#6b7280'}
            fontSize={12}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis 
            stroke={isDarkMode ? '#9CA3AF' : '#6b7280'}
            fontSize={12}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: isDarkMode ? '#fff' : '#000' }} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2 }}
          />
          {combinedData.some(item => item.predicted) && (
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4, stroke: '#ef4444', strokeWidth: 2 }}
            />
          )}
          {combinedData.some(item => item.comparison !== undefined) && (
            <Line
              type="monotone"
              dataKey="comparison"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 2 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;