import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import {
  RefreshCcw,
  Sparkles,
  ArrowDownToLine,
  ArrowUpToLine,
  Repeat2,
  Search,
} from "lucide-react";
import ModernHeading from "../lib/ModernHeading";
import DynamicLoder from "../Loader/DynamicLoder";
import { backendApi, metaApi } from "../../utils/apiClients";
import { FloatingParticles } from "../../utils/FloatingParticles";
import { AnimatedGrid } from "../../utils/AnimatedGrid";
import { FloatingOrbs } from "../../utils/FloatingOrbs";


/* ------------------------------ Helpers ---------------------------- */
function formatDate(iso) {
  if (!iso) return "N/A";
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return `${date}, ${time}`;
}

function money(n) {
  const num = Number(n ?? 0);
  return isFinite(num)
    ? num.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "0";
}

function getStatusStyle(status) {
  const s = (status || "").toLowerCase();
  if (s === "approved")
    return "bg-green-500/20 text-green-400 border border-green-500/40";
  if (s === "pending")
    return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40";
  if (s === "rejected")
    return "bg-red-500/20 text-red-400 border border-red-500/40";
  return "bg-gray-500/20 text-gray-400 border border-gray-500/40";
}

/* ----------------------------- UI Bits ----------------------------- */
const EmptyState = ({
  title = "No data",
  subtitle = "Try another tab or date range.",
}) => (
  <div className="text-center py-10">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-3">
      ⚪
    </div>
    <p className="text-white/90 font-semibold">{title}</p>
    <p className="text-white/60 text-sm">{subtitle}</p>
  </div>
);

const StatTile = ({ label, value, prefix = "", hint }) => (
  <motion.div
    whileHover={{ y: -3 }}
    className="rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-slate-950/80 via-slate-900/30 to-slate-950/80 p-4"
  >
    <div className="text-xs text-white/60">{label}</div>
    <div className="text-xl font-extrabold mt-0.5">
      {prefix}
      {value}
    </div>
    {hint ? <div className="text-[11px] text-white/50 mt-1">{hint}</div> : null}
  </motion.div>
);

const SkeletonRow = ({ cols = 8 }) => (
  <tr className="border-b border-white/10">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="p-3">
        <div className="h-4 w-full rounded bg-white/10 animate-pulse" />
      </td>
    ))}
  </tr>
);

