from fastapi import APIRouter
import yfinance as yf
import numpy as np
import pandas as pd
from utils.cache import DATA_CACHE

router = APIRouter()

@router.get("/api/sentiment/{ticker}")
def market_sentiment(ticker: str):
    """Get market sentiment and technical indicators"""
    try:
        data = yf.download(ticker, period="6mo", interval="1d")
        if data.empty:
            return {"error": {"message": "No data found for ticker", "suggestion": "Check if the ticker symbol is correct or try again later."}}
        if 'Close' not in data.columns:
            return {"error": {"message": "Close price data not available", "suggestion": "Try a different ticker or check data source."}}
        close = data['Close'].dropna()
        if isinstance(close, pd.DataFrame):
            if close.shape[1] == 1:
                close = close.iloc[:, 0]
            else:
                close = close.squeeze()
        close = close if isinstance(close, pd.Series) else pd.Series(close)
        if len(close) < 50:
            return {"error": {"message": "Not enough data for sentiment analysis", "suggestion": "Try a different ticker or wait for more data to accumulate."}}
        current_price = float(close.iloc[-1])
        ma_20 = float(close.rolling(window=20).mean().iloc[-1])
        ma_50 = float(close.rolling(window=50).mean().iloc[-1])
        if pd.isna(ma_20):
            ma_20 = current_price
        if pd.isna(ma_50):
            ma_50 = current_price
        delta = close.diff()
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        avg_gain = gain.rolling(window=14).mean()
        avg_loss = loss.rolling(window=14).mean()
        rs = avg_gain / avg_loss.replace(0, np.nan)
        rsi_series = 100 - (100 / (1 + rs))
        rsi = float(rsi_series.iloc[-1])
        if pd.isna(rsi):
            rsi = 50.0
        if len(close) >= 6:
            momentum_5d = float((current_price / close.iloc[-6]) - 1)
        else:
            momentum_5d = 0.0
        if len(close) >= 21:
            momentum_20d = float((current_price / close.iloc[-21]) - 1)
        else:
            momentum_20d = 0.0
        recent_vol = float(close.pct_change().tail(20).std())
        historical_vol = float(close.pct_change().std())
        vol_trend = "increasing" if recent_vol > historical_vol else "decreasing"
        signals = []
        if current_price > ma_20 and ma_20 > ma_50:
            signals.append("bullish_trend")
        elif current_price < ma_20 and ma_20 < ma_50:
            signals.append("bearish_trend")
        if rsi > 70:
            signals.append("overbought")
        elif rsi < 30:
            signals.append("oversold")
        if momentum_5d > 0.05:
            signals.append("strong_momentum")
        elif momentum_5d < -0.05:
            signals.append("weak_momentum")
        bullish_signals = len([s for s in signals if "bullish" in s or "strong" in s])
        bearish_signals = len([s for s in signals if "bearish" in s or "weak" in s])
        sentiment_score = bullish_signals - bearish_signals
        return {
            "current_price": current_price,
            "moving_averages": {
                "ma_20": ma_20,
                "ma_50": ma_50
            },
            "technical_indicators": {
                "rsi": rsi,
                "momentum_5d": momentum_5d,
                "momentum_20d": momentum_20d
            },
            "volatility_trend": vol_trend,
            "signals": signals,
            "sentiment_score": sentiment_score
        }
    except Exception as e:
        print(f"Error in /api/sentiment for {ticker}: {e}")
        return {"error": {"message": f"Sentiment analysis failed: {str(e)}", "suggestion": "Try again later or contact support if the issue persists."}} 