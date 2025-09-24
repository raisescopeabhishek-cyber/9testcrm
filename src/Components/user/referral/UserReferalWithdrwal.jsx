import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeDollarSign,
  Loader2,
  WalletCardsIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { backendApi } from "../../../utils/apiClients";
import ModernHeading from "../../lib/ModernHeading";
import useAutoUpdateLoggedUser from "../../../hooks/user/UseAutoUpdateLoggedUser";

export const UserReferralWithdrawal = () => {
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const [selectedGateway, setSelectedGateway] = useState("Bank Transfer");
  const [apiLoader, setApiLoader] = useState(false);
  const [error, setError] = useState("");
  const balance = Number(loggedUser?.ibBalance || 0).toFixed(4);
  const [amount, setAmount] = useState("");
  const [selectWallet, setSelectWallet] = useState("usdtTrc20");
  const [isWithdrawing, setIsWithdrawing] = useState(false); // NEW: Added withdrawal loading state
  useAutoUpdateLoggedUser();

  const currentDateTime = new Date();
  const formattedDateTime =
    currentDateTime.toLocaleDateString("en-GB") +
    ", " +
    currentDateTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // 12-hour format with AM/PM
    });

  const customContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Withdrawal Request Confirmation - Arena Trade</title>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 5px;
          background-color: #ffffff;
        }
        .header {
          background-color: #19422df2;
          color: #ffffff;
          padding: 20px 15px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 22px;
          letter-spacing: 1px;
        }
        .content {
          padding: 10px 20px;
        }
        .cta-button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #2d6a4f;
          color: #FFFFFF;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 10px 0;
        }
        .footer {
          background-color: #19422df2;
          color: #ffffff;
          text-align: center;
          padding: 5px 10px;
          font-size: 12px;
          border-radius: 0 0 10px 10px;
        }
        .footer-info {
          margin-top: 6px;
        }
        .footer-info a {
          color: #B6D0E2;
          text-decoration: none;
        }
        
       
        .withdrawal-details {
          background-color: #f8f8f8;
          border-left: 4px solid #2d6a4f;
          padding: 15px;
          margin: 20px 0;
        }
        .withdrawal-details p {
          margin: 5px 0;
        }
        .highlight {
          font-weight: bold;
          color: #0a2342;
        }
        .risk-warning {
          color: #C70039;
          padding: 5px;
          font-size: 12px;
          line-height: 1.4;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Commission Withdrwal Requested</h1>
        </div>
        <div class="content">
          <p>Dear ${loggedUser?.firstName + " " + loggedUser?.lastName},</p>
  <p>  We have received your Commision withdrawal request and are currently processing it.       <br><br>
 Our team is working diligently to verify your details, and you will be notified as soon as the verification is complete.</p>
        <div class="withdrawal-details">
          <p>Username: <span class="highlight">${loggedUser.email}</span></p>
            <p>Total Amount: <span class="highlight">${balance}</span></p>
            <p>Withdrwal Amount: <span class="highlight">${amount}</span></p>
            <p>Processing time: <span class="highlight">${" 1-3 business days"}</span></p>
            <p>Updated Date: <span class="highlight">${formattedDateTime}</span></p>
          </div>
    
    <p>Thank you for choosing us.</p>
    <p>Happy trading!</p>
          
          <p>Best regards,<br>The ${
            import.meta.env.VITE_WEBSITE_NAME || "Forex"
          } Team</p>
          <hr>
     <div class="risk-warning">
      <strong>Risk Warning:</strong> Trading CFDs carries high risk and may result in losses beyond your initial investment. Trade only with money you can afford to lose and understand the risks.  
      <br><br>
      Our services are not for U.S. citizens or in jurisdictions where they violate local laws.
    </div>
        
    
        </div>
          <div class="footer">
         <div class="footer-info">
                  <p>Website: <a href="https://${
                    import.meta.env.VITE_EMAIL_WEBSITE
                  }"> ${
    import.meta.env.VITE_EMAIL_WEBSITE
  } </a> | E-mail: <a href="mailto:${import.meta.env.VITE_EMAIL_EMAIL || ""}">${
    import.meta.env.VITE_EMAIL_EMAIL || ""
  }</a></p>
   
                  <p>© 2025 ${
                    import.meta.env.VITE_WEBSITE_NAME || ""
                  }. All Rights Reserved</p>
                </div>
        </div>
      </div>
    </body>
    </html>`;

  //    main withdrawal handler ---------------------

  const withdrawalHandler = async (e) => {
    e.preventDefault();
    if (isWithdrawing) return; // NEW: Prevent multiple clicks if already loading

    setApiLoader(true);
    setError("");
    setIsWithdrawing(true); // NEW: Set withdrawal loading to true

    try {
      if (balance <= 0) {
        setError(`You don't have sufficient balance for withdrawal.`);
        setApiLoader(false);
      } else if (amount > balance) {
        setError(`Amount must be less then or equal to $${balance}`);
        setApiLoader(false);
      } else if (amount <= balance && amount > 0) {
        const withdrawalDBres = await backendApi.post(
          `/add-referral-withdrawal`,
          {
            referralId: loggedUser.referralAccount,
            method:
              selectedGateway === "Bank Transfer"
                ? selectedGateway
                : selectWallet,
            amount: amount,
            status: "pending",
            userId: loggedUser._id,
            managerIndex: import.meta.env.VITE_MANAGER_INDEX,
            totalBalance: balance,
            level: 1,
          }
        );
        const customMailRes = await backendApi.post(`/custom-mail`, {
          email: loggedUser.email,
          content: customContent,
          subject: "IB Withdrawal Requested",
        });

        setApiLoader(false);
        toast.success("Withdrawal Requested");
      }
      setApiLoader(false);
    } catch (error) {
      setApiLoader(false);
      toast.error("Something went wrong!!");
      console.log("error while withdraw", error);
    } finally {
      setIsWithdrawing(false); // NEW: Reset withdrawal loading to false
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-indigo-900 via-indigo-900 to-indigo-950 min-h-screen p-10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-secondary-800/50  p-8 rounded-lg shadow-xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex flex-col md:flex-row items-center gap-2">
            {/* Back Button */}
            <button
              onClick={() => {
                window.history.back();
              }}
              className="flex items-center mt-2 gap-2 rounded-xl border-b px-5 py-1 hover:px-6 border-secondary-500 text-secondary-500  transition-all"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <ModernHeading text={"Withdraw IB Commission"}></ModernHeading>
          </div>
          <div>
            <h1 className=" font-semibold text-sm text-neutral-100">
              Withdrawable amount
            </h1>
            <p
              className={` text-center 
                text-secondary-500 bg-secondary-500-10 "
              }   mt-1 rounded-full py-1  font-bold`}
            >
              ${balance}
            </p>
          </div>
        </div>
        <form onSubmit={withdrawalHandler} className="space-y-6">
          {/* method and account type -- */}
          <div className=" grid grid-cols-1 md:grid-cols-2 items-center   gap-6">
            <div className=" w-full">
              <label
                htmlFor="gateway"
                className="block text-sm font-medium text-white mb-2"
              >
                Method
              </label>
              <select
                id="gateway"
                value={selectedGateway}
                onChange={(e) => setSelectedGateway(e.target.value)}
                className="bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950 block w-full p-3 text-base bg-secondary-700 outline-none border-none text-white rounded-md "
              >
                {/* <option value="">Select Gateway</option> */}
                <option
                  className="bg-indigo-950 text-white"
                  value="Bank Transfer"
                >
                  Bank Transfer
                </option>
                <option
                  className="bg-indigo-950 text-white"
                  value="Wallet Transfer"
                >
                  Wallet Transfer
                </option>
              </select>
            </div>

            {selectedGateway === "Wallet Transfer" && (
              <div className=" w-full">
                <label
                  htmlFor="account"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Choose Wallet
                </label>
                <select
                  id="account"
                  value={selectWallet}
                  onChange={(e) => setSelectWallet(e.target.value)}
                  className="block w-full p-3 text-base bg-secondary-700 text-white border outline-none border-none rounded-md "
                >
                  <option
                    className="bg-indigo-950 text-white"
                    value="usdtTrc20"
                  >
                    USDT {"(Trc20)"}{" "}
                  </option>
                  <option
                    className="bg-indigo-950 text-white"
                    value="usdtBep20"
                  >
                    USDT {"(Bep20)"}{" "}
                  </option>
                  <option
                    className="bg-indigo-950 text-white"
                    value="binanceId"
                  >
                    Binance ID{" "}
                  </option>
                  <option
                    className="bg-indigo-950 text-white"
                    value="btcAddress"
                  >
                    BTC Address{" "}
                  </option>
                </select>
              </div>
            )}
          </div>
          {/* account details -- */}

          {selectedGateway === "Bank Transfer" ? (
            <div>
              <div className=" flex items-center gap-2 mb-3">
                <WalletCardsIcon></WalletCardsIcon>
                <h1 className=" text-lg font-bold">Account details</h1>
              </div>
              <div>
                <p>
                  Bank Name -{" "}
                  <span className=" font-bold">
                    {loggedUser?.bankDetails?.bankName}{" "}
                  </span>
                </p>
              </div>
              <div>
                <p>
                  Holder Name -{" "}
                  <span className=" font-bold">
                    {loggedUser?.bankDetails?.holderName}
                  </span>{" "}
                </p>
              </div>
              <div>
                <p>
                  Account Number -{" "}
                  <span className=" font-bold">
                    {loggedUser?.bankDetails?.accountNumber}
                  </span>
                </p>
              </div>
              <div>
                <p>
                  IFSC Code -{" "}
                  <span className=" font-bold">
                    {loggedUser?.bankDetails?.ifscCode}
                  </span>
                </p>
              </div>
              <div>
                <p>
                  Swift Code -{" "}
                  <span className=" font-bold">
                    {loggedUser?.bankDetails?.swiftCode}
                  </span>
                </p>
              </div>
              <div>
                <p>
                  UPI ID -{" "}
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
              {selectWallet === "usdtTrc20" && (
                <div>
                  <p>
                    USDT Trc20 :{" "}
                    <span className=" font-bold">
                      {loggedUser?.walletDetails?.tetherAddress}{" "}
                    </span>
                  </p>
                </div>
              )}
              {selectWallet === "usdtBep20" && (
                <div>
                  <p>
                    USDT Bep20 :{" "}
                    <span className=" font-bold">
                      {loggedUser?.walletDetails?.ethAddress}
                    </span>{" "}
                  </p>
                </div>
              )}
              {selectWallet === "binanceId" && (
                <div>
                  <p>
                    Binance ID :{" "}
                    <span className=" font-bold">
                      {loggedUser?.walletDetails?.accountNumber}
                    </span>
                  </p>
                </div>
              )}
              {selectWallet === "btcAddress" && (
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

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-white mb-2"
            >
              Amount
            </label>
            <div className="relative bg-white/10 backdrop-blur-md rounded-md border border-white/20 shadow-md">
              {/* Icon */}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BadgeDollarSign className="h-6 w-6 text-indigo-400" />
              </div>

              {/* Input */}
              <input
                type="text"
                id="amount"
                className="bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950 w-full pl-12 py-3 bg-transparent text-white placeholder-gray-400 
               focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={withdrawalHandler}
            type="submit"
            disabled={isWithdrawing}
            className={`w-full  flex justify-center py-3 rounded-md shadow-md text-white focus:outline-none focus:ring-2 focus:ring-white/40 transition duration-300 ${
              // NEW: Disable button while withdrawing
              isWithdrawing
                ? "bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950 cursor-not-allowed"
                : "bg-gradient-to-br from-indigo-950  via-blue-950 to-indigo-950 hover:shadow-xl"
            }`}
          >
            {isWithdrawing ? "Processing..." : "Submit Withdrawal"}
            {(apiLoader || isWithdrawing) && (
              <Loader2 className="animate-spin mx-3" />
            )}
          </button>
          <div className=" my-2 text-red-500 text-center">
            <p>{error}</p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
