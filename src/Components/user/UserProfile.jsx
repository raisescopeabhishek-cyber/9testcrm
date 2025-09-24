import React, { useState } from "react";
import { User, Mail, Phone, MapPin, Flag, Shield, Cpu, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import UseUserHook from "../../hooks/user/UseUserHook";
import { backendApi } from "../../utils/apiClients";
import ModernHeading from "../lib/ModernHeading";
import { FloatingParticles } from "../../utils/FloatingParticles";

/* =========================== DECOR / THEME ============================ */

const AnimatedGrid = () => (
  <div className="absolute inset-0 pointer-events-none opacity-10">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(rgba(34,197,94,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.15) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        maskImage: "radial-gradient(ellipse at center, black 60%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 60%, transparent 100%)",
      }}
    />
    <motion.div
      className="absolute inset-0"
      animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      style={{
        background:
          "repeating-linear-gradient(90deg, rgba(0,255,200,0.06) 0px, rgba(0,255,200,0.06) 2px, transparent 2px, transparent 6px)",
      }}
    />
  </div>
);

const FloatingOrbs = () => (
  <div className="absolute inset-0 pointer-events-none">
    {Array.from({ length: 12 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full blur-2xl"
        style={{
          width: 140,
          height: 140,
          background:
            i % 3 === 0
              ? "radial-gradient(circle at center, rgba(16,185,129,0.25), transparent 60%)"
              : i % 3 === 1
              ? "radial-gradient(circle at center, rgba(34,211,238,0.25), transparent 60%)"
              : "radial-gradient(circle at center, rgba(99,102,241,0.22), transparent 60%)",
          left: `${(i * 83) % 100}%`,
          top: `${(i * 47) % 100}%`,
        }}
        animate={{
          y: [0, i % 2 ? -20 : 20, 0],
          x: [0, i % 2 ? 10 : -10, 0],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 6 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
      />
    ))}
  </div>
);

const GlassCard = ({ children, className = "" }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`relative rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-slate-900/60 via-slate-900/30 to-slate-900/60 backdrop-blur-xl shadow-[0_0_80px_rgba(16,185,129,0.08)] ${className}`}
  >
    <div className="absolute inset-px rounded-[calc(1rem-1px)] bg-gradient-to-br from-emerald-300/5 via-cyan-300/5 to-indigo-300/5 pointer-events-none" />
    {children}
  </motion.div>
);

/* =========================== MAIN COMPONENT ============================ */

const UserProfile = () => {
  const loggedUser = useSelector((store) => store?.user?.loggedUser) || {};
  const [formData, setFormData] = useState({
    firstName: loggedUser.firstName || "",
    lastName: loggedUser.lastName || "",
    email: loggedUser.email || "",
    mobileNumber: loggedUser.phone || "",
    address: loggedUser.address || "",
    state: loggedUser.state || "",
    zipCode: loggedUser.zipCode || "",
    city: loggedUser.city || "",
    country: loggedUser.country || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const { getUpdateLoggedUser } = UseUserHook();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((d) => ({ ...d, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loggedUser?._id) {
      toast.error("Please sign in to update your profile.");
      return;
    }
    const toastID = toast.loading("Syncing to chain…");
    setIsLoading(true);
    try {
      await backendApi.put("/update-user", {
        id: loggedUser._id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        state: formData.state,
        city: formData.city,
        zipCode: formData.zipCode,
      });
      toast.success("Profile updated ✨", { id: toastID });
      getUpdateLoggedUser();
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error("Update failed. Try again.", { id: toastID });
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { name: "firstName", label: "First Name", icon: <User size={16} />, required: true },
    { name: "lastName", label: "Last Name", icon: <User size={16} />, required: true },
    { name: "email", label: "E-mail Address", icon: <Mail size={16} />, readOnly: true },
    { name: "mobileNumber", label: "Mobile Number", icon: <Phone size={16} />, readOnly: true },
    { name: "address", label: "Address", icon: <MapPin size={16} /> },
    { name: "state", label: "State", icon: <MapPin size={16} /> },
    { name: "zipCode", label: "Zip Code", icon: <MapPin size={16} /> },
    { name: "city", label: "City", icon: <MapPin size={16} /> },
    { name: "country", label: "Country", icon: <Flag size={16} />, readOnly: true },
  ];

  return (
    <motion.div
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AnimatedGrid />
          <FloatingParticles/>

      <FloatingOrbs />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:px-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-emerald-400" size={20} />
            <span className="uppercase tracking-[0.25em] text-xs text-emerald-400/80 font-semibold">
              account · identity · wallet
            </span>
          </div>
          <motion.div
            className="inline-block"
            initial={{ scale: 0.98, rotateX: 10, opacity: 0 }}
            animate={{ scale: 1, rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <ModernHeading text="⚡ Update Profile" />
          </motion.div>
        </div>

        {/* Layout: Profile Card (left) + Form (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* Left: Profile / identity card */}
          <GlassCard className="p-6 lg:col-span-1">
            <div className="relative flex flex-col items-center text-center gap-4">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02, rotate: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
              >
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-emerald-400/20 via-cyan-400/20 to-indigo-400/20 border border-emerald-400/30 grid place-items-center shadow-[0_0_60px_rgba(16,185,129,0.25)]">
                  <User className="text-emerald-300" size={40} />
                </div>
                <motion.div
                  className="absolute -inset-2 -z-10 rounded-3xl"
                  animate={{
                    boxShadow: [
                      "0 0 0 rgba(16,185,129,0)",
                      "0 0 32px rgba(16,185,129,0.35)",
                      "0 0 0 rgba(16,185,129,0)",
                    ],
                  }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                />
              </motion.div>

              <div>
                <h3 className="text-xl font-semibold text-white">
                  {formData.firstName || "First"} {formData.lastName || "Last"}
                </h3>
                <p className="text-emerald-300/80 text-sm font-mono">{formData.email || "—"}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full mt-2">
                <BadgeStat icon={<Cpu size={14} />} label="Status" value="Verified" color="emerald" />
                <BadgeStat icon={<Shield size={14} />} label="2FA" value="Enabled" color="cyan" />
                <BadgeStat icon={<Flag size={14} />} label="Region" value={formData.country || "—"} color="indigo" />
              </div>

              <NeonDivider />

            </div>
          </GlassCard>

          {/* Right: Form */}
          <GlassCard className="p-6 lg:col-span-2">
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.04 } },
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {fields.map((f, idx) => (
                  <motion.div
                    key={f.name}
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  >
                    {f.readOnly ? (
                      <ReadOnlyField label={f.label} icon={f.icon} value={formData[f.name]} />
                    ) : (
                      <InputField
                        label={f.label}
                        icon={f.icon}
                        value={formData[f.name]}
                        onChange={handleInputChange}
                        name={f.name}
                        required={f.required}
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center pt-2">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className="relative group inline-flex items-center gap-2 px-10 py-3 rounded-full font-semibold text-black
                  bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400
                  shadow-[0_10px_40px_rgba(16,185,129,0.35)]"
                >
                  <span className="relative z-10">{isLoading ? "Updating…" : "Update Profile"}</span>
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                    bg-[radial-gradient(120%_120%_at_50%_10%,rgba(255,255,255,0.35),transparent_40%)]" />
                </motion.button>
              </div>
            </motion.form>

            {/* Loading shimmer under button */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 flex justify-center"
                >
                  <motion.div
                    className="h-1 w-52 rounded-full bg-emerald-500/20 overflow-hidden"
                    animate={{}}
                  >
                    <motion.div
                      className="h-full w-1/3 bg-emerald-400"
                      animate={{ x: ["0%", "200%"] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
};

/* =========================== SUB-COMPONENTS ============================ */

const LabelCaps = ({ children, required }) => (
  <div className="flex items-center gap-2 mb-1">
    <span className="text-[11px] tracking-[0.25em] uppercase text-emerald-300/70">{children}</span>
    {required ? <span className="text-emerald-300/80">*</span> : null}
  </div>
);

const InputField = ({ label, icon, value, onChange, name, required = false }) => (
  <div className="relative">
    <LabelCaps required={required}>{label}</LabelCaps>
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center text-emerald-300/80 pointer-events-none">
        {icon}
      </div>
      <motion.input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        whileFocus={{ scale: 1.01 }}
        className="w-full pl-10 pr-3 py-3 rounded-xl outline-none text-white/90
        bg-gradient-to-br from-slate-900/70 to-slate-900/30 border border-emerald-400/20
        focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400/50 transition"
      />
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl"
        initial={false}
        animate={{ boxShadow: ["0 0 0px rgba(16,185,129,0)", "0 0 16px rgba(16,185,129,0.25)", "0 0 0px rgba(16,185,129,0)"] }}
        transition={{ duration: 2.2, repeat: Infinity }}
      />
    </div>
  </div>
);

const ReadOnlyField = ({ label, icon, value }) => (
  <div className="relative">
    <LabelCaps>{label}</LabelCaps>
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center text-emerald-300/60">
        {icon}
      </div>
      <input
        type="text"
        value={value ?? ""}
        readOnly
        className="w-full pl-10 pr-3 py-3 rounded-xl text-white/60 cursor-not-allowed
        bg-gradient-to-br from-slate-900/60 to-slate-900/20 border border-emerald-400/10"
      />
    </div>
  </div>
);

const BadgeStat = ({ icon, label, value, color = "emerald" }) => {
  const palette = {
    emerald: "from-emerald-500/20 to-emerald-400/10 border-emerald-400/30 text-emerald-300",
    cyan: "from-cyan-500/20 to-cyan-400/10 border-cyan-400/30 text-cyan-300",
    indigo: "from-indigo-500/20 to-indigo-400/10 border-indigo-400/30 text-indigo-300",
  }[color];
  return (
    <div className={`rounded-xl px-3 py-2 text-center border bg-gradient-to-br ${palette}`}>
      <div className="flex items-center gap-1 justify-center text-xs opacity-80">{icon}<span>{label}</span></div>
      <div className="font-semibold text-sm">{value}</div>
    </div>
  );
};

const RowItem = ({ icon, label, value, wrap }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-emerald-300">{icon}</div>
    <div className="min-w-0">
      <div className="text-xs uppercase tracking-widest text-emerald-300/70">{label}</div>
      <div className={`text-white/90 ${wrap ? "" : "truncate"}`}>{value}</div>
    </div>
  </div>
);

const NeonDivider = () => (
  <div className="relative w-full my-4">
    <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
    <motion.div
      className="absolute -top-[3px] left-0 h-[7px] w-16 rounded-full bg-emerald-400/60 blur-md"
      animate={{ left: ["0%", "100%"] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

export default UserProfile;
