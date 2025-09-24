import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import DynamicLoder from "../Loader/DynamicLoder";
import ModernHeading from "../lib/ModernHeading";
import { metaApi } from "../../utils/apiClients";


export default function UserTradeHistory() {
  const [activeTab, setActiveTab] = useState("open");
  const [tradeData, setTradeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const [currentAccount, setCurrentAccount] = useState(
    loggedUser.accounts[0] || "000"
  );

  const currentDate = new Date().toISOString().slice(0, 10);

  const fetchTradeData = async (tradeType) => {
    setActiveTab(tradeType);
    setLoading(true);
    setError(null);
    try {
      setTradeData([]);
      const data = [];
      for (const account of loggedUser.accounts) {
        let res;
        if (tradeType === "closed") {
          res = await metaApi.get(
            `/GetCloseTradeAll?Manager_Index=${
              import.meta.env.VITE_MANAGER_INDEX
            }&MT5Accont=${
              account.accountNumber
            }&StartTime=2021-07-20 00:00:00&EndTime=${currentDate} 23:59:59`
          );
        } else if (tradeType === "open") {
          res = await metaApi.get(
            `/GetOpenTradeByAccount?Manager_Index=${
              import.meta.env.VITE_MANAGER_INDEX
            }&MT5Accont=${account.accountNumber}`
          );
        }
        // console.log("res trade history--", res.data);
        if (Array.isArray(res.data)) {
          data.push(...res.data);
        }
        // After all data is collected, update the state once
        if (data.length > 0) {
          setTradeData(data);
          setError("");
        } else if (data.length == 0) {
          setTradeData([]);
          setError("No data found. Please try again.");
        }
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching trade data:", error);
      setError("Failed to fetch trade data. Please try again.");
      setTradeData([]);
      setLoading(false);
    }
  };
  const handleTabClick = (tradeType) => {
    setActiveTab(tradeType);
    fetchTradeData(tradeType);
  };

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

  useEffect(() => {
    fetchTradeData(activeTab);
  }, [currentAccount]);

  return (
       <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 p-10 min-h-screen">
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950 p-5 rounded-lg shadow-lg  text-white "
    >
      <div className=" mb-5 flex justify-between">
        <ModernHeading text={"Trades History"}></ModernHeading>
      </div>
      <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors ${
            activeTab === "closed"
              ? "bg-secondary-500-50 text-white"
              : "bg-secondary-800/40 text-gray-300 hover:bg-secondary-700/30"
          }`}
          onClick={() => handleTabClick("closed")}
        >
          Closed Trades
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors ${
            activeTab === "open"
              ? "bg-secondary-500-50 text-white"
              : "bg-secondary-800/40 text-gray-300 hover:bg-secondary-700/30"
          }`}
          onClick={() => handleTabClick("open")}
        >
          Open Trades
        </motion.button>
      </motion.div>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center py-4"
        >
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
      {!loading && !error && (
        <motion.div
          variants={tableVariants}
          initial="hidden"
          animate="visible"
          className="overflow-x-auto"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b whitespace-nowrap border-gray-700">
                <th className="text-left py-3 px-4">Account No</th>
                <th className="text-left py-3 px-4">Symbol</th>
                <th className="text-left py-3 px-4">Open Time</th>
                {activeTab === "closed" && (
                  <th className="text-left py-3 px-4">Close Time</th>
                )}
                <th className="text-left py-3 px-4">Open Price</th>
                {activeTab === "closed" && (
                  <th className="text-left py-3 px-4">Close Price</th>
                )}
                <th className="text-center py-3 px-4">Buy/Sell</th>
                <th className="text-center py-3 px-4">Volume</th>
                <th className="text-left py-3 px-4">P/L</th>
              </tr>
            </thead>
            <AnimatePresence>
              <motion.tbody variants={tableVariants}>
                {tradeData?.map((trade, index) => (
                  <motion.tr
                    key={index}
                    variants={rowVariants}
                    className="border-b border-gray-700 hover:bg-secondary-800 transition-all"
                    whileHover={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      transition: { duration: 0.2 },
                    }}
                  >
                    <td className="py-1 px-4 text-left">
                      <div className="flex justify-left ml-4">
                        {trade?.MT5Account}
                      </div>
                    </td>
                    <td className="py-1 px-4">{trade?.Symbol}</td>
                    <td className="py-1">{trade?.Open_Time}</td>
                    {activeTab === "closed" && (
                      <td className="text-left py-2">{trade?.Close_Time}</td>
                    )}
                    <td className="text-left py-2 px-6">{trade?.Open_Price}</td>
                    {activeTab === "closed" && (
                      <td className="text-left py-2 px-6">
                        {trade?.Close_Price}
                      </td>
                    )}
                    {activeTab === "closed" && (
                      <td
                        className={`text-center py-2 ${
                          trade?.OrderType === 0
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {trade?.OrderType === 0 ? "Sell" : "Buy"}
                      </td>
                    )}
                    {activeTab === "open" && (
                      <td
                        className={`text-center py-3 px-4 ${
                          trade?.BUY_SELL === 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        <div className="flex text-center justify-center items-center">
                          {trade?.BUY_SELL === 0 ? "Buy" : "Sell"}
                        </div>
                      </td>
                    )}
                    <td className="text-center py-3 px-4">
                      <div className="flex justify-center items-center w-full">
                        {activeTab === "open"
                          ? trade?.Volume / 10000
                          : trade?.Lot}
                      </div>
                    </td>
                    <td
                      className={`text-left py-3 ${
                        trade?.Profit >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {trade?.Profit?.toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </motion.div>
      )}
    </motion.div>
    </div>
  );
}
