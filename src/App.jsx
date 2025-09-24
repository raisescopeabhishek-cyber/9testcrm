import React, { Suspense} from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DashboardRouting from "./Components/Admin/DashboardRouting";
import AuthForm from "./Components/Auth/AuthForm";
import LoadingModal from "./LoadingModal";
import SuperAdmin_DashboardRouting from "./Components/SuperAdmin/DashboardRouting";
import PasswordScreen from "./Components/SuperAdmin/PasswordScreen";
import UserDashboardRouting from "./Components/user/UserDashboardRouting";
import UserLogin from "./Components/user/UserLogin";
import UserSignUp from "./Components/user/UserSignUp";
import UserVerify from "./Components/user/UserVerify";
import UserResetPassword from "./Components/user/UserResetPassword";
import {  useSelector } from "react-redux";
// import UserAuthForm from "./Components/User/AuthForm"; // NEW

const RequireAuth = ({ children }) => {
  const location = useLocation();

  // Admin authentication
  const isAdmin = localStorage.getItem("admin_password_ref");

  // Super Admin authentication
  const superAdminData = sessionStorage.getItem("adminAuth");
  const isSuperAdmin =
    superAdminData &&
    (() => {
      try {
        const { isAuthenticated, expiry } = JSON.parse(superAdminData);
        return isAuthenticated && Date.now() < expiry;
      } catch {
        return false;
      }
    })();

  // User authentication
  const isUser = useSelector((store) => store.user.loggedUser);

  // Role-based checks
  if (location.pathname.startsWith("/admin")) {
    return isAdmin ? children : <Navigate to="/admin/authentication" replace />;
  }

  if (location.pathname.startsWith("/s-admin")) {
    return isSuperAdmin ? (
      children
    ) : (
      <Navigate to="/s-admin/authentication" replace />
    );
  }

  if (location.pathname.startsWith("/user")) {
    if (isUser) {
      return children;
    } else {
      // List of routes you want to potentially redirect to
      const fallbackRoutes = [
        "/user/login",
        "/user/signup",
        "/user/verify/:id/:token", // example
        "/user/reset-password/:token", // example
        "/user/signup/:id", // example
      ];

      // Pick one randomly
      const redirectPath =
        fallbackRoutes[Math.floor(Math.random() * fallbackRoutes.length)];

      return <Navigate to={redirectPath} replace />;
    }
  }

  // Default redirect if path doesn't match a role
  return <Navigate to="/authentication" replace />;
};

const App = () => {
  // const location = useLocation();
  //   useEffect(() => {
  //     console.log("fsdf");
      
  //     // fetchNotifications();
  //   }, [location]);
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <Suspense fallback={<LoadingModal />}>
        <Routes>
          {/* Default route → redirect to /user */}
          <Route path="/" element={<Navigate to="/user" replace />} />
          {/* User login */}
          {/* <Route path="/user/authentication" element={<UserAuthForm />} /> */}
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/signup" element={<UserSignUp />} />{" "}
          {/* <-- Add signup component here */}
          <Route path="/user/signup/:id" element={<UserSignUp />} />
          <Route path="/user/verify/:id/:token" element={<UserVerify />} />
          <Route
            path="/user/reset-password/:token"
            element={<UserResetPassword />}
          />
          {/* Admin login */}
          <Route path="/admin/authentication" element={<AuthForm />} />
          {/* Super Admin login */}
          <Route
            path="/s-admin/authentication"
            element={
              <PasswordScreen
                onAuthenticate={() => window.location.replace("/s-admin")}
              />
            }
          />
          {/* User protected */}
          <Route
            path="/user/*"
            element={
              <RequireAuth>
                <UserDashboardRouting />
              </RequireAuth>
            }
          />
          {/* Admin protected */}
          <Route
            path="/admin/*"
            element={
              <RequireAuth>
                <DashboardRouting />
              </RequireAuth>
            }
          />
          {/* Super Admin protected */}
          <Route
            path="/s-admin/*"
            element={
              <RequireAuth>
                <SuperAdmin_DashboardRouting />
              </RequireAuth>
            }
          />
          {/* Catch-all → redirect to /user */}
          <Route path="*" element={<Navigate to="/user" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
