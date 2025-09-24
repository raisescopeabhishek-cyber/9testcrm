import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  Mail,
  Lock,
  LogIn,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
} from "lucide-react";
import { backendApi } from "../../utils/apiClients";
import { setLoggedUser } from "../../redux/user/userSlice";
import ModernHeading from "../lib/ModernHeading";

/* -------------------- Crypto-y background bits -------------------- */
const AnimatedGrid = () => (
  <div className="pointer-events-none absolute inset-0 opacity-10">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(rgba(16,185,129,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.25) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        maskImage:
          "radial-gradient(ellipse at 50% 30%, black 60%, transparent 85%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at 50% 30%, black 60%, transparent 85%)",
      }}
    />
  </div>
);

const FloatingOrbs = () => (
  <div className="pointer-events-none absolute inset-0">
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full blur-2xl"
        style={{
          width: 160,
          height: 160,
          left: `${(i * 127) % 100}%`,
          top: `${(i * 83) % 100}%`,
          background:
            i % 3 === 0
              ? "radial-gradient(circle at center, rgba(16,185,129,0.25), transparent 60%)"
              : i % 3 === 1
              ? "radial-gradient(circle at center, rgba(34,211,238,0.25), transparent 60%)"
              : "radial-gradient(circle at center, rgba(99,102,241,0.25), transparent 60%)",
        }}
        animate={{
          y: [0, i % 2 ? -18 : 18, 0],
          x: [0, i % 2 ? 14 : -14, 0],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 6 + (i % 5),
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.15,
        }}
      />
    ))}
  </div>
);

