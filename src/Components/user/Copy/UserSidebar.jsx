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

const MenuItem = ({ icon: Icon, label, link, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.05, x: 5 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <NavLink
      to={link}
      className={({ isActive }) =>
        `flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
          isActive
            ? "text-secondary-400 bg-white/10 shadow-md"
            : "text-white/80 hover:text-secondary-300 hover:bg-white/5"
        }`
      }
      onClick={onClick}
    >
      <Icon size={24} />
      <span className="font-semibold text-xs">{label}</span>
    </NavLink>
  </motion.div>
);

const sidebarVariants = {
  open: {
    width: "180px",
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 25 },
  },
  closed: {
    width: "0px",
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 25,
      when: "afterChildren",
    },
  },
};

const contentVariants = {
  open: { opacity: 1, x: 0, transition: { delay: 0.1 } },
  closed: { opacity: 0, x: -10 },
};

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
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target))
        closeSidebar();
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
    {
      icon: ReceiptPoundSterlingIcon,
      label: "Economic Calendar",
      link: "/user/economic-calendar",
    },
  ];

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-secondary-500 text-white p-2 rounded-md shadow-md hover:bg-secondary-400 transition"
      >
        {isOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <motion.div
        ref={sidebarRef}
        className="fixed left-0 top-0 h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 shadow-xl text-white z-50 overflow-hidden"
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
      >
        <motion.div
          className="flex flex-col items-center py-4 h-full"
          variants={contentVariants}
        >
          {/* Logo */}
          {/* <motion.a
            href="/user/dashboard"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={siteConfig?.logo}
              alt="Logo"
              className="object-contain w-auto dynamic-logo"
              style={{ height: `${baseHeight}rem` }}
            />
          </motion.a> */}

          <motion.a
            href="/user/dashboard"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            User Panel
          </motion.a>

          {/* User Status */}
          <div
            className={`mt-3 border-b-2 mb-4 gap-1 flex font-bold rounded-full px-3 py-1 ${
              loggedUser?.accounts?.length !== 0
                ? "text-green-500 bg-green-500/10"
                : "text-red-500 animate-pulse bg-red-500/10"
            }`}
          >
            <p>
              {loggedUser?.accounts?.length !== 0 ? (
                <BadgeCheck size={16} />
              ) : (
                <ShieldBan size={16} />
              )}
            </p>
            <p className="text-xs">
              {loggedUser?.accounts?.length !== 0 ? "Active" : "Inactive"}
            </p>
          </div>

          {/* Menu */}
          <div className="flex-grow overflow-y-auto pb-16 px-2 user-custom-scrollbar w-full">
            <div className="sticky top-0 border-t-2 backdrop-blur-sm py-3 z-10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-semibold rounded-full px-6 py-2 bg-secondary-500 text-white w-full transition-all hover:bg-secondary-400"
              >
                <Link
                  to="/user/new-challenge"
                  onClick={closeSidebar} // ✅ Close sidebar on click
                  className="block text-sm shadow-none outline-none border-none whitespace-nowrap font-semibold rounded-full  py-1 bg-secondary-500-70 w-full transition-all duration-300 hover:bg-secondary-500-60"
                >
                  Open Account
                </Link>
              </motion.button>
            </div>

            <AnimatePresence>
              {menuItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
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
        </motion.div>
      </motion.div>
    </>
  );
}
