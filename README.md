# 📊 FinSight — Financial Risk Intelligence Dashboard

> A full-stack financial risk analytics platform for Indian equity markets, featuring real-time risk metrics, ARIMA-based price forecasting, market sentiment analysis, and portfolio optimization — all in a clean, responsive dashboard.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FinSight Dashboard                          │
├────────────────────────────┬────────────────────────────────────────┤
│        FRONTEND            │             BACKEND                     │
│  React 18 + Vite + TW CSS  │     FastAPI (Python 3.10+)             │
│                            │                                         │
│  ┌──────────────────────┐  │  ┌──────────────────────────────────┐  │
│  │    Navigation Bar    │  │  │           main.py                │  │
│  │  (Dark/Light Theme)  │  │  │  - App startup & CORS            │  │
│  └──────────┬───────────┘  │  │  - APScheduler (cache refresh)   │  │
│             │              │  │  - ARIMA /api/predict endpoint    │  │
│  ┌──────────▼───────────┐  │  └────────────┬─────────────────────┘  │
│  │     Dashboard        │  │               │                         │
│  │  - MetricCard        │  │  ┌────────────▼─────────────────────┐  │
│  │  - PriceChart        │◄─┼─►│         API Routes               │  │
│  │  - RiskAlerts        │  │  │  routes/metrics.py               │  │
│  │  - Settings          │  │  │  routes/portfolio.py             │  │
│  └──────────────────────┘  │  │  routes/sentiment.py             │  │
│                            │  └────────────┬─────────────────────┘  │
│  ┌──────────────────────┐  │               │                         │
│  │   PortfolioPage      │  │  ┌────────────▼─────────────────────┐  │
│  │  - PortfolioAnalysis │  │  │         Data Layer               │  │
│  └──────────────────────┘  │  │  yfinance + SQLite (SQLAlchemy)  │  │
│                            │  │  (finance_risk.db)               │  │
│  ┌──────────────────────┐  │  └────────────┬─────────────────────┘  │
│  │   SentimentPage      │  │               │                         │
│  │  - SentimentAnalysis │  │  ┌────────────▼─────────────────────┐  │
│  └──────────────────────┘  │  │      In-Memory Cache             │  │
│                            │  │  utils/cache.py (DATA_CACHE)     │  │
│  services/api.js (Axios)   │  │  Refreshed every 2 minutes       │  │
│  context/ThemeContext      │  └──────────────────────────────────┘  │
└────────────────────────────┴────────────────────────────────────────┘
                                          │
                              ┌───────────▼───────────┐
                              │   Yahoo Finance API   │
                              │   (yfinance library)  │
                              └───────────────────────┘
```

### High-Level Request Flow

```
User's Browser (React SPA — localhost:5173)
        │
        │  HTTP/Axios
        ▼
FastAPI Backend (localhost:8000)
        │
        ├─ Check DATA_CACHE (in-memory, fast)
        │       ├── HIT  → return immediately
        │       └── MISS → query SQLite → fallback to Yahoo Finance
        │
        ▼
SQLite (finance_risk.db)   ←→   Yahoo Finance (yfinance)
        │
        └─ APScheduler refreshes every 2 minutes in background
