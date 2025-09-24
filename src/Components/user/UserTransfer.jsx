import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useTransition,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModernHeading from "../lib/ModernHeading";
import { FloatingParticles } from "../../utils/FloatingParticles";

// Mock API
const metaApi = {
  get: async (url) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (url.includes("GetUserInfo")) {
      return { data: { Equity: Math.floor(Math.random() * 10000) + 1000 } };
    }
    return { data: { success: true } };
  },
};

// Mock toast
const toast = {
  loading: (message) => {
    console.log("Loading:", message);
    return "toast-id";
  },
  success: (message, options) => console.log("Success:", message),
  error: (message, options) => console.log("Error:", message),
};

// Animated Background Component
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -inset-[10px] opacity-50">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>
  </div>
);

// Crypto Icon Component
const CryptoIcon = ({ type }) => {
  const icons = {
    BTC: "₿",
    ETH: "Ξ",
    USDT: "₮",
    Standard: "💎",
    Pro: "⚡",
    ECN: "🚀",
    Demo: "📊"
  };
  return <span className="text-2xl">{icons[type] || "💰"}</span>;
};

const UserTransfer = () => {
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [fromAccountBalance, setFromAccountBalance] = useState("");
  const [toAccountBalance, setToAccountBalance] = useState("");
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [isTransferLoading, setIsTransferLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock user data with crypto theme
  const [loggedUser] = useState({
    accounts: [
      { accountNumber: "0x1001...7B9", currency: "BTC", type: "Standard", icon: "BTC" },
      { accountNumber: "0x1002...4A2", currency: "ETH", type: "Pro", icon: "ETH" },
      { accountNumber: "0x1003...8F5", currency: "USDT", type: "ECN", icon: "USDT" },
      { accountNumber: "0x1004...3D1", currency: "DEMO", type: "Demo", icon: "Demo" },
    ],
  });

  // Memoized account options
  const availableFromAccounts = useMemo(
    () =>
      loggedUser?.accounts?.filter((acc) => acc.accountNumber !== toAccount) ||
      [],
    [loggedUser?.accounts, toAccount]
  );

  const availableToAccounts = useMemo(
    () =>
      loggedUser?.accounts?.filter(
        (acc) => acc.accountNumber !== fromAccount
      ) || [],
    [loggedUser?.accounts, fromAccount]
  );

  // Enhanced account info fetching
  const fetchAccountInfo = useCallback(async (accountNumber, setBalance) => {
    if (!accountNumber) return;

    try {
      setBalance("");
      setBalanceLoading(true);

      const res = await metaApi.get(
        `/GetUserInfo?Manager_Index=demo_manager&MT5Account=${accountNumber}`
      );

      if (res.data.Equity) {
        setBalance(res.data.Equity);
      }
    } catch (error) {
      console.log("Error fetching account info:", error);
      toast.error("Failed to fetch account balance");
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  const fromAccountInfo = useCallback(() => {
    fetchAccountInfo(fromAccount, setFromAccountBalance);
  }, [fromAccount, fetchAccountInfo]);

  const toAccountInfo = useCallback(() => {
    fetchAccountInfo(toAccount, setToAccountBalance);
  }, [toAccount, fetchAccountInfo]);

  // Enhanced form validation
  const validateTransfer = useCallback(() => {
    if (!fromAccount || !toAccount) {
      toast.error("Both wallets must be selected!");
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount!");
      return false;
    }

    if (parseFloat(amount) > parseFloat(fromAccountBalance)) {
      toast.error("Insufficient balance in source wallet!");
      return false;
    }

    return true;
  }, [fromAccount, toAccount, amount, fromAccountBalance]);

  const handleSubmit = useCallback(
    async () => {
      if (isTransferLoading || !validateTransfer()) return;

      const toastId = toast.loading("Processing blockchain transfer...");
      setIsTransferLoading(true);

      try {
        const withdrawal = await metaApi.get(
          `/MakeWithdrawBalance?Manager_Index=demo_manager&MT5Account=${fromAccount}&Amount=${amount}&Comment=transfer`
        );

        const deposit = await metaApi.get(
          `/MakeDepositBalance?Manager_Index=demo_manager&MT5Account=${toAccount}&Amount=${amount}&Comment=transfer`
        );

        console.log(withdrawal);
        console.log(deposit);
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        toast.success("Transfer completed successfully!", { id: toastId });
        setAmount("");

        await Promise.all([fromAccountInfo(), toAccountInfo()]);
      } catch (error) {
        console.log("Transfer error:", error);
        toast.error("Transfer failed. Please try again.", { id: toastId });
      } finally {
        setIsTransferLoading(false);
      }
    },
    [
      isTransferLoading,
      validateTransfer,
      fromAccount,
      toAccount,
      amount,
      fromAccountInfo,
      toAccountInfo,
    ]
  );

  // Account selection handlers with transition
  const handleFromAccountChange = useCallback((value) => {
    startTransition(() => {
      setFromAccount(value);
    });
  }, []);

  const handleToAccountChange = useCallback((value) => {
    startTransition(() => {
      setToAccount(value);
    });
  }, []);

  useEffect(() => {
    fromAccountInfo();
  }, [fromAccountInfo]);

  useEffect(() => {
    toAccountInfo();
  }, [toAccountInfo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900
          relative overflow-hidden">
      {/* <AnimatedBackground /> */}
          <FloatingParticles/>
      
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
         {/* Header */}
          <motion.div  className="text-start mb-4">
            <ModernHeading text="Transfer Funds" />
          </motion.div>
          <p className="text-gray-400 text-lg text-start">Lightning-fast transfers between your crypto wallets</p>
        </motion.div>

        {/* Main Transfer Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative backdrop-blur-xl bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 rounded-3xl border border-purple-500/20 shadow-2xl shadow-purple-500/10 p-8"
        >
          {/* Success Animation Overlay */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
              >
                <div className="bg-green-500/20 backdrop-blur-xl rounded-3xl p-8 border border-green-500/50">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl text-green-400 mb-4"
                  >
                    ✓
                  </motion.div>
                  <p className="text-green-400 text-xl font-bold">Transfer Successful!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            {/* Two Column Layout for Accounts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* From Account Section */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <label className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-4 block">
                  From Wallet
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-3 hover:border-cyan-400/50 transition-all duration-300">
                    <select
                      value={fromAccount}
                      onChange={(e) => handleFromAccountChange(e.target.value)}
                      className="w-full bg-transparent text-white font-medium text-lg focus:outline-none cursor-pointer "
                      disabled={isPending}
                    >
                      <option value="" className="bg-gray-900">
                        Select Source Wallet
                      </option>
                      {availableFromAccounts.map((account, index) => (
                        <option
                          key={index}
                          value={account.accountNumber}
                          className="bg-gray-900"
                        >
                          {account.accountNumber} • {account.currency}
                        </option>
                      ))}
                    </select>

                    {fromAccount && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <CryptoIcon type={loggedUser.accounts.find(a => a.accountNumber === fromAccount)?.icon} />
                          <div>
                            <p className="text-gray-400 text-xs">Available Balance</p>
                            {balanceLoading ? (
                              <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="h-6 w-24 bg-gray-700 rounded animate-pulse"
                              />
                            ) : (
                              <p className="text-white text-xl font-bold">
                                ${fromAccountBalance || "0.00"}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* To Account Section */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <label className="text-purple-400 font-semibold text-sm uppercase tracking-wider mb-4 block">
                  To Wallet
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-3 hover:border-purple-400/50 transition-all duration-300">
                    <select
                      value={toAccount}
                      onChange={(e) => handleToAccountChange(e.target.value)}
                      className="w-full bg-transparent text-white font-medium text-lg focus:outline-none cursor-pointer "
                      disabled={isPending}
                    >
                      <option value="" className="bg-gray-900">
                        Select Destination Wallet
                      </option>
                      {availableToAccounts.map((account, index) => (
                        <option
                          key={index}
                          value={account.accountNumber}
                          className="bg-gray-900"
                        >
                          {account.accountNumber} • {account.currency}
                        </option>
                      ))}
                    </select>

                    {toAccount && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <CryptoIcon type={loggedUser.accounts.find(a => a.accountNumber === toAccount)?.icon} />
                          <div>
                            <p className="text-gray-400 text-xs">Current Balance</p>
                            {balanceLoading ? (
                              <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="h-6 w-24 bg-gray-700 rounded animate-pulse"
                              />
                            ) : (
                              <p className="text-white text-xl font-bold">
                                ${toAccountBalance || "0.00"}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Transfer Arrow Animation */}
            <motion.div 
              className="flex justify-center my-5"
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center gap-2">
                <div className="h-px w-20 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                <motion.div 
                  className="text-3xl text-cyan-400"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⟶
                </motion.div>
                <div className="h-px w-20 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
              </div>
            </motion.div>

            {/* Amount Input Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-8"
            >
              <label className="text-gray-400 font-semibold text-sm uppercase tracking-wider mb-4 block text-center">
                Transfer Amount
              </label>
              
              <div className="max-w-2xl mx-auto">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                  <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-3">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl text-gray-500">$</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 bg-transparent text-4xl font-bold text-white focus:outline-none placeholder-gray-600"
                        required
                      />
                      <span className="text-gray-400 text-lg">USD</span>
                    </div>
                    
                    {/* Quick Amount Pills */}
                    <div className="flex gap-3 mt-6 justify-center flex-wrap">
                      {[100, 500, 1000, 5000, 10000].map((quickAmount) => (
                        <motion.button
                          key={quickAmount}
                          type="button"
                          onClick={() => setAmount(quickAmount.toString())}
                          className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-cyan-900/50 hover:to-purple-900/50 border border-gray-600 rounded-full px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-all duration-300"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          ${quickAmount.toLocaleString()}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Transfer Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex justify-center"
            >
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={isTransferLoading}
                className="relative group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-pink-900 to-pink-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className={`relative px-12 py-5 bg-gradient-to-br from-slate-700 via-slate-900 to-slate-700 rounded-2xl font-bold text-white text-lg shadow-2xl ${
                  isTransferLoading ? 'opacity-75' : ''
                }`}>
                  {isTransferLoading ? (
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Processing Transfer...</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Transfer Now</span>
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </span>
                  )}
                </div>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 mb-20"
        >
          {[
            { icon: "⚡", title: "Lightning Fast", subtitle: "< 2 seconds", color: "from-yellow-500 to-orange-500" },
            { icon: "🔐", title: "Secure", subtitle: "256-bit encryption", color: "from-green-500 to-teal-500" },
            { icon: "💎", title: "Zero Fees", subtitle: "Free transfers", color: "from-blue-500 to-purple-500" },
            { icon: "🌍", title: "24/7 Available", subtitle: "Always online", color: "from-pink-500 to-red-500" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300`}></div>
              <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 text-center">
                <motion.div 
                  className="text-4xl mb-3"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: index * 0.2 }}
                >
                  {stat.icon}
                </motion.div>
                <p className="text-white font-bold">{stat.title}</p>
                <p className="text-gray-400 text-sm">{stat.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>


    </div>
  );
};

export default UserTransfer;