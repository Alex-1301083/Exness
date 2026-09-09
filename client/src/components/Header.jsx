import { useState } from "react";

import {
  Menu,
  Plus,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Wallet,
  Settings,
  X,
  CircleDollarSign,
  Bitcoin,
  Gem,
  Fuel,
  BarChart3,
} from "lucide-react";

function Header({
  user,
  account,
  symbols,
  prices,
  selectedSymbol,
  setSelectedSymbol,
  handleLogout,
  onMenuClick,
}) {
  const [showInstruments, setShowInstruments] = useState(false);
  const [showNotifications, setShowNotifications] =
    useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);

  const visibleSymbols = [
    "USOIL",
    "XAUUSD",
    "BTCUSD",
    "ETHUSD",
  ];

  const getPrice = (symbol) => {
    const price = prices?.[symbol];

    if (!price) return "--";

    const decimals =
      symbol === "EURUSD"
        ? 5
        : [
              "XAUUSD",
              "XAGUSD",
              "USOIL",
              "USDJPY",
            ].includes(symbol)
          ? 3
          : 2;

    return Number(price.bid).toFixed(decimals);
  };

  const getIcon = (symbol) => {
    switch (symbol) {
      case "BTCUSD":
        return <Bitcoin size={25} />;

      case "XAUUSD":
        return <Gem size={24} />;

      case "XAGUSD":
        return <CircleDollarSign size={24} />;

      case "USOIL":
        return <Fuel size={24} />;

      case "USDJPY":
        return <CircleDollarSign size={24} />;

      case "EURUSD":
        return <CircleDollarSign size={24} />;

      case "USTEC":
        return <BarChart3 size={24} />;

      case "ETHUSD":
        return <Gem size={24} />;

      default:
        return <CircleDollarSign size={24} />;
    }
  };

  const formatSymbol = (symbol) => {
    if (symbol === "XAUUSD") return "XAU/USD";
    if (symbol === "XAGUSD") return "XAG/USD";
    if (symbol === "BTCUSD") return "BTC";
    if (symbol === "ETHUSD") return "ETH";
    if (symbol === "USOIL") return "USOIL";
    if (symbol === "USDJPY") return "USD/JPY";
    if (symbol === "EURUSD") return "EUR/USD";
    if (symbol === "USTEC") return "USTEC";

    return symbol;
  };

  const selectInstrument = (symbol) => {
    setSelectedSymbol(symbol);
    setShowInstruments(false);
  };

  return (
    <>
      <header className="tradex-main-header">

        {/* =========================
            LEFT
        ========================= */}

        <div className="tradex-header-left">

          <button
            className="header-menu-button"
            type="button"
            onClick={onMenuClick}
            title="Menu"
          >
            <Menu size={27} />
          </button>

          <div className="tradex-brand">
            Trade<span>X</span>
          </div>

        </div>

        {/* =========================
            INSTRUMENTS
        ========================= */}

        <div className="header-instruments">

          {visibleSymbols.map((symbol) => {
            const active =
              selectedSymbol === symbol;

            return (
              <button
                key={symbol}
                type="button"
                className={`header-instrument ${
                  active ? "active" : ""
                }`}
                onClick={() =>
                  selectInstrument(symbol)
                }
              >
                <div className="instrument-icon">
                  {getIcon(symbol)}
                </div>

                <div className="instrument-info">
                  <strong>
                    {formatSymbol(symbol)}
                  </strong>

                  <span>
                    {getPrice(symbol)}
                  </span>
                </div>
              </button>
            );
          })}

          {/* PLUS */}

          <div className="instrument-plus-wrapper">

            <button
              type="button"
              className="instrument-plus"
              onClick={() =>
                setShowInstruments(
                  !showInstruments
                )
              }
              title="Add instrument"
            >
              <Plus size={27} />
            </button>

            {showInstruments && (
              <div className="instrument-dropdown">

                <div className="dropdown-title">
                  Instruments
                </div>

                {symbols.map((item) => {
                  const symbol = item.symbol;

                  return (
                    <button
                      key={symbol}
                      type="button"
                      className={
                        selectedSymbol === symbol
                          ? "dropdown-instrument active"
                          : "dropdown-instrument"
                      }
                      onClick={() =>
                        selectInstrument(symbol)
                      }
                    >
                      <div className="dropdown-icon">
                        {getIcon(symbol)}
                      </div>

                      <div>
                        <strong>
                          {formatSymbol(symbol)}
                        </strong>

                        <span>
                          {item.name}
                        </span>
                      </div>

                      <b>
                        {getPrice(symbol)}
                      </b>
                    </button>
                  );
                })}

              </div>
            )}
          </div>
        </div>

        {/* =========================
            RIGHT
        ========================= */}

        <div className="tradex-header-right">

          {/* DEMO ACCOUNT */}

          <button
            type="button"
            className="demo-account"
            onClick={() =>
              setShowDeposit(false)
            }
          >
            <div className="account-type">
              <span className="demo-badge">
                Demo
              </span>

              <span className="standard-text">
                Standard
              </span>
            </div>

            <div className="account-money">
              $
              {account?.balance !== undefined
                ? Number(account.balance).toFixed(2)
                : "10000.00"}

              <ChevronDown size={15} />
            </div>
          </button>

          {/* NOTIFICATION */}

          <div className="header-action-wrapper">

            <button
              type="button"
              className="header-action-button"
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
              title="Notifications"
            >
              <Bell size={24} />

              <span className="notification-dot">
                2
              </span>
            </button>

            {showNotifications && (
              <div className="header-popup notification-popup">

                <div className="popup-header">
                  <strong>
                    Notifications
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      setShowNotifications(false)
                    }
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="notification-item">
                  <div className="notification-icon">
                    <Wallet size={17} />
                  </div>

                  <div>
                    <strong>
                      Account ready
                    </strong>

                    <p>
                      Your demo trading account is active.
                    </p>

                    <small>
                      Just now
                    </small>
                  </div>
                </div>

                <div className="notification-item">
                  <div className="notification-icon">
                    <BarChart3 size={17} />
                  </div>

                  <div>
                    <strong>
                      Markets are live
                    </strong>

                    <p>
                      Live prices are connected.
                    </p>

                    <small>
                      Today
                    </small>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* PROFILE */}

          <div className="header-action-wrapper">

            <button
              type="button"
              className="profile-button"
              onClick={() =>
                setShowProfile(!showProfile)
              }
              title="Profile"
            >
              <div className="profile-avatar">
                <User size={22} />
              </div>

              <div className="profile-text">
                <strong>
                  {user?.name || "Trader"}
                </strong>

                <span>
                  {account?.accountNumber ||
                    "Trading Account"}
                </span>
              </div>

              <ChevronDown size={15} />
            </button>

            {showProfile && (
              <div className="header-popup profile-popup">

                <div className="profile-popup-user">

                  <div className="large-avatar">
                    <User size={27} />
                  </div>

                  <div>
                    <strong>
                      {user?.name || "Trader"}
                    </strong>

                    <span>
                      {user?.email || ""}
                    </span>
                  </div>

                </div>

                <div className="popup-divider" />

                <button
                  type="button"
                  className="popup-menu-item"
                  onClick={() =>
                    alert(
                      "Profile settings will be available here."
                    )
                  }
                >
                  <Settings size={18} />
                  Profile Settings
                </button>

                <button
                  type="button"
                  className="popup-menu-item logout-item"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  Logout
                </button>

              </div>
            )}

          </div>

          {/* DEPOSIT */}

          <button
            type="button"
            className="deposit-button"
            onClick={() =>
              setShowDeposit(true)
            }
          >
            Deposit
          </button>

        </div>

      </header>

      {/* =========================
          DEPOSIT MODAL
      ========================= */}

      {showDeposit && (
        <div
          className="deposit-overlay"
          onClick={() =>
            setShowDeposit(false)
          }
        >
          <div
            className="deposit-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="deposit-modal-header">

              <div>
                <h2>Deposit Funds</h2>

                <p>
                  Add funds to your trading account.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowDeposit(false)
                }
              >
                <X size={20} />
              </button>

            </div>

            <div className="deposit-balance">
              <span>
                Current Balance
              </span>

              <strong>
                $
                {account?.balance !== undefined
                  ? Number(
                      account.balance
                    ).toFixed(2)
                  : "10000.00"}
              </strong>
            </div>

            <label>
              Deposit Amount
            </label>

            <input
              type="number"
              placeholder="Enter amount"
              min="1"
            />

            <button
              type="button"
              className="deposit-confirm"
              onClick={() => {
                alert(
                  "Deposit system will be connected to payment gateway here."
                );

                setShowDeposit(false);
              }}
            >
              Continue Deposit
            </button>

            <small className="deposit-note">
              Demo mode: no real money is processed.
            </small>

          </div>
        </div>
      )}
    </>
  );
}

export default Header;