```

---

## ✨ Features

### 📈 Risk Metrics Dashboard
- **Annualized Volatility** — Standard deviation of daily returns × √252
- **Value at Risk (VaR 99%)** — 1st percentile of return distribution
- **Sharpe Ratio** — Risk-adjusted return (annual)
- **Sortino Ratio** — Downside-risk-adjusted return
- **Max Drawdown** — Worst peak-to-trough decline
- **Calmar Ratio** — Annual return / Max drawdown
- **Max Consecutive Losses** — Longest losing streak

### 📉 Price Charts & Forecasting
- Interactive historical price charts powered by **Recharts**
- **ARIMA model** for short-term price prediction (1–30 days)

### 🎯 Market Sentiment Analysis
- **RSI (Relative Strength Index)** — 14-day window
- **Moving Averages** — MA-20 and MA-50 crossover signals
- **Momentum** — 5-day and 20-day price momentum
- **Volatility Trend** — Increasing / Stable / Decreasing
- **Sentiment Score** — Composite bullish/bearish composite

### 📊 Portfolio Analysis
- Multi-asset correlation analysis
- Equal or custom weight allocation
- Portfolio-level VaR & volatility

### 🔔 Risk Alerts
- Configurable volatility threshold
- Real-time flagging of high-risk assets from the watchlist

### 🌗 UI/UX
- Dark / Light mode toggle
- Responsive design (desktop & tablet)
- Auto-refreshing data every 2 minutes

---

## 🗂️ Project Structure

```
FinSight-dashboard/
├── README.md                        ← You are here
├── .gitignore
│
├── risk-backend/                    ← FastAPI Python backend
│   ├── main.py                      ← Entry point, startup cache, ARIMA predict
│   ├── database.py                  ← SQLAlchemy engine & session (SQLite)
│   ├── requirements.txt             ← Python dependencies
│   ├── finance_risk.db              ← SQLite database (auto-created at startup)
│   ├── cache.json                   ← Persistent cache snapshot
│   │
│   ├── models/
│   │   └── stock_price.py           ← SQLAlchemy StockPrice ORM model
│   │
│   ├── routes/
│   │   ├── metrics.py               ← GET /api/metrics
│   │   ├── portfolio.py             ← GET /api/portfolio
│   │   └── sentiment.py             ← GET /api/sentiment/{ticker}
│   │
│   └── utils/
│       └── cache.py                 ← In-memory DATA_CACHE + APScheduler instance
│
└── risk-frontend/                   ← React + Vite frontend
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    │
    └── src/
        ├── main.jsx                 ← React DOM root
        ├── App.jsx                  ← Routes: /, /portfolio, /sentiment
        │
        ├── components/
        │   ├── Dashboard.jsx        ← Main dashboard view
        │   ├── MetricCard.jsx       ← Individual KPI card
        │   ├── Navigation.jsx       ← Top navbar with theme toggle
        │   ├── PortfolioAnalysis.jsx← Correlation matrix & portfolio stats
        │   ├── PriceChart.jsx       ← Historical + forecast chart
        │   ├── RiskAlerts.jsx       ← Volatility alert banner
        │   ├── SentimentAnalysis.jsx← RSI, MA, momentum gauges
        │   └── Settings.jsx         ← Ticker & threshold settings
        │
        ├── pages/
        │   ├── PortfolioPage.jsx    ← /portfolio route wrapper
        │   └── SentimentPage.jsx    ← /sentiment route wrapper
        │
        ├── services/
        │   └── api.js               ← Axios API client (all endpoint calls)
        │
        ├── context/
        │   └── ThemeContext.jsx     ← Dark/light mode React context
        │
        └── utils/                   ← Shared frontend utilities
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/assets` | Returns the list of tracked ticker symbols |
| `GET` | `/api/metrics?ticker=TCS.NS` | Risk metrics for a single stock |
| `GET` | `/api/history?ticker=TCS.NS` | Historical closing prices |
| `GET` | `/api/risk_alerts?threshold=0.05` | Tickers exceeding volatility threshold |
| `POST` | `/api/predict` | ARIMA price forecast `{ "ticker": "TCS.NS", "days": 7 }` |
| `GET` | `/api/sentiment/{ticker}` | Sentiment score, RSI, MA, momentum |
| `GET` | `/api/portfolio?tickers=A,B&weights={}` | Portfolio correlation & VaR |
| `GET` | `/api/health` | System health status |

### Default Watchlist (NSE)

```
RELIANCE.NS, HDFCBANK.NS, ICICIBANK.NS, INFY.NS, TCS.NS,
LT.NS, ITC.NS, AXISBANK.NS, KOTAKBANK.NS, SBIN.NS
```

> Configurable via the `TICKERS` environment variable in `risk-backend/.env`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, TailwindCSS 3, React Router v6 |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **HTTP Client** | Axios |
| **Backend** | FastAPI, Uvicorn |
| **Data Source** | yfinance (Yahoo Finance) |
| **Time Series** | statsmodels ARIMA |
| **Numerics** | NumPy, Pandas |
| **Database** | SQLite via SQLAlchemy ORM |
| **Scheduler** | APScheduler (BackgroundScheduler) |
| **ML Extras** | scikit-learn |

---

## ⚙️ Prerequisites

- **Python** 3.10 or higher
- **Node.js** 18 or higher + **npm**
- **Git**

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Saktheeswaran19/FinSight.git
cd FinSight
```

