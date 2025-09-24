import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { backendApi, metaApi } from "@/utils/apiClients";
import ModernText from "../../lib/ModernText";
import DynamicLoder from "../../Loader/DynamicLoder";

/* Small helpers */
const StatusPill = ({ s = "" }) => {
  const k = String(s).toLowerCase();
  const cls =
    k === "approved"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
      : k === "pending"
      ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
      : k === "rejected"
      ? "bg-red-500/20 text-red-300 border-red-400/30"
      : "bg-white/10 text-white/80 border-white/20";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {String(s || "unknown").toUpperCase()}
    </span>
  );
};

const EmptyState = ({ label }) => (
  <div className="py-10 text-center">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-3">📄</div>
    <p className="text-white/90 font-semibold">No {label} found</p>
    <p className="text-white/60 text-sm">Try another tab or check back later.</p>
  </div>
);

export default function UserTransaction() {
  const [activeTab, setActiveTab] = useState("deposit");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const loggedUser = useSelector((store) => store.user.loggedUser);
  const loggedAccounts = (loggedUser?.accounts || []).map((a) => +a.accountNumber);

  const fetchTransactions = async (type) => {
    setLoading(true);
    try {
      let res;
      if (type === "withdrawal") {
        res = await backendApi.get(`/withdrawals/${loggedUser._id}`);
      } else if (type === "deposit") {
        res = await backendApi.get(`/deposit/${loggedUser._id}`);
      } else if (type === "account") {
        if (!loggedAccounts.length) {
          setRows([]);
          setLoading(false);
          return;
        }
        res = await metaApi.post(`/TransactionHistoryByAccounts`, {
          Manager_Index: import.meta.env.VITE_MANAGER_INDEX,
          MT5Accounts: loggedAccounts,
          StartTime: "2021-01-01 00:00:00",
          EndTime: "2028-12-31 23:59:59",
        });
      }

      const data = type === "account" ? res?.data : res?.data?.data;
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Txn fetch error:", err);
      setRows([]); // no dummy fallback—clean, real-data only
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loggedUser?._id) return;
    fetchTransactions(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, loggedUser?._id]);

  const lastFive = useMemo(() => rows.slice(-5).reverse(), [rows]);

  const tabs = [
    { id: "deposit", label: "Deposits", icon: "💰" },
    { id: "withdrawal", label: "Withdrawals", icon: "💸" },
    { id: "account", label: "Account History", icon: "🔄" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45 }}
      className="relative rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-slate-950 via-slate-900/70 to-slate-950 backdrop-blur-xl text-white p-5 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(34,197,94,0.15) 0 2px, transparent 2px 8px)" }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <ModernText text="Transaction History" />
        <div className="flex gap-2">
          {tabs.map((t) => (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition
                ${activeTab === t.id
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/30"
                  : "bg-white/5 text-emerald-300 border-emerald-400/25 hover:bg-white/10"
                }`}
            >
              <span className="mr-1">{t.icon}</span>
              {t.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Loader */}
      {loading && (
        <div className="py-6">
          <DynamicLoder />
        </div>
      )}

      {/* Content */}
      {!loading && (
        <>
          {lastFive.length === 0 ? (
            <EmptyState label={tabs.find((t) => t.id === activeTab)?.label} />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10 relative z-10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 text-white/70 border-b border-white/10">
                    <th className="py-3 px-4 text-left">Account</th>
                    {activeTab !== "account" && <th className="py-3 px-4 text-left">Type</th>}
                    <th className="py-3 px-4 text-left">{activeTab === "withdrawal" ? "Amount" : activeTab === "deposit" ? "Deposit" : "Symbol"}</th>
                    <th className="py-3 px-4 text-left">{activeTab === "account" ? "Volume" : "Method"}</th>
                    <th className="py-3 px-4 text-left">{activeTab === "account" ? "P/L" : "Status"}</th>
                  </tr>
                </thead>
                <AnimatePresence>
                  <motion.tbody initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {lastFive.map((t, i) => {
                      const acc = t?.mt5Account || t?.account || t?.accountNumber || "-";
                      if (activeTab === "account") {
                        const profit = Number(t?.profit ?? 0);
                        return (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.03 }}
                            className="border-b border-white/10 hover:bg-white/5"
                          >
                            <td className="py-2 px-4">{acc}</td>
                            <td className="py-2 px-4">{t?.symbol || "-"}</td>
                            <td className="py-2 px-4">{t?.volume ?? 0}</td>
                            <td className="py-2 px-4">
                              <span className="font-mono">{(t?.type || "").toUpperCase()}</span>
                            </td>
                            <td className={`py-2 px-4 font-bold ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              ${Math.abs(profit).toLocaleString()}
                            </td>
                          </motion.tr>
                        );
                      }
                      // deposit / withdrawal row
                      const amount = t?.amount ?? t?.deposit ?? 0;
                      return (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.03 }}
                          className="border-b border-white/10 hover:bg-white/5"
                        >
                          <td className="py-2 px-4">{acc}</td>
                          <td className="py-2 px-4">{t?.accountType || "-"}</td>
                          <td className="py-2 px-4">${Number(amount).toLocaleString()}</td>
                          <td className="py-2 px-4 capitalize">{String(t?.method || "-")}</td>
                          <td className="py-2 px-4"><StatusPill s={t?.status} /></td>
                        </motion.tr>
                      );
                    })}
                  </motion.tbody>
                </AnimatePresence>
              </table>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
