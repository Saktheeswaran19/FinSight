
# Risk Dashboard Backend

A comprehensive real-time risk assessment and predictive analytics backend for financial assets, built with FastAPI and Python. The backend provides advanced risk metrics, portfolio analysis, market sentiment analysis, and machine learning-powered price predictions.

## 🚀 Features

### 📦 Modular Structure (NEW)
- Endpoints are organized in `routes/` (metrics, portfolio, sentiment)
- Shared cache and scheduler logic in `utils/cache.py`
- Easier to maintain, extend, and test

### 📊 Real-Time Risk Metrics
- **Volatility Analysis**: Annualized volatility calculations
- **Value at Risk (VaR)**: 99% confidence level VaR calculations (Indian market standard)
- **Sharpe Ratio**: Risk-adjusted return metrics
- **Sortino Ratio**: Downside deviation-based risk metrics
- **Maximum Drawdown**: Historical worst-case scenario analysis
- **Calmar Ratio**: Annual return to maximum drawdown ratio
- **Consecutive Losses**: Maximum consecutive losing periods

### 🤖 Machine Learning Predictions
- **ARIMA Model**: Customizable time series forecasting
- **Price Predictions**: Multi-day price forecasts with confidence intervals
- **Trend Analysis**: Historical pattern recognition

### 📈 Portfolio Analysis
- **Multi-Asset Analysis**: Correlation matrices for portfolio optimization
- **Custom Weights**: User-defined asset weights for portfolio risk/return (NEW)
- **Risk Decomposition**: Individual asset contribution to portfolio risk
- **Diversification Metrics**: Portfolio concentration analysis

### 📰 Market Sentiment Analysis
- **Technical Indicators**: RSI, Moving Averages, Momentum
- **Trend Signals**: Bullish/Bearish market sentiment
- **Volatility Regimes**: Market condition classification

### ⚡ Real-Time Data & Caching
- **Yahoo Finance Integration**: Live market data fetching
- **Intelligent Caching**: 2-minute data refresh intervals (faster!)
- **Persistent Cache**: Data survives restarts via `cache.json` (NEW)
- **Background Scheduler**: Automated data updates with APScheduler

### 🖥️ Frontend Improvements (NEW)
- **Time Frame Selection**: 1M, 3M, 6M zoom for price chart
- **Improved Error Handling**: User-friendly error messages and suggestions
- **Custom Portfolio Weights**: UI for setting asset weights
- **Modular, maintainable codebase**

## 🛠️ Technology Stack

- **Framework**: FastAPI (Python)
- **Data Source**: Yahoo Finance API
- **Machine Learning**: StatsModels (ARIMA), Scikit-learn
- **Data Processing**: Pandas, NumPy
- **Scheduling**: APScheduler
- **Configuration**: Python-dotenv

## 🚀 Quick Start

### 1. Setup Environment
```bash
python -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 2. Configure Environment
Create `.env` file:
```env
TICKERS=AAPL,MSFT,GOOG,TSLA,AMZN
```

### 3. Run Server
```bash
uvicorn main:app --reload
```

API available at: `http://localhost:8000`
Documentation: `http://localhost:8000/docs`

## 📚 API Endpoints

### Core Endpoints
- `GET /api/assets` - Get available asset tickers
- `GET /api/metrics?ticker={symbol}` - Get risk metrics for an asset
- `GET /api/history?ticker={symbol}` - Get historical price data
- `POST /api/predict` - Get price predictions using ARIMA model

### Advanced Analysis
- `GET /api/portfolio?tickers={symbol1,symbol2,...}&weights={json}` - Portfolio analysis with custom weights
- `GET /api/sentiment/{ticker}` - Market sentiment analysis
- `GET /api/risk_alerts?threshold={value}` - Risk alert monitoring

### System
- `GET /api/health` - System health check
- `GET /api/test?ticker={symbol}` - Test data fetching

## 📊 Risk Metrics Explained

- **Volatility**: Annualized standard deviation of returns
- **VaR**: Maximum expected loss at 99% confidence level (Indian market standard)
- **Sharpe Ratio**: Risk-adjusted return measure
- **Sortino Ratio**: Downside deviation-based risk metric
- **Maximum Drawdown**: Largest peak-to-trough decline
- **Calmar Ratio**: Annual return / maximum drawdown

## 🔧 Configuration

### Environment Variables
- `TICKERS`: Comma-separated list of stock symbols to monitor

### Customization
- Modify cache refresh intervals in `utils/cache.py`
- Adjust risk calculation periods
- Customize ARIMA model parameters

## 🧪 Testing

### Manual Testing
1. Start server: `uvicorn main:app --reload`
2. Visit `http://localhost:8000/docs` for interactive API docs
3. Test endpoints with sample data

### Example API Calls
```bash
# Get metrics for Apple
curl "http://localhost:8000/api/metrics?ticker=AAPL"

# Get portfolio analysis with custom weights
curl "http://localhost:8000/api/portfolio?tickers=AAPL,MSFT,GOOG&weights={\"AAPL\":0.5,\"MSFT\":0.3,\"GOOG\":0.2}"

# Get price prediction
curl -X POST "http://localhost:8000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{"ticker": "AAPL", "days": 7}'
```

## 🔄 Data Flow

1. **Data Fetching**: Yahoo Finance API provides real-time market data
2. **Processing**: Pandas/NumPy calculate risk metrics
3. **Caching**: APScheduler updates cache every 2 minutes
4. **Persistent Storage**: Cache saved to `cache.json` on shutdown
5. **API Response**: FastAPI serves processed data to frontend
6. **ML Predictions**: ARIMA models generate price forecasts

## 🔮 Future Enhancements

- Database integration for historical data storage
- Additional ML models (LSTM, Prophet)
- Real-time WebSocket connections
- Advanced portfolio optimization algorithms
- Integration with additional data sources
- User authentication and personalized portfolios

## 📄 License
MIT
