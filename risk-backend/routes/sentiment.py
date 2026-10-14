from fastapi import APIRouter
import yfinance as yf
import numpy as np
import pandas as pd
from database import SessionLocal
from models.stock_price import StockPrice

router = APIRouter()


@router.get("/api/sentiment/{ticker}")
def market_sentiment(ticker: str):
    db = SessionLocal()

    try:
        # 1. Read historical closing prices from SQLite
        rows = (
            db.query(StockPrice)
            .filter(StockPrice.ticker == ticker.upper())
            .order_by(StockPrice.trade_date.asc())
            .all()
        )

        close = pd.Series(
            [row.close_price for row in rows],
            index=pd.to_datetime([row.trade_date for row in rows]),
            dtype=float,
        )

        # 2. Fall back to Yahoo Finance if SQLite has insufficient data
        if len(close) < 50:
            stock = yf.Ticker(ticker)
            hist = stock.history(period="6mo", interval="1d")

            if hist.empty or "Close" not in hist.columns:
                return {"error": f"No historical data available for {ticker}"}

            close = hist["Close"].dropna()

            # 3. Save fetched daily prices to SQLite
            if not close.empty:
                for date, price in close.items():
                    trade_date = pd.Timestamp(date).date().isoformat()

                    existing = (
                        db.query(StockPrice)
                        .filter(
                            StockPrice.ticker == ticker.upper(),
                            StockPrice.trade_date == trade_date,
                        )
                        .first()
                    )

                    if existing:
                        existing.close_price = float(price)
                    else:
                        db.add(
                            StockPrice(
                                ticker=ticker.upper(),
                                trade_date=trade_date,
                                close_price=float(price),
                            )
                        )

                db.commit()

        # 4. Ensure enough data exists for sentiment calculations
        close = close.dropna()

        if len(close) < 50:
            return {
                "error": f"Insufficient historical data for {ticker}"
            }

        # 5. Calculate moving averages
        ma_20 = close.rolling(window=20).mean()
        ma_50 = close.rolling(window=50).mean()

        current_price = float(close.iloc[-1])
        current_ma20 = float(ma_20.iloc[-1])
        current_ma50 = float(ma_50.iloc[-1])

        # 6. Calculate RSI
        delta = close.diff()
        gains = delta.clip(lower=0)
        losses = -delta.clip(upper=0)

        avg_gain = gains.rolling(window=14).mean()
        avg_loss = losses.rolling(window=14).mean()

        relative_strength = avg_gain / avg_loss.replace(0, np.nan)
        rsi = 100 - (100 / (1 + relative_strength))
        current_rsi = float(rsi.iloc[-1]) if pd.notna(rsi.iloc[-1]) else 50.0

        # 7. Calculate momentum
        momentum_5d = (
            float((close.iloc[-1] / close.iloc[-6] - 1) * 100)
            if len(close) >= 6 and close.iloc[-6] != 0
            else 0.0
        )

        momentum_20d = (
            float((close.iloc[-1] / close.iloc[-21] - 1) * 100)
            if len(close) >= 21 and close.iloc[-21] != 0
            else 0.0
        )

        # 8. Calculate recent and previous volatility
        daily_returns = close.pct_change().dropna()

        recent_volatility = (
            float(daily_returns.tail(20).std() * np.sqrt(252) * 100)
            if len(daily_returns) >= 20
            else 0.0
        )

        previous_volatility = (
            float(daily_returns.iloc[-40:-20].std() * np.sqrt(252) * 100)
            if len(daily_returns) >= 40
            else recent_volatility
        )

        if recent_volatility > previous_volatility * 1.1:
            volatility_trend = "increasing"
        elif recent_volatility < previous_volatility * 0.9:
            volatility_trend = "decreasing"
        else:
            volatility_trend = "stable"

        # 9. Generate sentiment signals
        signals = []

        if current_price > current_ma20 > current_ma50:
            signals.append("bullish_trend")

        if current_price < current_ma20 < current_ma50:
            signals.append("bearish_trend")

        if current_rsi > 70:
            signals.append("overbought")
        elif current_rsi < 30:
            signals.append("oversold")

        if momentum_5d > 2:
            signals.append("strong_momentum")
        elif momentum_5d < -2:
            signals.append("weak_momentum")

        # 10. Calculate sentiment score
        sentiment_score = 0

        if current_price > current_ma20:
            sentiment_score += 1
        else:
            sentiment_score -= 1

        if current_ma20 > current_ma50:
            sentiment_score += 1
        else:
            sentiment_score -= 1

        if current_rsi > 50:
            sentiment_score += 1
        else:
            sentiment_score -= 1

        if momentum_5d > 0:
            sentiment_score += 1
        else:
            sentiment_score -= 1

        # 11. Return the existing response structure
        return {
            "current_price": current_price,
            "moving_averages": {
                "ma_20": current_ma20,
                "ma_50": current_ma50,
            },
            "technical_indicators": {
                "rsi": current_rsi,
                "momentum_5d": momentum_5d,
                "momentum_20d": momentum_20d,
            },
            "volatility_trend": volatility_trend,
            "signals": signals,
            "sentiment_score": sentiment_score,
        }

    except Exception as e:
        db.rollback()
        return {"error": str(e)}



    finally:
        db.close()