---

### 2. Backend Setup

```bash
# Navigate to backend folder
cd risk-backend

# Create a virtual environment
python -m venv venv

# Activate it — Windows
venv\Scripts\activate

# Activate it — macOS/Linux
source venv/bin/activate

# Install all Python dependencies
pip install -r requirements.txt
```

#### (Optional) Configure environment variables

Create a `.env` file inside `risk-backend/`:

```env
# Comma-separated NSE/BSE ticker symbols
TICKERS=RELIANCE.NS,HDFCBANK.NS,ICICIBANK.NS,INFY.NS,TCS.NS,LT.NS,ITC.NS,AXISBANK.NS,KOTAKBANK.NS,SBIN.NS
```

> If no `.env` file is present, the default 10-stock NSE watchlist is used automatically.

#### Start the backend server

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

- API base URL: **http://127.0.0.1:8000**
- Interactive Swagger docs: **http://127.0.0.1:8000/docs**
- ReDoc: **http://127.0.0.1:8000/redoc**

> ⏳ **Note:** On first startup the server pre-fetches all tickers from Yahoo Finance. This takes approximately 30–60 seconds before data is available.

---

### 3. Frontend Setup

Open a **new terminal window** (keep the backend running):

```bash
# Navigate to frontend folder
cd risk-frontend

# Install Node.js dependencies
npm install

# Start the Vite development server
npm run dev
```

Dashboard URL: **http://localhost:5173**

---

### 4. Using the Dashboard

1. Open **http://localhost:5173** in your browser.
2. Wait ~30 seconds for the backend to finish pre-fetching ticker data.
3. Use the **Settings** panel to select a ticker.
4. Navigate using the top bar:
   - **Dashboard** → KPI cards, price chart, ARIMA forecast, risk alerts
   - **Portfolio** → Select 2+ assets for correlation & portfolio VaR
   - **Sentiment** → RSI, moving averages, momentum for a chosen ticker

---

## 🔄 Data Flow

```
Backend Startup
  └─► update_cache() runs immediately
        └─► Downloads 6mo daily prices from Yahoo Finance for each ticker
        └─► Persists closing prices to SQLite (finance_risk.db)
        └─► Computes risk metrics → stores in DATA_CACHE (in-memory dict)
        └─► APScheduler repeats this every 2 minutes in the background

Incoming API Request (e.g. GET /api/metrics?ticker=TCS.NS)
  └─► Check DATA_CACHE first
        ├─► HIT  → return cached metrics (fast)
        └─► MISS → query SQLite for historical prices
                    └─► If SQLite has < 30 rows, call yfinance as fallback
                    └─► Compute metrics → cache → return response
```

---

## 📦 Production Build

### Frontend (static bundle)

```bash
cd risk-frontend
npm run build
# Output in risk-frontend/dist/ — deploy to Vercel, Netlify, Nginx, etc.
```

### Backend (production server)

```bash
cd risk-backend
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## 🐛 Troubleshooting

| Issue | Fix |
|---|---|
| `ModuleNotFoundError` on backend start | Activate the virtual environment and run `pip install -r requirements.txt` |
| Backend takes long to start | Normal — it pre-fetches 10 tickers from Yahoo Finance on startup (~30–60s) |
| `CORS` errors in browser console | Ensure the backend is running on port **8000** |
| Charts show no data / loading forever | Wait for the initial cache population after backend starts |
| `yfinance` rate-limit / 429 errors | Yahoo Finance throttled the requests; wait a few minutes and retry |
| SQLite locked error | Restart the backend; avoid running multiple backend instances simultaneously |
| Port 5173 already in use | Change the Vite port: `npm run dev -- --port 3000` |
| Port 8000 already in use | `uvicorn main:app --port 8001` and update `API_BASE_URL` in `services/api.js` |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit with a descriptive message: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request on GitHub

---

## 📄 License

This project is built for educational and portfolio purposes.

---

## 👤 Author

**Saktheeswaran**  
GitHub: [@Saktheeswaran19](https://github.com/Saktheeswaran19)  
Email: saktheeswaran231090@ssn.edu.in

---

> ⭐ If you found this useful, consider giving it a star on [GitHub](https://github.com/Saktheeswaran19/FinSight)!
