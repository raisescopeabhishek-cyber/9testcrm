import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, User, Wallet, Sparkles } from "lucide-react";
import ModernHeading from "../lib/ModernHeading";
import UserBankDetails from "./accountDetails/UserBankDetails";
import UserKycDetails from "./accountDetails/UserKycDetails";
import UserWalletDetails from "./accountDetails/UserWalletDetails";
import { FloatingParticles } from "../../utils/FloatingParticles";

/* ============================== DECOR =============================== */

const AnimatedGrid = () => (
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
    <motion.div
      className="absolute inset-0 opacity-20"
      animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      style={{
        background:
          "repeating-linear-gradient(90deg, rgba(59,130,246,0.1) 0 2px, transparent 2px 8px)",
      }}
    />
  </div>
);

const FloatingOrbs = () => (
  <div className="absolute inset-0 pointer-events-none">
    {Array.from({ length: 10 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full blur-2xl"
        style={{
          width: 150,
          height: 150,
          left: `${(i * 97) % 100}%`,
          top: `${(i * 53) % 100}%`,
          background:
            i % 3 === 0
              ? "radial-gradient(circle at center, rgba(16,185,129,0.25), transparent 60%)"
              : i % 3 === 1
              ? "radial-gradient(circle at center, rgba(34,211,238,0.25), transparent 60%)"
              : "radial-gradient(circle at center, rgba(99,102,241,0.25), transparent 60%)",
        }}
        animate={{
          y: [0, i % 2 ? -22 : 22, 0],
          x: [0, i % 2 ? 12 : -12, 0],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 6 + (i % 5),
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.2,
        }}
      />
    ))}
  </div>
);

const GlassCard = ({ className = "", children }) => (
  <motion.div
    whileHover={{ y: -2 }}
    transition={{ type: "spring", stiffness: 250, damping: 20 }}
    className={`relative rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-slate-900/70 via-slate-900/30 to-slate-900/70 backdrop-blur-xl shadow-[0_0_80px_rgba(16,185,129,0.08)] ${className}`}
  >
    <div className="absolute inset-px rounded-[calc(1rem-1px)] bg-gradient-to-br from-emerald-300/5 via-cyan-300/5 to-indigo-300/5 pointer-events-none" />
    {children}
  </motion.div>
);

/* ========================== TAB / CONTENT =========================== */

const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.97 }}
    className={`relative px-4 py-2 rounded-full font-semibold transition-colors
      ${active ? "text-black" : "text-emerald-300/80 hover:text-white"}`}
  >
    <div className="relative z-10 flex items-center gap-2">
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{children}</span>
      <span className="sm:hidden">{children?.toString().split(" ")[0]}</span>
    </div>
    {active && (
      <motion.span
        layoutId="tabBubble"
        transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
        className="absolute inset-0 -z-0 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 shadow-[0_10px_30px_rgba(16,185,129,0.35)]"
      />
    )}
  </motion.button>
);

const contentVariants = {
  enter: (dir) => ({
    opacity: 0,
    x: dir > 0 ? 40 : -40,
    rotateX: 6,
    scale: 0.98,
  }),
  center: {
    opacity: 1,
    x: 0,
    rotateX: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 180, damping: 20, duration: 0.55 },
  },
  exit: (dir) => ({
    opacity: 0,
    x: dir < 0 ? 40 : -40,
    rotateX: -6,
    scale: 0.98,
    transition: { duration: 0.35 },
  }),
};

/* ======================== MAIN COMPONENT ============================ */

const UserAccountDetails = () => {
  const tabs = useMemo(
    () => [
      { id: "personal", label: "KYC Details", icon: User },
      { id: "account", label: "Bank Details", icon: CreditCard },
      { id: "wallet", label: "Wallet Details", icon: Wallet },
    ],
    []
  );

  const [activeTab, setActiveTab] = useState("personal");
  const prevIndexRef = useRef(0);
  const currentIndex = tabs.findIndex((t) => t.id === activeTab);
  const direction = currentIndex - prevIndexRef.current;

  useEffect(() => {
    prevIndexRef.current = currentIndex;
  }, [currentIndex]);

  const renderContent = () => {
    if (activeTab === "personal") return <UserKycDetails />;
    if (activeTab === "account") return <UserBankDetails />;
    return <UserWalletDetails />;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <FloatingParticles />
      <AnimatedGrid />
      <FloatingOrbs />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:px-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-emerald-400" />
            <span className="uppercase tracking-[0.25em] text-xs text-emerald-300/80 font-semibold">
              profile · finance · wallet
            </span>
          </div>
          <motion.div
            initial={{ scale: 0.98, rotateX: 10, opacity: 0 }}
            animate={{ scale: 1, rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-block"
          >
            <ModernHeading text="⚡ Account Details" />
          </motion.div>
        </div>

        {/* Layout: Sidebar Tabs + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <GlassCard className="p-4 lg:col-span-4 xl:col-span-3">
            <div className="flex lg:flex-col items-center lg:items-stretch gap-3">
              <div className="w-full">
                <div
                  className="relative flex lg:flex-col gap-2 bg-gradient-to-br from-slate-900/60 to-slate-900/20 border border-emerald-400/10 rounded-2xl p-2"
                  role="tablist"
                >
                  {tabs.map((t) => (
                    <TabButton
                      key={t.id}
                      active={activeTab === t.id}
                      onClick={() => setActiveTab(t.id)}
                      icon={t.icon}
                    >
                      {t.label}
                    </TabButton>
                  ))}
                </div>
              </div>

              {/* Quick chips */}
              <div className="hidden lg:grid grid-cols-2 gap-2 w-full">
                <Chip text="Verified KYC" />
                <Chip text="Secure Wallet" />
                <Chip text="Bank Linked" />
                <Chip text="Encrypted" />
              </div>
            </div>
          </GlassCard>

          {/* Content */}
          <GlassCard className="p-4 lg:col-span-8 xl:col-span-9">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeTab}
                custom={direction}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="rounded-xl border border-emerald-400/10 bg-gradient-to-br from-slate-900/50 to-slate-900/20 p-4 md:p-6"
              >
                <motion.div
                  whileHover={{ rotateX: 1, rotateY: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                >
                  {renderContent()}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

/* ============================= SMALL UI ============================== */

const Chip = ({ text }) => (
  <div className="text-emerald-300/80 text-xs font-semibold px-3 py-2 rounded-xl border border-emerald-400/20 bg-emerald-300/5">
    {text}
  </div>
);

export default UserAccountDetails;
