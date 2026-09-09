import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import EconomicCalendar from "../components/EconomicCalendar";
import TradingChart from "../components/TradingChart";
import PositionsTable from "../components/PositionsTable";
import TradeHistory from "../components/TradeHistory";
import OrderHistory from "../components/OrderHistory";
import Watchlist from "../components/Watchlist";
import ScriptEditor from "../components/ScriptEditor";

import {
  TrendingDown,
  TrendingUp,
  X,
  ChevronDown,
} from "lucide-react";

import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);

  const [selectedSymbol, setSelectedSymbol] =
    useState("XAUUSD");

  const [activeSection, setActiveSection] =
    useState("markets");

  const [prices, setPrices] = useState({
    BTCUSD: {
      bid: 78747.95,
      ask: 78757.95,
    },

    XAUUSD: {
      bid: 4398.547,
      ask: 4398.807,
    },

    XAGUSD: {
      bid: 66.56,
      ask: 66.59,
    },

    ETHUSD: {
      bid: 2479.57,
      ask: 2480.57,
    },

    USOIL: {
      bid: 91.265,
      ask: 91.285,
    },

    USDJPY: {
      bid: 153.552,
      ask: 153.562,
    },

    EURUSD: {
      bid: 1.16235,
      ask: 1.16243,
    },

    USTEC: {
      bid: 29710.45,
      ask: 29720.45,
    },
  });

  const [positions, setPositions] = useState([]);

  const [volume, setVolume] =
    useState("0.01");

  const [stopLoss, setStopLoss] =
    useState("");

  const [takeProfit, setTakeProfit] =
    useState("");

  const [orderLoading, setOrderLoading] =
    useState(false);

  const [orderMessage, setOrderMessage] =
    useState("");

  const [orderError, setOrderError] =
    useState("");

  const symbols = [
    {
      symbol: "BTCUSD",
      name: "Bitcoin / US Dollar",
    },
    {
      symbol: "XAUUSD",
      name: "Gold / US Dollar",
    },
    {
      symbol: "XAGUSD",
      name: "Silver / US Dollar",
    },
    {
      symbol: "ETHUSD",
      name: "Ethereum / US Dollar",
    },
    {
      symbol: "USOIL",
      name: "US Oil",
    },
    {
      symbol: "USDJPY",
      name: "US Dollar / Japanese Yen",
    },
    {
      symbol: "EURUSD",
      name: "Euro / US Dollar",
    },
    {
      symbol: "USTEC",
      name: "US Tech 100",
    },
  ];

  /* =========================================
     LOAD DATA
  ========================================= */

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const loadUser = async () => {
      try {
        const response =
          await api.get("/auth/me");

        if (response.data?.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error(
          "User API Error:",
          error,
        );

        localStorage.removeItem("token");

        navigate("/login");
      }
    };

    const loadAccount = async () => {
      try {
        const response =
          await api.get("/account/me");

        if (response.data?.success) {
          setAccount(
            response.data.account,
          );
        }
      } catch (error) {
        console.error(
          "Account API Error:",
          error,
        );
      }
    };

    const loadPositions = async () => {
      try {
        const response =
          await api.get("/positions");

        if (response.data?.success) {
          setPositions(
            response.data.positions || [],
          );
        }
      } catch (error) {
        console.error(
          "Positions API Error:",
          error,
        );
      }
    };

    loadUser();
    loadAccount();
    loadPositions();

    /* =======================================
       SOCKET
    ======================================= */

    const socket = io(
      "http://localhost:5000",
      {
        transports: ["polling"],
      },
    );

    socket.on("connect", () => {
      console.log(
        "Connected to Tradex Socket",
      );

      symbols.forEach((item) => {
        socket.emit(
          "subscribeSymbol",
          item.symbol,
        );
      });
    });

    socket.on(
      "priceUpdate",
      (data) => {
        if (!data?.symbol) {
          return;
        }

        setPrices((previous) => ({
          ...previous,

          [data.symbol]: {
            bid: Number(data.bid),
            ask: Number(data.ask),
          },
        }));
      },
    );

    socket.on(
      "priceError",
      (data) => {
        console.error(
          "Price Feed Error:",
          data?.message,
        );
      },
    );

    socket.on(
      "connect_error",
      (error) => {
        console.error(
          "Socket Error:",
          error.message,
        );
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("account");

    navigate("/login", {
      replace: true,
    });
  };

  /* =========================================
     CURRENT PRICE
  ========================================= */

  const currentPrice =
    prices[selectedSymbol];

  const getPriceDecimals = () => {
    switch (selectedSymbol) {
      case "XAUUSD":
      case "XAGUSD":
      case "USOIL":
      case "USDJPY":
        return 3;

      case "EURUSD":
        return 5;

      default:
        return 2;
    }
  };

  /* =========================================
     REFRESH POSITIONS
  ========================================= */

  const refreshPositions = async () => {
    try {
      const response =
        await api.get("/positions");

      if (response.data?.success) {
        setPositions(
          response.data.positions || [],
        );
      }
    } catch (error) {
      console.error(
        "Position Refresh Error:",
        error,
      );
    }
  };

  /* =========================================
     PLACE ORDER
  ========================================= */

  const placeOrder = async (side) => {
    if (!currentPrice) {
      setOrderError(
        "Market price is not available",
      );

      return;
    }

    if (
      !volume ||
      Number(volume) <= 0
    ) {
      setOrderError(
        "Please enter a valid volume",
      );

      return;
    }

    setOrderLoading(true);
    setOrderMessage("");
    setOrderError("");

    try {
      const response =
        await api.post("/orders", {
          symbol: selectedSymbol,
          side,
          volume: Number(volume),

          stopLoss: stopLoss
            ? Number(stopLoss)
            : null,

          takeProfit: takeProfit
            ? Number(takeProfit)
            : null,
        });

      console.log(
        "Order response:",
        response.data,
      );

      setOrderMessage(
        `${side.toUpperCase()} order placed successfully`,
      );

      try {
        const accountResponse =
          await api.get("/account/me");

        if (
          accountResponse.data?.success
        ) {
          setAccount(
            accountResponse.data.account,
          );
        }
      } catch (error) {
        console.error(
          "Account refresh error:",
          error,
        );
      }

      await refreshPositions();

      setStopLoss("");
      setTakeProfit("");
    } catch (error) {
      console.error(
        "Order Error:",
        error,
      );

      setOrderError(
        error.response?.data?.message ||
          "Order could not be placed",
      );
    } finally {
      setOrderLoading(false);
    }
  };

  const handleBuy = () => {
    placeOrder("buy");
  };

  const handleSell = () => {
    placeOrder("sell");
  };

  const selectedSymbolData =
    symbols.find(
      (item) =>
        item.symbol === selectedSymbol,
    );

  /* =========================================
     MAIN
  ========================================= */

  return (
    <div className="terminal">
      <Header
        user={user}
        account={account}
        symbols={symbols}
        prices={prices}
        selectedSymbol={selectedSymbol}
        setSelectedSymbol={
          setSelectedSymbol
        }
        handleLogout={handleLogout}
        onMenuClick={() => {}}
      />

      <div className="terminal-body">
        <Sidebar
          activeSection={activeSection}
          onSelect={setActiveSection}
        />

        <main className="trading-terminal-workspace">

          {/* ==================================
              CALENDAR
          ================================== */}

          {activeSection === "calendar" ? (
            <div className="terminal-section-page">
              <EconomicCalendar />
            </div>
          ) : activeSection === "history" ? (
            <div className="terminal-history-page">

              <div className="terminal-page-card">
                <h2>Trade History</h2>
                <TradeHistory />
              </div>

              <div className="terminal-page-card">
                <h2>Order History</h2>
                <OrderHistory />
              </div>

            </div>
          ) : (
            <>
              {/* ==================================
                  MAIN TERMINAL GRID
              ================================== */}

              <div className="terminal-main-grid">

                {/* =================================
                    LEFT
                ================================= */}

                <aside className="terminal-left-panel">

                  {activeSection === "tools" ? (
                    <ScriptEditor />
                  ) : (
                    <Watchlist
                      prices={prices}
                      selectedSymbol={
                        selectedSymbol
                      }
                      setSelectedSymbol={
                        setSelectedSymbol
                      }
                      positions={positions}
                    />
                  )}

                </aside>

                {/* =================================
                    CENTER
                ================================= */}

                <section className="terminal-center-panel">

                  {/* CHART */}

                  <div className="terminal-chart-card">

                    <div className="terminal-chart-topbar">

                      <div className="terminal-chart-symbol">
                        <span className="gold-dot">
                          ◉
                        </span>

                        <strong>
                          {selectedSymbol ===
                          "XAUUSD"
                            ? "Gold vs US Dollar"
                            : selectedSymbolData?.name}
                        </strong>

                        <span className="chart-timeframe">
                          · 1
                        </span>
                      </div>

                      <div className="terminal-chart-price">
                        <span>
                          O{" "}
                          {currentPrice?.bid
                            ? Number(
                                currentPrice.bid,
                              ).toFixed(
                                getPriceDecimals(),
                              )
                            : "-"}
                        </span>

                        <span>
                          H{" "}
                          {currentPrice?.ask
                            ? Number(
                                currentPrice.ask,
                              ).toFixed(
                                getPriceDecimals(),
                              )
                            : "-"}
                        </span>

                        <span>
                          L{" "}
                          {currentPrice?.bid
                            ? Number(
                                currentPrice.bid,
                              ).toFixed(
                                getPriceDecimals(),
                              )
                            : "-"}
                        </span>

                        <strong>
                          C{" "}
                          {currentPrice?.bid
                            ? Number(
                                currentPrice.bid,
                              ).toFixed(
                                getPriceDecimals(),
                              )
                            : "-"}
                        </strong>
                      </div>

                    </div>

                    <TradingChart
                      symbol={selectedSymbol}
                    />

                  </div>

                  {/* POSITIONS */}

                  <div className="terminal-positions-card">

                    <div className="positions-tabs">

                      <button
                        className="active"
                        type="button"
                      >
                        Open
                        <span>
                          {positions.length}
                        </span>
                      </button>

                      <button type="button">
                        Pending
                      </button>

                      <button type="button">
                        Closed
                      </button>

                      <div className="positions-tools">
                        <button type="button">
                          ◈
                        </button>

                        <button type="button">
                          ⋮
                        </button>

                        <button type="button">
                          ×
                        </button>
                      </div>

                    </div>

                    <div className="positions-table-heading">

                      <span>Symbol</span>
                      <span>Type</span>
                      <span>
                        Volume, Lot
                      </span>
                      <span>
                        Open price
                      </span>
                      <span>
                        P/L, USD
                      </span>
                      <span />

                    </div>

                    <div className="terminal-position-content">
                      <PositionsTable />
                    </div>

                  </div>

                </section>

                {/* =================================
                    RIGHT ORDER PANEL
                ================================= */}

                <aside className="terminal-order-panel">

                  <div className="terminal-order-header">

                    <div className="terminal-order-symbol">
                      <span className="gold-dot">
                        ◉
                      </span>

                      <strong>
                        {selectedSymbol ===
                        "XAUUSD"
                          ? "XAU/USD"
                          : selectedSymbol}
                      </strong>
                    </div>

                    <button type="button">
                      <X size={18} />
                    </button>

                  </div>

                  {/* FORM TYPE */}

                  <button
                    className="order-form-selector"
                    type="button"
                  >
                    <span>
                      Regular form
                    </span>

                    <ChevronDown
                      size={17}
                    />
                  </button>

                  {/* BUY SELL */}

                  <div className="terminal-buy-sell">

                    <button
                      type="button"
                      className="terminal-sell"
                      onClick={handleSell}
                      disabled={
                        orderLoading
                      }
                    >
                      <span>
                        Sell
                      </span>

                      <strong>
                        {currentPrice?.bid
                          ? Number(
                              currentPrice.bid,
                            ).toFixed(
                              getPriceDecimals(),
                            )
                          : "-"}
                      </strong>
                    </button>

                    <button
                      type="button"
                      className="terminal-buy"
                      onClick={handleBuy}
                      disabled={
                        orderLoading
                      }
                    >
                      <span>
                        Buy
                      </span>

                      <strong>
                        {currentPrice?.ask
                          ? Number(
                              currentPrice.ask,
                            ).toFixed(
                              getPriceDecimals(),
                            )
                          : "-"}
                      </strong>
                    </button>

                  </div>

                  {/* SPREAD */}

                  <div className="terminal-spread">
                    <span>
                      49%
                    </span>

                    <div>
                      <i />
                      <i />
                    </div>

                    <span>
                      51%
                    </span>
                  </div>

                  {/* TABS */}

                  <div className="terminal-order-tabs">

                    <button
                      className="active"
                      type="button"
                    >
                      Market
                    </button>

                    <button type="button">
                      Pending
                    </button>

                  </div>

                  {/* FORM */}

                  <div className="terminal-order-form">

                    <label>
                      Volume
                    </label>

                    <div className="terminal-control">

                      <input
                        value={volume}
                        onChange={(event) =>
                          setVolume(
                            event.target
                              .value,
                          )
                        }
                      />

                      <span>
                        Lots
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setVolume(
                            Math.max(
                              0.01,
                              Number(
                                volume,
                              ) - 0.01,
                            ).toFixed(2),
                          )
                        }
                      >
                        −
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setVolume(
                            (
                              Number(
                                volume,
                              ) + 0.01
                            ).toFixed(2),
                          )
                        }
                      >
                        +
                      </button>

                    </div>

                    <label>
                      Take Profit
                    </label>

                    <div className="terminal-control">

                      <input
                        placeholder="Not set"
                        value={takeProfit}
                        onChange={(event) =>
                          setTakeProfit(
                            event.target
                              .value,
                          )
                        }
                      />

                      <span>
                        Price
                      </span>

                      <button type="button">
                        −
                      </button>

                      <button type="button">
                        +
                      </button>

                    </div>

                    <label>
                      Stop Loss
                    </label>

                    <div className="terminal-control">

                      <input
                        placeholder="Not set"
                        value={stopLoss}
                        onChange={(event) =>
                          setStopLoss(
                            event.target
                              .value,
                          )
                        }
                      />

                      <span>
                        Price
                      </span>

                      <button type="button">
                        −
                      </button>

                      <button type="button">
                        +
                      </button>

                    </div>

                    {orderMessage && (
                      <div className="terminal-success">
                        ✓ {orderMessage}
                      </div>
                    )}

                    {orderError && (
                      <div className="terminal-error">
                        ✕ {orderError}
                      </div>
                    )}

                  </div>

                </aside>

              </div>

              {/* ==================================
                  BOTTOM ACCOUNT BAR
              ================================== */}

              <div className="terminal-bottom-bar">

                <div>
                  <span>
                    Equity:
                  </span>

                  <strong>
                    {Number(
                      account?.balance || 9515.07,
                    ).toFixed(2)}{" "}
                    USD
                  </strong>
                </div>

                <div>
                  <span>
                    Free Margin:
                  </span>

                  <strong>
                    {Number(
                      account?.balance || 9513.05,
                    ).toFixed(2)}{" "}
                    USD
                  </strong>
                </div>

                <div className="bottom-spacer" />

                <div>
                  <span>
                    Total P/L, USD:
                  </span>

                  <strong className="bottom-loss">
                    -19.08
                  </strong>
                </div>

                <button
                  type="button"
                  className="close-all-button"
                >
                  Close all
                  <ChevronDown size={16} />
                </button>

              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;