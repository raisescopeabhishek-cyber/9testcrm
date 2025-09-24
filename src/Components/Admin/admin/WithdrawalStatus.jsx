import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  CircleCheckBig,
  CircleX,
  Loader,
  Search,
  WalletCardsIcon,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import toast from "react-hot-toast";
import { backendApi, metaApi } from "../../../utils/apiClients";
import {
  CFcalculateTimeSinceJoined,
  CFformatDate,
} from "../../../utils/CustomFunctions";
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const StatCard = ({ icon, amount, label, bgColor, link, allLoading }) => (
  <Link to={`${link}`} className="">
    <motion.div
      variants={cardVariants}
      className={`p-4  rounded-lg shadow-lg transition-all duration-300 hover:shadow-md ${bgColor} hover:px-5 text-white`}
      style={{
        backgroundImage:
          "url('https://png.pngtree.com/background/20230109/original/pngtree-white-abstract-carbon-fiber-texture-background-picture-image_1996167.jpg')", // More visible pattern
        overlay: "auto",
        backgroundBlendMode: "overlay",
        backgroundSize: "cover",
      }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {icon}
          <div className="ml-3">
            {allLoading ? (
              <p className="">Loading..</p>
            ) : (
              <p className="text-2xl font-bold">{amount}</p>
            )}
            <p className="text-sm opacity-80">{label}</p>
          </div>
        </div>
      </div>
    </motion.div>
  </Link>
);

const WithdrawalStatus = () => {
  const { status } = useParams();
  const [depositData, setDepositData] = useState([]);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [loading, setLoading] = useState(false);
  const isAll = status === "all" ? true : false;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [allDepositData, setAllDepositData] = useState([]);
  const [allLoading, setAllLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [pagination, setPagination] = useState({});
  const [isActionLoading, setIsActionLoading] = useState(false); // NEW: Added action loading state

  // fetch data------------------
  const fetchApiData = async () => {
    setLoading(true);
    try {
      let finalRes;

      if (status === "all") {
        const res = await backendApi.get(
          `/withdrawals?page=${currentPage}&limit=10&search=${debouncedSearch}&status=`
        );
        finalRes = res.data;
      } else if (status === "pending") {
        const res = await backendApi.get(
          `/withdrawals?page=${currentPage}&limit=10&search=${debouncedSearch}&status=pending`
        );
        finalRes = res.data;
      } else if (status === "approved") {
        const res = await backendApi.get(
          `/withdrawals?page=${currentPage}&limit=10&search=${searchQuery}&status=approved`
        );
        finalRes = res.data;
      } else if (status === "rejected") {
        const res = await backendApi.get(
          `/withdrawals?page=${currentPage}&limit=10&search=${searchQuery}&status=rejected`
        );
        finalRes = res.data;
      }
      setDepositData(finalRes.data);
      setPagination(finalRes.pagination);
      setLoading(false);
    } catch (error) {
      toast.error("Something went wrong");
      console.log("Error fetching deposits:", error);
      setLoading(false);
    }
  };

  // fetch all data ----------------

  const fetchAllData = async () => {
    try {
      // for all data -----
      const allRes = await backendApi.get(`/withdrawals`);
      setAllDepositData(allRes.data.data);
    } catch (error) {
      console.log("failed to fetch all data");
    } finally {
      setAllLoading(false);
    }
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleActionClick = (deposit, action) => {
    setSelectedDeposit(deposit);
    setActionType(action);
    setIsDialogOpen(true);
  };

  // custom content -----------------

  console.log("selected withdrawal####################", selectedDeposit);

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
          <h1>Withdrawal Success</h1>
        </div>
        <div class="content">
          <p>Dear ${
            selectedDeposit?.userData?.firstName +
            " " +
            selectedDeposit?.userData?.lastName
          },</p>
  <p> Your withdrawal request has been processed and the requested amount has been successfully added to your chosen account</p>
        <div class="withdrawal-details">
          <p>Account No: <span class="highlight">${
            selectedDeposit?.mt5Account
          }</span></p>
            <p>Amount: <span class="highlight">${
              selectedDeposit?.amount
            }</span></p>
            <p>Account Type: <span class="highlight">${
              selectedDeposit?.accountType
            }</span></p>
            <p>Time Stamp: <span class="highlight">${formattedDateTime}</span></p>
          </div>

    <p>Thank you for choosing us.</p>
    <p>Happy trading!</p>

          <p>Best regards,<br>The ${
            import.meta.env.VITE_WEBSITE_NAME || "Forex"
          } Team</p>
          <hr>

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

  // handle confirm click ----------------
  const handleConfirmAction = async (selectedDeposit) => {
    if (isActionLoading) return;

    const toastId = toast.loading("Please wait..");
    setIsActionLoading(true);

    try {
      if (actionType === "approve") {
        const apiWithdrawalRes = await metaApi.get(
          `/MakeWithdrawBalance?Manager_Index=${
            import.meta.env.VITE_MANAGER_INDEX
          }&MT5Account=${selectedDeposit.mt5Account}&Amount=${
            selectedDeposit.amount
          }&Comment=Withdrawal`
        );
        setIsDialogOpen(false);

        const updateWithdrawal = await backendApi.put(`/update-withdrawal`, {
          _id: selectedDeposit._id,
          status: "approved",
        });
        const customMailRes = await backendApi.post(`/custom-mail`, {
          email: selectedDeposit.userData.email,
          content: customContent,
          subject: "Withdrawal Success",
        });
        toast.success("Withdrawal Approved", { id: toastId });

        const updatedDepositData = depositData.map((deposit) =>
          deposit._id === selectedDeposit._id
            ? {
                ...deposit,
                status: "approved",
              }
            : deposit
        );
        setDepositData(updatedDepositData);
        setIsDialogOpen(false);
      } else if (actionType === "reject") {
        const res = await backendApi.put(`/update-withdrawal`, {
          _id: selectedDeposit._id,
          status: "rejected",
        });
        setIsDialogOpen(false);

        const updatedDepositData = depositData.map((deposit) =>
          deposit._id === selectedDeposit._id
            ? {
                ...deposit,
                status: "rejected",
              }
            : deposit
        );
        setDepositData(updatedDepositData);
        setIsDialogOpen(false);
        toast.success("Withdrawal Rejected", { id: toastId });
      }
    } catch (error) {
      toast.error("Something went wrong", { id: toastId }); // MODIFIED: Corrected toast type to error
      console.error("Error updating deposit status:", error);
    } finally {
      setIsActionLoading(false); // NEW: Reset action loading to false
    }
  };
  // total deposits ----------

  const TotalDeposits = allDepositData
    .reduce((total, item) => total + parseFloat(item.amount), 0)
    .toFixed(2);

  // Total pending deposits
  const TotalPendingDeposits = allDepositData
    .filter((item) => item.status === "pending")
    .reduce((total, item) => total + parseFloat(item.amount), 0)
    .toFixed(2);

  // Total successful deposits
  const TotalSuccessfullDeposits = allDepositData
    .filter((item) => item.status === "approved")
    .reduce((total, item) => total + parseFloat(item.amount), 0)
    .toFixed(2);

  // Total rejected deposits
  const TotalRejectedDeposits = allDepositData
    .filter((item) => item.status === "rejected")
    .reduce((total, item) => total + parseFloat(item.amount), 0)
    .toFixed(2);

  // stats data------------

  const stats = [
    {
      icon: <ArrowLeftRight size={24} />,
      amount: TotalDeposits,
      label: "Total Withdrawals",
      bgColor: "bg-sky-800",
      link: "/admin/deposit/all",
    },
    {
      icon: <ArrowLeftRight size={24} />,
      amount: TotalSuccessfullDeposits,
      label: "Successfull Withdrawals",
      bgColor: "bg-green-800",
      link: "/admin/deposit/approved",
    },
    {
      icon: <ArrowLeftRight size={24} />,
      amount: TotalPendingDeposits,
      label: "Pending Withdrawals",
      bgColor: "bg-yellow-800",
      link: "/admin/deposit/pending",
    },
    {
      icon: <ArrowLeftRight size={24} />,
      amount: TotalRejectedDeposits,
      label: "Rejected Withdrawals",
      bgColor: "bg-orange-800",
      link: "/admin/deposit/rejected",
    },
  ];

  // pagination -------------------

  const totalPages = pagination?.totalPages;
  const handleNextPage = () => {
    if (currentPage < pagination?.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // page reset ------

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, status]);

  // debouncing searching ------------
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // use effect for data fetching -----------------

  useEffect(() => {
    fetchApiData();
  }, [status, currentPage, debouncedSearch]);

  // use effect for all data -----------------

  useEffect(() => {
    if (status == "all") {
      fetchAllData();
    }
  }, [status]);

  return (
    <div className="  w-full p-4">
      <div className=" w-full flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl flex-col font-bold mb-4 text-white first-letter:uppercase">
          {status} Withdrawals
        </h1>
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Name / Email "
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-primary-600 border border-primary-500 rounded-lg focus:outline-none focus:border-primary-400 text-white placeholder-primary-300"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-300"
            size={18}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-300 hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div className=" overflow-x-auto">
        {isAll && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className=" hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <StatCard allLoading={allLoading} key={index} {...stat} />
            ))}
          </motion.div>
        )}
        {/* Added max-height container for scrolling */}
        <div className="max-h-[60vh] overflow-y-auto relative custom-scrollbar">
          <table className="min-w-full bg-primary-700">
            {/* Made header sticky */}
            <thead className="bg-primary-400 text-white sticky top-0 z-10">
              <tr>
                <th className="py-2 px-4 text-left">User | Email</th>
                <th className="py-2 px-4 text-left">Account</th>
                <th className="py-2 px-4 text-left">AC Type</th>
                <th className="py-2 px-4 text-left">Withdraw</th>
                <th className="py-2 px-4 text-left">Method</th>
                {status === "rejected" || status === "approved" ? (
                  <th className="py-2 px-4 text-left">Updated At</th>
                ) : (
                  <th className="py-2 px-4 text-left">Requested At</th>
                )}
                <th className="py-2 px-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody className="text-white">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-4">
                    <div className="text-white flex justify-center items-center gap-4">
                      <p>Loading...</p>
                      <Loader className="animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : (
                depositData?.map((item) => (
                  <tr key={item._id} className="border-b border-gray-600/40">
                    <td className="py-2 px-4">
                      <div className="font-semibold">
                        {item?.userData?.firstName
                          ? item?.userData?.firstName
                          : "Not found!!"}
                      </div>
                      <div className="text-white/70 text-sm">
                        {item?.userData ? item?.userData?.email : "Not found!!"}
                      </div>
                    </td>
                    <td className="py-2 px-4">{item?.mt5Account}</td>
                    <td className="py-2 px-4">
                      <span className="whitespace-nowrap font-semibold text-gray-100 py-1 text-sm">
                        {item?.accountType}
                      </span>
                    </td>
                    <td className="py-2 px-4">${item?.amount.toFixed(2)}</td>
                    <td className="py-2 px-4">{item?.method}</td>
                    {status === "rejected" || status === "approved" ? (
                      <td className="py-3 whitespace-nowrap px-4">
                        <div>{CFformatDate(item?.updatedAt)}</div>
                        <div className="text-sm text-gray-400">
                          {CFcalculateTimeSinceJoined(item?.updatedAt)}
                        </div>
                      </td>
                    ) : (
                      <td className="py-3 whitespace-nowrap px-4">
                        <div>{CFformatDate(item?.createdAt)}</div>
                        <div className="text-sm text-gray-400">
                          {CFcalculateTimeSinceJoined(item?.createdAt)}
                        </div>
                      </td>
                    )}

                    <td className="py-2 px-4">
                      {item.status === "pending" && (
                        <div>
                          {isActionLoading ? (
                            "Please wait.."
                          ) : (
                            <div className="flex items-center gap-5">
                              <button
                                className="text-green-400 hover:text-green-600 hover:scale-110 transition-all"
                                onClick={() =>
                                  handleActionClick(item, "approve")
                                }
                              >
                                <CircleCheckBig />
                              </button>
                              <button
                                className="text-red-500 hover:text-red-700 hover:scale-110 transition-all"
                                onClick={() =>
                                  handleActionClick(item, "reject")
                                }
                              >
                                <CircleX />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {item.status === "approved" && (
                        <p className="text-green-400">Approved</p>
                      )}
                      {item.status === "rejected" && (
                        <p className="text-red-500">Rejected</p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col items-center space-y-3">
          {/* Pagination Info */}
          <p className="text-gray-300 text-sm">
            <span className="font-semibold text-white">
              {" "}
              {pagination?.totalWithdrawals}
            </span>{" "}
            total records
          </p>

          {/* Pagination Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-5 py-2 rounded-xl transition-all ${
                currentPage === 1
                  ? "bg-gray-700/40 text-gray-400 cursor-not-allowed"
                  : "bg-primary-500 hover:bg-primary-600 text-white shadow-md"
              }`}
            >
              ← Previous
            </button>

            <span className="text-gray-300 text-sm">
              Page{" "}
              <span className="font-semibold text-white">{currentPage}</span> of
              <span className="font-semibold text-white"> {totalPages}</span>
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-5 py-2 rounded-xl transition-all ${
                currentPage === totalPages
                  ? "bg-gray-700/40 text-gray-400 cursor-not-allowed"
                  : "bg-primary-500 hover:bg-primary-600 text-white shadow-md"
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve"
                ? "Approve Withdrawal"
                : "Reject Withdrawal"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedDeposit && (
                <div>
                  <div>
                    {/* <li className=" text-lg font-semibold mb-1">User Info</li> */}
                    <p>
                      User:{" "}
                      {selectedDeposit.userData?.firstName +
                        " " +
                        selectedDeposit.userData?.lastName}
                    </p>
                    <p>Email: {selectedDeposit.userData?.email}</p>
                    <p>Withdrawal Amount: ${selectedDeposit?.amount}</p>
                    <p>Account: {selectedDeposit?.mt5Account}</p>
                    <p>Date: {CFformatDate(selectedDeposit?.updatedAt)}</p>
                  </div>
                  <div>
                    <li className=" text-lg my-4 font-semibold mb-1">
                      Payment Info
                    </li>
                    {selectedDeposit.method === "Bank Transfer" ? (
                      <div>
                        <div className=" flex items-center gap-2 my-2">
                          <WalletCardsIcon size={20}></WalletCardsIcon>
                          <h1 className=" font-bold">
                            {selectedDeposit?.method}
                          </h1>
                        </div>{" "}
                        <div>
                          <p>
                            Bank Name -{" "}
                            <span className=" font-bold">
                              {selectedDeposit?.userData?.bankDetails?.bankName}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p>
                            Holder Name -{" "}
                            <span className=" font-bold">
                              {
                                selectedDeposit?.userData?.bankDetails
                                  ?.holderName
                              }
                            </span>{" "}
                          </p>
                        </div>
                        <div>
                          <p>
                            Account Number -{" "}
                            <span className=" font-bold">
                              {
                                selectedDeposit?.userData?.bankDetails
                                  ?.accountNumber
                              }
                            </span>
                          </p>
                        </div>
                        <div>
                          <p>
                            IFSC Code -{" "}
                            <span className=" font-bold">
                              {selectedDeposit?.userData?.bankDetails?.ifscCode}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p>
                            Swift Code -{" "}
                            <span className=" font-bold">
                              {
                                selectedDeposit?.userData?.bankDetails
                                  ?.swiftCode
                              }
                            </span>
                          </p>
                        </div>
                        <div>
                          <p>
                            UPI ID -{" "}
                            <span className=" font-bold">
                              {selectedDeposit?.userData?.bankDetails?.upiId}
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : selectedDeposit?.method === "USDT(Trc20)" ? (
                      <div>
                        <div className=" flex gap-1">
                          <WalletCardsIcon size={20}></WalletCardsIcon>
                          <p>
                            USDT-Trc20 -
                            <span className=" font-bold">
                              {
                                selectedDeposit?.userData?.walletDetails
                                  ?.tetherAddress
                              }
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : selectedDeposit?.method === "USDT(Bep20)" ? (
                      <div className=" flex items-center gap-1">
                        <WalletCardsIcon size={20}></WalletCardsIcon>

                        <p>
                          USDT-Bep20 -{" "}
                          <span className=" font-bold">
                            {
                              selectedDeposit?.userData?.walletDetails
                                ?.ethAddress
                            }
                          </span>{" "}
                        </p>
                      </div>
                    ) : selectedDeposit?.method === "BinanceID" ? (
                      <div className=" flex items-center gap-1">
                        <WalletCardsIcon size={20}></WalletCardsIcon>{" "}
                        <p>
                          Binance ID -{" "}
                          <span className=" font-bold">
                            {
                              selectedDeposit?.userData?.walletDetails
                                ?.accountNumber
                            }
                          </span>
                        </p>
                      </div>
                    ) : selectedDeposit?.method === "BTCAddress" ? (
                      <div className=" flex items-center gap-1">
                        <WalletCardsIcon size={20}></WalletCardsIcon>{" "}
                        <p>
                          BTC Address -{" "}
                          <span className=" font-bold">
                            {
                              selectedDeposit?.userData?.walletDetails
                                ?.trxAddress
                            }
                          </span>
                        </p>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              )}
              <p className="mt-2">
                Are you sure you want to{" "}
                {actionType === "approve" ? "approve" : "reject"} this Withdraw?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleConfirmAction(selectedDeposit)}
              disabled={isActionLoading}
            >
              {isActionLoading
                ? "Processing..."
                : `Confirm ${
                    actionType === "approve" ? "Approval" : "Rejection"
                  }`}{" "}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WithdrawalStatus;
