import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Sparkles,
  Coins,
  Cpu,
  ShieldCheck,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { backendApi } from "../../utils/apiClients";
import ModernHeading from "../lib/ModernHeading";
import UserNewChallengeHook from "../../hooks/user/UseNewChallengeHook";
import UseUserHook from "../../hooks/user/UseUserHook";
import { FloatingParticles } from "../../utils/FloatingParticles";
import { FloatingOrbs } from "../../utils/FloatingOrbs";
import { AnimatedGrid } from "../../utils/AnimatedGrid";









/* ========================== DECOR / THEME ========================== */



const GlassCard = ({ className = "", children }) => (
  <motion.div
    whileHover={{ y: -2 }}
    transition={{ type: "spring", stiffness: 250, damping: 20 }}
    className={`relative rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-slate-950/90 via-slate-900/40 to-slate-950/90 backdrop-blur-xl shadow-[0_0_80px_rgba(16,185,129,0.10)] ${className}`}
  >
    <div className="absolute inset-px rounded-[calc(1rem-1px)] bg-gradient-to-br from-emerald-300/5 via-cyan-300/5 to-indigo-300/5 pointer-events-none" />
    {children}
  </motion.div>
);

/* ========================== COMPONENT ========================== */

export default function UserNewChallenge() {
  const navigate = useNavigate();
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const siteConfig = useSelector((state) => state.user.siteConfig);

  const { getPlatforms, getPaymentMethod } = UserNewChallengeHook();
  const { getUpdateLoggedUser } = UseUserHook();
  const platformData = useSelector((store) => store.user.platforms);

  const [accountConfigurations, setAccountConfigurations] = useState([]);
  const [creatingLoading, setCreatingLoading] = useState(false);

  const [formData, setFormData] = useState({
    accountType: "",
    apiGroup: "",
    platform: "",
    leverage: "",
  });

  const filteredPlatformData = useMemo(
    () => (platformData || []).filter((p) => p?.status === "active"),
    [platformData]
  );

  const selectedConfig = useMemo(
    () =>
      accountConfigurations?.find((v) => v.accountType === formData.accountType),
    [accountConfigurations, formData.accountType]
  );

  /* --------------------------- Fetch configs --------------------------- */
  const fetchAccountConfigurations = async () => {
    try {
      const res = await backendApi.get(`/get-account-types`);
      setAccountConfigurations(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (error) {
      console.log("Error fetching account types", error);
      toast.error("Failed to fetch account types");
    }
  };

  useEffect(() => {
    getPlatforms();
    getPaymentMethod();
    fetchAccountConfigurations();
  }, []);

  // Auto-pick first leverage on accountType change
  useEffect(() => {
    if (selectedConfig?.leverage?.length) {
      setFormData((prev) => ({
        ...prev,
        leverage: selectedConfig.leverage[0]?.value || "",
        apiGroup: selectedConfig.apiGroup || prev.apiGroup,
      }));
    }
  }, [selectedConfig?.leverage, selectedConfig?.apiGroup]);

  // If there’s a single platform, pre-select it
  useEffect(() => {
    if (filteredPlatformData?.length === 1) {
      setFormData((prev) => ({ ...prev, platform: filteredPlatformData[0]?.name || "" }));
    }
  }, [filteredPlatformData]);

  /* --------------------------- Handlers --------------------------- */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "accountType") {
      const cfg = accountConfigurations?.find((c) => c.accountType === value);
      setFormData((prev) => ({
        ...prev,
        accountType: value,
        apiGroup: cfg?.apiGroup || "",
        leverage: cfg?.leverage?.[0]?.value || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const createAccountHandler = async () => {
    if (creatingLoading) return;

    // Validation
    if (!loggedUser?._id) {
      toast.error("Please sign in to create an account.");
      return;
    }
    if (!formData.accountType) return toast.error("Select an account type.");
    if (!formData.leverage) return toast.error("Select leverage.");
    if (!formData.platform) return toast.error("Choose a platform.");

    setCreatingLoading(true);
    const toastID = toast.loading("Creating your account...");

    try {
      const response = await backendApi.post(`/create-mt5-account/${loggedUser._id}`, {
        leverage: formData.leverage,
        accountType: formData.accountType,
        groupName: formData.apiGroup,
        platform: formData.platform,
        siteConfig,
        VITE_MANAGER_INDEX: import.meta.env.VITE_MANAGER_INDEX,
        VITE_WEBSITE_NAME: import.meta.env.VITE_WEBSITE_NAME,
        VITE_EMAIL_WEBSITE: import.meta.env.VITE_EMAIL_WEBSITE,
      });

      if (response?.data?.message === "MT5 account created successfully") {
        toast.success("Account created successfully!", { id: toastID });
        await getUpdateLoggedUser();
        navigate("/user/challenges");
      } else {
        toast.error(response?.data?.message || "Failed to create account", { id: toastID });
      }
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong while creating the account.", { id: toastID });
    } finally {
      setCreatingLoading(false);
    }
  };

  /* --------------------------- Anim --------------------------- */
  const container = {
    hidden: { opacity: 0, y: 30, scale: 0.98, rotateX: 6 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: { duration: 0.8, when: "beforeChildren", staggerChildren: 0.06 },
    },
  };

  /* --------------------------- UI --------------------------- */
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white"
    >
      <AnimatedGrid />
      <FloatingOrbs />
    <FloatingParticles/>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 md:px-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-emerald-400" />
            <span className="uppercase tracking-[0.25em] text-xs text-emerald-300/80 font-semibold">
              accounts · mt5 · setup
            </span>
          </div>
          <ModernHeading text="Open MT5 Account" />
          <p className="text-white/70 mt-1">
            Pick your account type, dial the leverage, choose your platform — you’re live in minutes.
          </p>
        </div>

        {/* Layout: Left (form) + Right (review) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Form */}
          <GlassCard className="lg:col-span-7 p-6">
            {/* Step 1 & 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Type */}
              <div>
                <label className="block mb-2 font-semibold flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-300" />
                  1. Choose Account Type
                </label>
                <div className="relative">
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                    className="w-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white p-3 rounded-lg appearance-none outline-none focus:ring-2 focus:ring-emerald-400/40 border border-white/10"
                  >
                    <option value="" disabled className="bg-slate-950">
                      Select Account Type
                    </option>
                    {accountConfigurations?.map((opt) => (
                      <option key={opt.accountType} value={opt.accountType} className="bg-slate-900">
                        {opt.accountType}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>

              {/* Leverage */}
              <div>
                <label className="block mb-2 font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  2. Choose Leverage
                </label>
                <div className="relative">
                  <select
                    name="leverage"
                    value={formData.leverage}
                    onChange={handleInputChange}
                    disabled={!selectedConfig?.leverage?.length}
                    className="w-full disabled:opacity-50 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white p-3 rounded-lg appearance-none outline-none focus:ring-2 focus:ring-emerald-400/40 border border-white/10"
                  >
                    <option value="" disabled className="bg-slate-950">
                      {selectedConfig?.leverage?.length ? "Select Leverage" : "Select account type first"}
                    </option>
                    {selectedConfig?.leverage?.map((l) => (
                      <option key={l.value} value={l.value} className="bg-slate-900">
                        {l.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>
            </div>

            {/* Step 3: Platform */}
            <div className="mt-8">
              <label className="block mb-4 font-semibold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-300" />
                3. Choose your Platform
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <AnimatePresence initial={false}>
                  {filteredPlatformData?.map((plt, i) => {
                    const active = formData.platform === plt.name;
                    return (
                      <motion.button
                        key={plt.name}
                        onClick={() => setFormData((p) => ({ ...p, platform: plt.name }))}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                          active
                            ? "bg-emerald-500/15 border-emerald-400/40 shadow-[0_0_25px_rgba(16,185,129,0.25)]"
                            : "bg-white/5 border-white/10 hover:border-emerald-400/30"
                        }`}
                      >
                        <span className="text-2xl">{plt.logo ?? "🧭"}</span>
                        <span className={`font-semibold ${active ? "text-emerald-300" : "text-white/90"}`}>
                          {plt.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* CTA */}
            <div className="flex justify-center mt-10">
              <motion.button
                whileHover={{ scale: creatingLoading ? 1 : 1.03 }}
                whileTap={{ scale: creatingLoading ? 1 : 0.98 }}
                onClick={createAccountHandler}
                disabled={creatingLoading}
                className={`relative inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold
                ${creatingLoading ? "opacity-60 cursor-not-allowed" : ""}
                text-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 shadow-[0_10px_30px_rgba(16,185,129,0.35)]`}
              >
                <Zap className="w-5 h-5" />
                {creatingLoading ? "Creating..." : "Create Account"}
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
          </GlassCard>

          {/* Right: Review / Summary */}
          <GlassCard className="lg:col-span-5 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <h3 className="text-lg font-semibold">Review & Summary</h3>
            </div>

            <div className="space-y-3 text-white/90">
              <Row label="Account Type" value={formData.accountType || "—"} />
              <Row label="Leverage" value={formData.leverage || "—"} />
              <Row label="Platform" value={formData.platform || "—"} />
              <Row label="MT5 Group" value={formData.apiGroup || "—"} />
            </div>

            <div className="mt-6 text-xs text-white/60">
              By creating an account you agree to our trading terms & risk disclosure.
            </div>
          </GlassCard>
        </div>

        {/* Footer note */}
        <div className="text-center text-white/50 mt-8 text-sm">
          Fully encrypted. Lightning-fast provisioning ⚡
        </div>
      </div>
    </motion.div>
  );
}

/* --------------------------- Small bits --------------------------- */

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-white/60">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
