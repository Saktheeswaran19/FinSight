// Risk assessment utilities
export const getRiskLevel = (volatility) => {
  if (volatility < 0.02) return { level: 'low', color: 'risk-low', label: 'Low Risk' };
  if (volatility < 0.04) return { level: 'medium', color: 'risk-medium', label: 'Medium Risk' };
  return { level: 'high', color: 'risk-high', label: 'High Risk' };
};

export const formatPercentage = (value) => {
  return `${(value * 100).toFixed(2)}%`;
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value, decimals = 2) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const calculateChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const getChangeColor = (change) => {
  if (change > 0) return 'text-green-600';
  if (change < 0) return 'text-red-600';
  return 'text-gray-600';
};

export const getChangeIcon = (change) => {
  if (change > 0) return '↗';
  if (change < 0) return '↘';
  return '→';
};

// Chart data formatting
export const formatChartData = (history, dates) => {
  if (!history || !dates || history.length !== dates.length) {
    return [];
  }
  
  return history.map((price, index) => ({
    date: dates[index],
    price: parseFloat(price),
  }));
};

// Prediction data formatting
export const formatPredictionData = (historicalData, predictions, dates) => {
  const historical = formatChartData(historicalData, dates);
  
  // Generate future dates for predictions
  const lastDate = new Date(dates[dates.length - 1]);
  const futureDates = predictions.map((_, index) => {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + index + 1);
    return date.toISOString().split('T')[0];
  });
  
  const predictionData = predictions.map((price, index) => ({
    date: futureDates[index],
    price: parseFloat(price),
    predicted: true,
  }));
  
  return [...historical, ...predictionData];
}; 