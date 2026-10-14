# Risk Dashboard Frontend

A modern, responsive React-based frontend for the Risk Dashboard with Predictive Analysis project. This application provides real-time risk assessment, predictive analytics, and interactive data visualization for financial assets.

## Features

### 📊 Risk Metrics Dashboard
- **Volatility Analysis**: Real-time volatility calculations with risk level indicators
- **Value at Risk (VaR)**: 99% confidence interval risk assessment (Indian market standard)
- **Sharpe Ratio**: Risk-adjusted return metrics
- **Maximum Drawdown**: Historical decline analysis

### 🔮 Predictive Analytics
- **ARIMA Forecasting**: Advanced time series predictions
- **Moving Average Fallback**: Reliable prediction methods
- **7-Day Forecasts**: Short-term price predictions
- **Method Indicators**: Clear display of prediction algorithms used

### 🚨 Risk Alerts
- **High-Risk Asset Detection**: Automatic identification of volatile assets
- **Real-time Monitoring**: Continuous risk assessment
- **Interactive Alerts**: Click to view detailed asset analysis

### 📈 Data Visualization
- **Interactive Price Charts**: Historical price data with Recharts
- **Responsive Design**: Optimized for all screen sizes
- **Real-time Updates**: Live data refresh every 15 minutes
- **Multi-Asset Support**: Switch between different financial instruments

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## API Integration

The frontend integrates with the following backend endpoints:

- `GET /api/assets` - Retrieve available stock tickers
- `GET /api/metrics?ticker={symbol}` - Get risk metrics for specific asset
- `GET /api/history?ticker={symbol}` - Retrieve historical price data
- `GET /api/risk_alerts?threshold={value}` - Get high-risk assets
- `POST /api/predict` - Generate price predictions
- `GET /api/test?ticker={symbol}` - Test API connection

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:8000`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd risk-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.jsx    # Main dashboard component
│   ├── MetricCard.jsx   # Reusable metric display
│   ├── PriceChart.jsx   # Chart visualization
│   ├── RiskAlerts.jsx   # Risk alert component
│   └── Navigation.jsx   # Navigation bar
├── services/            # API services
│   └── api.js          # Backend communication
├── utils/              # Utility functions
│   └── riskUtils.js    # Risk assessment helpers
├── App.jsx             # Main app component
├── main.jsx            # App entry point
└── index.css           # Global styles
```

## Configuration

### API Base URL

The API base URL is configured in `src/services/api.js`. Update the `API_BASE_URL` constant if your backend runs on a different port or host.

### Environment Variables

Create a `.env` file in the root directory for environment-specific configurations:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Features in Detail

### Risk Level Assessment

The dashboard automatically categorizes assets into three risk levels:
- **Low Risk** (Green): Volatility < 2%
- **Medium Risk** (Yellow): Volatility 2-4%
- **High Risk** (Red): Volatility > 4%

### Real-time Data Updates

- Background scheduler updates cache every 15 minutes
- On-demand data fetching for new assets
- Automatic error handling and retry mechanisms

### Responsive Design

- Mobile-first approach
- Grid-based layouts that adapt to screen size
- Touch-friendly interactive elements
- Optimized for desktop, tablet, and mobile devices

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the repository or contact the development team.
