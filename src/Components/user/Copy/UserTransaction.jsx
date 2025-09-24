import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import ModernHeading from "../lib/ModernHeading";
import { backendApi, metaApi } from "../../utils/apiClients";
import DynamicLoder from "../Loader/DynamicLoder";
import UserMt5Transactions from "./transactions/UserMt5Transactions";




export default function UserTransaction() {
  const [activeTab, setActiveTab] = useState("deposit");
const [transactionData, setTransactionData] = useState([
  {
    mt5Account: "123456",
    accountType: "standard",
    amount: 250,
    deposit: 300,
    method: "bank transfer",
    createdAt: "2025-08-20T10:15:00Z",
    updatedAt: "2025-08-21T15:30:00Z",
    depositSS: "dummy-receipt.png",
    lastBalance: 1500,
    status: "approved",
  },
  {
    mt5Account: "789012",
    accountType: "pro",
    amount: 120,
    deposit: 500,
    method: "upi",
    createdAt: "2025-08-18T08:00:00Z",
    updatedAt: "2025-08-18T12:00:00Z",
    depositSS: "dummy-receipt2.png",
    lastBalance: 800,
    status: "pending",
  },
  {
    mt5Account: "345678",
    accountType: "demo",
    amount: 75,
    deposit: 200,
    method: "paypal",
    createdAt: "2025-08-15T14:25:00Z",
    updatedAt: "2025-08-16T09:45:00Z",
    depositSS: "dummy-receipt3.png",
    lastBalance: 300,
    status: "rejected",
  },
]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loggedUser = useSelector((store) => store.user.loggedUser);

  const loggedAccountNumbers = loggedUser?.accounts?.map(
    (value) => +value.accountNumber
  );

  const fetchTransactionData = async (tradeType = "withdrawal") => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (tradeType === "withdrawal") {
        res = await backendApi.get(`/withdrawals/${loggedUser._id}`);
      }
      if (tradeType === "deposit") {
        res = await backendApi.get(`/deposit/${loggedUser._id}`);
      }
      if (tradeType === "account") {
        res = await metaApi.post(`/TransactionHistoryByAccounts`, {
          Manager_Index: import.meta.env.VITE_MANAGER_INDEX,
          MT5Accounts: loggedAccountNumbers,
          StartTime: "2021-05-01 00:00:00",
          EndTime: "2028-06-30 23:59:59",
        });
      }
      const filteredData = activeTab === "account" ? res.data : res.data.data;
      if (filteredData?.length === 0) {
        setError(`No ${tradeType} data available.`);
        setTransactionData([]);
      } else {
        setTransactionData(filteredData);
      }
    } catch (error) {
      console.error(`Error fetching ${tradeType} data:`, error);
      setError(`Failed to fetch ${tradeType} data. Please try again.`);
      setTransactionData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (tradeType) => {
    setActiveTab(tradeType);
    fetchTransactionData(tradeType);
  };

  // Formate date
  function formatDate(isoDateString) {
    const date = new Date(isoDateString);
    const formattedDate = date.toLocaleDateString("en-GB", {
      year: "numeric",
      day: "2-digit",
      month: "2-digit",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    return `${formattedDate}, ${formattedTime}`;
  }

  // useEffect(() => {
  //   fetchTransactionData(activeTab);
  // }, [activeTab]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 p-10 min-h-screen">

      <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950 pb-20 rounded-lg shadow-lg p-3 text-white overflow-hidden user-custom-scrollbar"
    >
      <motion.div className=" mb-6">
        <ModernHeading text={"Transaction History"}></ModernHeading>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex gap-3 mb-6 overflow-x-auto whitespace-nowrap px-2 sm:px-0"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-colors ${
            activeTab === "deposit"
              ? "bg-secondary-500-80 text-white"
              : "bg-secondary-800/50 text-gray-300 hover:bg-secondary-700/50"
          }`}
          onClick={() => handleTabClick("deposit")}
        >
          Deposits
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-colors ${
            activeTab === "withdrawal"
              ? "bg-secondary-500-80 text-white"
              : "bg-secondary-800/50 text-gray-300 hover:bg-secondary-700/50"
          }`}
          onClick={() => handleTabClick("withdrawal")}
        >
          Withdrawals
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-colors ${
            activeTab === "account"
              ? "bg-secondary-500-80 text-white"
              : "bg-secondary-800/50 text-gray-300 hover:bg-secondary-700/50"
          }`}
          onClick={() => handleTabClick("account")}
        >
          Account Transactions
        </motion.button>
      </motion.div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center py-4"
        >
          {/* <Loader /> */}
          <DynamicLoder></DynamicLoder>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center py-4 text-red-500"
        >
          {error}
        </motion.div>
      )}

      {!loading && !error && transactionData?.length > 0 && (
        <motion.div
          variants={tableVariants}
          initial="hidden"
          animate="visible"
          className=" overflow-x-auto user-custom-scrollbar"
        >
          {activeTab === "account" ? (
            <UserMt5Transactions
              transactionData={transactionData}
              tableVariants={tableVariants}
              rowVariants={rowVariants}
            ></UserMt5Transactions>
          ) : (
            <table className="w-full text-sm overflow-y-hidden overflow-x-auto user-custom-scrollbar">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-center py-3 px-4 whitespace-nowrap">
                    Account No
                  </th>
                  <th className="text-center py-3 px-4 whitespace-nowrap">
                    Type
                  </th>
                  {activeTab === "withdrawal" && (
                    <th className="text-center py-3 px-4 whitespace-nowrap">
                      Amount
                    </th>
                  )}
                  {activeTab === "deposit" && (
                    <>
                      <th className="text-center py-3 px-4 whitespace-nowrap">
                        Deposit
                      </th>
                    </>
                  )}
                  <th className="text-center py-3 px-4 whitespace-nowrap">
                    Method
                  </th>

                  <th className="text-center py-3 px-4 whitespace-nowrap">
                    Requested on
                  </th>
                  <th className="text-center py-3 px-4 whitespace-nowrap">
                    Updated on
                  </th>
                  {activeTab === "deposit" ? (
                    <th className="text-center py-3 px-4 whitespace-nowrap">
                      Attachment
                    </th>
                  ) : (
                    <th className="text-center py-3 px-4 whitespace-nowrap">
                      Last Balance
                    </th>
                  )}

                  <th className="text-center py-3 px-4 whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <AnimatePresence>
                <motion.tbody variants={tableVariants}>
                  {transactionData?.map((item, index) => (
                    <motion.tr
                      key={index}
                      variants={rowVariants}
                      className="border-b border-gray-700/60 sticky hover:bg-secondary-800 transition-all"
                      whileHover={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        transition: { duration: 0.2 },
                      }}
                    >
                      <td className="py-2 px-4 text-center">
                        {item?.mt5Account}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <motion.div
                          className="bg-secondary-500-10 whitespace-nowrap rounded-full px-3 py-1 inline-block"
                          whileHover={{ scale: 1.05 }}
                        >
                          {item?.accountType}
                        </motion.div>
                      </td>
                      {activeTab === "withdrawal" && (
                        <td className="py-2 px-4 text-center">
                          ${item?.amount}
                        </td>
                      )}
                      {activeTab === "deposit" && (
                        <>
                          <td className="py-2 text-center">${item?.deposit}</td>
                        </>
                      )}
                      <td className="py-2 px-4 text-center capitalize">
                        <p className=" capitalize"> {item?.method}</p>
                      </td>

                      <td className="text-center text-xs py-2 px-3">
                        {formatDate(item?.createdAt)}
                      </td>
                      <td className="text-center text-xs py-2 px-3">
                        {formatDate(item?.updatedAt)}
                      </td>
                      {activeTab === "deposit" ? (
                        <td className="text-center py-2 px-3">
                          <a
                            target="_blank"
                            className=" text-blue-500 hover:text-blue-600 transition-all"
                            href={`${
                              import.meta.env.VITE_BACKEND_BASE_URL +
                              "/" +
                              item.depositSS
                            }`}
                          >
                            View
                          </a>
                        </td>
                      ) : (
                        <td className="text-center text-xs py-2 px-3">
                          ${item?.lastBalance}
                        </td>
                      )}

                      <td className="text-center py-2 px-2">
                        <motion.div
                          className={`inline-block px-2 py-1 font-semibold rounded-full ${
                            item?.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : item?.status === "approved"
                              ? "bg-green-500/10 text-green-500"
                              : item?.status === "rejected"
                              ? "bg-red-400/10 text-red-500"
                              : ""
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <p className="first-letter:capitalize">
                            {item?.status}
                          </p>
                        </motion.div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </AnimatePresence>
            </table>
          )}
        </motion.div>
      )}
    </motion.div>

    </div>
  );
}
