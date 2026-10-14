
from sqlalchemy import Column, Date, Float, Integer, String, UniqueConstraint

from database import Base


class StockPrice(Base):
    __tablename__ = "stock_prices"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, nullable=False, index=True)
    trade_date = Column(Date, nullable=False)
    close_price = Column(Float, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "ticker",
            "trade_date",
            name="uq_stock_price_ticker_date",
        ),
    )
