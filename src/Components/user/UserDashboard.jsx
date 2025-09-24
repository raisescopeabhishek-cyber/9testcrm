import { useEffect, useMemo } from "react";
import UserDashboardBalanceCards from "./dashboard/UserDashboardCards";
import UseUserHook from "../../hooks/user/UseUserHook";
import UserDashboardTransaction from "./dashboard/UserDashboardTransaction";
import UserDashboardTradeHistory from "./dashboard/UserDashboardTradeHistory";
import { motion } from "framer-motion";
import { FloatingParticles } from "../../utils/FloatingParticles";
import { AnimatedGrid } from "../../utils/AnimatedGrid";

/* --- Ticker (crypto vibe) --- */
const Ticker = ({ items }) => (
  <div className="relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-slate-900/60 via-black/60 to-slate-900/60 backdrop-blur-md">
    <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(34,197,94,0.15) 0 2px, transparent 2px 8px)" }} />
    <div className="whitespace-nowrap animate-[marquee_24s_linear_infinite] py-2">
      {items.map((c, i) => {
        const up = c.change24h >= 0;
        return (
          <span key={c.symbol + i} className="inline-flex items-center mx-4 gap-2 text-sm">
            <span className="font-mono text-white/80">{c.symbol}</span>
            <span className="font-semibold">{c.price.toLocaleString()}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${up ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
              {up ? "▲" : "▼"} {Math.abs(c.change24h).toFixed(2)}%
            </span>
          </span>
        );
      })}
    </div>
    {/* keyframes */}
    <style>{`
      @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    `}</style>
  </div>
);

export default function UserDashboard() {
  const { getUpdateLoggedUser } = UseUserHook();

  const trendingCoins = useMemo(
    () => [
      { symbol: "BTCUSDT", name: "Bitcoin", price: 61234.12, change24h: 2.14 },
      { symbol: "ETHUSDT", name: "Ethereum", price: 2431.78, change24h: -0.86 },
      { symbol: "SOLUSDT", name: "Solana", price: 162.45, change24h: 4.21 },
      { symbol: "XRPUSDT", name: "XRP", price: 0.62, change24h: 1.37 },
      { symbol: "DOGEUSDT", name: "Dogecoin", price: 0.146, change24h: -2.05 },
      { symbol: "ADAUSDT", name: "Cardano", price: 0.48, change24h: 0.72 },
      { symbol: "ARBUSDT", name: "Arbitrum", price: 1.24, change24h: -1.23 },
    ],
    []
  );

  useEffect(() => {
    const run = async () => {
      try {
        await getUpdateLoggedUser();
      } catch (e) {
        console.error("Dashboard init:", e);
      }
    };
    run();
    const id = setInterval(run, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="p-4 md:p-6 pb-10 min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <FloatingParticles />
      <AnimatedGrid />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-4">
          <Ticker items={[...trendingCoins, ...trendingCoins]} />
        </div>

        {/* Balance Cards */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
          <UserDashboardBalanceCards />
        </motion.div>

        {/* Content Grid */}
        <motion.div
          className="grid md:grid-cols-2 grid-cols-1 gap-6 mt-6 mb-20"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <UserDashboardTransaction />
          <UserDashboardTradeHistory />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
