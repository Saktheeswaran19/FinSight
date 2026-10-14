from fastapi import APIRouter, Query
import yfinance as yf
import numpy as np
import pandas as pd
import json
from utils.cache import DATA_CACHE

router = APIRouter()

@router.get("/api/portfolio")
def portfolio_analysis(tickers: str = Query(..., description="Comma-separated ticker symbols"), weights: str = Query(None, description="JSON string of weights for each ticker")):
    """Analyze a portfolio of multiple assets with optional custom weights"""
    try:
        ticker_list = [t.strip() for t in tickers.split(",")]
        if len(ticker_list) < 2:
            return {"error": {"message": "Portfolio analysis requires at least 2 assets", "suggestion": "Select at least two assets for portfolio analysis."}}
        # Parse weights if provided
        weight_dict = None
        if weights:
            try:
                weight_dict = json.loads(weights)
                weight_dict = {k: float(weight_dict[k]) for k in ticker_list if k in weight_dict}
                total = sum(weight_dict.values())
                if total > 0:
                    weight_dict = {k: v / total for k, v in weight_dict.items()}
                else:
                    weight_dict = None
            except Exception as e:
                print(f"Invalid weights: {e}")
                weight_dict = None
        portfolio_data = {}
        for ticker in ticker_list:
            try:
                data = yf.download(ticker, period="1y", interval="1d")
                if not data.empty and 'Close' in data.columns:
                    close_prices = data['Close'].dropna()
                    if isinstance(close_prices, pd.DataFrame):
                        if close_prices.shape[1] == 1:
                            close_prices = close_prices.iloc[:, 0]
                        else:
                            close_prices = close_prices.squeeze()
                    close_prices = close_prices if isinstance(close_prices, pd.Series) else pd.Series(close_prices)
                    if len(close_prices) >= 30:
                        portfolio_data[ticker] = close_prices
            except Exception as e:
                print(f"Error fetching data for {ticker} in /api/portfolio: {e}")
                continue
        if len(portfolio_data) < 2:
            return {"error": {"message": "Not enough valid data for portfolio analysis", "suggestion": "Try different assets or check data availability."}}
        min_length = min(len(data) for data in portfolio_data.values())
        if min_length < 30:
            return {"error": {"message": "Not enough overlapping data for analysis", "suggestion": "Try assets with more historical data."}}
        try:
            aligned_series = []
            for ticker, data in portfolio_data.items():
                recent_data = data.tail(min_length).reset_index(drop=True)
                recent_data.name = ticker
                aligned_series.append(recent_data)
            df = pd.concat(aligned_series, axis=1)
        except Exception as df_error:
            print(f"DataFrame creation error in /api/portfolio: {df_error}")
            return {"error": {"message": f"Failed to align data: {str(df_error)}", "suggestion": "Try again later or contact support if the issue persists."}}
        returns = df.pct_change().dropna()
        if len(returns) < 20:
            return {"error": {"message": "Not enough return data for analysis", "suggestion": "Try assets with more historical data."}}
        if weight_dict and len(weight_dict) == len(ticker_list):
            weights_arr = [weight_dict.get(t, 0) for t in ticker_list]
            returns_matrix = returns[ticker_list].values
            portfolio_returns = (returns_matrix * weights_arr).sum(axis=1)
        else:
            portfolio_returns = returns.mean(axis=1)
        portfolio_volatility = float(np.std(portfolio_returns) * np.sqrt(252))
        portfolio_sharpe = float((np.mean(portfolio_returns) * 252) / (np.std(portfolio_returns) * np.sqrt(252))) if np.std(portfolio_returns) != 0 else 0
        portfolio_var = float(np.percentile(portfolio_returns, 1))
        annual_return = float(np.mean(portfolio_returns) * 252)
        try:
            corr_matrix = returns.corr()
            correlation_dict = {}
            for col in corr_matrix.columns:
                correlation_dict[col] = {}
                for idx in corr_matrix.index:
                    val = corr_matrix.loc[idx, col]
                    correlation_dict[col][idx] = float(val) if not pd.isna(val) else 0.0
        except Exception as corr_error:
            print(f"Correlation calculation error in /api/portfolio: {corr_error}")
            correlation_dict = {}
            for ticker in portfolio_data.keys():
                correlation_dict[ticker] = {t: 1.0 if t == ticker else 0.0 for t in portfolio_data.keys()}
        return {
            "portfolio_metrics": {
                "volatility": portfolio_volatility,
                "sharpe_ratio": portfolio_sharpe,
                "var_99": portfolio_var,
                "annual_return": annual_return
            },
            "correlation_matrix": correlation_dict,
            "assets": list(portfolio_data.keys()),
            "data_points": len(df),
            "weights": weight_dict if weight_dict else None
        }
    except Exception as e:
        print(f"Portfolio analysis error in /api/portfolio: {e}")
        return {"error": {"message": f"Portfolio analysis failed: {str(e)}", "suggestion": "Try again later or contact support if the issue persists."}} 