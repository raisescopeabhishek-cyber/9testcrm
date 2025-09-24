import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  Mail,
  Lock,
  User as UserIcon,
  Globe,
  Check,
  MapPin,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
} from "lucide-react";
import { getData } from "country-list";
import { useSelector } from "react-redux";
import { backendApi } from "../../utils/apiClients";
import ModernHeading from "../lib/ModernHeading";

/* ---------- Dark theme for react-phone-number-input ---------- */
const phoneInputCustomStyles = `
.PhoneInput {
  position: relative;
}
.PhoneInputInput {
  background-color: rgba(17, 24, 39, 0.65) !important; /* gray-900/65 */
  border: 1px solid rgba(255,255,255,0.12) !important;
  color: #fff !important;
  padding: 0.75rem 0.9rem 0.75rem 3rem !important;
  border-radius: 0.5rem !important;
  outline: none !important;
}
.PhoneInputInput:focus {
  border-color: rgba(16,185,129,0.5) !important; /* emerald */
  box-shadow: 0 0 0 2px rgba(16,185,129,0.25) !important;
}
.PhoneInputCountry {
  position: absolute;
  left: 0.5rem; top: 50%; transform: translateY(-50%);
  background: transparent !important;
  border: none !important;
}
.PhoneInputCountrySelect {
  background-color: #0b1220 !important;
  color: #fff !important;
}
`;

/* ---------- Background candy (crypto vibes) ---------- */
const AnimatedGrid = () => (
  <div className="pointer-events-none absolute inset-0 opacity-10">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(rgba(16,185,129,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.22) 1px, transparent 1px)",
        backgroundSize: "46px 46px",
        maskImage:
          "radial-gradient(ellipse at 50% 25%, black 60%, transparent 85%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at 50% 25%, black 60%, transparent 85%)",
      }}
    />
  </div>
);

