import { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2,
  ArrowUpDown,
  ShieldEllipsis,
  ReceiptPoundSterlingIcon,
  HardDriveDownloadIcon,
  CircleFadingPlus,
  ArrowLeftRight,
  ArrowDownCircleIcon,
  SquareStackIcon,
  CopyPlus,
  Menu as MenuIcon,
  X as CloseIcon,
  BadgeCheck,
  ShieldBan,
} from "lucide-react";
import { useSelector } from "react-redux";

/* ===================== Small bits ===================== */

const NeonRail = ({ active }) => (
  <span
    className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r
      ${active ? "bg-gradient-to-b from-emerald-400 via-cyan-400 to-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.8)]" : "bg-transparent"}`}
  />
);

const MenuItem = ({ icon: Icon, label, link, onClick }) => (
  <NavLink
    to={link}
    onClick={onClick}
    className={({ isActive }) =>
      `relative block rounded-xl px-3 py-2.5
       ${isActive
         ? "bg-white/5 ring-1 ring-emerald-400/30"
         : "hover:bg-white/5 hover:ring-1 hover:ring-emerald-400/20"}`
    }
  >
    {({ isActive }) => (
      <motion.div
        layout
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="flex items-center gap-3"
      >
        <NeonRail active={isActive} />
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg border
            ${isActive
              ? "border-emerald-400/40 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10"
              : "border-white/10 bg-white/5"}`}
        >
          <Icon size={18} className="text-emerald-200" />
        </div>
        <span
          className={`text-[12px] font-semibold tracking-wide
            ${isActive ? "text-emerald-200" : "text-white/80"}`}
        >
          {label}
        </span>
      </motion.div>
    )}
  </NavLink>
);

/* ===================== Animations ===================== */

const sidebarVariants = {
  open: {
    width: 260,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
  closed: {
    width: 0,
    opacity: 0,
    transition: { type: "spring", stiffness: 260, damping: 26, when: "afterChildren" },
  },
};

const contentVariants = {
  open: { opacity: 1, x: 0, transition: { delay: 0.05 } },
  closed: { opacity: 0, x: -12 },
};

/* ===================== Component ===================== */

export default function UserSidebar({ siteConfig }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
  const sidebarRef = useRef(null);
  const baseHeight = siteConfig?.logoSize || 4;

  const loggedUser = useSelector((state) => state.user.loggedUser);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeSidebar = () => setIsOpen(false);
  const toggleSidebar = () => setIsOpen((p) => !p);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) closeSidebar();
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const menuItems = [
    { icon: BarChart2, label: "Dashboard", link: "/user/dashboard" },
    { icon: ShieldEllipsis, label: "Accounts", link: "/user/challenges" },
    { icon: ArrowUpDown, label: "Transactions", link: "/user/transaction" },
    { icon: BarChart2, label: "Trades", link: "/user/trade-history" },
    { icon: CircleFadingPlus, label: "Deposit", link: "/user/deposit" },
    { icon: ArrowLeftRight, label: "Transfer", link: "/user/transfer" },
    { icon: ArrowDownCircleIcon, label: "Withdraw", link: "/user/withdraw" },
    { icon: SquareStackIcon, label: "IB Zone", link: "/user/referrals" },
    { icon: CopyPlus, label: "Request Copy", link: "/user/copy-request" },
    { icon: HardDriveDownloadIcon, label: "Platform", link: "/user/platform" },
    { icon: ReceiptPoundSterlingIcon, label: "Economic Calendar", link: "/user/economic-calendar" },
  ];

  return (
    <>
     {!isOpen && <motion.button
        onClick={toggleSidebar}
        whileTap={{ scale: 0.94 }}
        className="fixed top-4 left-4 z-[60] rounded-xl p-2
                   border border-emerald-400/30 bg-gradient-to-br
                   from-gray-900/90 via-gray-900/70 to-gray-900/90
                   text-emerald-200 shadow-[0_0_22px_rgba(16,185,129,0.25)]
                   hover:bg-white/5"
      >
        {
        
        
        isOpen ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
      </motion.button>}

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        ref={sidebarRef}
        className="fixed left-0 top-0 z-50 h-screen overflow-hidden
                   text-white shadow-2xl"
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
      >
        {/* Neon background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-950" />
        <div className="absolute inset-0 opacity-[0.12]">
          <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_10%_0%,rgba(16,185,129,0.45),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_90%_100%,rgba(59,130,246,0.35),transparent_60%)]" />
        </div>
        <div className="absolute inset-0 ring-1 ring-emerald-400/15 rounded-none" />

        {/* Content */}
        <motion.div className="relative flex h-full flex-col px-3 py-4" variants={contentVariants}>
          {/* Logo / Title */}
          <div className="mb-3 flex items-center justify-between px-1">
            <Link to="/user/dashboard" onClick={closeSidebar} className="flex items-center gap-2">
              {siteConfig?.logo ? (
                <img
                  src={siteConfig.logo}
                  alt="Logo"
                  className="object-contain w-auto"
                  style={{ height: `${baseHeight}rem` }}
                />
              ) : (
                <span className="bg-gradient-to-r from-emerald-300 via-cyan-200 to-emerald-300 bg-clip-text text-lg font-extrabold text-transparent">
                  User Panel
                </span>
              )}
            </Link>
            <span className="h-[1px] flex-1 ml-3 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
          </div>

          {/* Status chip */}
          <div
            className={`mb-4 flex items-center gap-2 self-stretch rounded-xl px-3 py-2 text-xs font-semibold tracking-wide
              ${loggedUser?.accounts?.length
                ? "text-emerald-300 bg-emerald-400/10 ring-1 ring-emerald-400/20"
                : "text-rose-300 bg-rose-400/10 ring-1 ring-rose-400/20"}`}
          >
            {loggedUser?.accounts?.length ? <BadgeCheck size={14} /> : <ShieldBan size={14} />}
            {loggedUser?.accounts?.length ? "Active" : "Inactive"}
          </div>

          {/* CTA */}
          <motion.div
            className="sticky top-0 z-10 mb-3 rounded-xl p-2
                       bg-gradient-to-r from-emerald-500/10 to-cyan-500/10
                       ring-1 ring-emerald-400/20 backdrop-blur-sm"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              to="/user/new-challenge"
              onClick={closeSidebar}
              className="block w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500
                         py-2 text-center text-sm font-extrabold text-black tracking-wide
                         shadow-[0_10px_30px_rgba(16,185,129,0.35)] hover:brightness-110"
            >
              Open Account
            </Link>
          </motion.div>

          {/* Menu */}
          <div className="user-custom-scrollbar relative flex-1 overflow-y-auto pb-16">
            <AnimatePresence initial={false}>
              {menuItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="mb-1"
                >
                  <MenuItem
                    icon={item.icon}
                    label={item.label}
                    link={item.link}
                    onClick={closeSidebar}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Footer mini */}
          <div className="mt-2 border-t border-emerald-400/15 pt-2 text-[10px] text-white/50">
            <div className="flex items-center justify-between px-1">
              <span>v1.0</span>
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Live
              </span>
            </div>
          </div>
        </motion.div>
      </motion.aside>
    </>
  );
}
