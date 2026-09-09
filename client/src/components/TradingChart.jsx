import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, ColorType } from "lightweight-charts";
import { io } from "socket.io-client";

import api from "../services/api";

function TradingChart({ symbol = "XAUUSD" }) {
  const chartContainerRef = useRef(null);

  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);

  const lastCandleRef = useRef(null);

  const [timeframe, setTimeframe] = useState("1m");
  const [currentPrice, setCurrentPrice] = useState(null);

  const [loading, setLoading] = useState(true);
  const [chartError, setChartError] = useState("");

  // =========================================
  // TIMEFRAMES
  // =========================================

  const timeframes = {
    "1m": 60,
    "5m": 300,
    "15m": 900,
    "1H": 3600,
    "4H": 14400,
    "1D": 86400,
  };

  // =========================================
  // CREATE CHART
  // =========================================

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 580,

      layout: {
        background: {
          type: ColorType.Solid,
          color: "#0f141b",
        },

        textColor: "#9ca3af",
      },

      grid: {
        vertLines: {
          color: "#1c2530",
        },

        horzLines: {
          color: "#1c2530",
        },
      },

      crosshair: {
        mode: 1,
      },

      rightPriceScale: {
        borderColor: "#27313d",

        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },

      timeScale: {
        borderColor: "#27313d",

        timeVisible: true,

        secondsVisible: false,
      },

      handleScroll: {
        mouseWheel: true,

        pressedMouseMove: true,
      },

      handleScale: {
        mouseWheel: true,

        pinch: true,

        axisPressedMouseMove: true,
      },
    });

    // =======================================
    // CANDLESTICK SERIES
    // =======================================

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00c087",

      downColor: "#ff5b6e",

      borderUpColor: "#00c087",

      borderDownColor: "#ff5b6e",

      wickUpColor: "#00c087",

      wickDownColor: "#ff5b6e",
    });

    chartRef.current = chart;

    candleSeriesRef.current = candlestickSeries;

    // =======================================
    // RESPONSIVE RESIZE
    // =======================================

    const resizeObserver = new ResizeObserver(() => {
      if (!chartContainerRef.current) {
        return;
      }

      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    });

    resizeObserver.observe(container);

    // =======================================
    // CLEANUP
    // =======================================

    return () => {
      resizeObserver.disconnect();

      chart.remove();

      chartRef.current = null;

      candleSeriesRef.current = null;
    };
  }, []);

  // =========================================
  // LOAD HISTORICAL CANDLES
  // =========================================

  useEffect(() => {
    let cancelled = false;

    const loadCandles = async () => {
      if (!candleSeriesRef.current) {
        return;
      }

      setLoading(true);

      setChartError("");

      try {
        const response = await api.get(`/market/candles/${symbol}`, {
          params: {
            timeframe,
            limit: 200,
          },
        });

        if (cancelled) return;

        const candles = response.data?.candles || response.data?.data || [];

        // =====================================
        // NO DATABASE CANDLES
        // =====================================

        if (!candles.length) {
          setChartError("Historical candles are not available yet.");

          candleSeriesRef.current.setData([]);

          lastCandleRef.current = null;

          return;
        }

        // =====================================
        // FORMAT CANDLES
        // =====================================

        const formattedCandles = candles
          .map((candle) => ({
            time: Number(candle.time),

            open: Number(candle.open),

            high: Number(candle.high),

            low: Number(candle.low),

            close: Number(candle.close),
          }))
          .filter(
            (candle) =>
              Number.isFinite(candle.time) &&
              Number.isFinite(candle.open) &&
              Number.isFinite(candle.high) &&
              Number.isFinite(candle.low) &&
              Number.isFinite(candle.close),
          );

        // =====================================
        // SET CHART DATA
        // =====================================

        candleSeriesRef.current.setData(formattedCandles);

        if (formattedCandles.length > 0) {
          lastCandleRef.current = formattedCandles[formattedCandles.length - 1];

          setCurrentPrice(formattedCandles[formattedCandles.length - 1].close);
        }

        // =====================================
        // FIT CONTENT
        // =====================================

        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: 500,
          });

          chartRef.current.timeScale().fitContent();
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Historical Candle Error:", error);

        setChartError(
          error.response?.data?.message || "Failed to load chart data.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCandles();

    return () => {
      cancelled = true;
    };
  }, [symbol, timeframe]);

  // =========================================
  // SOCKET.IO LIVE PRICE
  // =========================================

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      transports: ["polling"],
    });

    // =======================================
    // CONNECT
    // =======================================

    socket.on("connect", () => {
      console.log(`Chart connected: ${symbol}`);

      socket.emit("subscribeSymbol", symbol);
    });

    // =======================================
    // LIVE PRICE
    // =======================================

    socket.on("priceUpdate", (data) => {
      if (data.symbol !== symbol || !candleSeriesRef.current) {
        return;
      }

      const price = Number(data.bid);

      if (!Number.isFinite(price)) {
        return;
      }

      setCurrentPrice(price);

      const seconds = timeframes[timeframe];

      const now = Math.floor(Date.now() / 1000);

      const candleTime = Math.floor(now / seconds) * seconds;

      let candle = lastCandleRef.current;

      // ===================================
      // NEW CANDLE
      // ===================================

      if (!candle || candle.time !== candleTime) {
        candle = {
          time: candleTime,

          open: price,

          high: price,

          low: price,

          close: price,
        };
      } else {
        // =================================
        // UPDATE CURRENT CANDLE
        // =================================

        candle = {
          ...candle,

          high: Math.max(candle.high, price),

          low: Math.min(candle.low, price),

          close: price,
        };
      }

      lastCandleRef.current = candle;

      candleSeriesRef.current.update(candle);
    });

    // =======================================
    // SOCKET ERROR
    // =======================================

    socket.on("connect_error", (error) => {
      console.error("Chart Socket Error:", error.message);
    });

    // =======================================
    // CLEANUP
    // =======================================

    return () => {
      socket.emit("unsubscribeSymbol", symbol);

      socket.disconnect();
    };
  }, [symbol, timeframe]);

  // =========================================
  // DECIMAL PLACES
  // =========================================

  const getDecimals = () => {
    switch (symbol) {
      case "BTCUSD":
      case "ETHUSD":
      case "USTEC":
        return 2;

      case "XAUUSD":
      case "XAGUSD":
      case "USOIL":
      case "USDJPY":
        return 3;

      case "EURUSD":
        return 5;

      default:
        return 5;
    }
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div className="real-chart-wrapper">
      {/* =====================================
          CHART TOOLBAR
      ===================================== */}

      <div className="real-chart-toolbar">
        <div className="chart-timeframes">
          {Object.keys(timeframes).map((item) => (
            <button
              key={item}
              type="button"
              className={timeframe === item ? "active" : ""}
              onClick={() => setTimeframe(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="chart-live-price">
          <span>LIVE</span>

          <strong>
            {currentPrice !== null ? currentPrice.toFixed(getDecimals()) : "-"}
          </strong>
        </div>
      </div>

      {/* =====================================
          CHART AREA
      ===================================== */}

      <div ref={chartContainerRef} className="real-chart-container" />

      {/* =====================================
          LOADING
      ===================================== */}

      {loading && <div className="chart-status">Loading chart...</div>}

      {/* =====================================
          ERROR / EMPTY
      ===================================== */}

      {!loading && chartError && (
        <div className="chart-status">{chartError}</div>
      )}
    </div>
  );
}

export default TradingChart;
