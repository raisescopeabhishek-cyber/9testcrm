import { useEffect, useState, useCallback, useMemo, useTransition, useRef } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion, useInView } from "framer-motion";
import ModernHeading from "../lib/ModernHeading";
import DynamicLoder from "../Loader/DynamicLoder";
import { metaApi } from "../../utils/apiClients";
import { FloatingOrbs } from "../../utils/FloatingOrbs";
import { AnimatedGrid } from "../../utils/AnimatedGrid";



// Floating particles (SSR-safe & lightweight)
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-green-400 rounded-full"
        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: -100, opacity: [0, 1, 0] }}
        transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2 }}
      />
    ))}
  </div>
);

/* ------------------------------ UTILS ------------------------------------ */

const money = (n) => {
  const num = Number(n ?? 0);
  return Number.isFinite(num) ? num.toLocaleString() : "0";
};

const formatTime = (timeString) => {
  if (!timeString) return "N/A";
  const d = new Date(timeString);
  const date = d.toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  return `${date}, ${time}`;
};

const getSymbolIcon = (symbol) => {
  if (!symbol) return "📈";
  const s = String(symbol).toUpperCase();
  if (s.includes("XAU") || s.includes("GOLD")) return "🥇";
  if (s.includes("OIL") || s.includes("CRUDE")) return "🛢️";
  if (s.includes("USD") || s.includes("EUR") || s.includes("GBP") || s.includes("JPY")) return "💱";
  return "📈";
};

const profitText = (p) => (Number(p ?? 0) >= 0 ? "text-green-400" : "text-red-400");
const profitPill = (p) =>
  Number(p ?? 0) >= 0
    ? "bg-green-500/20 border-green-500/30"
    : "bg-red-500/20 border-red-500/30";

/* --------------------------- ANIMATION VARIANTS -------------------------- */

const containerVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.98, rotateX: 8 },
  visible: {
    opacity: 1, y: 0, scale: 1, rotateX: 0,
    transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], when: "beforeChildren", staggerChildren: 0.06 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, rotateX: -6 },
  visible: {
    opacity: 1, y: 0, rotateX: 0,
    transition: { type: "spring", stiffness: 120, damping: 18, duration: 0.7 }
  },
  hover: { y: -4, rotateX: 3, transition: { duration: 0.25 } }
};

const glowVariants = {
  initial: { boxShadow: "0 0 20px rgba(0, 255, 136, 0.25)" },
  animate: {
    boxShadow: [
      "0 0 20px rgba(0, 255, 136, 0.25)",
      "0 0 44px rgba(0, 255, 136, 0.55)",
      "0 0 20px rgba(0, 255, 136, 0.25)"
    ],
    transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
  }
};

const pulseVariants = {
  animate: { scale: [1, 1.02, 1], opacity: [0.85, 1, 0.85], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } }
};

const tableVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, staggerChildren: 0.015, delayChildren: 0.25 } }
};

const rowVariants = {
  hidden: { opacity: 0, x: -40, rotateY: -8, scale: 0.98 },
  visible: {
    opacity: 1, x: 0, rotateY: 0, scale: 1,
    transition: { type: "spring", stiffness: 160, damping: 22, duration: 0.55 }
  }
};

const tabVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 220, damping: 20 } },
  tap: { scale: 0.96 }
};

/* --------------------------- COMPONENT ----------------------------------- */

