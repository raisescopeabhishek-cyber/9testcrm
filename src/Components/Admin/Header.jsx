import { useState, useRef, useEffect } from "react";
import { User, LogOut, Bell, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import { backendApi } from "../../utils/apiClients";
import { setNotification } from "../../redux/adminSlice"; // adjust slice path
import { handleToggleSidebar } from "../../redux/user/userSlice";

// import React from "react";
// import { LogOut, User } from "lucide-react";
// import Sidebar from "./Sidebar";
// import { useNavigate } from "react-router-dom";

// ---------------- Notification Dropdown ----------------
const NotificationDropdown = ({ isOpen, onClose, adminId }) => {
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useSelector((state) => state.admin.notification);

  console.log(notifications);

  useEffect(() => {
    if (!adminId) return;
    const fetchNotifications = async () => {
      try {
        const { data } = await backendApi.get(
          `/admin/get-all-notification/${adminId}`
        );
        if (data.success) dispatch(setNotification(data.data));
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, [adminId, location.pathname, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleNotificationClick = async (note) => {
    try {
      await backendApi.put(`/admin/mark-notification-read/${note._id}`);
      dispatch(
        setNotification(
          notifications.map((n) =>
            n._id === note._id ? { ...n, isRead: true } : n
          )
        )
      );
      if (note.adminLink) navigate(note.adminLink);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  // const unreadCount = notifications.filter((n) => !n?.isRead)?.length;

  return (
    <div ref={dropdownRef} className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 right-0 top-10 w-80 bg-indigo-950 text-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-indigo-800">
              <p className="font-semibold">
                {/* Notifications {unreadCount > 0 && `(${unreadCount})`} */}
              </p>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((note, index) => (
                  <motion.button
                    key={note._id}
                    onClick={() => handleNotificationClick(note)}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`w-full text-left px-4 py-3 hover:bg-indigo-900 transition-all flex flex-col border-b border-indigo-800/40 ${
                      !note.isRead
                        ? "font-semibold bg-indigo-900/40"
                        : "text-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-sm">{note.title}</p>
                      <span className="text-[10px] text-gray-400">
                        {new Date(note.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{note.message}</p>
                  </motion.button>
                ))
              ) : (
                <p className="px-4 py-2 text-sm text-gray-400">
                  No notifications
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------------- Admin Dropdown ----------------
const AdminDropdown = ({ isOpen, onClose, admin }) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const logoutHandler = () => {
    // clear admin state or token
    navigate("/authentication");
  };

  const menuItems = [
    { to: "/admin/profile", label: "Profile" },
    { to: "/admin/account", label: "Account Settings" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div ref={dropdownRef} className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 right-0 top-10 w-48 bg-indigo-950 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="py-1">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center px-4 py-2 text-sm text-white hover:bg-indigo-900 transition-all"
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={logoutHandler}
                className="flex items-center w-full px-4 py-2 text-sm text-red-500 font-semibold hover:bg-indigo-900 transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------------- Main Admin Header ----------------
const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const isSidebarOpen = useSelector((store) => store.admin.isSidebarOpen);
  const dispatch = useDispatch();
  const admin = useSelector((store) => store.admin.adminUser);
  const siteConfig = useSelector((store) => store.admin.siteConfig);
  const baseHeight = siteConfig?.logoSize || 4;
  const notifications = useSelector((store) => store.admin.notification) || [];

  const sidebarHandler = () => dispatch(handleToggleSidebar(!isSidebarOpen));

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 py-4 sticky top-0 z-50 w-full">
      <Sidebar />
      <div className="flex items-center justify-between px-6">
        {/* Left Logo + Sidebar */}
        <div className="flex gap-2">
          <button className="sm:hidden" onClick={sidebarHandler}>
            <User />
          </button>
          <a href="/admin/dashboard" className="mr-4">
            <img
              src={siteConfig?.logo}
              alt="Logo"
              className="block md:hidden object-contain w-auto dynamic-logo"
            />
            <style jsx>{`
              .dynamic-logo {
                height: ${baseHeight * 0.8}rem;
              }
              @media (min-width: 640px) {
                .dynamic-logo {
                  height: ${baseHeight * 0.666}rem;
                }
              }
              @media (min-width: 768px) {
                .dynamic-logo {
                  height: ${baseHeight}rem;
                }
              }
              @media (min-width: 1024px) {
                .dynamic-logo {
                  height: ${baseHeight * 1.2}rem;
                }
              }
            `}</style>
          </a>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-light mx-auto text-white  text-center relative w-full">
          <span>📈 Forex CRM Dashboard</span>
          <div className="border-b border-white/30 w-24 mx-auto mt-1"></div>
        </h1>

        {/* Right Side */}
        <div className="relative flex items-center gap-3">
          {/* Notifications */}
          <button
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setIsDropdownOpen(false);
            }}
            className="relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-indigo-800 transition"
          >
            <Bell className="w-5 h-5 text-gray-200" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] flex items-center justify-center bg-red-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationDropdown
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            adminId={admin?._id}
          />

          {/* Admin User */}
          <div className="flex items-center text-gray-200 gap-1">
            <p className="md:text-sm text-[10px] font-semibold whitespace-nowrap">
              {admin?.firstName}
            </p>
          </div>
          <button
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              setIsNotificationOpen(false);
            }}
            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-indigo-800 transition"
          >
            <User className="w-4 h-4 md:w-6 md:h-6 text-gray-200" />
          </button>
          <AdminDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            admin={admin}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;

// ***********************************************************************************************

// import React from "react";
// import { LogOut, User } from "lucide-react";
// import Sidebar from "./Sidebar";
// import { useNavigate } from "react-router-dom";

// const Header = () => {

//   const navigate = useNavigate();

//   return (
//     <header className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 py-8 text-white  sticky top-0 z-50 w-full">

//          <Sidebar />
//       <div className="flex items-center justify-between px-6 py-4">
//         {/* Title Centered */}
//         <h1 className="text-xl sm:text-2xl lg:text-3xl font-light mx-auto  text-center relative w-full">
//           <span>📈 Forex CRM Dashboard</span>
//           <div className="border-b border-white/30 w-24 mx-auto mt-1"></div>
//         </h1>

//         {/* User Actions (Optional) */}
//         <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
//           <button className="hover:text-gray-300 transition">
//             <User size={20} />
//           </button>
//           <button className="hover:text-gray-300 transition" onClick={()=>navigate("/authentication")}>
//             <LogOut size={20} />
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;
