from fastapi import APIRouter, Query
import yfinance as yf
import numpy as np
import pandas as pd
from utils.cache import DATA_CACHE

router = APIRouter()

@router.get("/api/metrics")
def get_metrics(ticker: str = Query(..., description="Stock ticker symbol")):
    if not DATA_CACHE or ticker not in DATA_CACHE:
        try:
            data = yf.download(ticker, period="1y", interval="1d")
            if data.empty:
                return {"error": {"message": "No data found for ticker.", "suggestion": "Check if the ticker symbol is correct or try again later."}}
            close_col = None
            if isinstance(data.columns, pd.MultiIndex):
                for col in data.columns:
                    if "close" in str(col).lower():
                        close_col = col
                        break
            else:
                close_col = 'Close'
            if not close_col or close_col not in data.columns:
                return {"error": {"message": f"No 'Close' column found in data. Columns: {list(data.columns)}", "suggestion": "Try a different ticker or check data source."}}
            close = data[close_col].dropna()
            if isinstance(close, pd.DataFrame):
                if close.shape[1] == 1:
                    close = close.iloc[:, 0]
                else:
                    close = close.squeeze()
            close = close if isinstance(close, pd.Series) else pd.Series(close)
            if len(close) < 30:
                return {"error": {"message": "Not enough data for calculations.", "suggestion": "Try a different ticker or wait for more data to accumulate."}}
            returns = close.pct_change().dropna()
            volatility = float(np.std(returns) * np.sqrt(252))
            var_99 = float(np.percentile(returns, 1))
            sharpe = float((np.mean(returns) * 252) / (np.std(returns) * np.sqrt(252))) if np.std(returns) != 0 else 0
            downside_returns = returns[returns < 0]
            downside_deviation = np.std(downside_returns) * np.sqrt(252) if len(downside_returns) > 0 else 0
            sortino = float((np.mean(returns) * 252) / downside_deviation) if downside_deviation != 0 else 0
            consecutive_losses = 0
            max_consecutive_losses = 0
            for ret in returns:
                if ret < 0:
                    consecutive_losses += 1
                    max_consecutive_losses = max(max_consecutive_losses, consecutive_losses)
                else:
                    consecutive_losses = 0
            annual_return = float(np.mean(returns) * 252)
            roll_max = close.expanding().max()
            daily_drawdown = (close / roll_max) - 1.0
            max_drawdown = float(daily_drawdown.min())
            calmar = float(annual_return / abs(max_drawdown)) if max_drawdown != 0 else 0
            DATA_CACHE[ticker] = {
                "metrics": {
                    "volatility": volatility,
                    "VaR_99": var_99,
                    "sharpe_ratio": sharpe,
                    "max_drawdown": max_drawdown,
                    "sortino_ratio": sortino,
                    "max_consecutive_losses": max_consecutive_losses,
                    "calmar_ratio": calmar,
                },
                "history": close.tolist(),
                "dates": [str(d.date()) for d in close.index],
            }
            return DATA_CACHE[ticker]["metrics"]
        except Exception as e:
            print(f"Error in /api/metrics for {ticker}: {e}")
            return {"error": {"message": str(e), "suggestion": "Try again later or contact support if the issue persists."}}
    return DATA_CACHE[ticker]["metrics"]

@router.get("/api/history")
def get_history(
    ticker: str = Query(..., description="Stock ticker symbol"),
    timeframe: str = Query("1Y", description="Time frame for historical data (1D, 5D, 1M, 3M, 6M, 1Y, 2Y, 5Y, MAX)")
):
    # Convert timeframe to yfinance period format
    period_map = {
        "1D": "1d",
        "5D": "5d",
        "1M": "1mo",
        "3M": "3mo",
        "6M": "6mo",
        "1Y": "1y",
        "2Y": "2y",
        "5Y": "5y",
        "MAX": "max"
    }
    
    period = period_map.get(timeframe.upper(), "1y")
    print(f"Fetching history for {ticker} with period: {period}")
    
    # Set appropriate interval based on timeframe
    interval = "1d"  # default
    if timeframe.upper() in ["1D", "5D"]:
        interval = "15m"
    
    cache_key = f"{ticker}_{timeframe.upper()}"
    
    if not DATA_CACHE or cache_key not in DATA_CACHE:
        try:
            data = yf.download(ticker, period=period, interval=interval)
            if data.empty:
                return {"error": {"message": "No data found for ticker.", "suggestion": "Check if the ticker symbol is correct or try again later."}}
            
            close = data['Close']
            if isinstance(close, pd.DataFrame):
                if close.shape[1] == 1:
                    close = close.iloc[:, 0]
                else:
                    close = close.squeeze()
            close = close if isinstance(close, pd.Series) else pd.Series(close)

            result = {
                "history": close.tolist(),
                "dates": [str(d.date()) for d in close.index]
            }
            
            # Cache the result
            if ticker not in DATA_CACHE:
                DATA_CACHE[ticker] = {}
            DATA_CACHE[cache_key] = result
            
            return result
        except Exception as e:
            print(f"Error in /api/history for {ticker} with timeframe {timeframe}: {e}")
            return {"error": {"message": str(e), "suggestion": "Try again later or contact support if the issue persists."}}
    
    return DATA_CACHE[cache_key]