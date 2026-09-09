import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "../services/api";

function PositionsTable() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState(null);
  const [error, setError] = useState("");

  const fetchPositions = async () => {
    try {
      const response = await api.get("/positions");

      if (response.data.success) {
        setPositions(response.data.positions || []);
      }
    } catch (error) {
      console.log("POSITIONS API DATA:", response.data.positions);

      setPositions(response.data.positions || []);

      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(error.response?.data?.message || "Failed to load positions");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();

    // Refresh position prices every second
    const interval = setInterval(() => {
      fetchPositions();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClose = async (positionId) => {
    try {
      setClosingId(positionId);
      setError("");

      const response = await api.post(`/positions/${positionId}/close`);

      if (response.data.success) {
        await fetchPositions();
      }
    } catch (error) {
      console.error("Close Position Error:", error);

      setError(error.response?.data?.message || "Failed to close position");
    } finally {
      setClosingId(null);
    }
  };

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

  if (loading) {
    return <div className="positions-empty">Loading positions...</div>;
  }

  return (
    <div className="positions-wrapper">
      {error && <div className="positions-error">{error}</div>}

      {positions.length === 0 ? (
        <div className="positions-empty">
          <div className="empty-icon">⌁</div>

          <h3>No Open Positions</h3>

          <p>Your open trades will appear here.</p>
        </div>
      ) : (
        <div className="positions-table-container">
          <table className="positions-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Type</th>
                <th>Volume</th>
                <th>Open Price</th>
                <th>Current Price</th>
                <th>Stop Loss</th>
                <th>Take Profit</th>
                <th>Margin</th>
                <th>P/L</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {positions.map((position) => {
                const isBuy = position.side === "buy";

                const pnl = Number(position.floatingPnl || 0);

                return (
                  <tr key={position._id}>
                    <td>
                      <strong>{position.symbol}</strong>
                    </td>

                    <td>
                      <span
                        className={isBuy ? "position-buy" : "position-sell"}
                      >
                        {isBuy ? "BUY" : "SELL"}
                      </span>
                    </td>

                    <td>{Number(position.volume).toFixed(2)}</td>

                    <td>{formatPrice(position.openPrice)}</td>

                    <td>{formatPrice(position.currentPrice)}</td>

                    <td>
                      {position.stopLoss ? formatPrice(position.stopLoss) : "-"}
                    </td>

                    <td>
                      {position.takeProfit
                        ? formatPrice(position.takeProfit)
                        : "-"}
                    </td>

                    <td>${Number(position.margin || 0).toFixed(2)}</td>

                    <td>
                      <span
                        className={pnl >= 0 ? "pnl-positive" : "pnl-negative"}
                      >
                        {formatPnl(pnl)}
                      </span>
                    </td>

                    <td>
                      <button
                        className="close-position-button"
                        onClick={() => handleClose(position._id)}
                        disabled={closingId === position._id}
                      >
                        <X size={15} />

                        {closingId === position._id ? "Closing..." : "Close"}
                      </button>
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

export default PositionsTable;
