import { useState, useMemo } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  AlertCircle,
  Shield,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ModernHeading from "../lib/ModernHeading";
import { backendApi } from "../../utils/apiClients";
import UseUserHook from "../../hooks/user/UseUserHook";
import { FloatingParticles } from "../../utils/FloatingParticles";

/* ============================== THEME DECOR ============================== */

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
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      style={{
        background:
          "repeating-linear-gradient(90deg, rgba(59,130,246,0.08) 0 2px, transparent 2px 8px)",
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
          width: 140,
          height: 140,
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

const GlassCard = ({ children, className = "" }) => (
  <motion.div
    whileHover={{ y: -2 }}
    transition={{ type: "spring", stiffness: 250, damping: 20 }}
    className={`relative rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-slate-900/70 via-slate-900/30 to-slate-900/70 backdrop-blur-xl shadow-[0_0_80px_rgba(16,185,129,0.08)] ${className}`}
  >
    <div className="absolute inset-px rounded-[calc(1rem-1px)] bg-gradient-to-br from-emerald-300/5 via-cyan-300/5 to-indigo-300/5 pointer-events-none" />
    {children}
  </motion.div>
);

/* ============================== COMPONENT ================================ */

const UserChnagePassword = () => {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [error, setError] = useState("");

  const loggedUser = useSelector((store) => store.user.loggedUser);
  const navigate = useNavigate();
  const { getUpdateLoggedUser } = UseUserHook();

  const handleChange = (e) => {
    setPasswords((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((s) => ({ ...s, [field]: !s[field] }));
  };

  const currentDateTime = new Date();
  const formattedDateTime =
    currentDateTime.toLocaleDateString("en-GB") +
    ", " +
    currentDateTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  /* NOTE: Consider NOT sending plaintext passwords over email. It’s a security risk.
     If you must keep behavior, it remains below to match your API. */
  const customContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Updated - ${
        import.meta.env.VITE_WEBSITE_NAME || "Forex"
      }</title>
      <style>
        body, html { margin: 0; padding: 0; font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; padding: 5px; background-color: #ffffff; }
        .header { background-color: #19422df2; color: #ffffff; padding: 20px 15px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 22px; letter-spacing: 1px; }
        .content { padding: 10px 20px; }
        .cta-button { display: inline-block; padding: 12px 24px; background-color: #2d6a4f; color: #FFFFFF; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
        .footer { background-color: #19422df2; color: #ffffff; text-align: center; padding: 5px 10px; font-size: 12px; border-radius: 0 0 10px 10px; }
        .footer-info { margin-top: 6px; }
        .footer-info a { color: #0ec097; text-decoration: none; }
        .withdrawal-details { background-color: #f8f8f8; border-left: 4px solid #2d6a4f; padding: 15px; margin: 20px 0; }
        .withdrawal-details p { margin: 5px 0; }
        .highlight { font-weight: bold; color: #0a2342; }
        .risk-warning { color: #C70039; padding: 5px; font-size: 12px; line-height: 1.4; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>Account Password Updated</h1></div>
        <div class="content">
          <p>Dear ${loggedUser?.firstName + " " + loggedUser?.lastName},</p>
          <p>Your account password has been successfully updated.</p>
          <div class="withdrawal-details">
            <p>New password: <span class="highlight">${
              passwords.confirm
            }</span></p>
            <p>Updated Date: <span class="highlight">${formattedDateTime}</span></p>
          </div>
          <p>Thank you for choosing us.</p>
          <p>Best regards,<br/>The ${
            import.meta.env.VITE_WEBSITE_NAME || "Forex"
          } Team</p>
          <hr/>
          <div class="risk-warning">
            <strong>Risk Warning:</strong> Trading CFDs carries high risk and may result in losses beyond your initial investment. Trade only with money you can afford to lose and understand the risks.
            <br/><br/>Our services are not for U.S. citizens or in jurisdictions where they violate local laws.
          </div>
        </div>
        <div class="footer">
          <div class="footer-info">
            <p>Website: <a href="https://${
              import.meta.env.VITE_EMAIL_WEBSITE
            }">${import.meta.env.VITE_EMAIL_WEBSITE}</a> | 
            E-mail: <a href="mailto:${
              import.meta.env.VITE_EMAIL_EMAIL || ""
            }">${import.meta.env.VITE_EMAIL_EMAIL || ""}</a></p>
            <p>© 2025 ${
              import.meta.env.VITE_WEBSITE_NAME || ""
            }. All Rights Reserved</p>
          </div>
        </div>
      </div>
    </body>
    </html>`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Please wait…");
    if (passwords.new !== passwords.confirm) {
      setError("Passwords do not match. Please try again.");
      toast.error("Passwords do not match", { id: toastId });
      return;
    }
    try {
      const res = await backendApi.post(`/update-password`, {
        userId: loggedUser._id,
        currentPassword: passwords.current,
        newPassword: passwords.confirm,
      });
      await backendApi.post(`/custom-mail`, {
        email: loggedUser.email,
        content: customContent,
        subject: "Account Password Changed",
      });
      toast.success(res?.data?.msg || "Password updated", { id: toastId });
      navigate("/user/dashboard");
      getUpdateLoggedUser();
    } catch (error) {
      console.log("error while changing password--", error);
      toast.error(error?.response?.data?.message || "Update failed", {
        id: toastId,
      });
    }
  };

  /* ------------------------- Password strength ------------------------- */
  const strength = useMemo(() => {
    const v = passwords.new;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    const labels = ["Very Weak", "Weak", "Good", "Strong", "Excellent"];
    const colors = ["#ef4444", "#f59e0b", "#22c55e", "#10b981", "#06b6d4"];
    return { score, label: labels[score], color: colors[score] };
  }, [passwords.new]);

  const rule = (ok) => (ok ? "text-emerald-300" : "text-white/50");

  return (
    <motion.div
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

            <FloatingParticles/>
      <AnimatedGrid />
      <FloatingOrbs />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10 md:px-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-emerald-400" />
            <span className="uppercase tracking-[0.25em] text-xs text-emerald-300/80 font-semibold">
              security · identity · wallet
            </span>
          </div>
          <motion.div
            initial={{ scale: 0.98, rotateX: 10, opacity: 0 }}
            animate={{ scale: 1, rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-block"
          >
            <ModernHeading text="⚡ Change Password" />
          </motion.div>
        </div>

        {/* Card */}
        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {(["current", "new", "confirm"] as const).map((field) => (
              <motion.div
                key={field}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor={field}
                    className="text-[11px] tracking-[0.25em] uppercase text-emerald-300/80"
                  >
                    {field} password
                  </label>
                  {field === "new" && (
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Shield size={14} className="text-emerald-300" />
                      <span className="font-mono">Strength: </span>
                      <span style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center text-emerald-300/80 pointer-events-none">
                    <Lock size={18} />
                  </div>
                  <motion.input
                    type={showPasswords[field] ? "text" : "password"}
                    id={field}
                    name={field}
                    value={passwords[field]}
                    onChange={handleChange}
                    whileFocus={{ scale: 1.01 }}
                    className="w-full pl-10 pr-10 py-3 rounded-xl outline-none text-white/90
                      bg-gradient-to-br from-slate-900/70 to-slate-900/30 border border-emerald-400/20
                      focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400/50 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(field)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-200/80 hover:text-white transition"
                    aria-label="Toggle password visibility"
                  >
                    {showPasswords[field] ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                  <motion.div
                    className="pointer-events-none absolute inset-0 rounded-xl"
                    initial={false}
                    animate={{
                      boxShadow: [
                        "0 0 0px rgba(16,185,129,0)",
                        "0 0 16px rgba(16,185,129,0.22)",
                        "0 0 0px rgba(16,185,129,0)",
                      ],
                    }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                  />
                </div>

                {/* Strength bar only for 'new' */}
                {field === "new" && (
                  <div className="mt-3">
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, #22c55e, #06b6d4)`,
                        }}
                        initial={{ width: "0%" }}
                        animate={{ width: `${(strength.score / 4) * 100}%` }}
                        transition={{
                          type: "spring",
                          stiffness: 120,
                          damping: 18,
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                      <span className={rule(passwords.new.length >= 8)}>
                        • 8+ chars
                      </span>
                      <span className={rule(/[A-Z]/.test(passwords.new))}>
                        • Uppercase
                      </span>
                      <span className={rule(/[0-9]/.test(passwords.new))}>
                        • Number
                      </span>
                      <span
                        className={rule(/[^A-Za-z0-9]/.test(passwords.new))}
                      >
                        • Symbol
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            <AnimatePresence>
              {error && (
                <motion.div
                  className="text-red-400 flex items-center mt-1"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <AlertCircle className="mr-2" size={18} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col-reverse gap-4 sm:flex-row justify-between items-center mt-8">
              <Link
                to={"/user/dashboard"}
                className="w-full sm:w-auto text-center text-white/80 py-3 px-6 rounded-full
                  border border-white/15 bg-white/5 hover:bg-white/10 transition"
              >
                Cancel
              </Link>

              <motion.button
                type="submit"
                className="w-full sm:w-auto relative inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold text-black
                  bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 shadow-[0_10px_40px_rgba(16,185,129,0.35)]"
                initial={{ scale: 0.99 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckCircle size={18} />
                Update Password
                <motion.span
                  className="absolute inset-0 rounded-full opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background:
                      "radial-gradient(120% 120% at 50% 10%, rgba(255,255,255,0.35), transparent 40%)",
                  }}
                />
              </motion.button>
            </div>
          </form>
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default UserChnagePassword;
