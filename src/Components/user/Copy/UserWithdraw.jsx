import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  Loader2,
  LoaderPinwheelIcon,
  WalletCardsIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { withdrawRequestMail } from "./emails/WithdrwalsMails";
import ModernHeading from "../lib/ModernHeading";
import { backendApi, metaApi } from "../../utils/apiClients";
import OtpUi from "../OtpUi";

const UserWithdraw = () => {
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const [selectedGateway, setSelectedGateway] = useState("");
  const [selectWallet, setSelectWallet] = useState("USDT(Trc20)");
  const [account, selectAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [apiLoader, setApiLoader] = useState(false);
  const [error, setError] = useState("");
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [accountBalance, setAccountBalance] = useState("");
  const [accountType, setAccountType] = useState("");
  const siteConfig = useSelector((state) => state.user.siteConfig); // Get from Redux
  const [isWithdrawing, setIsWithdrawing] = useState(false); // NEW: Added withdrawal loading state
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");

  const fetchAccountInfo = async () => {
    setBalanceLoading(true);
    try {
      setAccountBalance("");
      const res = await metaApi.get(
        `/GetUserInfo?Manager_Index=${
          import.meta.env.VITE_MANAGER_INDEX
        }&MT5Account=${account}`
      );
      setBalanceLoading(false);
      if (res.data.Equity) {
        setAccountBalance(res.data.Equity);
      }
    } catch (error) {
      console.log(error);
      setBalanceLoading(false);
    }
  };

  const withdrawalHandler = async (e) => {
    e.preventDefault();

    if (isWithdrawing) return;

    // Validate inputs first
    if (!account || !selectedGateway || !amount) {
      setError("All fields are required.");
      return;
    }
    const toastId = toast.loading("please wait..");

    // Send OTP first
    try {
      const sendOtpRes = await backendApi.post("/send-otp", {
        email: loggedUser.email,
      });

      if (sendOtpRes.data.otp) {
        toast.success("OTP sent to your email", { id: toastId });
        setShowOtpInput(true); // open OTP input modal
      } else {
        toast.error("Failed to send OTP", { id: toastId });
      }
    } catch (err) {
      console.log("OTP error", err);
      toast.error("Error sending OTP", { id: toastId });
    }
  };

  const verifyOtpHandler = async () => {
    const toastID = toast.loading("Verifying your request..");
    if (!otp) {
      toast.error("OTP required", { id: toastID });
      return;
    }

    setApiLoader(true);
    setIsWithdrawing(true);

    try {
      const res = await backendApi.post("/verify-otp", {
        email: loggedUser.email,
        otp,
      });

      // Proceed to withdrawal logic
      if (accountBalance < amount) {
        setError("You don't have balance for withdrawal !!");
      } else {
        await backendApi.post(`/withdrawal`, {
          method:
            selectedGateway === "Bank Transfer"
              ? selectedGateway
              : selectWallet,
          accountType: accountType,
          amount: amount,
          mt5Account: account,
          status: "pending",
          userId: loggedUser._id,
          lastBalance: accountBalance,
        });

        const customContent = withdrawRequestMail({
          loggedUser,
          amount,
          accountBalance,
        });
        toast.success("Withdrawal Requested.", { id: toastID });
        fetchAccountInfo();
        setAmount("");

        await backendApi.post(`/custom-mail`, {
          email: loggedUser.email,
          content: customContent,
          subject: "Withdrawal requested",
        });
      }

      // Reset OTP state
      setShowOtpInput(false);
      setOtp("");
    } catch (error) {
      toast.error(error.response.data.message || "Withdrawal failed", {
        id: toastID,
      });
      console.log("error during withdrawal", error);
    } finally {
      setApiLoader(false);
      setIsWithdrawing(false);
    }
  };

  useEffect(() => {
    fetchAccountInfo();
  }, [account]);

  return (
      //  <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 p-10 min-h-screen">

    <div className="w-full flex items-center justify-center p-10 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950  min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className=" w-full bg-gradient-to-br from-indigo-950 via-indigo-900 p-3 to-indigo-950  rounded-lg shadow-xl"
      >
        {showOtpInput && (
          <OtpUi
            otp={otp}
            setOtp={setOtp}
            setShowOtpInput={setShowOtpInput}
            verifyOtpHandler={verifyOtpHandler}
            apiLoader={apiLoader}
          ></OtpUi>
        )}
        <div className="flex items-center justify-between mb-6">
          <div className=" mb-4">
            <ModernHeading text={"Withdraw Funds"}></ModernHeading>
          </div>
        </div>
        <form onSubmit={withdrawalHandler} className="space-y-6">
          <div className=" flex flex-col gap-4">
            {/* select account */}
            <div className=" w-full ">
              <label
                htmlFor="from-account"
                className="text-sm flex justify-between font-medium text-gray-200"
              >
                <p>Select Account</p>
                {balanceLoading ? (
                  <LoaderPinwheelIcon className=" animate-spin text-secondary-500"></LoaderPinwheelIcon>
                ) : (
                  accountBalance && (
                    <p className="px-4 ">
                      Balance :{" "}
                      <span className="  px-3 py-1 rounded-full text-secondary-500">
                        ${accountBalance}
                      </span>{" "}
                    </p>
                  )
                )}
              </label>
              <select
                id="from-account"
                onChange={(e) => {
                  selectAccount(e.target.value);
                  const selectedAccount = loggedUser?.accounts?.find(
                    (value) => value.accountNumber === e.target.value
                  );
                  setAccountType(selectedAccount?.accountType || ""); // Handle potential undefined value
                }}
                className="w-full bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950  px-4 py-2 mt-2 border bg-secondary-800/20 border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
              >
                <option
                  className="bg-indigo-950 text-white"
                  value=""
                  disabled
                  selected
                >
                  Select Account
                </option>
                {loggedUser?.accounts?.map((value, index) => (
                  <option
                    key={index}
                    className="bg-indigo-950 text-white"
                    value={value.accountNumber}
                  >
                    {value.accountNumber}
                  </option>
                ))}
              </select>
            </div>



            {/* Gateway Selection */}
            <div className="w-full space-y-4">
              <div className="w-full">
                <label
                  htmlFor="gateway"
                  className="block text-sm font-medium text-gray-200 mb-2"
                >
                  Withdrawal Method
                </label>
                <select
                  id="gateway"
                  value={selectedGateway}
                  onChange={(e) => setSelectedGateway(e.target.value)}
                  className="block w-full px-4 py-2 bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950 text-gray-200 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                >
                  <option
                    selected
                    className=" bg-indigo-950 text-white"
                    value=""
                  >
                    select Method
                  </option>
                  <option
                    selected
                    className=" bg-indigo-950 text-white"
                    value="Bank Transfer"
                  >
                    Bank Transfer
                  </option>
                  <option
                    className=" bg-indigo-950 text-white"
                    value="Wallet Transfer"
                  >
                    Wallet Transfer
                  </option>
                </select>
              </div>

              {/* Conditional Wallet Selection */}
              {selectedGateway === "Wallet Transfer" && (
                <div className="w-full">
                  <label
                    htmlFor="account"
                    className="block text-sm font-medium text-gray-200 mb-2"
                  >
                    Choose Wallet
                  </label>
                  <select
                    id="account"
                    value={selectWallet}
                    onChange={(e) => setSelectWallet(e.target.value)}
                    className="block w-full bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950 px-4 py-2 bg-secondary-800/20 text-gray-200 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                  >
                    <option
                      className=" bg-indigo-950 text-white"
                      value="USDT(Trc20)"
                    >
                      USDT (Trc20)
                    </option>
                    <option
                      className=" bg-indigo-950 text-white"
                      value="USDT(Bep20)"
                    >
                      USDT (Bep20)
                    </option>
                    <option
                      className=" bg-indigo-950 text-white"
                      value="BinanceID"
                    >
                      Binance ID
                    </option>
                    <option
                      className=" bg-indigo-950 text-white"
                      value="BTCAddress"
                    >
                      BTC Address
                    </option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className=" flex flex-col md:flex-row justify-between  items-center gap-10">
            {/* enter amount */}
            <div className="w-full">
              <div className=" w-full flex justify-between items-center">
                <label
                  htmlFor="amount"
                  className=" text-sm font-medium text-gray-200"
                >
                  Enter Amount
                </label>
                {siteConfig?.inrUi !== false ? (
                  <div className="flex mb-2  whitespace-nowrap gap-2 items-center">
                    <h1 className="text-sm font-bold text-gray-300">In INR:</h1>

                    <p className="bg-secondary-500-10 text-secondary-500 px-2 text-sm py-1 font-semibold rounded-full">
                      &#8377; {amount * siteConfig?.dollarWithdrawalRate}
                    </p>
                  </div>
                ) : (
                  ""
                )}
              </div>
              <div className="relative bg-secondary-800/20 rounded-md cursor-not-allowed">

                {/* Icon */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BadgeDollarSign className="h-6 w-6 text-gray-400" />
                </div>

                
                {/* Input */}
                <input
                  type="number"
                  id="amount"
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 py-3 bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950 text-gray-200 border focus:ring-secondary-500  focus:ring-2 border-gray-700 rounded-md focus:outline-none placeholder-gray-500"
                  placeholder="Enter Amount"
                  value={amount}
                />
              </div>
            </div>
            {/* account details */}

            <div className=" w-full">
              {selectedGateway === "Bank Transfer" ? (
                <div>
                  <div className=" flex items-center gap-2 mb-3">
                    <WalletCardsIcon></WalletCardsIcon>
                    <h1 className=" text-lg font-bold">Account details</h1>
                  </div>
                  <div>
                    <p>
                      Bank Name :{" "}
                      <span className=" font-bold">
                        {loggedUser?.bankDetails?.bankName}{" "}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p>
                      Holder Name :{" "}
                      <span className=" font-bold">
                        {loggedUser?.bankDetails?.holderName}
                      </span>{" "}
                    </p>
                  </div>
                  <div>
                    <p>
                      Account Number :{" "}
                      <span className=" font-bold">
                        {loggedUser?.bankDetails?.accountNumber}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p>
                      IFSC Code :{" "}
                      <span className=" font-bold">
                        {loggedUser?.bankDetails?.ifscCode}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p>
                      Swift Code :{" "}
                      <span className=" font-bold">
                        {loggedUser?.bankDetails?.swiftCode}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p>
                      UPI ID :{" "}
                      <span className=" font-bold">
                        {loggedUser?.bankDetails?.upiId}
                      </span>
                    </p>
                  </div>
                </div>
              ) : selectedGateway === "Wallet Transfer" ? (
                <div>
                  <div className=" flex items-center gap-2 mb-3">
                    <WalletCardsIcon></WalletCardsIcon>
                    <h1 className=" text-lg font-bold">Account details</h1>
                  </div>{" "}
                  {selectWallet === "USDT(Trc20)" && (
                    <div>
                      <p>
                        USDT-Trc20 :{" "}
                        <span className=" font-bold">
                          {loggedUser?.walletDetails?.tetherAddress}{" "}
                        </span>
                      </p>
                    </div>
                  )}
                  {selectWallet === "USDT(Bep20)" && (
                    <div>
                      <p>
                        USDT-Erc20 :{" "}
                        <span className=" font-bold">
                          {loggedUser?.walletDetails?.ethAddress}
                        </span>{" "}
                      </p>
                    </div>
                  )}
                  {selectWallet === "BinanceID" && (
                    <div>
                      <p>
                        Binance ID :
                        <span className=" font-bold">
                          {loggedUser?.walletDetails?.accountNumber}
                        </span>
                      </p>
                    </div>
                  )}
                  {selectWallet === "BTCAddress" && (
                    <div>
                      <p>
                        BTC Address :{" "}
                        <span className=" font-bold">
                          {loggedUser?.walletDetails?.trxAddress}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
          <div className=" flex items-center justify-center">
            <button
              onClick={withdrawalHandler}
              type="submit"
              disabled={isWithdrawing} // NEW: Disable button while withdrawing
              className={`text-sm md:text-lg flex px-12 py-3 shadow-md transition-all md:hover:px-16 rounded-full ${
                isWithdrawing
                  ? "bg-gradient-to-br from-indigo-950  via-blue-500 to-indigo-950 cursor-not-allowed"
                  : "bg-gradient-to-br from-indigo-950  via-blue-900 to-indigo-950 hover:bg-secondary-500-70"
              }`}
            >
              {isWithdrawing ? "Processing..." : "Request Withdrawal"}
              {(apiLoader || isWithdrawing) && (
                <Loader2 className="animate-spin mx-3" />
              )}
            </button>
          </div>
          {siteConfig?.inrUi !== false ? (
            <p className="text-xs mb-2 text-gray-500">
              USD to INR Rate:{" "}
              <span className="font-medium text-gray-400/80">
                ₹ {siteConfig?.dollarWithdrawalRate}
              </span>
            </p>
          ) : (
            ""
          )}

          <div className=" my-2 text-red-500 text-center">
            <p>{error}</p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UserWithdraw;
