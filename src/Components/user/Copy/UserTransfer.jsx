import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { LoaderPinwheelIcon } from "lucide-react";
import toast from "react-hot-toast";
import { metaApi } from "../../utils/apiClients";
import ModernHeading from "../lib/ModernHeading";

const UserTransfer = () => {
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const [fromAccountBalance, setFromAccountBalance] = useState("");
  const [toAccountBalance, setToAccountBalance] = useState("");
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [isTransferLoading, setIsTransferLoading] = useState(false); // NEW: Added transfer loading state

  const fromAccountInfo = async () => {
    try {
      setFromAccountBalance("");
      setBalanceLoading(true);
      const res = await metaApi.get(
        `/GetUserInfo?Manager_Index=${
          import.meta.env.VITE_MANAGER_INDEX
        }&MT5Account=${fromAccount}`
      );
      setBalanceLoading(false);

      if (res.data.Equity) {
        setFromAccountBalance(res.data.Equity);
      }
    } catch (error) {
      console.log(error);
      setBalanceLoading(false);
    }
  };
  const toAccountInfo = async () => {
    try {
      setToAccountBalance("");
      setBalanceLoading(true);
      const res = await metaApi.get(
        `/GetUserInfo?Manager_Index=${
          import.meta.env.VITE_MANAGER_INDEX
        }&MT5Account=${toAccount}`
      );
      setBalanceLoading(false);

      if (res.data.Equity) {
        setToAccountBalance(res.data.Equity);
      }
    } catch (error) {
      console.log(error);
      setBalanceLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isTransferLoading) return;
    if (!fromAccount || !toAccount) {
      toast.error("Both two account must be selected !!");
      return;
    }
    const toastId = toast.loading("Processing your transfer. Please wait...");
    setIsTransferLoading(true); // NEW: Set loading to true when transfer starts

    try {
      const withdrawal = await metaApi.get(
        `/MakeWithdrawBalance?Manager_Index=${
          import.meta.env.VITE_MANAGER_INDEX
        }&MT5Account=${fromAccount}&Amount=${amount}&Comment=transfer`
      );
      const deposit = await metaApi.get(
        `/MakeDepositBalance?Manager_Index=${
          import.meta.env.VITE_MANAGER_INDEX
        }&MT5Account=${toAccount}&Amount=${amount}&Comment=transfer`
      );
      toast.success("Transfer completed successfully!", { id: toastId });
      setAmount("");
      await fromAccountInfo();
      await toAccountInfo();
    } catch (error) {
      console.log(error);
      toast.error("Transfer failed. Please try again.", { id: toastId });
    } finally {
      setIsTransferLoading(false); // NEW: Reset loading to false when transfer completes
    }
  };

  useEffect(() => {
    fromAccountInfo();
  }, [fromAccount]);

  useEffect(() => {
    toAccountInfo();
  }, [toAccount]);

  return (

       <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 p-10 min-h-screen">

    <motion.div
      className="mx-auto p-6 bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ModernHeading text={"Transfer Funds"} />
      </motion.div>
      <p className="text-gray-400 mb-6">
        You can instantly transfer funds between accounts with the same currency
        using the form below. <br /> For transfers between different currencies,
        Contact Admin.
      </p>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
      >
        <div className="flex flex-col md:flex-row justify-between gap-5">
          {/* From Account */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label
              htmlFor="from-account"
              className="text-sm font-medium flex justify-between text-gray-200"
            >
              <p>From Account</p>
              {balanceLoading ? (
                <LoaderPinwheelIcon className=" animate-spin text-secondary-500"></LoaderPinwheelIcon>
              ) : (
                fromAccountBalance && (
                  <p className="px-4">
                    Balance :{" "}
                    <span className="bg-secondary-500-10 px-3 py-1 rounded-full text-secondary-500">
                      ${fromAccountBalance}
                    </span>{" "}
                  </p>
                )
              )}
            </label>
            <select
              id="from-account"
              required
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
              className="w-full bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950 px-4 py-2 mt-2 border bg-secondary-800/20 border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
            >
              <option className="bg-indigo-950 text-white" value="" disabled>
                Select Account
              </option>
              {loggedUser?.accounts?.map((value, index) => (
                <option
                  disabled={toAccount === value.accountNumber}
                  key={index}
                  className="bg-indigo-950 text-white"
                  value={value.accountNumber}
                >
                  {value.accountNumber}
                </option>
              ))}
            </select>
          </motion.div>

          {/* To Account */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label
              htmlFor="to-account"
              className="text-sm flex justify-between font-medium text-gray-200"
            >
              <p>To Account</p>
              {balanceLoading ? (
                <LoaderPinwheelIcon className=" animate-spin text-secondary-500"></LoaderPinwheelIcon>
              ) : (
                toAccountBalance && (
                  <p className="px-4">
                    Balance :{" "}
                    <span className="bg-secondary-500-10 px-3 py-1 rounded-full text-secondary-500">
                      ${toAccountBalance}
                    </span>{" "}
                  </p>
                )
              )}
            </label>
            <select
              id="to-account"
              required
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              className="bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950 w-full px-4 py-2 mt-2 border bg-secondary-800/20 border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
            >
              <option className="bg-indigo-950 text-white" value="" disabled>
                Select Account
              </option>
              {loggedUser?.accounts?.map((value, index) => (
                <option
                  disabled={fromAccount === value.accountNumber}
                  key={index}
                  className="bg-indigo-950 text-white"
                  value={value.accountNumber}
                >
                  {value.accountNumber}
                </option>
              ))}
            </select>
          </motion.div>
        </div>

        {/* Amount to Transfer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label htmlFor="amount" className="text-sm font-medium text-gray-200">
            Amount Wish To Transfer
          </label>
          <input
            type="number"
            id="amount"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950 px-4 py-2 mt-2 border bg-secondary-800/20 border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
          />
        </motion.div>

        {/* Transfer Button */}
        <motion.div
          className="flex justify-center items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            disabled={isTransferLoading} // NEW: Disable button while loading
            className={`px-12 py-3 mt-4 text-white font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-secondary-500/30 ${
              isTransferLoading
                ? "bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950 cursor-not-allowed"
                : "bg-gradient-to-br from-indigo-950  via-blue-800 to-indigo-950"
            }`}
          >
            {isTransferLoading ? "Processing..." : "Transfer Now"}
          </motion.button>
        </motion.div>
      </motion.form>
    </motion.div>

    </div>
  );
};

export default UserTransfer;
