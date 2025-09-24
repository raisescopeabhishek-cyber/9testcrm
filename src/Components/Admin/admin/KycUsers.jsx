import { useEffect, useState } from "react";
import { Ban, CheckCircle, Image, Loader, Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import toast from "react-hot-toast";
import { backendApi } from "../../../utils/apiClients";
import {
  CFcalculateTimeSinceJoined,
  CFformatDate,
} from "../../../utils/CustomFunctions";

const KycUsers = () => {
  const [selectedUser, setSelectedUser] = useState([]);
  const [kycUsers, setKycUsers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [pagination, setPagination] = useState({});
  const [comment, setComment] = useState("");

  // fetch data------------------
  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const res = await backendApi.get(
        `/kyc-users?page=${currentPage}&limit=10&search=${debouncedSearch}`
      );
      setPagination(res.data.pagination);

      setKycUsers(res.data.data);
      setLoading(false);
    } catch (error) {
      toast.error("Something went wrong");
      console.log("Error fetching deposits:", error);
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // on confirm api handler  ------------------------------

  const handleConfirmAction = async (selectedUser, action) => {
    setActionType(action);
    const toastId = toast.loading("Please wait..");
    try {
      const actionMessage =
        action === "approve"
          ? `<p>Your KYC has been successfully verified. Thank you for completing the verification process.</p>`
          : `<p>Unfortunately, your KYC verification was not successful. Please check your details and submit again.</p>`;

      const rejectionReason =
        action === "reject"
          ? `<div class="withdrawal-details">
            <p>Reason: <span class="highlight">${
              comment || "Contact Admin"
            }</span></p>
          </div>`
          : "";

      const customContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>KYC Verification Status - Arena Trade</title>
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${action === "approve" ? "KYC Approved" : "KYC Rejected"}</h1>
        </div>
        <div class="content">
          <p>Dear ${selectedUser?.firstName} ${selectedUser?.lastName},</p>
          ${actionMessage}
          ${rejectionReason}
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
      } </a> | E-mail: <a href="mailto:${
        import.meta.env.VITE_EMAIL_EMAIL || ""
      }">${import.meta.env.VITE_EMAIL_EMAIL || ""}</a></p>
      
                  <p>© 2025 ${
                    import.meta.env.VITE_WEBSITE_NAME || ""
                  }. All Rights Reserved</p>
                </div>
        </div>
      </div>
    </body>
    </html>`;
      if (action === "approve") {
        const updateLoggedUser = await backendApi.put(`/update-user`, {
          id: selectedUser._id,
          kycVerified: true,
        });
        const updateKycStatus = await backendApi.put(
          `/user/${selectedUser?._id}/kyc-status`,
          {
            status: "approved",
          }
        );
        toast.success("KYC Approved", { id: toastId });
        try {
          const customMailRes = await backendApi.post(`/custom-mail`, {
            email: selectedUser?.email,
            content: customContent,
            subject: "KYC Approved",
          });
          setComment("");
        } catch (error) {
          console.log("error sending mail", error);
        }
      } else if (action === "reject") {
        const updateLoggedUser = await backendApi.put(`/update-user`, {
          id: selectedUser._id,
          kycVerified: false,
        });
        const updateKycStatus = await backendApi.put(
          `/user/${selectedUser?._id}/kyc-status`,
          {
            status: "rejected",
          }
        );

        toast.success("KYC Rejected", { id: toastId });
        try {
          const customMailRes = await backendApi.post(`/custom-mail`, {
            email: selectedUser?.email,
            content: customContent,
            subject: "KYC Rejected",
          });
          setComment("");
        } catch (error) {
          console.log("error sending mail", error);
        }
      }
    } catch (error) {
      console.error("Error updating KYC status:", error);
      toast.error(
        `${error?.response?.data?.message || "Something went wrong"}`,
        {
          id: toastId,
        }
      );
    } finally {
      setIsDialogOpen(false);
    }
  };

  // pagination -------------------

  const totalPages = pagination.totalPages;
  const handleNextPage = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  //   toggle handler

  const togglePreview = (item) => {
    setSelectedUser(item);
    setIsDialogOpen(true);
  };

  // page reset ------

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

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
    fetchUsersData();
  }, [currentPage, debouncedSearch]);

  return (
    <div className="mx-auto mt-5 px-5">
      <div className=" w-full flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl flex-col font-bold mb-4 text-white first-letter:uppercase">
          Updated KYC Users
        </h1>
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Name / Email"
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
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          <table className="min-w-full bg-primary-700">
            {/* Made header sticky */}
            <thead className="bg-primary-400 text-white sticky top-0 z-10">
              <tr>
                <th className="py-2 px-4 text-left">User | Email</th>
                <th className="py-2 px-4 text-left">Total AC:</th>
                <th className="py-2 px-4 text-left">Email Verified</th>
                <th className="py-2 px-4 text-left">Country</th>
                <th className="py-2 px-4 text-left">Updated At</th>
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
                kycUsers?.map((item) => (
                  <tr key={item._id} className="border-b border-gray-400/30">
                    <td className="py-2 px-4">
                      <div className="font-semibold">
                        {item?.firstName ? item?.firstName : "Not found!!"}
                      </div>
                      <div className="text-white/70 text-sm">
                        {item?.email ? item?.email : "Not found!!"}
                      </div>
                    </td>

                    <td className="py-2 px-4">
                      <span className="bg-primary-400/20 whitespace-nowrap text-white px-2 py-1 rounded-full text-sm">
                        {item?.accounts?.length}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      {item?.emailVerified ? (
                        <CheckCircle className=" text-green-500"></CheckCircle>
                      ) : (
                        <Ban className=" text-red-500"></Ban>
                      )}
                    </td>
                    <td className="py-2 px-4">{item?.country || "N/A"}</td>
                    <td className="py-3 whitespace-nowrap px-4">
                      <div>{CFformatDate(item?.updatedAt)}</div>
                      <div className="text-sm text-gray-400">
                        {CFcalculateTimeSinceJoined(item?.updatedAt)}
                      </div>
                    </td>

                    <td className="py-2 px-4">
                      <button
                        className="flex items-center justify-center gap-1 text-blue-400 hover:text-blue-500 transition-all"
                        onClick={() => togglePreview(item)}
                      >
                        <Image></Image> view
                      </button>
                    </td>
                    {/* <td className="py-2 px-4">
                      <div className="flex items-center gap-5">
                        <button
                          className="text-green-400 hover:text-green-600 hover:scale-110 transition-all"
                          onClick={() => handleActionClick(item, "approve")}
                        >
                          <CircleCheckBig />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 hover:scale-110 transition-all"
                          onClick={() => handleActionClick(item, "reject")}
                        >
                          <CircleX />
                        </button>
                      </div>
                    </td> */}
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
            {pagination?.totalUsers}
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
      <AlertDialog
        className=" w-[300px]"
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Account Details</AlertDialogTitle>
            <AlertDialogDescription>
              <div>
                {/* KYC details -- */}
                <div className=" my-4">
                  <h1 className=" text-lg font-bold border-b my-4">
                    KYC Details
                  </h1>
                  <div>
                    <p className="">
                      Purpose -{" "}
                      <span className=" font-semibold">
                        {" "}
                        {selectedUser?.kycDetails?.purpose}{" "}
                      </span>{" "}
                    </p>
                    <p className="">
                      Occupation -{" "}
                      <span className=" font-semibold">
                        {" "}
                        {selectedUser?.kycDetails?.occupation}{" "}
                      </span>{" "}
                    </p>
                    <p className="">
                      Country of issue -{" "}
                      <span className=" font-semibold">
                        {" "}
                        {selectedUser?.kycDetails?.countryOfIssue}{" "}
                      </span>{" "}
                    </p>
                    <p className="">
                      Document Type -{" "}
                      <span className=" font-semibold">
                        {" "}
                        {selectedUser?.kycDetails?.documentType}{" "}
                      </span>{" "}
                    </p>
                    <div className=" border border-1 rounded-md border-gray-500/40 my-4 p-2">
                      <p>Front Side of Docuent </p>
                      <img
                        className=" mx-auto size-[40%]"
                        src={
                          import.meta.env.VITE_BACKEND_BASE_URL +
                          "/" +
                          selectedUser?.kycDetails?.frontSideOfDocument
                        }
                        alt=""
                      />
                      <a
                        target="_blank"
                        className=" flex justify-end px-5 text-blue-500 hover:text-blue-600"
                        href={
                          import.meta.env.VITE_BACKEND_BASE_URL +
                          "/" +
                          selectedUser?.kycDetails?.frontSideOfDocument
                        }
                      >
                        View Full Image
                      </a>
                    </div>
                    <div className=" border border-1 rounded-md border-gray-500/40 my-4 p-2">
                      <p>Back Side of Document </p>
                      <img
                        className=" mx-auto size-[40%]"
                        src={
                          import.meta.env.VITE_BACKEND_BASE_URL +
                          "/" +
                          selectedUser?.kycDetails?.backSideOfDocument
                        }
                        alt=""
                      />
                      <a
                        target="_blank"
                        className=" flex justify-end px-5 text-blue-500 hover:text-blue-600"
                        href={
                          import.meta.env.VITE_BACKEND_BASE_URL +
                          "/" +
                          selectedUser?.kycDetails?.backSideOfDocument
                        }
                      >
                        View Full Image
                      </a>
                    </div>
                    <div className=" border border-1 rounded-md border-gray-500/40 my-4 p-2">
                      <p>Selfie With Document </p>
                      <img
                        className=" mx-auto size-[40%]"
                        src={
                          import.meta.env.VITE_BACKEND_BASE_URL +
                          "/" +
                          selectedUser?.kycDetails?.selfieWithDocument
                        }
                        alt=""
                      />
                      <a
                        target="_blank"
                        className=" flex justify-end px-5 text-blue-500 hover:text-blue-600"
                        href={
                          import.meta.env.VITE_BACKEND_BASE_URL +
                          "/" +
                          selectedUser?.kycDetails?.selfieWithDocument
                        }
                      >
                        View Full Image
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <h1 className=" text-lg font-bold border-b my-4">Action</h1>
            <div className=" flex flex-col gap-4">
              <div>
                <textarea
                  type="text"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className=" text-black border-gray-300 rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div className=" flex gap-4">
                <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
                  Close
                </AlertDialogCancel>
                {/* Approve Button */}
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  onClick={() => handleConfirmAction(selectedUser, "approve")}
                >
                  Approve
                </button>

                {/* Reject Button */}
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  onClick={() => handleConfirmAction(selectedUser, "reject")}
                >
                  Reject
                </button>
              </div>
            </div>

            {/* Comment Input */}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KycUsers;
