import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  Menu,
  Activity,
  UserCheck,
  UserX,
  UserPlus,
  Users,
  CreditCard,
  Settings,
  Mail,
  DollarSign,
  Shield,
  LogIn,
  FileText,
  Clipboard,
  User,
  Key,
  ChevronsRight,
  Mails,
  SquareStackIcon,
  LogOut,
  SubtitlesIcon,
  CopyPlusIcon,
  HandCoins,
  Banknote,
  LucideBadgeDollarSign,
  Home,
} from "lucide-react";

const modules = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: <Home className="w-5 h-5" />,
  },
  {
    name: "Login Logs",
    path: "/admin/login-logs",
    icon: <ChevronsRight className="w-5 h-5" />,
  },

  // Manage Users Nested
  {
    name: "Manage Users",
    path: "/admin/manage-users/all-users", // default route for main menu
    icon: <Users className="w-5 h-5" />,
    children: [
      { name: "KYC Updates", path: "/admin/kyc-users" },
      { name: "IB Users", path: "/admin/ib-users" },
      { name: "Email Verified", path: "/admin/manage-users/email-verified" },
      {
        name: "Email Unverified",
        path: "/admin/manage-users/email-unverified",
      },
      { name: "KYC Verified", path: "/admin/manage-users/kyc-verified" },
      { name: "KYC Unverified", path: "/admin/manage-users/kyc-unverified" },
      { name: "All Users", path: "/admin/manage-users/all-users" },
    ],
  },

  // Deposits Nested
  {
    name: "Deposits",
    path: "/admin/deposit/all",
    icon: <LucideBadgeDollarSign className="w-5 h-5" />,
    children: [
      { name: "Pending Deposits", path: "/admin/deposit/pending" },
      { name: "Approved Deposits", path: "/admin/deposit/approved" },
      { name: "Rejected Deposits", path: "/admin/deposit/rejected" },
      { name: "All Deposits", path: "/admin/deposit/all" },
    ],
  },

  // Withdrawals Nested
  {
    name: "Withdrawals",
    path: "/admin/withdrawal/all",
    icon: <Banknote className="w-5 h-5" />,
    children: [
      { name: "Pending Withdrawals", path: "/admin/withdrawal/pending" },
      { name: "Approved Withdrawals", path: "/admin/withdrawal/approved" },
      { name: "Rejected Withdrawals", path: "/admin/withdrawal/rejected" },
      { name: "All Withdrawals", path: "/admin/withdrawal/all" },
    ],
  },

  // IB Withdrawals Nested
  {
    name: "IB Withdrawals",
    path: "/admin/ib-withdrawal/all",
    icon: <HandCoins className="w-5 h-5" />,
    children: [
      { name: "Pending IB Withdrawals", path: "/admin/ib-withdrawal/pending" },
      {
        name: "Approved IB Withdrawals",
        path: "/admin/ib-withdrawal/approved",
      },
      {
        name: "Rejected IB Withdrawals",
        path: "/admin/ib-withdrawal/rejected",
      },
      { name: "All IB Withdrawals", path: "/admin/ib-withdrawal/all" },
    ],
  },

  {
    name: "Copy Requests",
    path: "/admin/copy-requests",
    icon: <CopyPlusIcon className="w-5 h-5" />,
  },
  {
    name: "Payment Getaways",
    path: "/admin/getway/manual",
    icon: <CreditCard className="w-5 h-5" />,
  },
  // {
  //   name: "Site Configuration",
  //   path: "/admin/site-configuration",
  //   icon: <SubtitlesIcon className="w-5 h-5" />,
  // },

  {
    name: "Custom Mail",
    path: "/admin/customerSupport/all",
    icon: <Mails className="w-5 h-5" />,
    children: [
      { name: "Manage Mails", path: "/admin/customerSupport/custom-email" },
      {
        name: "Manage Tickets",
        path: "/admin/customerSupport/tickets",
      },
    ],
  },

  {
    name: "IB Zone",
    path: "/admin/ib-zone",
    icon: <SquareStackIcon className="w-5 h-5" />,
  },
  {
    name: "Logout",
    path: "/admin/login",
    icon: <LogOut className="w-5 h-5" />,
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <>
      {/* Mobile Toggle Button */}
      {!mobileOpen && (
        <div className=" fixed top-4 left-4 z-50">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md bg-indigo-800 text-white shadow-md"
          >
            {<Menu className="w-6 h-6" />}
          </button>
        </div>
      )}

      {/* Sidebar */}
      {mobileOpen && (
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-indigo-950 via-indigo-900 to-black text-white shadow-xl z-40 transform transition-transform duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0`}
        >
          <div
            // className="h-full overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-indigo-700 scrollbar-track-transparent hover:scrollbar-thumb-indigo-600 transition-all"

            className="h-full overflow-y-auto p-5 
             scrollbar-thin scrollbar-track-transparent 
             scrollbar-thumb-indigo-700 hover:scrollbar-thumb-indigo-500 
             transition-colors duration-300 ease-in-out 
             scroll-smooth"
          >
            {/* Brand Title */}
            <div className="mb-10 border-b border-indigo-700 pb-6 text-center">
              <h2 className="text-3xl font-extrabold tracking-wide drop-shadow-lg bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent font-['Poppins']">
                🏥 Admin
              </h2>
            </div>

            {/* Navigation */}
            <nav className="space-y-3">
              {modules.map((mod) => {
                const active = isActive(mod.path);
                const isOpen = openMenus[mod.name] || active;

                return (
                  <div key={mod.name}>
                    {/* Parent Menu */}
                    <button
                      onClick={() => {
                        if (mod.name === "Logout") {
                          localStorage.removeItem("admin_password_ref");
                          navigate("/admin/authentication");
                        } else if (mod.children) {
                          toggleMenu(mod.name);
                        } else {
                          navigate(mod.path);
                          setMobileOpen(false); // close on mobile
                        }
                      }}
                      className={`flex items-center justify-between px-4 py-3 w-full rounded-lg text-left group transition-all duration-200 ${
                        active
                          ? "bg-indigo-700 text-white ring-1 ring-indigo-400 shadow-md"
                          : "hover:bg-indigo-800 text-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-indigo-300 group-hover:text-white transition">
                          {mod.icon}
                        </span>
                        <span className="text-sm font-medium tracking-wide">
                          {mod.name}
                        </span>
                      </div>
                      {mod.children && (
                        <span className="transition-transform duration-300">
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </span>
                      )}
                    </button>

                    {/* Submenu */}
                    {mod.children && (
                      <div
                        className={`ml-6 mt-2 overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out
                       ${
                         isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                       }`}
                      >
                        {/* Scrollable container for children */}
                        <div className="max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-indigo-700 hover:scrollbar-thumb-indigo-500">
                          {mod.children.map((child) => (
                            <button
                              key={child.name}
                              onClick={() => {
                                navigate(child.path);
                                setMobileOpen(false);
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm w-full text-left transition duration-200 font-medium ${
                                location.pathname === child.path
                                  ? "bg-indigo-700 text-white"
                                  : "hover:bg-indigo-800 text-indigo-300"
                              }`}
                            >
                              {child.icon}
                              {child.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>
      )}
    </>
  );
};

export default Sidebar;
