import { useEffect, useState, useCallback, useMemo } from "react";
import {
  BadgeDollarSign,
  Loader2,
  RotateCw,
  CreditCard,
  Wallet,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Banknote,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ModernHeading from "../lib/ModernHeading";
import { FloatingParticles } from "../../utils/FloatingParticles";
import { AnimatedGrid } from "../../utils/AnimatedGrid";

// Mock data for demonstration
const mockUser = {
  _id: "user123",
  email: "user@example.com",
  accounts: [
    { accountNumber: "MT5001234", accountType: "Standard" },
    { accountNumber: "MT5005678", accountType: "Premium" },
  ],
  bankDetails: {
    bankName: "Chase Bank",
    holderName: "John Doe",
    accountNumber: "*****1234",
    ifscCode: "CHAS0001",
    swiftCode: "CHASINBB",
    upiId: "john@okaxis",
  },
  walletDetails: {
    tetherAddress: "TQn9Y2k...xyz123",
    ethAddress: "0x742d3...abc456",
    accountNumber: "binance123",
    trxAddress: "TRX123...def789",
  },
};

const mockSiteConfig = {
  inrUi: true,
  dollarWithdrawalRate: 83.45,
};

const ModernWithdraw = () => {
  const [selectedGateway, setSelectedGateway] = useState("");
  const [selectWallet, setSelectWallet] = useState("USDT(Trc20)");
  const [account, selectAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [apiLoader, setApiLoader] = useState(false);
  const [error, setError] = useState("");
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [accountBalance, setAccountBalance] = useState(12847.5);
  const [accountType, setAccountType] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);

  // Calculate INR equivalent
  const inrAmount = useMemo(() => {
    return amount
      ? (parseFloat(amount) * mockSiteConfig.dollarWithdrawalRate).toFixed(2)
      : "0";
  }, [amount]);

  // Form validation
  useEffect(() => {
    const isValid =
      account && selectedGateway && amount && parseFloat(amount) > 0;
    setIsFormValid(isValid);
  }, [account, selectedGateway, amount]);

  const fetchAccountInfo = useCallback(async () => {
    if (!account) return;

    setBalanceLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAccountBalance(12847.5 + Math.random() * 1000);
      setBalanceLoading(false);
    }, 1000);
  }, [account]);

  const withdrawalHandler = async (e) => {
    e.preventDefault();
    if (isWithdrawing || !isFormValid) return;

    setCurrentStep(2);
    setIsWithdrawing(true);

    // Simulate OTP sending
    setTimeout(() => {
      setShowOtpInput(true);
      setIsWithdrawing(false);
      setCurrentStep(3);
    }, 2000);
  };

  const verifyOtpHandler = async () => {
    if (!otp) {
      setError("OTP required");
      return;
    }

    setApiLoader(true);

    // Simulate verification
    setTimeout(() => {
      if (parseFloat(amount) > accountBalance) {
        setError("Insufficient balance for withdrawal!");
      } else {
        setCurrentStep(4);
        setError("");
        // Reset form after success
        setTimeout(() => {
          setCurrentStep(1);
          setAmount("");
          setAccount("");
          setSelectedGateway("");
          setShowOtpInput(false);
          setOtp("");
        }, 3000);
      }
      setApiLoader(false);
    }, 2000);
  };

  useEffect(() => {
    fetchAccountInfo();
  }, [fetchAccountInfo]);

  const walletOptions = [
    { value: "USDT(Trc20)", label: "USDT (TRC-20)", icon: "₮" },
    { value: "USDT(Bep20)", label: "USDT (BEP-20)", icon: "₮" },
    { value: "BinanceID", label: "Binance ID", icon: "🟡" },
    { value: "BTCAddress", label: "BTC Address", icon: "₿" },
  ];

  const getWalletAddress = (walletType) => {
    const mapping = {
      "USDT(Trc20)": mockUser.walletDetails.tetherAddress,
      "USDT(Bep20)": mockUser.walletDetails.ethAddress,
      BinanceID: mockUser.walletDetails.accountNumber,
      BTCAddress: mockUser.walletDetails.trxAddress,
    };
    return mapping[walletType] || "Not configured";
  };


  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900
 p-4 md:p-8"
    >
      <div className="max-w-6xl mx-auto">
        <AnimatedGrid />
    <FloatingParticles/>

        {/* Header */}
        <motion.div className="text-center mb-4 ">
          <ModernHeading text="Withdraw Funds" />
        </motion.div>
        <p className="text-gray-400 text-lg text-center">
          Secure and instant withdrawals to your preferred method
        </p>

        {/* <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Withdraw Funds
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Secure and instant withdrawals to your preferred method
          </p>
        </div> */}

        {/* Progress Steps */}
        <div className="mb-8 mt-7">
          <div className="flex justify-center items-center space-x-4 mb-6">
            {[
              { step: 1, title: "Details", icon: CreditCard },
              { step: 2, title: "Processing", icon: Loader2 },
              { step: 3, title: "Verify", icon: Shield },
              { step: 4, title: "Complete", icon: CheckCircle2 },
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 ${
                    currentStep >= step
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 border-transparent text-white"
                      : "border-slate-600 text-slate-400"
                  } ${
                    currentStep === step
                      ? "scale-110 shadow-lg shadow-blue-500/25"
                      : ""
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      currentStep === 2 && step === 2 ? "animate-spin" : ""
                    }`}
                  />
                </div>
                <span className="ml-2 text-sm text-slate-400">{title}</span>
                {step < 4 && (
                  <ArrowRight className="w-4 h-4 text-slate-600 ml-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-4 shadow-2xl">
              {currentStep === 1 && (
                <div onSubmit={withdrawalHandler} className="space-y-8">
                  {/* Account Selection */}
                  <div className="group">
                    <label className="flex items-center justify-between text-sm font-semibold text-slate-200 mb-3">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        Trading Account
                      </span>
                      {balanceLoading ? (
                        <RotateCw className="w-5 h-5 animate-spin text-blue-400" />
                      ) : (
                        accountBalance && (
                          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full px-4 py-1">
                            <span className="text-green-400 font-bold">
                              ${accountBalance.toLocaleString()}
                            </span>
                          </div>
                        )
                      )}
                    </label>
                    <select
                      value={account}
                      onChange={(e) => {
                        selectAccount(e.target.value);
                        const selectedAcc = mockUser.accounts.find(
                          (acc) => acc.accountNumber === e.target.value
                        );
                        setAccountType(selectedAcc?.accountType || "");
                      }}
                      className="w-full bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:bg-slate-700/70"
                    >
                      <option value="" disabled>
                        Select Trading Account
                      </option>
                      {mockUser.accounts.map((acc, index) => (
                        <option
                          key={index}
                          value={acc.accountNumber}
                          className="bg-slate-800"
                        >
                          {acc.accountNumber} ({acc.accountType})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Withdrawal Method */}
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                      <Zap className="w-4 h-4 text-purple-400" />
                      Withdrawal Method
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Bank Transfer */}
                      <div
                        onClick={() => setSelectedGateway("Bank Transfer")}
                        className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                          selectedGateway === "Bank Transfer"
                            ? "bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-blue-500/50"
                            : "bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                            <CreditCard className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-200">
                              Bank Transfer
                            </h3>
                            <p className="text-sm text-slate-400">
                              Direct to bank account
                            </p>
                          </div>
                        </div>
                        {selectedGateway === "Bank Transfer" && (
                          <CheckCircle2 className="absolute top-4 right-4 w-6 h-6 text-green-400" />
                        )}
                      </div>

                      {/* Wallet Transfer */}
                      <div
                        onClick={() => setSelectedGateway("Wallet Transfer")}
                        className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                          selectedGateway === "Wallet Transfer"
                            ? "bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-purple-500/50"
                            : "bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                            <Wallet className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-200">
                              Crypto Wallet
                            </h3>
                            <p className="text-sm text-slate-400">
                              To digital wallet
                            </p>
                          </div>
                        </div>
                        {selectedGateway === "Wallet Transfer" && (
                          <CheckCircle2 className="absolute top-4 right-4 w-6 h-6 text-green-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Wallet Selection - Show only if Wallet Transfer is selected */}
                  {selectedGateway === "Wallet Transfer" && (
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <Wallet className="w-4 h-4 text-pink-400" />
                        Choose Wallet Type
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {walletOptions.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => setSelectWallet(option.value)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                              selectWallet === option.value
                                ? "bg-gradient-to-r from-pink-500/20 to-purple-600/20 border-pink-500/50"
                                : "bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{option.icon}</span>
                              <span className="text-sm font-medium text-slate-200">
                                {option.label}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amount Input */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <BadgeDollarSign className="w-4 h-4 text-green-400" />
                        Withdrawal Amount
                      </label>
                      {mockSiteConfig.inrUi && amount && (
                        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full px-3 py-1">
                          <span className="text-orange-400 text-sm font-semibold">
                            ₹ {inrAmount}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Banknote className="h-6 w-6 text-slate-400" />
                      </div>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 text-lg font-semibold"
                        placeholder="0.00"
                      />
                      {amount &&
                        accountBalance &&
                        parseFloat(amount) > accountBalance && (
                          <AlertCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-400" />
                        )}
                    </div>
                    {amount &&
                      accountBalance &&
                      parseFloat(amount) > accountBalance && (
                        <p className="text-red-400 text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Insufficient balance
                        </p>
                      )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!isFormValid || isWithdrawing}
                    className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                      isFormValid && !isWithdrawing
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 hover:scale-[1.02] shadow-lg shadow-blue-500/25"
                        : "bg-slate-700 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {isWithdrawing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Request...
                      </>
                    ) : (
                      <>
                        Request Withdrawal
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* OTP Verification Step */}
              {currentStep === 3 && showOtpInput && (
                <div className="text-center space-y-6">
                  <div className="mb-6">
                    <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-slate-200 mb-2">
                      Verify Your Identity
                    </h3>
                    <p className="text-slate-400">
                      Enter the OTP sent to your email
                    </p>
                  </div>

                  <div className="max-w-xs mx-auto space-y-4">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-center text-2xl font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 tracking-widest"
                      placeholder="000000"
                      maxLength="6"
                    />

                    <button
                      onClick={verifyOtpHandler}
                      disabled={!otp || apiLoader}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {apiLoader ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Verify & Withdraw
                          <CheckCircle2 className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Success Step */}
              {currentStep === 4 && (
                <div className="text-center space-y-6">
                  <div className="animate-bounce">
                    <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-4" />
                  </div>
                  <h3 className="text-3xl font-bold text-green-400 mb-2">
                    Withdrawal Successful!
                  </h3>
                  <p className="text-slate-400">
                    Your withdrawal request has been processed successfully
                  </p>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 max-w-sm mx-auto">
                    <p className="text-green-400 font-semibold">
                      Amount: ${amount}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      Processing time: 1-3 business days
                    </p>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary Section */}
          <div className="space-y-6">
            {/* Account Details Card */}
            {selectedGateway && (
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-slate-200">
                    Destination Details
                  </h3>
                </div>

                {selectedGateway === "Bank Transfer" && (
                  <div className="space-y-3">
                    {[
                      {
                        label: "Bank Name",
                        value: mockUser.bankDetails.bankName,
                      },
                      {
                        label: "Account Holder",
                        value: mockUser.bankDetails.holderName,
                      },
                      {
                        label: "Account Number",
                        value: mockUser.bankDetails.accountNumber,
                      },
                      {
                        label: "IFSC Code",
                        value: mockUser.bankDetails.ifscCode,
                      },
                      { label: "UPI ID", value: mockUser.bankDetails.upiId },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-b-0"
                      >
                        <span className="text-slate-400 text-sm">
                          {item.label}
                        </span>
                        <span className="text-slate-200 font-medium">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedGateway === "Wallet Transfer" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                      <span className="text-slate-400 text-sm">
                        Wallet Type
                      </span>
                      <span className="text-slate-200 font-medium">
                        {selectWallet}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-400 text-sm">Address</span>
                      <span className="text-slate-200 font-medium font-mono text-xs bg-slate-700/50 px-2 py-1 rounded">
                        {getWalletAddress(selectWallet)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Exchange Rate Card */}
            {mockSiteConfig.inrUi && (
              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-orange-400 mb-3">
                  Exchange Rate
                </h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-200">
                    ₹ {mockSiteConfig.dollarWithdrawalRate}
                  </p>
                  <p className="text-orange-400 text-sm">per USD</p>
                </div>
              </div>
            )}

            {/* Security Badge */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-3xl p-6 text-center">
              <Shield className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-green-400 mb-2">
                Secure Transaction
              </h3>
              <p className="text-slate-400 text-sm">
                Your withdrawal is protected by bank-level security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernWithdraw;
