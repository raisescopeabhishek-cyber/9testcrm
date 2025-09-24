import { useEffect, useState } from "react";
import { Ban, CheckCircle, Copy, Loader, Search } from "lucide-react";

import toast from "react-hot-toast";
import { backendApi } from "../../../utils/apiClients";
import { Button } from "@headlessui/react";
import { RiUserSharedFill } from "react-icons/ri";
import { setLoggedUser } from "../../../redux/user/userSlice";
import { useDispatch } from "react-redux";
import UseUserHook from "../../../hooks/user/UseUserHook";
import { Link } from "react-router-dom";

const IbUsers = () => {
  const [ibUsers, setIbUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [pagination, setPagination] = useState({});
  const currentUrl = window.location.href;
  const extractedUrl = new URL(currentUrl).origin;

  // fetch data------------------
  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const res = await backendApi.get(
        `/get-users?page=${currentPage}&limit=10&search=${debouncedSearch}&referralUsers=true`
      );
      setPagination(res.data.pagination);
      setIbUsers(res.data.data);
      setLoading(false);
    } catch (error) {
      toast.error("Something went wrong");
      console.log("Error fetching deposits:", error);
      setLoading(false);
    }
  };
  //   copy link handler
  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link);
    toast.success(`Link Copied`);
  };
  // handle search------------------

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  //   pagination -------------------

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
  // for login as user

  const dispatch = useDispatch();
  const { getReset } = UseUserHook();

  // page reset ------

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // use effect for debouncing searching ------
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // use effect for data fetching -------

  useEffect(() => {
    fetchUsersData();
  }, [currentPage, debouncedSearch]);

  return (
    <div className="mx-auto mt-5 px-5">
      <div className=" w-full flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl flex-col font-bold mb-4 text-white first-letter:uppercase">
          IB Users
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
          <table className="min-w-full whitespace-nowrap bg-primary-700">
            {/* Made header sticky */}
            <thead className="bg-primary-400 text-white sticky top-0 z-10">
              <tr>
                <th className="py-2 px-4 text-left">User | Email</th>
                <th className="py-2 px-4 text-center">MT5 Accounts</th>
                <th className="py-2 px-4 text-center">Email</th>
                <th className="py-2 px-4 text-center">KYC</th>
                <th className="py-2 px-4 text-center">IB ID</th>
                <th className="py-2 px-4 text-center">IB Balance</th>
                <th className="py-2 px-4 text-center">Referral Link</th>
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
                ibUsers?.map((item) => (
                  <tr key={item._id} className="border-b border-gray-400/30">
                    <td className="py-2 flex gap-2 px-4">
                      <button
                        onClick={() => {
                          getReset();
                          dispatch(setLoggedUser(item));
                          window.open("/user/dashboard", "_blank");
                        }}
                        className="text-blue-500 hover:shadow-lg hover:text-blue-500/80 hover:scale-110 transition-all"
                      >
                        <RiUserSharedFill size={25} />
                      </button>
                      <div>
                        <div className="font-semibold">
                          {item?.firstName ? item?.firstName : "Not found!!"}
                        </div>
                        <Link to={`/admin/user-detail/${item?._id}`}>
                          <div className="text-white/70 hover:text-blue-400 hover:font-semibold transition-all text-sm">
                            {item?.email ? item?.email : "Not found!!"}
                          </div>
                        </Link>
                      </div>
                    </td>

                    <td className="py-2 text-center px-4">
                      <span className="bg-primary-400/20 whitespace-nowrap text-white px-2 py-1 rounded-full text-sm">
                        {item?.accounts?.length}
                      </span>
                    </td>

                    <td className="py-2  text-center px-4">
                      <div className=" flex flex-col items-center justify-center">
                        {item?.emailVerified ? (
                          <CheckCircle className=" text-green-500"></CheckCircle>
                        ) : (
                          <Ban className=" text-red-500"></Ban>
                        )}
                      </div>
                    </td>
                    <td className="py-2  text-center px-4">
                      <div className=" flex flex-col items-center justify-center">
                        {item?.kycVerified ? (
                          <CheckCircle className=" text-green-500"></CheckCircle>
                        ) : (
                          <Ban className=" text-red-500"></Ban>
                        )}
                      </div>
                    </td>
                    <td className="py-2  text-center px-4">
                      {item?.referralAccount || "N/A"}
                    </td>
                    <td className="py-2 text-green-400 font-semibold  text-center px-4">
                      {Number(item?.ibBalance || 0).toFixed(4)}
                    </td>
                    <td className="py-3 whitespace-nowrap px-4">
                      <div className=" flex gap-2">
                        <input
                          value={`${extractedUrl}/user/signup/${item?.referralAccount}`}
                          className="  bg-primary-800/50 border-none outline-none py-1 px-4 text-gray-300 rounded-lg"
                          type="text"
                        />
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${extractedUrl}/user/signup/${item?.referralAccount}`
                            )
                          }
                        >
                          <Copy
                            size={24}
                            className=" text-blue-500 hover:scale-105 transition-all"
                          ></Copy>
                        </button>
                      </div>
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
    </div>
  );
};

export default IbUsers;
