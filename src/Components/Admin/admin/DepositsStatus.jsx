import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  CircleCheckBig,
  CircleX,
  Image,
  Loader,
  Search,
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

const DepositsStatus = () => {
  const { status } = useParams();
  const [depositData, setDepositData] = useState([]);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [loading, setLoading] = useState(false);
  const isAll = status === "all" ? true : false;
  const [showPreview, setShowPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [allDepositData, setAllDepositData] = useState([]);
  const [allLoading, setAllLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [pagination, setPagination] = useState({});
  const [isActionLoading, setIsActionLoading] = useState(false);

  const togglePreview = (item) => {
    setShowPreview(!showPreview);
    setSelectedDeposit(item);
  };
  // fetch data------------------
  const fetchApiData = async () => {
    try {
      let finalRes;

      if (status === "all") {
        const res = await backendApi.get(
          `/deposits?page=${currentPage}&limit=10&search=${debouncedSearch}&status=`
        );
        finalRes = res.data;
      } else if (status === "pending") {
        const res = await backendApi.get(
          `/deposits?page=${currentPage}&limit=10&search=${debouncedSearch}&status=pending`
        );
        finalRes = res.data;
      } else if (status === "approved") {
        const res = await backendApi.get(
          `/deposits?page=${currentPage}&limit=10&search=${searchQuery}&status=approved`
        );
        finalRes = res.data;
      } else if (status === "rejected") {
        const res = await backendApi.get(
          `/deposits?page=${currentPage}&limit=10&search=${searchQuery}&status=rejected`
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
      const allRes = await backendApi.get(`/deposits`);
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

  // console.log("selected deposit!!!!", selectedDeposit);

  // on confirm api handler  ------------------------------
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
          <h1>Deposit Approved</h1>
        </div>
        <div class="content">
          <p>Dear ${
            selectedDeposit?.userId?.firstName +
            " " +
            selectedDeposit?.userId?.lastName
          },</p>
  <p>We are pleased to inform you that your deposit has been successfully credited to your MT5 account</p>
         <div class="withdrawal-details">

          <p>Account No: <span class="highlight">${
            selectedDeposit?.mt5Account
          }</span></p>
            <p>Account Type: <span class="highlight">${
              selectedDeposit?.accountType
            }</span></p>
            <p>Deposit Balance: <span class="highlight">$${
              selectedDeposit?.deposit
            }</span></p>
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

  const handleConfirmAction = async (selectedDeposit) => {
    if (isActionLoading) return;

    const toastId = toast.loading("Please wait..");
    setIsActionLoading(true); // NEW: Set action loading to true

    try {
      if (actionType === "approve") {
        const depositApires = await metaApi.get(
          `/MakeDepositBalance?Manager_Index=${
            import.meta.env.VITE_MANAGER_INDEX
          }&MT5Account=${selectedDeposit.mt5Account}&Amount=${
            selectedDeposit.deposit
          }&Comment=deposit`
        );
        setIsDialogOpen(false);

        if (depositApires.data.Equity) {
          const updateDbDepositRes = await backendApi.put(`/update-deposit`, {
            _id: selectedDeposit._id,
            status: "approved",
          });
          try {
            const customMailRes = await backendApi.post(`/custom-mail`, {
              email: selectedDeposit.userId.email,
              content: customContent,
              subject: "Deposit Added",
            });
          } catch (error) {
            console.error("error while mailing", error);
          }
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
          toast.success("Deposit Added", { id: toastId });
        } else {
          toast.error("Failed, Please retry!!", { id: toastId });
          setIsDialogOpen(false);
        }
      } else if (actionType === "reject") {
        const res = await backendApi.put(`/update-deposit`, {
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
        setSelectedDeposit("");
        toast.success("Deposit Rejected", { id: toastId });
      }
    } catch (error) {
      console.error("Error updating deposit status:", error);
      toast.error("Something went wrong", { id: toastId });
    } finally {
      setIsActionLoading(false); // NEW: Reset action loading to false
    }
  };
  // total deposits ----------

  const TotalDeposits = allDepositData
    .reduce((total, item) => total + Number(item.deposit), 0)
    .toFixed(2);

  // Total pending deposits
  const TotalPendingDeposits = allDepositData
    .filter((item) => item.status === "pending")
    .reduce((total, item) => total + Number(item.deposit), 0)
    .toFixed(2);

  // Total successful deposits
  const TotalSuccessfullDeposits = allDepositData
    .filter((item) => item.status === "approved")
    .reduce((total, item) => total + Number(item.deposit), 0)
    .toFixed(2);

  // Total rejected deposits
  const TotalRejectedDeposits = allDepositData
    .filter((item) => item.status === "rejected")
    .reduce((total, item) => total + Number(item.deposit), 0)
    .toFixed(2);

  // console.log("Total rejected", TotalRejectedDeposits);

  // stats data------------

  const stats = [
    {
      icon: <ArrowLeftRight size={24} />,
      amount: TotalDeposits,
      label: "Total Deposits",
      bgColor: "bg-sky-800",
      link: "/admin/deposit/all",
    },
    {
      icon: <ArrowLeftRight size={24} />,
      amount: TotalSuccessfullDeposits,
      label: "Successfull Deposits",
      bgColor: "bg-green-800",
      link: "/admin/deposit/approved",
    },
    {
      icon: <ArrowLeftRight size={24} />,
      amount: TotalPendingDeposits,
      label: "Pending Deposits",
      bgColor: "bg-yellow-800",
      link: "/admin/deposit/pending",
    },
    {
      icon: <ArrowLeftRight size={24} />,
      amount: TotalRejectedDeposits,
      label: "Rejected Deposits",
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
    }, 500); // 500ms debounce time

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
    <div className="mx-auto mt-5 px-5">
      <div className=" w-full flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl flex-col font-bold mb-4 text-white first-letter:uppercase">
          {status} Deposits
        </h1>
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Name / Email / Ac No"
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

      <div className="overflow-x-auto relative">
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
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          <table className="min-w-full bg-primary-700">
            {/* Made header sticky */}
            <thead className="bg-primary-400 text-white sticky top-0 z-10">
              <tr>
                <th className="py-2 px-4 text-left">User | Email</th>

                <th className="py-2 px-4 text-left">MT5 AC</th>
                <th className="py-2 px-4 text-left">AC Type</th>
                <th className="py-2 px-4 text-left">Deposit</th>
                {status === "rejected" || status === "approved" ? (
                  <th className="py-2 px-4 text-left">Updated At</th>
                ) : (
                  <th className="py-2 px-4 text-left">Requested At</th>
                )}
                <th className="py-2 px-4 text-left">Proof</th>
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
                        {item?.userId?.firstName
                          ? item?.userId?.firstName
                          : "Not found!!"}
                      </div>
                      <div className="text-white/70 text-sm">
                        {item?.userId?.email
                          ? item?.userId?.email
                          : "Not found!!"}
                      </div>
                    </td>
                    <td className="py-2 px-4">{item?.mt5Account || "N/A"}</td>

                    <td className="py-2 px-4">
                      <span className="bg-primary-400/20 whitespace-nowrap text-white px-2 py-1 rounded-full text-sm">
                        {item?.accountType}
                      </span>
                    </td>
                    <td className="py-2 px-4">${item?.deposit}</td>
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
                      <button
                        className="flex items-center justify-center gap-1 text-blue-400 hover:text-blue-500 transition-all"
                        onClick={() => togglePreview(item)}
                      >
                        <Image></Image> view
                      </button>
                    </td>
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
      </div>

      <div className="mt-6 flex flex-col items-center space-y-3">
        {/* Pagination Info */}
        <p className="text-gray-300 text-sm">
          <span className="font-semibold text-white">
            {" "}
            {pagination?.totalDeposits}
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
            Page <span className="font-semibold text-white">{currentPage}</span>{" "}
            of
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

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve" ? "Approve Deposit" : "Reject Deposit"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedDeposit && (
                <div className="space-y-4 text-gray-300">
                  <div className="p-4 bg-gradient-to-r from-primary-800 to-primary-900 rounded-lg shadow-lg">
                    <p className="text-lg font-bold text-white">
                      User Information
                    </p>
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedDeposit.userId?.firstName +
                        " " +
                        selectedDeposit.userId?.lastName}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedDeposit.userId?.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedDeposit.userId?.phone}
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-primary-800 to-primary-900 rounded-lg shadow-lg">
                    <p className="text-lg font-bold text-white">
                      Deposit Details
                    </p>
                    <p>
                      <span className="font-medium">Deposit Amount:</span>{" "}
                      <span className="text-green-500 font-semibold">
                        ${selectedDeposit.deposit}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">AC Number:</span>{" "}
                      <span className="text-gray-200 font-semibold">
                        {selectedDeposit?.mt5Account}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">AC Type:</span>{" "}
                      <span className="text-gray-200 font-semibold">
                        {selectedDeposit.accountType}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Transaction ID:</span>{" "}
                      <span className="text-gray-200 font-semibold">
                        {selectedDeposit?.transactionId}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {CFformatDate(selectedDeposit.updatedAt)}
                    </p>
                  </div>

                  <p className="mt-4 text-sm">
                    Are you sure you want to{" "}
                    <span
                      className={`font-semibold ${
                        actionType === "approve"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {actionType === "approve" ? "approve" : "reject"}
                    </span>{" "}
                    this deposit?
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isActionLoading} // NEW: Disable confirm button while loading
              onClick={() => handleConfirmAction(selectedDeposit)}
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
      {/* for image ----- */}
      <AlertDialog open={showPreview} onOpenChange={setShowPreview}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Proof Of Deposit</AlertDialogTitle>
            <AlertDialogDescription>
              <img
                src={
                  import.meta.env.VITE_BACKEND_BASE_URL +
                  "/" +
                  selectedDeposit?.depositSS
                }
                alt="Preview"
                className=" my-6 w-full rounded-md h-auto"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowPreview(false)}>
              Close
            </AlertDialogCancel>
            <AlertDialogAction>
              <a
                target="_blank"
                href={
                  import.meta.env.VITE_BACKEND_BASE_URL +
                  "/" +
                  selectedDeposit?.depositSS
                }
              >
                {" "}
                View Full Image
              </a>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DepositsStatus;
