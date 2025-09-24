import React, { useEffect, useMemo, useState } from "react";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { motion, animate } from "framer-motion";
import { backendApi, metaApi } from "@/utils/apiClients";
import { setTotalFinalPnL } from "@/redux/user/userSlice";
import { useGetInfoByAccounts } from "../../../hooks/user/UseGetInfoByAccounts";

/* --- Ambient crypto grid (soft) --- */
const AmbientGrid = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage:
          "linear-gradient(rgba(34,197,94,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.2) 1px, transparent 1px)",
        backgroundSize: "42px 42px",
        maskImage:
          "radial-gradient(ellipse at center, black 55%, transparent 85%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 55%, transparent 85%)",
      }}
    />
  </div>
);

/* --- Animated number --- */
const AnimatedNumber = ({ value = 0, decimals = 0, suffix = "" }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, Number(value || 0), {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value]);
  return (
    <span>
      {Number(display).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

/* --- Card shell --- */
const NeonCard = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 18, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -3 }}
    className="group relative overflow-hidden rounded-2xl
               bg-gradient-to-br from-slate-950 via-slate-900/60 to-slate-950
               border border-emerald-400/25 shadow-[0_0_60px_rgba(16,185,129,0.08)] p-4"
  >
    {/* inner glow border */}
    <div className="pointer-events-none absolute inset-px rounded-[calc(1rem-1px)] bg-gradient-to-br from-emerald-300/5 via-cyan-300/5 to-indigo-300/5" />
    {/* sheen */}
    <span className="pointer-events-none absolute -inset-x-8 -top-1/2 h-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    {children}
  </motion.div>
);

const UserDashboardBalanceCards = () => {
  const totalFinalPnL = useSelector((store) => store.user.totalFinalPnL);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);

  const loggedUser = useSelector((store) => store.user.loggedUser);
  const accountIds =
    loggedUser?.accounts?.map((acc) => +acc.accountNumber) || [];
  useGetInfoByAccounts(accountIds, "accounts");
  const { accountsStats } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const isPositive = parseFloat(totalFinalPnL) >= 0;

  const fetchAccountsInfo = async () => {
    try {
      let Balance = 0;
      for (const account of loggedUser?.accounts || []) {
        const res = await metaApi.get(
          `/GetUserInfo?Manager_Index=${
            import.meta.env.VITE_MANAGER_INDEX
          }&MT5Account=${account.accountNumber}`
        );
        Balance += Number(res.data.Equity);
      }
      dispatch(setTotalFinalPnL(Balance.toFixed(2)));
    } catch (error) {
      console.error("Error fetching accounts info:", error);
    }
  };

  const fetchTotalDeposits = async () => {
    try {
      const res = await backendApi.get(`/deposit/${loggedUser._id}`);
      const balance = (res.data?.data || []).reduce(
        (total, current) => total + Number(current.deposit || 0),
        0
      );
      setTotalDeposits(balance);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTotalWithdrawals = async () => {
    try {
      const res = await backendApi.get(`/withdrawals/${loggedUser._id}`);
      const balance = (res.data?.data || []).reduce(
        (total, current) => total + Number(current.amount || 0),
        0
      );
      setTotalWithdrawals(balance);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTotalDeposits();
    fetchTotalWithdrawals();
    const fetchBalance = setInterval(() => {
      fetchAccountsInfo();
    }, 4000);
    return () => clearInterval(fetchBalance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = useMemo(() => {
    const equity = Number(accountsStats?.totalEquity || 0);
    return [
      {
        title: "Total MT5 Accounts",
        value: loggedUser?.accounts?.length || 0,
        decimals: 0,
        Icon: Coins,
        accent: "from-emerald-500/20 to-cyan-500/20",
      },
      {
        title: "Available Balance",
        value: equity,
        decimals: 2,
        suffix: " USD",
        Icon: isPositive ? TrendingUp : TrendingDown,
        accent: isPositive
          ? "from-emerald-500/25 to-emerald-400/10"
          : "from-red-500/25 to-red-400/10",
      },
      {
        title: "Total Deposits",
        value: totalDeposits,
        decimals: 2,
        suffix: " USD",
        Icon: ArrowUpCircle,
        accent: "from-blue-500/25 to-indigo-500/15",
      },
      {
        title: "Total Withdrawals",
        value: totalWithdrawals,
        decimals: 2,
        suffix: " USD",
        Icon: ArrowDownCircle,
        accent: "from-purple-500/25 to-fuchsia-500/15",
      },
      // Keep your existing placeholders; swap to real values later
      {
        title: "Total Transfer",
        value: totalWithdrawals,
        decimals: 2,
        suffix: " USD",
        Icon: ArrowDownCircle,
        accent: "from-teal-500/25 to-cyan-500/15",
      },
      {
        title: "Total IB",
        value: totalWithdrawals,
        decimals: 2,
        suffix: " USD",
        Icon: ArrowDownCircle,
        accent: "from-sky-500/25 to-blue-500/15",
      },
    ];
  }, [accountsStats?.totalEquity, isPositive, loggedUser?.accounts, totalDeposits, totalWithdrawals]);

  return (
    <div className="relative">
      <AmbientGrid />
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-4
                   rounded-2xl border border-emerald-400/20 bg-gradient-to-br
                   from-gray-900/60 via-black/60 to-gray-900/60 backdrop-blur-xl text-white"
      >
        {cards.map((c, i) => (
          <NeonCard key={c.title} delay={i * 0.05}>
            <div className="relative flex items-center gap-4">
              {/* icon bubble */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border border-white/10
                            bg-gradient-to-br ${c.accent} shadow-inner`}
              >
                <c.Icon className="text-white" size={20} />
              </motion.div>

              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-white/60">
                  {c.title}
                </p>
                <p className="text-lg font-extrabold leading-tight">
                  <AnimatedNumber
                    value={c.value}
                    decimals={c.decimals}
                    suffix={c.suffix || ""}
                  />
                </p>
              </div>
            </div>

            {/* bottom glow line */}
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.9, delay: 0.15 + i * 0.05 }}
              className="mt-4 h-[2px] rounded-full bg-gradient-to-r from-emerald-400/60 via-cyan-400/60 to-indigo-400/60"
            />
          </NeonCard>
        ))}
      </div>
    </div>
  );
};

export default UserDashboardBalanceCards;