/* -------------------- Glass card wrapper -------------------- */
const GlassCard = ({ className = "", children }) => (
  <motion.div
    initial={{ opacity: 0, y: 18, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={`relative w-full max-w-md rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl shadow-[0_0_60px_rgba(16,185,129,0.15)] ${className}`}
  >
    <div className="absolute inset-px rounded-[calc(1rem-1px)] bg-gradient-to-br from-emerald-400/5 via-cyan-400/5 to-indigo-400/5 pointer-events-none" />
    <div className="relative p-8 md:p-10">{children}</div>
  </motion.div>
);

/* -------------------- Ticker (mocked) -------------------- */
const Ticker = () => {
  const coins = [
    { s: "BTC", p: 61234.12, c: +2.14 },
    { s: "ETH", p: 2431.78, c: -0.86 },
    { s: "SOL", p: 162.45, c: +4.21 },
    { s: "XRP", p: 0.62, c: +1.37 },
    { s: "DOGE", p: 0.146, c: -2.05 },
  ];
  return (
    <div className="relative w-full overflow-hidden border-b border-emerald-400/20 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent">
      <motion.div
        className="flex gap-6 whitespace-nowrap py-2 text-xs px-3"
        animate={{ x: ["0%", "-100%"] }}
        transition={{ duration: 18, ease: "linear", repeat: Infinity }}
      >
        {[...coins, ...coins].map((c, i) => (
          <span
            key={i}
            className="font-mono"
            title={`${c.s} ${c.p.toLocaleString()}`}
          >
            {c.s}:{" "}
            <span className="text-white/90">
              {c.p < 1 ? c.p.toFixed(4) : c.p.toLocaleString()}
            </span>{" "}
            <span className={c.c >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {c.c >= 0 ? "▲" : "▼"} {Math.abs(c.c)}%
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const siteConfig = useSelector((state) => state.user.siteConfig);
  const baseHeight = siteConfig?.logoSize || 4;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await backendApi.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        { email, password, remember }
      );

      if (!res?.data) {
        toast.error("Unexpected response from server.");
        return;
      }
      if (!res.data.status) {
        toast.error(res.data.message || "Login failed!");
        return;
      }

      toast.success(`Welcome 👋🏽 ${res.data.user.firstName}`);
      dispatch(setLoggedUser(res.data.user));
      setTimeout(() => navigate("/user/dashboard"), 600);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed! Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsResetLoading(true);
    try {
      const res = await backendApi.post(`/send-reset-link`, { email: resetEmail });
      if (!res?.data) {
        toast.error("Unexpected response from server.");
        return;
      }
      toast.success(res.data.message || "Reset link sent successfully!");
      setResetEmail("");
      setShowForgotPassword(false);
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to send reset email!";
      toast.error(message);
    } finally {
      setIsResetLoading(false);
    }
  };

  const inputWrap = "relative group";
  const inputBase =
    "w-full pl-10 pr-12 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400/50 transition";

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      <Toaster position="top-right" />
      <AnimatedGrid />
      <FloatingOrbs />

      {/* Ticker */}
      <Ticker />

      <div className="flex flex-1">
        {/* Left promo (hidden on small) */}
        <div className="hidden xl:flex flex-col justify-center items-center w-1/2 px-14">
          <motion.img
            src={
              siteConfig?.logo ||
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAeFBMVEX///8AAAC2trYaGhrY2NhfX19kZGSxsbGOjo78/Pzx8fHS0tIwMDBISEjFxcXj4+N2dnakpKRTU1Pg4OA7Ozvr6+s1NTWIiIjw8PCVlZXMzMxQUFBzc3O7u7vGxsapqakmJiYPDw8dHR2bm5t+fn5qamojIyNBQUGjxSU6AAAEw0lEQVR4nO2c2ZayOhBGiQM2iDjgbOPQavv+b3ioCiJI8OqnOVXr21ch9HJld6BSSQDPAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAFKeg6xa0SxyZrpvQKuOHMZoNBwdjNBtOfWM0G26/jdFsGG6MUW24s2q3s1LDufXzV0edfTi6sNZi4Hk/Gg1je2Eu957ty4k2wxX7nWMqB1lpnWoz9LIY2u/Z4i2T2+szDM08LyWZ28HrqTN8QXfgVLMhqd08xYYUZkyg2ZCyUoo4ag3HHGY8xYaUzayooNWQZhZXLik1HFA2Y4tptDx32pZ2oGs06boRbULp2q7rRrTJ8XWN6iQ0nK4pZpEJnrpuRJtcaX7fdSPaZJDno2rhhHvfdSva5KB9oNg8E26t0KLMRfNNSCszZtB1K1qEh/pR161ok6VdmdGLXxvqVzkdNehfQ2H0txJljrp213i/qdJb4VOw31Wb/ilpPYweVBnuySSuVNEmacp5qgZDTrerMyZynnlaDKemlo1us5qICioMec/wbSBcPuOOBkMWvFfrvovbUoEhC/rVOho6vmxRviELDqt1+1J2I96Qg8yiXldkN9INE0cPBpdydiPccOwQ5DA6Lo5kGx4dUdQbVieJog1HJs9bymxeYZSRbMhP523ea7Mu/C4fCzacmWIXtIxvt+8LxBoGtDtRdbH4b0s1Ug2356a1bSWGPEpcnDtoOgxPJLgOnedUGM4cuXaBAsPtsj7fLSHfkFdk3pZkyog3/CK/n1qMSeen05xDq3DDcOK+Be3LFZzfyDaMWWReq7/bdVFOR0Ub3ox794yWfh8P+YYJpzHD2v5nGPEccSfe8Grqq75Eki8lfgk3nPIgGNXztPg5wxBueH3FSseJlEqiDZM1J9rj+pn7K/RINuRB3rV9vaUYE22LvxJquO/zFqCjA/eVhTaphqHfdAfaZZpXAi7U0EaYteuBZt7hPb6ORRoefxuyNC9/8668bS/QcMprTWa4dZ4lw8okX5xhaJPQc9ODlOIN7Q3ovkAZ4YYj6zdzrzUxog1T+wb2wvlKSDoc8gnBhnHEfpHzBrTDI43+Yg1jTkFNP3We7dmrV7Bhavuv4W2J1fMxLrGGvehjALXhNV5KNQzml49+Y85v7oEXyTTcfpmPfiFPBPsUfUQaJvm3ci5NbytdX4uFEg3jifWL3PEz+wO+fg95mi3PMM9fFk0J6ID/AZdCX56hRwLfja+02o2Y0k6TQMON2X3IP2m18F6eQAk0DJve4uH6zHBSqRVo2EBw5ZcI1BoGNEBQQalhYAdAKqo0DJ8JDh0oNFzdjNFsOMi3c+eJTsP4wXo/J/skM1cpMgznvENhlpyg6TOczqr5qT5De//dik1efYZZF/5eS01WaViZ/6o0rKxgwBCGBTD8M2BYAEMYdgYMC2AIw86AYQEMYdgZMCyA4f/W8Pa2TrPKDffvhuv84Xzz9g3PXb5TfH97/zkx5qeF9n4mWQzf8bOuefilCnp8lo4nWReU6/2LMQcqZOcrP5CZr7M/9M/ZD5VPHPIfyn/2b74QPTbd4XjmvwX2HRr+zcdbV6NeV4y0fGEQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIDW+A9JJUQmMzty7gAAAABJRU5ErkJggg=="
            }
            alt="Logo"
            className="object-contain mb-6"
            initial={{ rotate: 0 }}
            whileHover={{ rotate: -3, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
            style={{ height: `${baseHeight}rem` }}
          />

          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-emerald-300 uppercase tracking-[0.25em] text-xs font-semibold">
              <Sparkles size={16} /> secure · fast · modern
            </div>
            <ModernHeading text="Welcome to Our Platform" />
            <p className="mt-3 text-emerald-200/80 max-w-md">
              Trade smarter with real-time performance, encrypted access, and a sleek web app UX.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-white/70 text-sm">
              <Shield className="w-4 h-4" /> 2FA ready • Encrypted transit • Session hardening
            </div>
          </div>
        </div>

        {/* Right: Auth card */}
        <div className="flex justify-center items-center w-full xl:w-1/2 p-6">
          <GlassCard>
            <AnimatePresence mode="wait">
              {!showForgotPassword ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex flex-col items-center mb-6">
                    <motion.img
                      src={
                        siteConfig?.logo ||
                        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAeFBMVEX///8AAAC2trYaGhrY2NhfX19kZGSxsbGOjo78/Pzx8fHS0tIwMDBISEjFxcXj4+N2dnakpKRTU1Pg4OA7Ozvr6+s1NTWIiIjw8PCVlZXMzMxQUFBzc3O7u7vGxsapqakmJiYPDw8dHR2bm5t+fn5qamojIyNBQUGjxSU6AAAEw0lEQVR4nO2c2ZayOhBGiQM2iDjgbOPQavv+b3ioCiJI8OqnOVXr21ch9HJld6BSSQDPAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAFKeg6xa0SxyZrpvQKuOHMZoNBwdjNBtOfWM0G26/jdFsGG6MUW24s2q3s1LDufXzV0edfTi6sNZi4Hk/Gg1je2Eu957ty4k2wxX7nWMqB1lpnWoz9LIY2u/Z4i2T2+szDM08LyWZ28HrqTN8QXfgVLMhqd08xYYUZkyg2ZCyUoo4ag3HHGY8xYaUzayooNWQZhZXLik1HFA2Y4tptDx32pZ2oGs06boRbULp2q7rRrTJ8XWN6iQ0nK4pZpEJnrpuRJtcaX7fdSPaZJDno2rhhHvfdSva5KB9oNg8E26t0KLMRfNNSCszZtB1K1qEh/pR161ok6VdmdGLXxvqVzkdNehfQ2H0txJljrp213i/qdJb4VOw31Wb/ilpPYweVBnuySSuVNEmacp5qgZDTrerMyZynnlaDKemlo1us5qICioMec/wbSBcPuOOBkMWvFfrvovbUoEhC/rVOho6vmxRviELDqt1+1J2I96Qg8yiXldkN9INE0cPBpdydiPccOwQ5DA6Lo5kGx4dUdQbVieJog1HJs9bymxeYZSRbMhP523ea7Mu/C4fCzacmWIXtIxvt+8LxBoGtDtRdbH4b0s1Ug2356a1bSWGPEpcnDtoOgxPJLgOnedUGM4cuXaBAsPtsj7fLSHfkFdk3pZkyog3/CK/n1qMSeen05xDq3DDcOK+Be3LFZzfyDaMWWReq7/bdVFOR0Ub3ox794yWfh8P+YYJpzHD2v5nGPEccSfe8Grqq75Eki8lfgk3nPIgGNXztPg5wxBueH3FSseJlEqiDZM1J9rj+pn7K/RINuRB3rV9vaUYE22LvxJquO/zFqCjA/eVhTaphqHfdAfaZZpXAi7U0EaYteuBZt7hPb6ORRoefxuyNC9/8668bS/QcMprTWa4dZ4lw8okX5xhaJPQc9ODlOIN7Q3ovkAZ4YYj6zdzrzUxog1T+wb2wvlKSDoc8gnBhnHEfpHzBrTDI43+Yg1jTkFNP3We7dmrV7Bhavuv4W2J1fMxLrGGvehjALXhNV5KNQzml49+Y85v7oEXyTTcfpmPfiFPBPsUfUQaJvm3ci5NbytdX4uFEg3jifWL3PEz+wO+fg95mi3PMM9fFk0J6ID/AZdCX56hRwLfja+02o2Y0k6TQMON2X3IP2m18F6eQAk0DJve4uH6zHBSqRVo2EBw5ZcI1BoGNEBQQalhYAdAKqo0DJ8JDh0oNFzdjNFsOMi3c+eJTsP4wXo/J/skM1cpMgznvENhlpyg6TOczqr5qT5De//dik1efYZZF/5eS01WaViZ/6o0rKxgwBCGBTD8M2BYAEMYdgYMC2AIw86AYQEMYdgZMCyA4f/W8Pa2TrPKDffvhuv84Xzz9g3PXb5TfH97/zkx5qeF9n4mWQzf8bOuefilCnp8lo4nWReU6/2LMQcqZOcrP5CZr7M/9M/ZD5VPHPIfyn/2b74QPTbd4XjmvwX2HRr+zcdbV6NeV4y0fGEQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIDW+A9JJUQmMzty7gAAAABJRU5ErkJggg=="
                      }
                      alt="Logo"
                      className="object-contain dynamic-logo"
                      initial={{ rotate: 0 }}
                      whileHover={{ rotate: -3, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      style={{ height: `${baseHeight}rem` }}
                    />
                    <ModernHeading text="Welcome Back" />
                    <p className="text-emerald-200/80 mt-2">
                      Enter your credentials to access your account
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email */}
                    <div className={inputWrap}>
                      <Mail className="absolute top-3.5 left-3 text-emerald-300" />
                      <input
                        type="email"
                        className={inputBase}
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    {/* Password */}
                    <div className={inputWrap}>
                      <Lock className="absolute top-3.5 left-3 text-emerald-300" />
                      <input
                        type={showPass ? "text" : "password"}
                        className={inputBase}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((s) => !s)}
                        className="absolute right-3 top-3.5 text-white/60 hover:text-white"
                        aria-label={showPass ? "Hide password" : "Show password"}
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Row: remember + forgot */}
                    <div className="flex items-center justify-between text-sm">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          className="accent-emerald-400"
                          checked={remember}
                          onChange={() => setRemember((v) => !v)}
                        />
                        <span className="text-white/80">Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-emerald-300 hover:text-emerald-200"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Submit */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex gap-2 items-center justify-center py-3 px-4 rounded-lg text-black font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 hover:brightness-110 shadow-[0_10px_30px_rgba(16,185,129,0.35)] disabled:opacity-60"
                    >
                      <LogIn size={20} />
                      Sign in
                      {isLoading && <Loader2 className="animate-spin" />}
                    </motion.button>
                  </form>

                  <p className="mt-6 text-center text-sm text-white/70">
                    Don&apos;t have an account?{" "}
                    <Link
                      to="/user/signup"
                      className="font-semibold text-emerald-300 hover:text-emerald-200"
                    >
                      Sign up
                    </Link>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className="flex items-center text-emerald-300 hover:text-emerald-200 mb-6"
                  >
                    <ArrowLeft size={20} className="mr-2" /> Back to login
                  </button>
                  <div className="mb-2">
                    <ModernHeading text="Forgot Password" />
                    <p className="text-emerald-200/80 mt-2">
                      Enter your email and we’ll send you a secure reset link.
                    </p>
                  </div>

                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div className="relative">
                      <Mail className="absolute top-3.5 left-3 text-emerald-300" />
                      <input
                        type="email"
                        className={inputBase}
                        placeholder="Email address"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isResetLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-black font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 hover:brightness-110 shadow-[0_10px_30px_rgba(16,185,129,0.35)] disabled:opacity-60"
                    >
                      Send reset link
                      {isResetLoading && <Loader2 className="animate-spin" />}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
