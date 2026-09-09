import { useEffect, useState } from "react";
import api from "../services/api";

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");

      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error("Order History Error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load order history"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (value) => {
    if (value === null || value === undefined) {
      return "-";
    }

    return Number(value).toFixed(2);
  };

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleString();
  };

  const formatStatus = (status) => {
    if (!status) return "-";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="order-history-empty">
        Loading order history...
      </div>
    );
  }

  return (
    <div className="order-history-wrapper">

      {error && (
        <div className="order-history-error">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="order-history-empty">

          <div className="order-history-icon">
            ☷
          </div>

          <h3>No Order History</h3>

          <p>
            Your orders will appear here.
          </p>

        </div>
      ) : (
        <div className="order-history-table-container">

          <table className="order-history-table">

            <thead>
              <tr>
                <th>Symbol</th>
                <th>Type</th>
                <th>Side</th>
                <th>Volume</th>
                <th>Price</th>
                <th>Stop Loss</th>
                <th>Take Profit</th>
                <th>Status</th>
                <th>Created</th>
                <th>Filled</th>
                <th>Closed</th>
              </tr>
            </thead>

            <tbody>

              {orders.map((order) => {

                const isBuy = order.side === "buy";

                return (
                  <tr key={order._id}>

                    <td>
                      <strong>
                        {order.symbol}
                      </strong>
                    </td>

                    <td>
                      {order.type
                        ? order.type.toUpperCase()
                        : "-"}
                    </td>

                    <td>
                      <span
                        className={
                          isBuy
                            ? "order-buy"
                            : "order-sell"
                        }
                      >
                        {isBuy ? "BUY" : "SELL"}
                      </span>
                    </td>

                    <td>
                      {Number(order.volume).toFixed(2)}
                    </td>

                    <td>
                      {formatPrice(order.price)}
                    </td>

                    <td>
                      {order.stopLoss !== null &&
                      order.stopLoss !== undefined
                        ? formatPrice(order.stopLoss)
                        : "-"}
                    </td>

                    <td>
                      {order.takeProfit !== null &&
                      order.takeProfit !== undefined
                        ? formatPrice(order.takeProfit)
                        : "-"}
                    </td>

                    <td>
                      <span
                        className={`order-status order-status-${order.status}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </td>

                    <td>
                      {formatDate(order.createdAt)}
                    </td>

                    <td>
                      {formatDate(order.filledAt)}
                    </td>

                    <td>
                      {formatDate(order.closedAt)}
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

export default OrderHistory;