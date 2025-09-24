import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { backendApi } from "../../utils/apiClients";
import UserCopyRequestHistory from "./UserCopyRequestHistory";
import ModernHeading from "../lib/ModernHeading";

export default function UserCopyRequest() {
  const [activeTab, setActiveTab] = useState("request");
  const [role, setRole] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loggedUser = useSelector((store) => store.user.loggedUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Please wait..");
    const res = await backendApi.post(`/create-copy-request`, {
      userId: loggedUser?._id,
      role: role,
      accounts: selectedAccounts,
    });
    console.log("res", res);

    try {
      toast.success("Request Submitted", { id: toastId });
    } catch (error) {
      console.log("error", error);
      toast.error(`${error.response.message || `Please try again later`}`, {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
      setRole("");
      setSelectedAccounts([]);
      setActiveTab("history");
    }
    setTimeout(() => {
      console.log("Request submitted:", { role, selectedAccounts });
      setIsSubmitting(false);
    }, 2000);
  };

  const handleAccountChange = (accountNumber) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountNumber)
        ? prev.filter((acc) => acc !== accountNumber)
        : [...prev, accountNumber]
    );
  };

  const handleSelectAll = () => {
    setSelectedAccounts(
      selectedAccounts.length === loggedUser?.accounts.length
        ? []
        : loggedUser?.accounts.map((acc) => acc.accountNumber)
    );
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 p-10 min-h-screen">
      <motion.div
        className="mx-auto p-6 bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950 rounded-lg shadow-lg "
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Tabs */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex border-b border-gray-700">
            <button
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === "request"
                  ? "text-secondary-500 border-b-2 border-secondary-500"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("request")}
            >
              Request Role
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === "history"
                  ? "text-secondary-500 border-b-2 border-secondary-500"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setActiveTab("history")}
            >
              Request History
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ x: activeTab === "request" ? -100 : 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: activeTab === "request" ? 100 : -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-4"
          >
            {activeTab === "request" && (
              // Your request form content here
              <div>
                <motion.div
                  className="mb-4"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <ModernHeading text="Request Copy Trading Role" />
                </motion.div>
                <p className="text-gray-400 mb-6">
                  Use the form below to request approval as a Master or Copier
                  for copy trading. <br />
                  Your request will be reviewed by the admin within 1-2 business
                  days.
                </p>

                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-5">
                    {/* Role Selection */}
                    <motion.div
                      className="w-full"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label
                        htmlFor="role"
                        className="text-sm font-medium flex justify-between text-gray-200"
                      >
                        <p>Select Role</p>
                      </label>
                      <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full  px-4 py-2 mt-2 border bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950 border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                      >
                        <option
                          className="bg-blue-950 text-white"
                          value=""
                          disabled
                        >
                          Select Role
                        </option>
                        <option
                          className="bg-blue-950 text-white"
                          value="master"
                        >
                          Master
                        </option>
                        <option
                          className="bg-blue-950 text-white"
                          value="copier"
                        >
                          Copier
                        </option>
                      </select>
                    </motion.div>

                    {/* Account Selection with Modern Checkboxes */}
                    <motion.div
                      className="w-full"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className="text-sm font-medium flex justify-between text-gray-200">
                        <p>Select Accounts</p>
                        <p className="px-4">
                          Selected:{" "}
                          <span className="bg-secondary-500-10 px-3 py-1 rounded-full text-secondary-500">
                            {selectedAccounts.length}
                          </span>
                        </p>
                      </label>
                      <div className="mt-2 p-4 border bg-secondary-800/20 border-gray-700 rounded-md space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="select-all"
                            checked={
                              selectedAccounts.length ===
                              loggedUser?.accounts.length
                            }
                            onChange={handleSelectAll}
                            className="hidden"
                          />
                          <label
                            htmlFor="select-all"
                            className="flex items-center cursor-pointer w-full"
                          >
                            <span className="relative inline-flex items-center h-6 w-11 rounded-full bg-gray-700 transition-colors duration-200 ease-in-out">
                              <span
                                className={`absolute h-5 w-5 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${
                                  selectedAccounts.length ===
                                  loggedUser?.accounts.length
                                    ? "translate-x-5 bg-secondary-500-90"
                                    : "translate-x-0.5"
                                }`}
                              />
                            </span>
                            <span className="ml-3 text-gray-200">
                              {selectedAccounts.length === loggedUser?.accounts
                                ? "Deselect All"
                                : "Select All"}
                            </span>
                          </label>
                        </div>
                        <div className="my-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                          {loggedUser?.accounts.map((value, index) => (
                            <div key={index} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`account-${index}`}
                                checked={selectedAccounts.includes(
                                  value.accountNumber
                                )}
                                onChange={() =>
                                  handleAccountChange(value.accountNumber)
                                }
                                className="hidden"
                              />
                              <label
                                htmlFor={`account-${index}`}
                                className="flex items-center cursor-pointer w-full"
                              >
                                <span className="relative inline-flex items-center h-6 w-11 rounded-full bg-gray-700 transition-colors duration-200 ease-in-out">
                                  <span
                                    className={`absolute h-5 w-5 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${
                                      selectedAccounts.includes(
                                        value.accountNumber
                                      )
                                        ? "translate-x-5 bg-secondary-500-90"
                                        : "translate-x-0.5"
                                    }`}
                                  />
                                </span>
                                <span className="ml-3 text-gray-200">
                                  {value.accountNumber}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Selected Accounts Display */}
                  {selectedAccounts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="text-sm font-medium text-gray-200">
                        Selected Accounts
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedAccounts.map((account, index) => (
                          <span
                            key={index}
                            className="bg-secondary-500-10 px-3 py-1 rounded-full text-secondary-500"
                          >
                            {account}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.div
                    className="flex justify-center items-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <motion.button
                      type="submit"
                      whileTap={{ scale: 0.95 }}
                      disabled={
                        isSubmitting || !role || selectedAccounts.length === 0
                      }
                      className={`px-12 py-3 mt-4 text-white font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-secondary-500/30 ${
                        isSubmitting || !role || selectedAccounts.length === 0
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-secondary-500-90 hover:px-16 hover:bg-secondary-500-80"
                      }`}
                    >
                      {isSubmitting ? "Processing..." : "Submit Request"}
                    </motion.button>
                  </motion.div>
                </motion.form>
              </div>
            )}
            {activeTab === "history" && (
              // Your history table content here
              <UserCopyRequestHistory></UserCopyRequestHistory>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
