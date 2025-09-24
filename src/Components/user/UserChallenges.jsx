import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Loader2, Sparkles, Wallet, TrendingUp, Gauge, CircleDollarSign } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { CFcalculateTimeSinceJoined, CFformatDate } from "../../utils/CustomFunctions";
import { useGetInfoByAccounts } from "../../hooks/user/UseGetInfoByAccounts";
import ModernHeading from "../lib/ModernHeading";
import { FloatingParticles } from "../../utils/FloatingParticles";

/* --------------------- Ambient Grid (crypto vibe) --------------------- */
const AnimatedGrid = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage:
          "linear-gradient(rgba(34,197,94,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.18) 1px, transparent 1px)",
        backgroundSize: "42px 42px",
        maskImage: "radial-gradient(120% 80% at 50% -10%, black 55%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(120% 80% at 50% -10%, black 55%, transparent 80%)",
      }}
    />
    <motion.div
      className="absolute inset-0 opacity-20"
      animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
      transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      style={{
        background:
          "repeating-linear-gradient(90deg, rgba(59,130,246,0.08) 0 2px, transparent 2px 8px)",
      }}
    />
  </div>
);

/* --------------------------- Small UI bits ---------------------------- */
const Pill = ({ children, tone = "emerald" }) => {
  const tones = {
    emerald: "bg-emerald-500/15 border-emerald-400/30 text-emerald-300",
    cyan: "bg-cyan-500/15 border-cyan-400/30 text-cyan-300",
    indigo: "bg-indigo-500/15 border-indigo-400/30 text-indigo-300",
    red: "bg-red-500/15 border-red-400/30 text-red-300",
    yellow: "bg-yellow-500/15 border-yellow-400/30 text-yellow-300",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
};

const Money = ({ value }) =>
  typeof value === "number" ? (
    <>{value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</>
  ) : (
    <Loader2 className="inline animate-spin text-white/60" size={16} />
  );

/* ------------------------------ Page --------------------------------- */
const UserChallenges = () => {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const siteConfig = useSelector((store) => store.user.siteConfig);
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const accountIds = loggedUser?.accounts?.map((acc) => +acc.accountNumber) || [];

  useGetInfoByAccounts(accountIds, "accounts");
  const { accountsData } = useSelector((store) => store.user);

  const handleMoreInfo = (value) => {
    setSelectedChallenge(value);
    setIsDialogOpen(true);
  };

  const stats = useMemo(() => {
    const list = (loggedUser?.accounts || []).map((acc) => {
      const info = accountsData?.find((i) => i.MT5Account === +acc.accountNumber);
      return {
        balance: info?.Balance ?? null,
        equity: info?.Equity ?? null,
        profit: info?.Profit ?? null,
      };
    });
    const sum = (arr, key) =>
      arr.reduce((s, x) => (typeof x[key] === "number" ? s + x[key] : s), 0);

    const totalBalance = sum(list, "balance");
    const totalEquity = sum(list, "equity");
    const totalPL = sum(list, "profit");

    return {
      accounts: (loggedUser?.accounts || []).length,
      totalBalance: isFinite(totalBalance) ? totalBalance : null,
      totalEquity: isFinite(totalEquity) ? totalEquity : null,
      totalPL: isFinite(totalPL) ? totalPL : null,
    };
  }, [loggedUser?.accounts, accountsData]);

  const container = {
    hidden: { opacity: 0, y: 30, scale: 0.98, rotateX: 6 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: { duration: 0.8, when: "beforeChildren", staggerChildren: 0.06 },
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <AnimatedGrid />
      <FloatingParticles />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 px-6 md:px-10 py-10 max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-emerald-400" />
            <span className="uppercase tracking-[0.25em] text-xs text-emerald-300/80 font-semibold">
              mt5 · accounts · live
            </span>
          </div>
          <ModernHeading text="MT5 Accounts" />
          <p className="text-white/70 mt-1">
            Real-time balances & equity at a glance. Tap the “i” to view secure credentials.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard
            icon={<Wallet className="text-emerald-300" />}
            label="Accounts"
            value={stats.accounts}
            tone="emerald"
          />
          <StatCard
            icon={<CircleDollarSign className="text-cyan-300" />}
            label="Total Balance"
            value={<Money value={stats.totalBalance} />}
            prefix="$"
            tone="cyan"
          />
          <StatCard
            icon={<Gauge className="text-indigo-300" />}
            label="Total Equity"
            value={<Money value={stats.totalEquity} />}
            prefix="$"
            tone="indigo"
          />
          <StatCard
            icon={<TrendingUp className="text-yellow-300" />}
            label="Total P/L"
            value={<Money value={stats.totalPL} />}
            prefix="$"
            tone={typeof stats.totalPL === "number" && stats.totalPL < 0 ? "red" : "emerald"}
          />
        </div>

        {/* Accounts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loggedUser?.accounts
            ?.slice()
            .reverse()
            .map((value, index) => {
              const info = accountsData?.find(
                (item) => item.MT5Account === +value?.accountNumber
              );

              const profitPos = typeof info?.Profit === "number" ? info?.Profit >= 0 : true;

              return (
                <motion.div
                  key={value?.accountNumber || index}
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 140, damping: 18 }}
                  whileHover={{ y: -4 }}
                  className="relative rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-slate-950/90 via-slate-900/40 to-slate-950/90 backdrop-blur-xl shadow-[0_0_60px_rgba(16,185,129,0.10)] overflow-hidden"
                >
                  {/* Glow ring */}
                  <motion.div
                    className="absolute -inset-px rounded-2xl pointer-events-none"
                    animate={{
                      boxShadow: [
                        "0 0 0 rgba(16,185,129,0)",
                        "0 0 40px rgba(16,185,129,0.25)",
                        "0 0 0 rgba(16,185,129,0)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />

                  <div className="p-5">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-xs text-white/60">
                        <span className="opacity-70">AC NO</span>:{" "}
                        <span className="font-mono text-white/90">{value?.accountNumber}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.15, rotate: 6 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMoreInfo(value)}
                        className="text-emerald-300 hover:text-emerald-200"
                        aria-label="More info"
                        title="More info"
                      >
                        <Info size={18} />
                      </motion.button>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Pill tone="emerald">{value?.accountType || "Account"}</Pill>
                      <Pill tone="cyan">Lev {value?.leverage}</Pill>
                      {value?.platform ? <Pill tone="indigo">{value.platform}</Pill> : null}
                    </div>

                    {/* Figures */}
                    <div className="space-y-2">
                      <Row label="Balance" value={<Money value={info?.Balance} />} prefix="$" />
                      <Row label="Live Equity" value={<Money value={info?.Equity} />} prefix="$" />
                      <Row
                        label="P/L"
                        value={
                          typeof info?.Profit === "number" ? (
                            <span className={profitPos ? "text-emerald-300" : "text-red-300"}>
                              ${Math.abs(info?.Profit).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <Loader2 className="inline animate-spin text-white/60" size={16} />
                          )
                        }
                      />
                    </div>

                    {/* Meta */}
                    <div className="mt-4 text-[11px] text-white/50">
                      <p>{CFformatDate(value?.createdAt)}</p>
                      <p>{CFcalculateTimeSinceJoined(value?.createdAt)}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* Modal */}
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AnimatePresence>
            {isDialogOpen && selectedChallenge && (
              <AlertDialogContent
                as={motion.div}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-400/25 rounded-2xl p-6 max-w-lg mx-auto text-white"
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-extrabold flex items-center gap-2">
                    <Sparkles className="text-emerald-300" /> Account Info
                  </AlertDialogTitle>
                  <AlertDialogDescription className="mt-3 text-white/80 space-y-2">
                    <Line label="Trade Platform" value={selectedChallenge?.platform} />
                    <Line label="Server Name" value={siteConfig?.serverName} />
                    <Line label="Trading Account" value={selectedChallenge?.accountNumber} />
                    <Line label="Leverage" value={selectedChallenge?.leverage} />
                    <Line
                      label="Master Password"
                      value={
                        <>
                          {selectedChallenge?.masterPassword}{" "}
                          <Link to="/user/master-password" className="text-emerald-300 hover:text-emerald-200 ml-2">
                            change
                          </Link>
                        </>
                      }
                    />
                    <Line
                      label="Investor Password"
                      value={
                        <>
                          {selectedChallenge?.investorPassword}{" "}
                          <Link to="/user/investor-password" className="text-emerald-300 hover:text-emerald-200 ml-2">
                            change
                          </Link>
                        </>
                      }
                    />
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-5">
                  <AlertDialogCancel className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl transition-all">
                    Close
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            )}
          </AnimatePresence>
        </AlertDialog>
      </motion.div>
    </div>
  );
};

export default UserChallenges;

/* --------------------------- Subcomponents --------------------------- */

function StatCard({ icon, label, value, prefix = "", tone = "emerald" }) {
  const tones = {
    emerald: "from-emerald-500/20 to-emerald-500/10 border-emerald-400/30",
    cyan: "from-cyan-500/20 to-cyan-500/10 border-cyan-400/30",
    indigo: "from-indigo-500/20 to-indigo-500/10 border-indigo-400/30",
    red: "from-red-500/20 to-red-500/10 border-red-400/30",
    yellow: "from-yellow-500/20 to-yellow-500/10 border-yellow-400/30",
  };
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`rounded-2xl border ${tones[tone]} bg-gradient-to-br p-4 flex items-center gap-3`}
    >
      <div className="p-2 rounded-xl bg-white/5 border border-white/10">{icon}</div>
      <div>
        <div className="text-xs text-white/60">{label}</div>
        <div className="text-lg font-bold">
          {prefix}
          {value}
        </div>
      </div>
    </motion.div>
  );
}

function Row({ label, value, prefix }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-white/60">{label}</span>
      <span className="font-semibold">{prefix ? <>{prefix}{value}</> : value}</span>
    </div>
  );
}

function Line({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-white/60">{label}</span>
      <span className="text-white/90 text-right">{value || "—"}</span>
    </div>
  );
}