const FloatingOrbs = () => (
  <div className="pointer-events-none absolute inset-0">
    {Array.from({ length: 7 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full blur-2xl"
        style={{
          width: 160,
          height: 160,
          left: `${(i * 133) % 100}%`,
          top: `${(i * 77) % 100}%`,
          background:
            i % 3 === 0
              ? "radial-gradient(circle at center, rgba(16,185,129,0.22), transparent 60%)"
              : i % 3 === 1
              ? "radial-gradient(circle at center, rgba(34,211,238,0.22), transparent 60%)"
              : "radial-gradient(circle at center, rgba(99,102,241,0.22), transparent 60%)",
        }}
        animate={{
          y: [0, i % 2 ? -16 : 16, 0],
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

/* ---------- Password strength helper ---------- */
function getPasswordStrength(pw = "") {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const clamp = Math.min(score, 4);
  const labels = ["Very weak", "Weak", "Good", "Strong", "Excellent"];
  const colors = [
    "bg-rose-500",
    "bg-amber-500",
    "bg-yellow-400",
    "bg-emerald-400",
    "bg-emerald-500",
  ];
  return { score: clamp, label: labels[score], color: colors[clamp] };
}

const UserSignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    address: "",
    zipCode: "",
    country: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();
  const siteConfig = useSelector((state) => state.user.siteConfig);
  const baseHeight = siteConfig?.logoSize || 4;
  const countriesArray = getData();

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handlePhoneChange = (phone) =>
    setFormData((prev) => ({ ...prev, phone }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      return setError({ type: "validation", message: "Passwords do not match." });
    }
    if (!formData.phone?.trim()) {
      return setError({ type: "validation", message: "Phone number is required." });
    }

    setSubmitting(true);
    const toastId = toast.loading("Creating account...");
    try {
      const res = await backendApi.post(
        `/signup/${"687374db5242fb3456adcb83"}`,
        formData
      );

      toast.success(`Verification link sent to ${formData.email}`, { id: toastId });

      // Send verification email
      await backendApi.post(`/send-link`, {
        userId: res.data.user._id,
        email: res.data.user.email,
        password: formData.confirmPassword,
      });

      // Optional: kick user to pending verification screen
      navigate(`/user/verify/${res.data.user._id}/000`);
    } catch (err) {
      let message = "Signup failed";
      if (!err.response) {
        message = "Network error: please check your internet connection.";
      } else if (err.response.status >= 500) {
        message = "Server error: please try again later.";
      } else if (err.response.status === 401) {
        message = "Unauthorized: invalid credentials.";
      } else if (err.response.status === 403) {
        message = "Forbidden: you do not have permission.";
      } else if (err.response.data?.msg) {
        message = err.response.data.msg;
      }
      setError({ type: "http", message });
      toast.error(message, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const strength = getPasswordStrength(formData.password);

  const inputBase =
    "w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400/50 transition";
  const iconWrap = "absolute top-3.5 left-3 text-emerald-300";

  return (
    <div className="relative min-h-screen flex bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden text-white">
      <style>{phoneInputCustomStyles}</style>
      <Toaster />

      {/* Crypto background */}
      <AnimatedGrid />
      <FloatingOrbs />

      {/* Left hero */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 px-12 relative z-10">
        <motion.img
          src={siteConfig?.logo}
          alt="Logo"
          className="object-contain mb-6"
          initial={{ rotate: 0 }}
          whileHover={{ rotate: -3, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
          style={{ height: `${baseHeight}rem` }}
        />
        <div className="inline-flex items-center gap-2 text-emerald-300 uppercase tracking-[0.25em] text-xs font-semibold">
          <Sparkles size={16} /> secure · fast · modern
        </div>
        <ModernHeading text="Join Our Platform" />
        <p className="mt-3 text-emerald-200/80 text-center max-w-md">
          Start your journey with neon-speed onboarding and a sleek trading dashboard.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 text-white/70 text-sm">
          <Shield className="w-4 h-4" /> Email verification • Encrypted transit • Session hardening
        </div>
      </div>

      {/* Right form */}
      <div className="flex justify-center items-center w-full lg:w-1/2 p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl shadow-[0_0_60px_rgba(16,185,129,0.15)] p-6 md:p-8"
        >
          {/* Top chips / steps */}
          <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300">
              1 · Personal
            </span>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
              2 · Contact
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300">
              3 · Security
            </span>
          </div>

          <div className="mb-4">
            <ModernHeading text="Create an Account" />
            <p className="text-emerald-200/80 mt-1">
              It only takes a minute. We’ll email a verification link.
            </p>
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {error?.message && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-rose-200"
              >
                {error.message}
              </motion.div>
            )}
          </AnimatePresence>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
          >
            {/* First / Last */}
            <div className="relative">
              <UserIcon className={iconWrap} />
              <input
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className={inputBase}
                required
              />
            </div>
            <div className="relative">
              <UserIcon className={iconWrap} />
              <input
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className={inputBase}
                required
              />
            </div>

            {/* Email / Phone */}
            <div className="relative">
              <Mail className={iconWrap} />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={inputBase}
                required
              />
            </div>
            <div className="relative">
              <PhoneInput
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handlePhoneChange}
                defaultCountry="IN"
                international
                required
              />
            </div>

            {/* Country / Address */}
            <div className="relative">
              <Globe className={iconWrap} />
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={inputBase}
                required
              >
                <option value="">Select Country</option>
                {countriesArray.map((c) => (
                  <option key={c.code} value={c.name} className="bg-gray-900">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <MapPin className={iconWrap} />
              <input
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className={inputBase}
                required
              />
            </div>

            {/* State / City */}
            <div className="relative">
              <MapPin className={iconWrap} />
              <input
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                className={inputBase}
                required
              />
            </div>
            <div className="relative">
              <MapPin className={iconWrap} />
              <input
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className={inputBase}
                required
              />
            </div>

            {/* Zip */}
            <div className="relative">
              <MapPin className={iconWrap} />
              <input
                name="zipCode"
                placeholder="Zip Code"
                value={formData.zipCode}
                onChange={handleChange}
                className={inputBase}
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className={iconWrap} />
              <input
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={inputBase}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-3.5 text-white/60 hover:text-white"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {/* Strength meter */}
              <div className="mt-2">
                <div className="h-1.5 w-full rounded bg-white/10 overflow-hidden">
                  <motion.div
                    className={`h-full ${strength.color}`}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(strength.score / 4) * 100}%`,
                    }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  />
                </div>
                <div className="text-xs text-white/70 mt-1">
                  {strength.label}
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className={iconWrap} />
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputBase}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-3.5 text-white/60 hover:text-white"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Terms */}
            <div className="md:col-span-2 flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                className="form-checkbox text-emerald-500 rounded"
                required
              />
              <span className="text-white/70 text-sm">
                I agree with the{" "}
                <a
                  href={siteConfig?.tNcLink}
                  className="text-emerald-300 hover:text-emerald-200"
                  target="_blank"
                  rel="noreferrer"
                >
                  Terms &amp; Conditions
                </a>
              </span>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="md:col-span-2 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-black font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 hover:brightness-110 shadow-[0_10px_30px_rgba(16,185,129,0.35)] disabled:opacity-60"
            >
              <Check size={20} /> Create Account
              {submitting && (
                <motion.span
                  className="inline-block w-4 h-4 rounded-full border-2 border-black/70 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                />
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-white/70">
            Already have an account?{" "}
            <Link
              to="/user/login"
              className="font-semibold text-emerald-300 hover:text-emerald-200"
            >
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default UserSignUp;