export default function UserTradeHistory() {
  const [activeTab, setActiveTab] = useState("open"); // "open" | "closed"
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, margin: "-100px" });

  const loggedUser = useSelector((s) => s?.user?.loggedUser);

  const accounts = useMemo(
    () =>
      (loggedUser?.accounts || [])
        .map((a) => a?.accountNumber ?? a?.MT5Account ?? a) // tolerate different shapes
        .filter(Boolean),
    [loggedUser]
  );

  const [tradeData, setTradeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const tradeStats = useMemo(() => {
    if (!Array.isArray(tradeData) || tradeData.length === 0) {
      return { totalProfit: 0, winningTrades: 0, losingTrades: 0 };
    }
    const totalProfit = tradeData.reduce((sum, t) => sum + (Number(t?.Profit) || 0), 0);
    const winningTrades = tradeData.filter((t) => Number(t?.Profit) > 0).length;
    const losingTrades = tradeData.filter((t) => Number(t?.Profit) < 0).length;
    return { totalProfit, winningTrades, losingTrades };
  }, [tradeData]);

  const fetchTradeData = useCallback(
    async (tradeType) => {
      if (!loggedUser?._id) {
        setTradeData([]);
        setError("Please sign in to view your trade history.");
        return;
      }
      if (!accounts.length) {
        setTradeData([]);
        setError("No linked MT5 accounts found.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const agg = [];

        // Sequential fetch to keep API happy (change to Promise.all if your API supports concurrency)
        for (const acc of accounts) {
          let res;
          if (tradeType === "closed") {
            res = await metaApi.get(
              `/GetCloseTradeAll?Manager_Index=${
                import.meta.env.VITE_MANAGER_INDEX
              }&MT5Accont=${acc}&StartTime=2021-07-20 00:00:00&EndTime=${currentDate} 23:59:59`
            );
          } else {
            res = await metaApi.get(
              `/GetOpenTradeByAccount?Manager_Index=${
                import.meta.env.VITE_MANAGER_INDEX
              }&MT5Accont=${acc}`
            );
          }
          if (Array.isArray(res?.data)) agg.push(...res.data);
        }

        // Optional: sort by time desc (close time for closed, open time otherwise)
        agg.sort((a, b) => {
          const at = new Date(a?.Close_Time || a?.Open_Time || 0).getTime();
          const bt = new Date(b?.Close_Time || b?.Open_Time || 0).getTime();
          return bt - at;
        });

        if (agg.length) {
          setTradeData(agg);
          setError("");
        } else {
          setTradeData([]);
          setError("No data found. Please try again.");
        }
      } catch (e) {
        console.error("Error fetching trade data:", e);
        setTradeData([]);
        setError("Failed to fetch trade data. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [accounts, currentDate, loggedUser?._id]
  );

  const handleTab = useCallback(
    (next) => {
      startTransition(() => setActiveTab(next));
    },
    [startTransition]
  );

  // Fetch when tab or accounts change
  const accountsKey = useMemo(() => JSON.stringify(accounts), [accounts]);
  useEffect(() => {
    fetchTradeData(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, accountsKey, loggedUser?._id]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden"
    >
              <AnimatedGrid />
      
            <FloatingOrbs />
      <FloatingParticles />

      <div className="relative z-10 p-6 lg:p-10" ref={containerRef}>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          whileHover="hover"
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={pulseVariants} animate="animate" className="text-center mb-8">
            <motion.div
              variants={glowVariants}
              initial="initial"
              animate="animate"
              className="inline-block p-4 rounded-xl bg-gradient-to-r from-gray-800/50 via-gray-900/80 to-gray-800/50 backdrop-blur-xl"
            >
              <ModernHeading text="⚡ TRADE HISTORY ⚡" />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-green-400 mt-2 font-mono text-sm tracking-wider"
              >
                TRADING PERFORMANCE
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Main Card */}
          <motion.div
            variants={cardVariants}
            className="bg-gradient-to-br from-gray-900/90 via-black/95 to-gray-900/90 backdrop-blur-2xl rounded-3xl border border-green-500/30 shadow-2xl overflow-hidden"
            style={{ boxShadow: "0 0 100px rgba(0, 255, 136, 0.10), inset 0 0 100px rgba(0,0,0,0.5)" }}
          >
            {/* Tabs + Stats */}
            <div className="p-6 border-b border-green-500/20 bg-gradient-to-r from-transparent via-green-500/5 to-transparent">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                {/* Tabs */}
                <div className="flex flex-wrap gap-4 justify-center">
                  {[
                    { key: "open", label: "📊 OPEN TRADES" },
                    { key: "closed", label: "📈 CLOSED TRADES" },
                  ].map((t) => (
                    <motion.button
                      key={t.key}
                      variants={tabVariants}
                      initial="hidden"
                      animate="visible"
                      whileTap="tap"
                      whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0,255,136,0.4)" }}
                      className={`px-6 py-3 font-bold rounded-xl font-mono text-sm tracking-wider transition-all duration-300 border-2 ${
                        activeTab === t.key
                          ? "bg-gradient-to-r from-green-500 to-blue-500 text-black border-green-400 shadow-lg shadow-green-500/50"
                          : "bg-gray-800/50 text-green-400 border-green-500/30 hover:bg-gray-700/70 hover:border-green-400/60"
                      }`}
                      disabled={isPending}
                      onClick={() => handleTab(t.key)}
                    >
                      {isPending && activeTab !== t.key ? "⏳ " : ""}
                      {t.label}
                    </motion.button>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex gap-4 flex-wrap justify-center">
                  <motion.div
                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-emerald-500/30 rounded-2xl px-4 py-3 text-center backdrop-blur-sm min-w-[150px]"
                    whileHover={{ scale: 1.05, rotateY: 5 }}
                  >
                    <div className="text-emerald-400 font-bold text-lg">
                      ${tradeStats.totalProfit.toFixed(2)}
                    </div>
                    <div className="text-white/70 text-sm font-mono">TOTAL P/L</div>
                  </motion.div>

                  <motion.div
                    className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl px-4 py-3 text-center backdrop-blur-sm min-w-[150px]"
                    whileHover={{ scale: 1.05, rotateY: -5 }}
                  >
                    <div className="text-cyan-300 font-bold text-lg">
                      {tradeStats.winningTrades}/{tradeStats.losingTrades}
                    </div>
                    <div className="text-white/70 text-sm font-mono">WIN / LOSS</div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Loading */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-16"
                >
                  <DynamicLoder />
                  <motion.p
                    className="mt-6 text-green-400 font-mono tracking-widest"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    FETCHING DATA...
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {error && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-12"
                >
                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md mx-auto">
                    <div className="text-6xl mb-4">⚠️</div>
                    <p className="text-red-400 font-mono">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Table */}
            <AnimatePresence mode="wait">
              {!loading && !error && Array.isArray(tradeData) && tradeData.length > 0 && (
                <motion.div
                  key={activeTab}
                  variants={tableVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: 20 }}
                  className="p-6"
                >
                  <div className="overflow-x-auto user-custom-scrollbar rounded-2xl border border-green-500/20">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-b border-green-500/30">
                          {[
                            "🔢 ACCOUNT",
                            "💎 SYMBOL",
                            "⏱️ OPEN TIME",
                            ...(activeTab === "closed" ? ["🛑 CLOSE TIME"] : []),
                            "🎯 OPEN PRICE",
                            ...(activeTab === "closed" ? ["💰 CLOSE PRICE"] : []),
                            "📈 TYPE",
                            "📊 VOLUME",
                            "⚡ P/L",
                          ].map((h) => (
                            <th key={h} className="text-center py-4 px-4 font-mono font-bold text-green-400 tracking-wider">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <motion.tbody variants={tableVariants}>
                        {tradeData.map((t, i) => (
                          <motion.tr
                            key={`${t?.MT5Account || "acc"}-${i}`}
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            className="border-b border-gray-700/30 hover:shadow-lg hover:shadow-green-500/10"
                            whileHover={{ backgroundColor: "rgba(0,255,136,0.05)", scale: 1.01, transition: { duration: 0.18 } }}
                          >
                            <td className="py-4 px-4 text-center font-mono text-green-300">#{t?.MT5Account}</td>
                            <td className="py-4 px-4 text-center font-semibold text-cyan-400">
                              <span className="mr-1">{getSymbolIcon(t?.Symbol)}</span>{t?.Symbol}
                            </td>
                            <td className="py-4 px-4 text-center text-xs font-mono text-gray-400">{formatTime(t?.Open_Time)}</td>
                            {activeTab === "closed" && (
                              <td className="py-4 px-4 text-center text-xs font-mono text-gray-400">{formatTime(t?.Close_Time)}</td>
                            )}
                            <td className="py-4 px-4 text-center font-mono text-gray-300">${money(t?.Open_Price)}</td>
                            {activeTab === "closed" && (
                              <td className="py-4 px-4 text-center font-mono text-gray-300">${money(t?.Close_Price)}</td>
                            )}
                            <td className="py-4 px-4 text-center">
                              <motion.span
                                whileHover={{ scale: 1.1 }}
                                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                  (activeTab === "closed" ? t?.OrderType === 1 : t?.BUY_SELL === 0)
                                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                                    : "bg-red-500/20 text-red-300 border-red-500/30"
                                }`}
                              >
                                {activeTab === "closed"
                                  ? (t?.OrderType === 1 ? "BUY" : "SELL")
                                  : (t?.BUY_SELL === 0 ? "BUY" : "SELL")}
                              </motion.span>
                            </td>
                            <td className="py-4 px-4 text-center font-mono text-yellow-400 font-bold">
                              {activeTab === "open"
                                ? (Number(t?.Volume ?? 0) / 10000).toFixed(2)
                                : Number(t?.Lot ?? 0).toFixed(2)}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <motion.div
                                className={`inline-block px-4 py-2 rounded-xl font-bold border ${profitPill(Number(t?.Profit))}`}
                                whileHover={{ scale: 1.08, rotate: 1 }}
                                animate={Number(t?.Profit) > 100 ? {
                                  boxShadow: ["0 0 0 rgba(34,197,94,0)", "0 0 20px rgba(34,197,94,0.5)", "0 0 0 rgba(34,197,94,0)"]
                                } : {}}
                                transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
                              >
                                <span className={profitText(Number(t?.Profit))}>
                                  ${Math.abs(Number(t?.Profit ?? 0)).toFixed(2)}
                                </span>
                              </motion.div>
                            </td>
                          </motion.tr>
                        ))}
                      </motion.tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty */}
            <AnimatePresence>
              {!loading && !error && tradeData.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-3">📈</div>
                    <p className="text-white/90 font-semibold">No trades yet</p>
                    <p className="text-white/60 text-sm">Start trading to see your history here.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
