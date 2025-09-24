import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
// import UserNewChallengeHook from "@/hooks/user/UseNewChallengeHook";
import UserNewChallengeHook from "../../../hooks/user/UseNewChallengeHook";
import { AnimatePresence, motion } from "framer-motion";

import { backendApi, metaApi } from "@/utils/apiClients";
import SelectedPaymentMethod from "./SelectedPaymentMethod";
import axios from "axios";
import { AnimatedGrid } from "../../../utils/AnimatedGrid";

/** ========= Small inline SVG icons for the theme (no extra deps) ========= */
const TrendingUpIcon = () => (
  <svg
    className="w-8 h-8"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);
const ActivityIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);
const WalletIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);
const DollarSignIcon = () => (
  <svg
    className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
    />
  </svg>
);
const ShieldIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);
const StarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const UploadIcon = () => (
  <svg
    className="w-8 h-8"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);
const EyeIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);
const XIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const ClipboardIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);
const LoaderIcon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);
const BanknoteIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

/** ========= Background FX ========= */
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${2 + Math.random() * 3}s`,
        }}
      />
    ))}
  </div>
);

/** ========================= Component ========================= */
export default function UserDeposit() {
  const navigate = useNavigate();
  const { getPaymentMethod } = UserNewChallengeHook();

  // Redux
  const loggedUser = useSelector((s: any) => s.user?.loggedUser);
  const siteConfig = useSelector((s: any) => s.user?.siteConfig);
  const paymentMethods = useSelector((s: any) => s.user?.paymentMethods);

  // Form + UI state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    apiGroup: "",
    depositAmount: "",
    accountNumber: "",
    transactionId: "",
  });
  const [accountType, setAccountType] = useState("");
  const [accountBalance, setAccountBalance] = useState<string | number>("");
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [creatingLoading, setCreatingLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Payment modal (for crypto flow response)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  // Load available payment methods (from your hook)
  useEffect(() => {
    try {
      getPaymentMethod?.();
    } catch (e) {
      // ignore
    }
  }, []);

  // Account balance fetch (Meta API)
  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (!formData.accountNumber) return;
      try {
        setBalanceLoading(true);
        setAccountBalance("");
        const res = await metaApi.get(
          `/GetUserInfo?Manager_Index=${
            import.meta.env.VITE_MANAGER_INDEX
          }&MT5Account=${formData.accountNumber}`
        );
        setBalanceLoading(false);
        if (res?.data?.Equity) setAccountBalance(res.data.Equity);
      } catch (error) {
        setBalanceLoading(false);
        // optional: show a soft toast
      }
    };
    fetchAccountInfo();
  }, [formData.accountNumber]);

  // Build unique active methods + include "Crypto"
  const uniqueActiveMethods = (() => {
    const list = Array.isArray(paymentMethods) ? paymentMethods : [];
    const namesSet = new Set<string>();
    const unique: any[] = [];
    list.forEach((m: any) => {
      if (m?.status === "active" && !namesSet.has(m?.name)) {
        namesSet.add(m.name);
        unique.push(m);
      }
    });
    // add virtual "Crypto" choice at the end
    // unique.push({ name: "Crypto", icon: "💎", status: "active" });
    return unique;
  })();

  const bankTransfers = Array.isArray(paymentMethods)
    ? paymentMethods.filter(
        (m: any) => m.status === "active" && m.name === "Bank Transfer"
      )
    : [];

  const paymentDetails = Array.isArray(paymentMethods)
    ? paymentMethods.find((m: any) => m.name === selectedPayment)?.details
    : undefined;

  const paymentImage = Array.isArray(paymentMethods)
    ? paymentMethods.find((m: any) => m.name === selectedPayment)?.image
    : undefined;

  // Handlers
  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    if (name === "accountNumber") {
      const selected = loggedUser?.accounts?.find(
        (a: any) => String(a.accountNumber) === String(value)
      );
      setAccountType(selected?.accountType || "");
      setFormData((prev) => ({
        ...prev,
        accountNumber: value,
        apiGroup: selected?.apiGroup || "",
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Files
  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
    if (selectedFile && selectedFile.type?.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(String(reader.result));
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  };
  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const togglePreview = () => setShowPreview((s) => !s);

  // Copy helper for payment details
  const copyText = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Render links inside a text blob (for payment details)
  const formatTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, idx) =>
      urlRegex.test(part) ? (
        <button
          key={idx}
          onClick={() => window.open(part, "_blank", "noopener,noreferrer")}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 mx-2 text-white px-6 py-2 rounded-full hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg transform hover:scale-105"
        >
          <span className="flex items-center gap-2">Pay Now</span>
        </button>
      ) : (
        <span key={idx} className="text-gray-200">
          {part}
        </span>
      )
    );
  };

  // === Crypto (Paygate) flow ===
  const handleCryptoPayment = async (body) => {
    try {
      if (
        !loggedUser?._id ||
        !loggedUser?.email ||
        !formData.depositAmount ||
        !formData.accountNumber
      ) {
        toast.error("Enter all required details (account & amount).");
        return;
      }
      setCreatingLoading(true);

      const { data: resp } = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/auth/create-nowPayment-payment`, body
      );
      const invoiceUrl = resp?.invoice_url || resp?.invoice?.invoice_url;

      if (!invoiceUrl) throw new Error("Invoice URL not returned");

      toast.success("Redirecting to crypto payment page");
      window.location.href = invoiceUrl;
      return;
    } catch (err) {
      console.error(err);
      toast.error("Could not start crypto payment. Please try again.");
    } finally {
      setCreatingLoading(false);
    }
  };

  // === Normal deposit submit ===
  const submitHandler = async () => {
    if (creatingLoading || isSubmitting) return;
    if (!selectedPayment) {
      toast.error("Choose a payment method.");
      return;
    }
    if (!agreeToTerms) {
      toast.error("Please agree to Terms & Conditions.");
      return;
    }
    if (!formData.depositAmount || !formData.accountNumber) {
      toast.error("Enter amount and select account.");
      return;
    }

    // Multipart form
    const toastID = toast.loading("Submitting...");
    try {
      setCreatingLoading(true);
      setIsSubmitting(true);

      const body = {
        userId: loggedUser._id,
        mt5Account: formData.accountNumber,
        deposit: formData.depositAmount,
        status: "pending",
        accountType,
        method: selectedPayment,
        transactionId: formData.transactionId,
      };

      const fd = new FormData();
      Object.entries(body).forEach(([k, v]) => fd.append(k, String(v ?? "")));
      if (file) fd.append("depositSS", file);

      if (selectedPayment === "crypto") {
        await handleCryptoPayment(body);
        return;
      }

      // await backendApi.post("/deposit", fd, {
      //   headers: { "Content-Type": "multipart/form-data" },
      // });

      // toast.success("Deposit request submitted.", { id: toastID });
      // navigate("/user/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Submission failed. Please try again.", { id: toastID });
    } finally {
      setCreatingLoading(false);
      setIsSubmitting(false);
    }
  };

  const paymentProps = {
    selectedPayment,
    paymentDetails,
    formatTextWithLinks,
    copyText,
    paymentImage,
    bankTransfers,
    handleFileChange,
    fileInputRef,
    file,
    togglePreview,
    previewUrl,
    handleInputChange,
    formData,
    handleRemoveFile,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* <FloatingParticles /> */}
      <AnimatedGrid />
{/* Floating Particles (SSR-safe) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -100, opacity: [0, 1, 0] }}
            transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>
      {/* Header */}
      <div className="relative z-10 p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-4 animate-slide-in-left">
            <div className="p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-cyan-500/30">
              <TrendingUpIcon />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Deposit Funds</h1>
              <p className="text-gray-400">
                Fund your trading account instantly
              </p>
            </div>
          </div>

          <div className="flex gap-4 animate-slide-in-right">
            {siteConfig?.inrUi !== false && (
              <div className="p-4 bg-black/40 backdrop-blur-md rounded-xl border border-cyan-500/30">
                <div className="text-cyan-400 text-sm">INR Amount</div>
                <div className="text-2xl font-bold text-white">
                  ₹{" "}
                  {Number(formData.depositAmount || 0) *
                    Number(siteConfig?.dollarDepositRate || 0)}
                </div>
                <div className="text-xs text-gray-400">
                  Rate: ₹{siteConfig?.dollarDepositRate}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Account + Amount */}
          <div className="lg:col-span-1 space-y-6 animate-slide-in-left">
            <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <ActivityIcon />
                <h3 className="text-xl font-semibold text-white">
                  Trading Account
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Select Account
                  </label>
                  <div className="relative">
                    <select
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900/80 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    >
                      <option value="">Choose your account</option>
                      {loggedUser?.accounts?.map((a: any, idx: number) => (
                        <option key={idx} value={a.accountNumber}>
                          {a.accountNumber} ({a.accountType})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Balance */}
                <div
                  className={`p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30 transition-all duration-500 ${
                    accountBalance
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 text-sm">
                      Current Balance
                    </span>
                    {balanceLoading ? (
                      <LoaderIcon />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        ${accountBalance || 0}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <WalletIcon />
                <h3 className="text-xl font-semibold text-white">
                  Deposit Amount
                </h3>
              </div>

              <div className="relative">
                <DollarSignIcon />
                <input
                  type="number"
                  name="depositAmount"
                  placeholder="Enter amount"
                  value={formData.depositAmount}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900/80 text-white pl-10 pr-4 py-4 rounded-xl border border-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-lg font-semibold"
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[100, 500, 1000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        depositAmount: String(amount),
                      }))
                    }
                    className="py-2 px-3 bg-gray-800 hover:bg-emerald-600/20 text-gray-300 hover:text-emerald-400 rounded-lg transition-all text-sm border border-gray-600 hover:border-emerald-500/50 transform hover:scale-105"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Methods + Details + Upload + Txn */}
          <div className="lg:col-span-2 space-y-6 animate-slide-in-right">
            {/* Methods */}
            <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <ShieldIcon />
                <h3 className="text-xl font-semibold text-white">
                  Payment Methods
                </h3>
                <div className="ml-auto animate-spin-slow">
                  <StarIcon />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {uniqueActiveMethods.map((method: any, index: number) => (
                  <div
                    key={`${method.name}-${index}`}
                    onClick={() => setSelectedPayment(method.name)}
                    className={`p-4 cursor-pointer rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      selectedPayment === method.name
                        ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400 shadow-xl shadow-cyan-500/25 scale-105"
                        : "bg-gray-800/60 border-gray-600 hover:border-gray-500"
                    } border backdrop-blur-sm`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div
                        className={`p-3 rounded-full transition-all ${
                          selectedPayment === method.name
                            ? "bg-cyan-500/20 text-cyan-400"
                            : "bg-gray-700/50 text-gray-400"
                        }`}
                      >
                        {/* Simple label as icon (keep neutral and universal) */}
                        <span className="text-base font-semibold">
                          {method.icon || "💳"}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {method.name}
                      </span>
                      {selectedPayment === method.name && (
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SelectedPaymentMethod {...paymentProps} />

            {/* Terms + Submit */}
            <div className="space-y-6">
              <label className="flex items-center gap-3 p-4 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 backdrop-blur-xl rounded-xl border border-gray-700/50 cursor-pointer hover:border-cyan-500/50 transition-all transform hover:scale-[1.02] animate-slide-in-up">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-5 h-5 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                />
                <span className="text-white">
                  I agree to the{" "}
                  <a
                    href={siteConfig?.tNcLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Terms & Conditions
                  </a>
                </span>
              </label>

              <div className="flex justify-center animate-slide-in-up">
                <button
                  onClick={submitHandler}
                  disabled={
                    !agreeToTerms ||
                    creatingLoading ||
                    !selectedPayment ||
                    isSubmitting ||
                    !formData.depositAmount ||
                    !formData.accountNumber
                  }
                  className={`flex items-center justify-center py-4 px-12 rounded-full text-white font-semibold text-lg transition-all transform ${
                    selectedPayment &&
                    agreeToTerms &&
                    formData.depositAmount &&
                    formData.accountNumber &&
                    !isSubmitting
                      ? "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 hover:scale-105 shadow-xl shadow-cyan-500/25"
                      : "bg-gray-600 cursor-not-allowed opacity-50"
                  }`}
                >
                  {(creatingLoading || isSubmitting) && <LoaderIcon />}
                  <span className="ml-2">
                    {selectedPayment === "crypto"
                      ? "Process Payment"
                      : "Submit Request"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && previewUrl && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 p-6 rounded-2xl max-w-3xl max-h-[90vh] overflow-auto border border-gray-700 animate-scale-in">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-2xl"
              />
              <button
                onClick={togglePreview}
                className="mt-4 w-full bg-red-500/80 text-white px-6 py-3 rounded-full hover:bg-red-600/70 transition-all transform hover:scale-105"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}

        {/* Crypto Payment Modal */}
        {showPaymentModal && paymentData && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-900 p-8 rounded-2xl max-w-md w-full mx-4 border border-gray-700 animate-scale-in">
              <div className="text-center space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="text-3xl">✅</div>
                </div>

                <h3 className="text-2xl font-bold text-white">
                  Payment Initiated
                </h3>

                <div className="space-y-2 text-left bg-gray-800/60 rounded-lg p-4">
                  <p className="text-gray-300">
                    <span className="text-gray-400">Pay Amount:</span>{" "}
                    {paymentData.pay_amount} {paymentData.pay_currency}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-400">To Address:</span>{" "}
                    {paymentData.pay_address}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-400">Price:</span>{" "}
                    {paymentData.price_amount} {paymentData.price_currency}
                  </p>
                  {paymentData.expiration_estimate_date && (
                    <p className="text-gray-300">
                      <span className="text-gray-400">Expires:</span>{" "}
                      {new Date(
                        paymentData.expiration_estimate_date
                      ).toLocaleString()}
                    </p>
                  )}
                  <p className="text-gray-300">
                    <span className="text-gray-400">Payment ID:</span>{" "}
                    {paymentData.payment_id}
                  </p>
                </div>

                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 rounded-full hover:from-cyan-400 hover:to-purple-500 transition-all transform hover:scale-105"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyframes for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.5s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
