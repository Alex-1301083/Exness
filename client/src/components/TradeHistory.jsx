import { useEffect, useState } from "react";
import api from "../services/api";

function TradeHistory() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrades = async () => {
    try {
      const response = await api.get("/trades");

      if (response.data.success) {
        setTrades(response.data.trades || []);
      }
    } catch (error) {
      console.error("Trade History Error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load trade history"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();

    const interval = setInterval(() => {
      fetchTrades();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (value) => {
    if (value === null || value === undefined) {
      return "-";
    }

    return Number(value).toFixed(2);
  };

  const formatPnl = (value) => {
    const pnl = Number(value || 0);

    if (pnl >= 0) {
      return `+$${pnl.toFixed(2)}`;
    }

    return `-$${Math.abs(pnl).toFixed(2)}`;
  };

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleString();
  };

  if (loading) {
    return (
      <div className="trade-history-empty">
        Loading trade history...
      </div>
    );
  }

  return (
    <div className="trade-history-wrapper">

      {error && (
        <div className="trade-history-error">
          {error}
        </div>
      )}

      {trades.length === 0 ? (
        <div className="trade-history-empty">

          <div className="trade-history-icon">
            ↕
          </div>

          <h3>No Trade History</h3>

          <p>
            Your completed trades will appear here.
          </p>

        </div>
      ) : (
        <div className="trade-history-table-container">

          <table className="trade-history-table">

            <thead>
              <tr>
                <th>Symbol</th>
                <th>Type</th>
                <th>Volume</th>
                <th>Open Price</th>
                <th>Close Price</th>
                <th>P/L</th>
                <th>Commission</th>
                <th>Open Time</th>
                <th>Close Time</th>
              </tr>
            </thead>

            <tbody>

              {trades.map((trade) => {

                const isBuy = trade.side === "buy";

                const pnl = Number(trade.pnl || 0);

                return (
                  <tr key={trade._id}>

                    <td>
                      <strong>
                        {trade.symbol}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={
                          isBuy
                            ? "trade-buy"
                            : "trade-sell"
                        }
                      >
                        {isBuy ? "BUY" : "SELL"}
                      </span>
                    </td>

                    <td>
                      {Number(trade.volume).toFixed(2)}
                    </td>

                    <td>
                      {formatPrice(trade.openPrice)}
                    </td>

                    <td>
                      {formatPrice(trade.closePrice)}
                    </td>

                    <td>
                      <span
                        className={
                          pnl >= 0
                            ? "trade-pnl-positive"
                            : "trade-pnl-negative"
                        }
                      >
                        {formatPnl(pnl)}
                      </span>
                    </td>

                    <td>
                      ${Number(
                        trade.commission || 0
                      ).toFixed(2)}
                    </td>

                    <td>
                      {formatDate(trade.createdAt)}
                    </td>

                    <td>
                      {formatDate(trade.closedAt)}
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

export default TradeHistory;