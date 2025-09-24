import { useState, useRef, useEffect } from "react";
import {
  User,
  LogOut,
  CheckCircle,
  Menu,
  Bell,
  X,
  UserCircle,
  UserRoundCog,
  KeyRound,
} from "lucide-react";
import { RiCustomerService2Line } from "react-icons/ri";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import UseUserHook from "../../../hooks/user/UseUserHook";
import {
  handleToggleSidebar,
  setNotification,
} from "../../../redux/user/userSlice";
import { backendApi } from "../../../utils/apiClients";

// ---------------- Notification Dropdown ----------------
import {
  fetchUserNotifications,
  markNotificationRead,
} from "../../utils/authService";
import UserDropdown from "./UserDropdown";
import NotificationDropdown from "./NotificationDropdown";
import { FloatingParticles } from "../../../utils/FloatingParticles";



// ---------------- Main Header ----------------
const UserHeader = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const isSidebarOpen = useSelector((store) => store.user.isSidebarOpen);
  const dispatch = useDispatch();
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const siteConfig = useSelector((state) => state.user.siteConfig);
  const baseHeight = siteConfig?.logoSize || 4;
  const notifications = useSelector((store) => store.user.notification) || [];

  const sidebarHandler = () => dispatch(handleToggleSidebar(!isSidebarOpen));

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  console.log(unreadCount);

  // Fetch notifications for logged user
  useEffect(() => {
    if (!loggedUser?._id) return;

    const fetchNotifications = async () => {
      try {
        const { data } = await backendApi.get(
          `/get-all-notification/${loggedUser._id}`
        );
        if (data.success) {
          dispatch(setNotification(data.data));
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, [loggedUser?._id, dispatch]);

  return (
    <nav 
    
 className="sticky top-0 z-50 h-16 w-full text-white
                 bg-gradient-to-r from-black via-blue-950 to-black
                 border-b border-emerald-400/20 "
    
    
    >
            <FloatingParticles />
      
      <div className="flex justify-between items-center md:px-5">
        {/* Left Logo */}
        <div className="flex gap-2">
          <button className="sm:hidden" onClick={sidebarHandler}>
            <Menu />
          </button>
          <a href="/user/dashboard" className="mr-4">
            {siteConfig?.logo ? (
              <img
                src={siteConfig.logo}
                alt="Logo"
                className="block md:hidden object-contain w-auto dynamic-logo"
              />
            ) : null}

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
        <div className="px-6 py-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-light text-center w-full">
            📈 Forex
          </h1>
          <div className="border-b border-white/30 mt-1 w-24 mx-auto" />
        </div>

        {/* Right Side: Notifications + User */}
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
            userId={loggedUser?._id}
          />

          {/* User */}
          <div className="flex items-center text-gray-200 gap-1">
            <CheckCircle className="w-4 mt-1" />
            <p className="md:text-sm text-[10px] font-semibold whitespace-nowrap">
              {loggedUser?.firstName}
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
          <UserDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
          />
        </div>
      </div>
    </nav>
  );
};

export default UserHeader;
