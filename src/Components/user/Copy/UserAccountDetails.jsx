import React, { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, User, Wallet } from "lucide-react";
import UserBankDetails from "./accountDetails/UserBankDetails";
import UserKycDetails from "./accountDetails/UserKycDetails";
import UserWalletDetails from "./accountDetails/UserWalletDetails";
import ModernHeading from "../lib/ModernHeading";





const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <motion.button
    className={`flex items-center justify-center px-3 p-2 sm:p-3 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
      active
        ? "bg-secondary-500-80 text-white shadow-lg"
        : "text-gray-400 hover:text-white hover:bg-secondary-700/20 hover:px-4"
    }`}
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
    {children}
  </motion.button>
);

const UserAccountDetails = () => {
  const [activeTab, setActiveTab] = useState("personal");

  const tabs = [
    { id: "personal", label: "Kyc Details", icon: User },
    { id: "account", label: "Bank Details", icon: CreditCard },
    { id: "wallet", label: "Wallet Details", icon: Wallet },
  ];

  return (
    <div className="max-w-full mx-auto sm:p-6 md:p-8 p-10  bg-gradient-to-br from-indigo-950 via-indigo-800 to-indigo-950  min-h-screen">
      <div className=" mb-6">
        <ModernHeading text={"Account Details"}></ModernHeading>
      </div>
      <div className="flex flex-col sm:flex-row justify-start sm:justify-center mb-6 space-y-2 sm:space-y-0 sm:space-x-4">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            icon={tab.icon}
          >
            {tab.label}
          </TabButton>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl mb-10 shadow-lg"
      >
        {activeTab === "personal" && <UserKycDetails />}
        {activeTab === "account" && <UserBankDetails />}
        {activeTab === "wallet" && <UserWalletDetails />}
      </motion.div>
    </div>
  );
};

export default UserAccountDetails;
