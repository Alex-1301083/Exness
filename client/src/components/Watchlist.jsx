import { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  Star,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

function Watchlist({
  prices = {},
  selectedSymbol,
  setSelectedSymbol,
  positions = [],
}) {
  const [search, setSearch] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  const instruments = [
    {
      symbol: "BTCUSD",
      display: "BTC",
      name: "Bitcoin",
      decimals: 2,
      change: 0.42,
      fallbackBid: 78747.95,
      fallbackAsk: 78757.95,
      favorite: true,
    },
    {
      symbol: "XAUUSD",
      display: "XAU/USD",
      name: "Gold / US Dollar",
      decimals: 3,
      change: 0.01,
      fallbackBid: 4422.679,
      fallbackAsk: 4422.939,
      favorite: true,
    },
    {
      symbol: "XAGUSD",
      display: "XAG/USD",
      name: "Silver / US Dollar",
      decimals: 3,
      change: 0,
      fallbackBid: 66.560,
      fallbackAsk: 66.590,
      favorite: false,
    },
    {
      symbol: "ETHUSD",
      display: "ETH",
      name: "Ethereum / US Dollar",
      decimals: 2,
      change: 0.39,
      fallbackBid: 2479.57,
      fallbackAsk: 2480.57,
      favorite: false,
    },
    {
      symbol: "USOIL",
      display: "USOIL",
      name: "US Oil",
      decimals: 3,
      change: 0.94,
      fallbackBid: 91.265,
      fallbackAsk: 91.285,
      favorite: true,
    },
    {
      symbol: "USDJPY",
      display: "USD/JPY",
      name: "US Dollar / Japanese Yen",
      decimals: 3,
      change: 0.18,
      fallbackBid: 153.552,
      fallbackAsk: 153.562,
      favorite: false,
    },
    {
      symbol: "EURUSD",
      display: "EUR/USD",
      name: "Euro / US Dollar",
      decimals: 5,
      change: 0.04,
      fallbackBid: 1.16235,
      fallbackAsk: 1.16243,
      favorite: true,
    },
    {
      symbol: "USTEC",
      display: "USTEC",
      name: "US Tech 100",
      decimals: 2,
      change: null,
      fallbackBid: 29710.45,
      fallbackAsk: 29720.45,
      favorite: false,
    },
  ];

  const getPrice = (item) => {
    const live = prices[item.symbol];

    return {
      bid: Number(
        live?.bid ?? item.fallbackBid
      ),
      ask: Number(
        live?.ask ?? item.fallbackAsk
      ),
    };
  };

  const getSignal = (item) => {
    if (item.change === null) {
      return "neutral";
    }

    if (item.change > 0) {
      return "up";
    }

    if (item.change < 0) {
      return "down";
    }

    return "neutral";
  };

  const getSymbolPnl = (symbol) => {
    const symbolPositions = positions.filter(
      (position) =>
        position.symbol === symbol &&
        position.status === "open"
    );

    if (!symbolPositions.length) {
      return null;
    }

    return symbolPositions.reduce(
      (total, position) =>
        total + Number(position.floatingPnl || 0),
      0
    );
  };

  const filteredInstruments = useMemo(() => {
    return instruments.filter((item) => {
      const matchesSearch =
        item.display
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.symbol
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFavorite =
        !favoriteOnly || item.favorite;

      return (
        matchesSearch &&
        matchesFavorite
      );
    });
  }, [search, favoriteOnly]);

  return (
    <aside className="instruments-panel">

      {/* HEADER */}

      <div className="instruments-header">

        <div className="instruments-title">
          <h3>INSTRUMENTS</h3>

          <button
            className="instruments-menu"
            type="button"
          >
            ⋮
          </button>
        </div>

        {/* SEARCH */}

        <div className="instruments-search">

          <Search size={16} />

          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        {/* FAVORITES */}

        <button
          className="favorites-selector"
          type="button"
          onClick={() =>
            setFavoriteOnly(
              (value) => !value
            )
          }
        >
          <span>
            <Star
              size={15}
              fill={
                favoriteOnly
                  ? "currentColor"
                  : "none"
              }
            />

            Favorites
          </span>

          <ChevronDown size={16} />
        </button>

      </div>

      {/* TABLE HEADER */}

      <div className="instrument-table-header">

        <span>Symbol</span>
        <span>Signal</span>
        <span>Bid</span>
        <span>Ask</span>
        <span>1D</span>
        <span>P/L, USD</span>

      </div>

      {/* INSTRUMENT ROWS */}

      <div className="instrument-list">

        {filteredInstruments.map(
          (item) => {
            const price =
              getPrice(item);

            const signal =
              getSignal(item);

            const pnl =
              getSymbolPnl(
                item.symbol
              );

            const isSelected =
              selectedSymbol ===
              item.symbol;

            return (
              <button
                key={item.symbol}
                type="button"
                className={`instrument-row ${
                  isSelected
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setSelectedSymbol(
                    item.symbol
                  )
                }
              >

                {/* SYMBOL */}

                <div className="instrument-symbol">

                  <Star
                    size={12}
                    className={
                      item.favorite
                        ? "favorite-star active"
                        : "favorite-star"
                    }
                    fill={
                      item.favorite
                        ? "currentColor"
                        : "none"
                    }
                  />

                  <div>
                    <strong>
                      {item.display}
                    </strong>

                    <small>
                      {item.name}
                    </small>
                  </div>

                </div>

                {/* SIGNAL */}

                <div className="instrument-signal">

                  {signal === "up" && (
                    <span className="signal-up">
                      <ArrowUp size={14} />
                    </span>
                  )}

                  {signal === "down" && (
                    <span className="signal-down">
                      <ArrowDown size={14} />
                    </span>
                  )}

                  {signal === "neutral" && (
                    <span className="signal-neutral">
                      -
                    </span>
                  )}

                </div>

                {/* BID */}

                <span className="instrument-price">
                  {price.bid.toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits:
                        item.decimals,
                      maximumFractionDigits:
                        item.decimals,
                    }
                  )}
                </span>

                {/* ASK */}

                <span className="instrument-price">
                  {price.ask.toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits:
                        item.decimals,
                      maximumFractionDigits:
                        item.decimals,
                    }
                  )}
                </span>

                {/* 1D CHANGE */}

                <span
                  className={
                    item.change === null
                      ? "change-neutral"
                      : item.change > 0
                      ? "change-positive"
                      : item.change < 0
                      ? "change-negative"
                      : "change-neutral"
                  }
                >
                  {item.change === null
                    ? "-"
                    : `${item.change > 0 ? "+" : ""}${item.change.toFixed(2)}%`}
                </span>

                {/* P/L */}

                <span
                  className={
                    pnl === null
                      ? "pnl-neutral"
                      : pnl >= 0
                      ? "pnl-positive"
                      : "pnl-negative"
                  }
                >
                  {pnl === null
                    ? "-"
                    : `${
                        pnl >= 0
                          ? "+"
                          : "-"
                      }$${Math.abs(
                        pnl
                      ).toFixed(2)}`}
                </span>

              </button>
            );
          }
        )}

      </div>

    </aside>
  );
}

export default Watchlist;