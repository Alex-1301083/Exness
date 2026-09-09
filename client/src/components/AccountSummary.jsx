import {
  WalletCards,
  TrendingUp,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

import { useEffect, useState } from "react";

import api from "../services/api";

function AccountSummary() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadAccount = async () => {
      try {
        const response = await api.get("/account/me");

        if (
          mounted &&
          response.data?.success
        ) {
          setAccount(response.data.account);
        }
      } catch (error) {
        console.error(
          "Account Summary Error:",
          error
        );
      }
    };

    loadAccount();

    const interval = setInterval(
      loadAccount,
      1000
    );

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const balance = Number(
    account?.balance ?? 10000
  );

  const equity = Number(
    account?.equity ?? balance
  );

  const margin = Number(
    account?.margin ?? 0
  );

  const freeMargin = Number(
    account?.freeMargin ??
      equity - margin
  );

  const leverage = Number(
    account?.leverage ?? 100
  );

  const floatingPnl =
    equity - balance;

  const formatMoney = (value) => {
    return `$${Number(value).toFixed(2)}`;
  };

  return (
    <div className="compact-account-bar">

      {/* ACCOUNT */}
      <div className="compact-account-info">
        <div className="compact-account-icon">
          <WalletCards size={20} />
        </div>

        <div>
          <strong>Trading Account</strong>

          <span>
            {account?.accountNumber ||
              "TX59275899"}
          </span>
        </div>
      </div>

      {/* ACCOUNT TYPE */}
      <div className="compact-account-type">
        <span>Demo</span>
        <strong>
          1:{leverage}
        </strong>
      </div>

      {/* BALANCE */}
      <div className="compact-stat">
        <div className="compact-stat-icon">
          <WalletCards size={17} />
        </div>

        <div>
          <span>Balance</span>
          <strong>
            {formatMoney(balance)}
          </strong>
        </div>
      </div>

      {/* EQUITY */}
      <div className="compact-stat">
        <div className="compact-stat-icon">
          <TrendingUp size={17} />
        </div>

        <div>
          <span>Equity</span>
          <strong>
            {formatMoney(equity)}
          </strong>
        </div>
      </div>

      {/* MARGIN */}
      <div className="compact-stat">
        <div className="compact-stat-icon">
          <BarChart3 size={17} />
        </div>

        <div>
          <span>Margin</span>
          <strong>
            {formatMoney(margin)}
          </strong>
        </div>
      </div>

      {/* FREE MARGIN */}
      <div className="compact-stat">
        <div className="compact-stat-icon">
          <ShieldCheck size={17} />
        </div>

        <div>
          <span>Free Margin</span>
          <strong>
            {formatMoney(freeMargin)}
          </strong>
        </div>
      </div>

      {/* P/L */}
      <div className="compact-pnl">
        <span>Floating P/L</span>

        <strong
          className={
            floatingPnl >= 0
              ? "compact-pnl-positive"
              : "compact-pnl-negative"
          }
        >
          {floatingPnl >= 0 ? "+" : ""}
          {formatMoney(floatingPnl)}
        </strong>
      </div>
    </div>
  );
}

export default AccountSummary;