from fastapi import APIRouter, Query
import yfinance as yf
import numpy as np
import pandas as pd
import json
from database import SessionLocal
from models.stock_price import StockPrice

router = APIRouter()

@router.get("/api/portfolio")
def portfolio_analysis(
    tickers: str = Query(..., description="Comma-separated ticker symbols"),
    weights: str = Query(
        None,
        description="JSON string of weights for each ticker"
    )
):
    db = SessionLocal()

    try:
        ticker_list = list(dict.fromkeys(
            t.strip() for t in tickers.split(",") if t.strip()
        ))

        if len(ticker_list) < 2:
            return {
                "error": {
                    "message": "Portfolio analysis requires at least 2 assets",
                    "suggestion": "Select at least two assets."
                }
            }

        # Parse optional portfolio weights.
        weight_dict = None

        if weights:
            try:
                parsed_weights = json.loads(weights)

                if not isinstance(parsed_weights, dict):
                    raise ValueError("Weights must be a JSON object.")

                if any(
                    not np.isfinite(float(parsed_weights[t]))
                    or float(parsed_weights[t]) < 0
                    for t in ticker_list
                    if t in parsed_weights
                ):
                    raise ValueError("Weights must be finite and non-negative.")

                if all(t in parsed_weights for t in ticker_list):
                    weight_dict = {
                        t: float(parsed_weights[t]) for t in ticker_list
                    }

                    total = sum(weight_dict.values())

                    if total > 0:
                        weight_dict = {
                            t: value / total
                            for t, value in weight_dict.items()
                        }
                    else:
                        weight_dict = None

            except Exception as e:
                print(f"Invalid portfolio weights: {e}")
                weight_dict = None

        portfolio_data = {}

        # Load each ticker's prices from SQLite.
        for ticker in ticker_list:
            rows = (
                db.query(StockPrice)
                .filter(StockPrice.ticker == ticker)
                .order_by(StockPrice.trade_date.asc())
                .all()
            )

            # Fetch and persist prices only when SQLite has insufficient data.
            if len(rows) < 30:
                try:
                    data = yf.download(
                        ticker,
                        period="1y",
                        interval="1d",
                        progress=False
                    )

                    if not data.empty:
                        if isinstance(data.columns, pd.MultiIndex):
                            close_columns = [
                                col for col in data.columns
                                if "close" in str(col).lower()
                            ]
                            close = (
                                data[close_columns[0]]
                                if close_columns else pd.Series(dtype=float)
                            )
                        elif "Close" in data.columns:
                            close = data["Close"]
                        else:
                            close = pd.Series(dtype=float)

                        if isinstance(close, pd.DataFrame):
                            close = close.iloc[:, 0]

                        close = close.dropna()

                        existing_by_date = {
                            row.trade_date: row for row in rows
                        }

                        for timestamp, price in close.items():
                            trade_date = pd.Timestamp(timestamp).date()
                            close_price = float(price)

                            if trade_date in existing_by_date:
                                existing_by_date[trade_date].close_price = close_price
                            else:
                                db.add(
                                    StockPrice(
                                        ticker=ticker,
                                        trade_date=trade_date,
                                        close_price=close_price
                                    )
                                )

                        db.commit()

                        rows = (
                            db.query(StockPrice)
                            .filter(StockPrice.ticker == ticker)
                            .order_by(StockPrice.trade_date.asc())
                            .all()
                        )

                except Exception as e:
                    db.rollback()
                    print(f"Could not refresh {ticker}: {e}")

                    # Use previously stored rows if a refresh fails.

            if len(rows) >= 30:
                portfolio_data[ticker] = pd.Series(
                    [float(row.close_price) for row in rows],
                    index=pd.to_datetime(
                        [row.trade_date for row in rows]
                    ),
                    dtype=float
                )

        if len(portfolio_data) < 2:
            return {
                "error": {
                    "message": "Not enough valid historical data for portfolio analysis",
                    "suggestion": "Choose at least two assets with sufficient price history."
                }
            }

        # Align prices by actual trading date, not by array position.
        prices_df = pd.concat(portfolio_data, axis=1, join="inner")
        prices_df = prices_df.dropna().sort_index()

        if len(prices_df) < 30:
            return {
                "error": {
                    "message": "Not enough overlapping historical data",
                    "suggestion": "Choose assets with more overlapping price history."
                }
            }

        returns = prices_df.pct_change().dropna()

        if len(returns) < 20:
            return {
                "error": {
                    "message": "Not enough return data for portfolio analysis"
                }
            }

        # Use supplied normalized weights or equal weights.
        if weight_dict and all(t in prices_df.columns for t in ticker_list):
            weights_series = pd.Series(weight_dict).reindex(
                prices_df.columns
            ).fillna(0.0)

            portfolio_returns = returns.dot(weights_series)
            response_weights = weights_series.to_dict()
        else:
            portfolio_returns = returns.mean(axis=1)
            response_weights = None

        portfolio_volatility = float(
            np.std(portfolio_returns) * np.sqrt(252)
        )

        daily_std = float(np.std(portfolio_returns))

        portfolio_sharpe = (
            float(
                (np.mean(portfolio_returns) * 252)
                / (daily_std * np.sqrt(252))
            )
            if daily_std != 0 else 0.0
        )

        portfolio_var = float(np.percentile(portfolio_returns, 1))
        annual_return = float(np.mean(portfolio_returns) * 252)

        corr_matrix = returns.corr().fillna(0.0)

        correlation_dict = {
            col: {
                idx: float(corr_matrix.loc[idx, col])
                for idx in corr_matrix.index
            }
            for col in corr_matrix.columns
        }

        return {
            "portfolio_metrics": {
                "volatility": portfolio_volatility,
                "sharpe_ratio": portfolio_sharpe,
                "var_99": portfolio_var,
                "annual_return": annual_return
            },
            "correlation_matrix": correlation_dict,
            "assets": list(prices_df.columns),
            "data_points": len(prices_df),
            "weights": response_weights
        }

    except Exception as e:
        db.rollback()
        print(f"Portfolio analysis error: {e}")
        return {
            "error": {
                "message": f"Portfolio analysis failed: {str(e)}",
                "suggestion": "Check the selected assets and portfolio weights."
            }
        }

    finally:
        db.close()
