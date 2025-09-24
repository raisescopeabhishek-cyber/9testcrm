import { useEffect, useState, useCallback, useMemo, useTransition, useRef } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import ModernHeading from "../../lib/ModernHeading";
import ModernText from "../../lib/ModernText";

// If you already have a real client, pass it via props or import it:
// import { metaApi } from "@/utils/apiClients";

// Lightweight loader (or swap with your DynamicLoder)
const Spinner = () => (
  <div className="flex items-center justify-center py-6">
    <motion.div
      className="relative"
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <div className="w-10 h-10 border-4 border-emerald-400/20 rounded-full"></div>
      <div className="absolute inset-0 w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
    </motion.div>
  </div>
);

/**
 * Dashboard card to show last N trades (default 5).
 *
 * Props:
 * - managerIndex?: string  -> defaults to env or "demo_manager"
 * - accounts?: string[]    -> MT5 account numbers; if not provided, uses mock
 * - metaClient?: { get: (url: string) => Promise<{data: any[]}> }
 * - defaultTab?: "open" | "closed"
 * - limit?: number         -> default 5
 * - className?: string
 * - onViewAll?: () => void -> optional "view all" handler
 */
export default function UserDashboardTradeHistory({
  managerIndex = import.meta.env?.VITE_MANAGER_INDEX || "demo_manager",
  accounts,
  metaClient, // pass your real client here (e.g., metaApi)
  defaultTab = "open",
  limit = 5,
  className = "",
  onViewAll,
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  // Fallback meta client (mock) if none provided
  const client = useMemo(
    () =>
      metaClient || {
        get: async () => ({ data: [] }),
      },
    [metaClient]
  );

  // Mock initial sample so the card doesn't look empty in dev
  const [tradeData, setTradeData] = useState([
    {
      MT5Account: "100001",
      Symbol: "EURUSD",
      Open_Time: "2025-08-20 10:30:00",
      Close_Time: "2025-08-20 15:45:00",
      Open_Price: 1.085,
      Close_Price: 1.0925,
      OrderType: 1,
      BUY_SELL: 0,
      Lot: 1.5,
      Volume: 15000,
      Profit: 112.45,
    },
    {
      MT5Account: "100002",
      Symbol: "GBPUSD",
      Open_Time: "2025-08-21 09:10:00",
      Close_Time: "2025-08-21 12:30:00",
      Open_Price: 1.265,
      Close_Price: 1.26,
      OrderType: 0,
      BUY_SELL: 1,
      Lot: 2,
      Volume: 20000,
      Profit: -85.6,
    },
    {
      MT5Account: "100003",
      Symbol: "XAUUSD",
      Open_Time: "2025-08-22 11:15:00",
      Close_Time: null,
      Open_Price: 1925.5,
      Close_Price: null,
      OrderType: null,
      BUY_SELL: 0,
      Lot: null,
      Volume: 5000,
      Profit: 45.3,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use provided accounts or tiny mock
  const mt5Accounts = useMemo(
    () => (accounts && accounts.length ? accounts : ["100001", "100002", "100003"]),
    [accounts]
  );

  const currentDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const toDate = useCallback((s) => (s ? new Date(s.replace(" ", "T")) : new Date(0)), []);

  // Stats over all data (optional header KPIs)
  const tradeStats = useMemo(() => {
    if (!tradeData?.length) return { totalProfit: 0, winningTrades: 0, losingTrades: 0 };
    const totalProfit = tradeData.reduce((sum, t) => sum + (t.Profit || 0), 0);
    const winningTrades = tradeData.filter((t) => t.Profit > 0).length;
    const losingTrades = tradeData.filter((t) => t.Profit < 0).length;
    return { totalProfit, winningTrades, losingTrades };
  }, [tradeData]);

  // Fetch
  const fetchTradeData = useCallback(
    async (tradeType) => {
      setLoading(true);
      setError("");
      try {
        const bag = [];
        for (const acc of mt5Accounts) {
          let res;
          if (tradeType === "closed") {
            res = await client.get(
              `/GetCloseTradeAll?Manager_Index=${managerIndex}&MT5Accont=${acc}&StartTime=2021-01-01 00:00:00&EndTime=${currentDate} 23:59:59`
            );
          } else {
            res = await client.get(
              `/GetOpenTradeByAccount?Manager_Index=${managerIndex}&MT5Accont=${acc}`
            );
          }
          if (Array.isArray(res?.data)) bag.push(...res.data);
        }
        setTradeData(bag.length ? bag : []);
        if (!bag.length) setError("No recent trades found.");
      } catch (e) {
        console.error("Trade fetch error:", e);
        setError("Failed to load trades.");
        setTradeData([]);
      } finally {
        setLoading(false);
      }
    },
    [client, managerIndex, mt5Accounts, currentDate]
  );

  const handleTab = useCallback(
    (val) => {
      startTransition(() => setActiveTab(val));
      fetchTradeData(val);
    },
    [fetchTradeData]
  );

  // Only last N (limit) — newest first by relevant timestamp
  const lastTrades = useMemo(() => {
    const key = activeTab === "closed" ? "Close_Time" : "Open_Time";
    const sorted = [...(tradeData || [])].sort((a, b) => toDate(b?.[key]) - toDate(a?.[key]));
    return sorted.slice(0, limit);
  }, [tradeData, activeTab, limit, toDate]);

  const formatTime = useCallback(
    (timeString) => {
      if (!timeString) return "—";
      const d = toDate(timeString);
      return d.toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    },
    [toDate]
  );

  const getSymbolIcon = useCallback((symbol) => {
    const s = symbol || "";
    if (s.includes("XAU") || s.includes("GOLD")) return "🥇";
    if (s.includes("OIL") || s.includes("CRUDE")) return "🛢️";
    if (s.includes("USD") || s.includes("EUR") || s.includes("GBP") || s.includes("JPY")) return "💱";
    return "📈";
  }, []);

  const getProfitColor = useCallback((p) => (p > 0 ? "text-emerald-400" : p < 0 ? "text-red-400" : "text-slate-300"), []);
  const getTypePill = useCallback(
    (t) =>
      activeTab === "closed"
        ? t?.OrderType === 1
          ? { label: "Buy", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" }
          : { label: "Sell", cls: "bg-red-500/15 text-red-400 border-red-500/30" }
        : t?.BUY_SELL === 0
        ? { label: "Buy", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" }
        : { label: "Sell", cls: "bg-red-500/15 text-red-400 border-red-500/30" },
    [activeTab]
  );

  // Animations (light)
  const cardVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
  const rowVariants = { hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0, transition: { duration: 0.25 } } };

  useEffect(() => {
    // Trigger initial load (comment out if you only want mock)
    // fetchTradeData(activeTab);
  }, []); // eslint-disable-line

  return (
    <motion.div
      ref={containerRef}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 border border-slate-700/50 rounded-2xl text-white ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-3">
          {/* <ModernHeading text="Recent Trades" /> */}
                  <ModernText text="Recent Trades" />
          
          <span className="text-xs text-slate-400">(last {limit})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTab("open")}
            disabled={isPending}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              activeTab === "open"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-transparent text-slate-300 border-slate-600 hover:bg-white/5"
            }`}
          >
            Open
          </button>
          <button
            onClick={() => handleTab("closed")}
            disabled={isPending}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              activeTab === "closed"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-transparent text-slate-300 border-slate-600 hover:bg-white/5"
            }`}
          >
            Closed
          </button>

          {onViewAll && (
            <button
              onClick={onViewAll}
              className="ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-600 text-slate-300 hover:bg-white/5"
            >
              View all
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-4">
        {/* Loading */}
        <AnimatePresence>{loading && <Spinner />}</AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {!loading && error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 text-sm text-red-300">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table (compact, last 5) */}
        {!loading && !error && lastTrades.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead className="text-slate-300/80">
                <tr className="border-b border-slate-700/60">
                  <th className="text-left py-2.5">Symbol</th>
                  <th className="text-left py-2.5">Open</th>
                  {activeTab === "closed" && <th className="text-left py-2.5">Close</th>}
                  <th className="text-center py-2.5">Type</th>
                  <th className="text-center py-2.5">Vol</th>
                  <th className="text-right py-2.5">P/L</th>
                </tr>
              </thead>
              <tbody>
                {lastTrades.map((t, i) => {
                  const typePill = getTypePill(t);
                  return (
                    <motion.tr
                      key={`${t.MT5Account}-${t.Open_Time}-${i}`}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      className="border-b border-slate-700/30 hover:bg-white/5 transition"
                    >
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getSymbolIcon(t.Symbol)}</span>
                          <div className="font-semibold text-slate-100">{t.Symbol}</div>
                          <div className="text-[10px] text-slate-400">#{t.MT5Account}</div>
                        </div>
                      </td>
                      <td className="py-2.5 pr-2 text-slate-300">{formatTime(t.Open_Time)}</td>
                      {activeTab === "closed" && <td className="py-2.5 pr-2 text-slate-300">{formatTime(t.Close_Time)}</td>}
                      <td className="py-2.5 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full border text-[11px] ${typePill.cls}`}>{typePill.label}</span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="inline-block bg-slate-700/50 rounded-md px-2 py-0.5 font-semibold">
                          {activeTab === "open" ? (t.Volume / 10000).toFixed(2) : t.Lot?.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold">
                        <span className={getProfitColor(t.Profit)}>${t.Profit?.toFixed(2)}</span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && lastTrades.length === 0 && (
          <div className="py-8 text-center text-slate-400 text-sm">No recent trades.</div>
        )}
      </div>
    </motion.div>
  );
}