/* -------------------------- Anim Variants -------------------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, when: "beforeChildren", staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, rotateX: -15 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { type: "spring", stiffness: 100, damping: 15, duration: 0.8 },
  },
  hover: { y: -5, rotateX: 5, transition: { duration: 0.3 } },
};

const glowVariants = {
  initial: { boxShadow: "0 0 20px rgba(0, 255, 136, 0.3)" },
  animate: {
    boxShadow: [
      "0 0 20px rgba(0, 255, 136, 0.3)",
      "0 0 44px rgba(0, 255, 136, 0.6)",
      "0 0 20px rgba(0, 255, 136, 0.3)",
    ],
    transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
  },
};

const tabVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 220, damping: 20 },
  },
  tap: { scale: 0.96 },
};

/* ----------------------------- Component --------------------------- */
export default function UserTransaction() {
  const [activeTab, setActiveTab] = useState("deposit"); // deposit | withdrawal | account
  const [transactionData, setTransactionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [q, setQ] = useState(""); // quick filter

  const loggedUser = useSelector((s) => s?.user?.loggedUser);

  const loggedAccountNumbers = useMemo(
    () =>
      (loggedUser?.accounts || [])
        .map((a) => Number(a?.accountNumber))
        .filter(Boolean),
    [loggedUser]
  );

  async function fetchTransactionData(tradeType, signal) {
    setLoading(true);
    setError(null);
    try {
      if (!loggedUser?._id) {
        setTransactionData([]);
        setError("Please sign in to view your transactions.");
        return;
      }

      let res;
      if (tradeType === "withdrawal") {
        res = await backendApi.get(`/withdrawals/${loggedUser._id}`, {
          signal,
        });
      } else if (tradeType === "deposit") {
        res = await backendApi.get(`/deposit/${loggedUser._id}`, { signal });
      } else if (tradeType === "account") {
        if (!loggedAccountNumbers.length) {
          setTransactionData([]);
          setError("No linked MT5 accounts found.");
          return;
        }
        res = await metaApi.post(
          `/TransactionHistoryByAccounts`,
          {
            Manager_Index: import.meta.env.VITE_MANAGER_INDEX,
            MT5Accounts: loggedAccountNumbers,
            StartTime: "2021-05-01 00:00:00",
            EndTime: "2028-06-30 23:59:59",
          },
          { signal }
        );
      }

      const payload = tradeType === "account" ? res?.data : res?.data?.data;
      if (!Array.isArray(payload) || payload.length === 0) {
        setTransactionData([]);
        setError(`No ${tradeType} data available.`);
        return;
      }

      const normalized = payload.map((item) => {
        if (tradeType === "deposit") {
          return {
            mt5Account:
              item.mt5Account || item.accountNumber || item.account || "N/A",
            accountType: item.accountType || item.type || "N/A",
            deposit: item.deposit ?? item.amount ?? 0,
            method: (item.method || "N/A").toString(),
            createdAt:
              item.createdAt || item.created_at || item.created || null,
            updatedAt:
              item.updatedAt || item.updated_at || item.updated || null,
            depositSS: item.depositSS || item.attachment || item.file || null,
            status: item.status || "unknown",
          };
        }
        if (tradeType === "withdrawal") {
          return {
            mt5Account:
              item.mt5Account || item.accountNumber || item.account || "N/A",
            accountType: item.accountType || item.type || "N/A",
            amount: item.amount ?? 0,
            method: (item.method || "N/A").toString(),
            createdAt:
              item.createdAt || item.created_at || item.created || null,
            updatedAt:
              item.updatedAt || item.updated_at || item.updated || null,
            lastBalance: item.lastBalance ?? item.balance ?? 0,
            status: item.status || "unknown",
          };
        }
        return {
          account:
            item.account || item.mt5Account || item.accountNumber || "N/A",
          type: (item.type || item.tradeType || "").toString().toLowerCase(),
          symbol: item.symbol || item.Symbol || item.pair || "-",
          volume: item.volume ?? item.lots ?? 0,
          openPrice: item.openPrice ?? item.open_price ?? 0,
          closePrice: item.closePrice ?? item.close_price ?? 0,
          profit: item.profit ?? 0,
          time: item.time || item.closeTime || item.openTime || null,
        };
      });

      setTransactionData(normalized);
    } catch (err) {
      if (err?.name === "CanceledError" || err?.message === "canceled") return;
      console.error(`Error fetching ${tradeType} data:`, err);
      setTransactionData([]);
      setError(`Failed to fetch ${tradeType} data. Please try again.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    fetchTransactionData(activeTab, controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, loggedUser?._id]);

  /* ------------------------------ Derived --------------------------- */
  const filtered = useMemo(() => {
    if (!q.trim()) return transactionData;
    const term = q.trim().toLowerCase();
    return transactionData.filter((row) =>
      Object.values(row).some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(term)
      )
    );
  }, [q, transactionData]);

  const stats = useMemo(() => {
    if (activeTab === "deposit") {
      const total = filtered.reduce((s, x) => s + (Number(x.deposit) || 0), 0);
      const approved = filtered.filter(
        (x) => String(x.status).toLowerCase() === "approved"
      ).length;
      const pending = filtered.filter(
        (x) => String(x.status).toLowerCase() === "pending"
      ).length;
      return { total, approved, pending, title: "Deposits" };
    }
    if (activeTab === "withdrawal") {
      const total = filtered.reduce((s, x) => s + (Number(x.amount) || 0), 0);
      const approved = filtered.filter(
        (x) => String(x.status).toLowerCase() === "approved"
      ).length;
      const pending = filtered.filter(
        (x) => String(x.status).toLowerCase() === "pending"
      ).length;
      return { total, approved, pending, title: "Withdrawals" };
    }
    // account
    const pl = filtered.reduce((s, x) => s + (Number(x.profit) || 0), 0);
    const wins = filtered.filter((x) => Number(x.profit) > 0).length;
    const losses = filtered.filter((x) => Number(x.profit) < 0).length;
    return {
      total: pl,
      approved: wins,
      pending: losses,
      title: "Account Trades",
    };
  }, [filtered, activeTab]);

  /* ------------------------------- Render --------------------------- */
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden"
    >

      <div className="relative z-10 p-6 lg:p-10">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="max-w-7xl mx-auto"
        >

                <AnimatedGrid />

      <FloatingOrbs />
      <FloatingParticles />
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              variants={glowVariants}
              initial="initial"
              animate="animate"
              className="inline-block px-5 py-4 rounded-xl bg-gradient-to-r from-gray-800/50 via-gray-900/80 to-gray-800/50 backdrop-blur-xl"
            >
              <div className="flex items-center justify-center gap-2 text-emerald-300 mb-1">
                <Sparkles size={16} />
                <span className="uppercase tracking-[0.25em] text-xs">
                  trading · activity
                </span>
              </div>
              <ModernHeading text="⚡ TRANSACTIONS ⚡" />
            </motion.div>
          </div>

          {/* Card */}
          <motion.div
            variants={cardVariants}
            className="bg-gradient-to-br from-gray-900/90 via-black/95 to-gray-900/90 backdrop-blur-2xl rounded-3xl border border-emerald-400/30 shadow-2xl overflow-hidden"
            style={{
              boxShadow:
                "0 0 100px rgba(0, 255, 136, 0.10), inset 0 0 100px rgba(0,0,0,0.5)",
            }}
          >
            {/* Tabs (sticky header) */}
            <div className="sticky top-0 z-10 p-4 md:p-6 border-b border-emerald-400/20 bg-gradient-to-r from-transparent via-emerald-400/5 to-transparent backdrop-blur">
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="flex flex-wrap gap-3">
                  {[
                    {
                      key: "deposit",
                      label: "Deposits",
                      Icon: ArrowDownToLine,
                    },
                    {
                      key: "withdrawal",
                      label: "Withdrawals",
                      Icon: ArrowUpToLine,
                    },
                    { key: "account", label: "Account Txn", Icon: Repeat2 },
                  ].map(({ key, label, Icon }) => (
                    <motion.button
                      key={key}
                      variants={tabVariants}
                      initial="hidden"
                      animate="visible"
                      whileTap="tap"
                      onClick={() => setActiveTab(key)}
                      className={`relative px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                        activeTab === key
                          ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-black border-emerald-300 shadow-lg shadow-emerald-500/40"
                          : "bg-white/5 text-emerald-300 border-emerald-400/30 hover:bg-white/10"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Icon size={16} />
                        {label}
                      </span>
                      {activeTab === key && (
                        <motion.span
                          layoutId="tab-underline"
                          className="absolute -bottom-1 left-3 right-3 h-[3px] rounded-full bg-black/50"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-none">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300/80"
                    />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Quick filter…"
                      className="w-full md:w-64 pl-9 pr-3 py-2 rounded-xl outline-none text-white/90
                        bg-gradient-to-br from-slate-900/70 to-slate-900/30 border border-emerald-400/20
                        focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400/50 transition"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const c = new AbortController();
                      fetchTransactionData(activeTab, c.signal);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-400/30 text-emerald-300 bg-white/5 hover:bg-white/10"
                  >
                    <RefreshCcw size={16} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <StatTile
                  label={`${stats.title} Total`}
                  value={`$${money(stats.total)}`}
                  hint={
                    activeTab === "account"
                      ? "Aggregated P/L"
                      : "Sum of amounts"
                  }
                />
                <StatTile
                  label={
                    activeTab === "account" ? "Winning Trades" : "Approved"
                  }
                  value={stats.approved}
                  hint={activeTab === "account" ? "Profit > 0" : undefined}
                />
                <StatTile
                  label={activeTab === "account" ? "Losing Trades" : "Pending"}
                  value={stats.pending}
                  hint={activeTab === "account" ? "Profit < 0" : undefined}
                />
                <StatTile label="Rows" value={filtered.length} />
              </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6">
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="text-center py-12"
                  >
                    <DynamicLoder />
                    <motion.p
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-emerald-400 mt-4 font-mono tracking-widest"
                    >
                      FETCHING DATA…
                    </motion.p>

                    {/* shimmer skeleton */}
                    <div className="mt-6 overflow-x-auto rounded-2xl border border-emerald-400/20">
                      <table className="w-full text-sm">
                        <tbody>
                          {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonRow
                              key={i}
                              cols={activeTab === "account" ? 8 : 9}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {error && !loading && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    className="text-center py-12"
                  >
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md mx-auto">
                      <div className="text-6xl mb-4">⚠️</div>
                      <p className="text-red-400 font-mono">{error}</p>
                    </div>
                  </motion.div>
                )}

                {!loading && !error && filtered.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <EmptyState title={`No ${activeTab} data available.`} />
                  </motion.div>
                )}

                {!loading && !error && filtered.length > 0 && (
                  <motion.div
                    key="data"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4 }}
                  >
                    {activeTab === "account" ? (
                      <div className="overflow-x-auto rounded-2xl border border-emerald-400/20">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-emerald-500/30">
                              {[
                                "🔢 ACCOUNT",
                                "📈 TYPE",
                                "💎 SYMBOL",
                                "📊 VOLUME",
                                "🎯 OPEN",
                                "💰 CLOSE",
                                "⚡ P/L",
                                "📅 TIME",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="text-center py-3 px-4 font-mono font-bold text-emerald-300 tracking-wider"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((item, i) => (
                              <motion.tr
                                key={`${item.account}-${i}`}
                                initial={{ opacity: 0, x: -40 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.02 }}
                                whileHover={{
                                  backgroundColor: "rgba(16,185,129,0.06)",
                                  scale: 1.005,
                                  transition: { duration: 0.15 },
                                }}
                                className="border-b border-white/10"
                              >
                                <td className="py-3 px-4 text-center font-mono text-emerald-300">
                                  #{item?.account}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                      item?.type === "buy"
                                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                                        : "bg-red-500/20 text-red-300 border-red-500/30"
                                    }`}
                                  >
                                    {(item?.type || "N/A").toUpperCase()}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center font-semibold text-cyan-300">
                                  {item?.symbol || "-"}
                                </td>
                                <td className="py-3 px-4 text-center font-mono text-yellow-300">
                                  {item?.volume ?? 0}
                                </td>
                                <td className="py-3 px-4 text-center font-mono text-white/80">
                                  ${money(item?.openPrice)}
                                </td>
                                <td className="py-3 px-4 text-center font-mono text-white/80">
                                  ${money(item?.closePrice)}
                                </td>
                                <td className="py-3 px-4 text-center font-mono font-bold">
                                  <span
                                    className={
                                      (item?.profit ?? 0) >= 0
                                        ? "text-emerald-300"
                                        : "text-red-300"
                                    }
                                  >
                                    ${money(Math.abs(item?.profit ?? 0))}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center text-xs font-mono text-white/60">
                                  {formatDate(item?.time)}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-emerald-400/20">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-emerald-500/30">
                              {[
                                "🔢 ACCOUNT",
                                "🎯 TYPE",
                                ...(activeTab === "withdrawal"
                                  ? ["💰 AMOUNT"]
                                  : []),
                                ...(activeTab === "deposit"
                                  ? ["💳 DEPOSIT"]
                                  : []),
                                "🔄 METHOD",
                                "📅 REQUESTED",
                                "🔁 UPDATED",
                                ...(activeTab === "deposit"
                                  ? ["📎 PROOF"]
                                  : ["💼 BALANCE"]),
                                "⚡ STATUS",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="text-center py-3 px-4 font-mono font-bold text-emerald-300 tracking-wider"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((item, i) => (
                              <motion.tr
                                key={`${item.mt5Account}-${i}`}
                                initial={{ opacity: 0, x: -40 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.02 }}
                                whileHover={{
                                  backgroundColor: "rgba(16,185,129,0.06)",
                                  scale: 1.005,
                                  transition: { duration: 0.15 },
                                }}
                                className="border-b border-white/10"
                              >
                                <td className="py-3 px-4 text-center font-mono text-emerald-300">
                                  #{item?.mt5Account || "N/A"}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30">
                                    {(item?.accountType || "N/A").toUpperCase()}
                                  </span>
                                </td>
                                {activeTab === "withdrawal" && (
                                  <td className="py-3 px-4 text-center font-mono text-emerald-300 font-bold">
                                    ${money(item?.amount)}
                                  </td>
                                )}
                                {activeTab === "deposit" && (
                                  <td className="py-3 px-4 text-center font-mono text-emerald-300 font-bold">
                                    ${money(item?.deposit)}
                                  </td>
                                )}
                                <td className="py-3 px-4 text-center">
                                  <span className="text-cyan-300 font-mono text-xs bg-white/5 px-2 py-1 rounded">
                                    {(item?.method || "N/A")
                                      .toString()
                                      .toUpperCase()}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center text-xs font-mono text-white/60">
                                  {formatDate(item?.createdAt)}
                                </td>
                                <td className="py-3 px-4 text-center text-xs font-mono text-white/60">
                                  {formatDate(item?.updatedAt)}
                                </td>
                                {activeTab === "deposit" ? (
                                  <td className="py-3 px-4 text-center">
                                    {item?.depositSS ? (
                                      <a
                                        className="text-cyan-300 hover:text-cyan-200 font-mono underline"
                                        target="_blank"
                                        rel="noreferrer"
                                        href={
                                          item.depositSS.startsWith("http")
                                            ? item.depositSS
                                            : `${
                                                import.meta.env
                                                  .VITE_BACKEND_BASE_URL
                                              }/${item.depositSS}`
                                        }
                                      >
                                        VIEW 📄
                                      </a>
                                    ) : (
                                      <span className="text-white/40">—</span>
                                    )}
                                  </td>
                                ) : (
                                  <td className="py-3 px-4 text-center font-mono text-yellow-300 font-bold">
                                    ${money(item?.lastBalance)}
                                  </td>
                                )}
                                <td className="py-3 px-4 text-center">
                                  <div
                                    className={`inline-flex items-center px-3 py-1.5 rounded-full font-bold text-[11px] font-mono tracking-wider ${getStatusStyle(
                                      item?.status
                                    )}`}
                                  >
                                    <span className="mr-1">
                                      {String(item?.status).toLowerCase() ===
                                      "pending"
                                        ? "⏳"
                                        : String(item?.status).toLowerCase() ===
                                          "approved"
                                        ? "✅"
                                        : String(item?.status).toLowerCase() ===
                                          "rejected"
                                        ? "❌"
                                        : "❓"}
                                    </span>
                                    {(item?.status || "UNKNOWN")
                                      .toString()
                                      .toUpperCase()}
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
