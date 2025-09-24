import { useEffect, useState } from "react";

import toast from "react-hot-toast";
import { backendApi } from "../../../utils/apiClients";
import { Search } from "lucide-react";
const LoginLogs = () => {
  const [challengesData, setChallengesData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchChallengesData = async () => {
    setLoader(true);
    try {
      const res = await backendApi.get(`/logs`);
      console.log(res.data.data);
      setChallengesData(res.data.data.reverse());
      setLoader(false);
    } catch (error) {
      console.log("error in fetch user challenges", error);
      toast.error("Data fetching failed!");
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchChallengesData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredData = challengesData?.filter((item) => {
    if (!searchQuery.trim()) return true;

    const searchLower = searchQuery.toLowerCase().trim();
    const searchableFields = [
      item?.userId?.firstName,
      item?.userId?.email,
      item?.ip,
      item?.browser,
      item?.os,
      item?.userId?.phone,
      item?.country,
    ];

    return searchableFields.some((field) =>
      field?.toLowerCase()?.includes(searchLower)
    );
  });

  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData?.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // format date ---------------------

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
      hour12: true, // 12-hour format with AM/PM
    });

    return `${formattedDate}, ${formattedTime}`;
  }
  // since joined ---------------

  function calculateTimeSinceJoined(isoDateString) {
    const joinDate = new Date(isoDateString);
    const today = new Date();

    // Calculate the difference in time (in milliseconds)
    const timeDifference = today - joinDate;

    // Calculate different time units
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    );

    // Build the time string
    let timeString = [];

    if (days > 0) {
      timeString.push(`${days} day${days !== 1 ? "s" : ""}`);
    }
    if (hours > 0) {
      timeString.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
    }
    if (minutes > 0) {
      timeString.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
    }

    // Handle case when less than a minute
    if (timeString.length === 0) {
      return "less than a minute ago";
    }

    return timeString.join(", ") + " ago";
  }

  console.log("painted data --", paginatedData);

  return (
    <div className="m-5 p-5 sm:px-6 bg-primary-700 text-white rounded-xl shadow-2xl">
      <div className="py-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl md:text-3xl font-bold">Login Logs</h2>
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by any field"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-primary-600 border border-primary-500 rounded-lg focus:outline-none focus:border-primary-400 text-white placeholder-gray-300"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300"
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

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-primary-600 rounded text-white">
                <th className="p-3 text-left font-semibold rounded-tl-lg">
                  Name/Email
                </th>
                <th className="p-3 text-center font-semibold">Phone</th>
                <th className="p-3 text-center font-semibold">IP</th>
                <th className="p-3 text-center font-semibold">Browser</th>
                <th className="p-3 text-center font-semibold">OS</th>
                <th className="p-3 text-center font-semibold">Country</th>
                <th className="p-3 text-center font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loader ? (
                <tr>
                  <td colSpan="9" className="p-4">
                    <div className="flex justify-center items-center w-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-300"></div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData?.map((value, index) => (
                  <tr
                    key={index}
                    className="border-b border-primary-500/50 hover:bg-primary-600/50 transition-colors"
                  >
                    <td className="p-3 text-sm">
                      <div>
                        <p>{value?.userId?.firstName}</p>
                        <p className="text-gray-300/80">
                          {value?.userId?.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{value?.userId?.phone}</td>
                    <td className="p-3 text-sm">{value?.ip}</td>
                    <td className="p-3 text-sm text-center">
                      {value?.browser}
                    </td>
                    <td className="p-3 text-sm text-center">{value?.os}</td>
                    <td className="p-3 text-sm text-center">
                      {value?.country}
                    </td>

                    <td className="py-3 text-center whitespace-nowrap px-4">
                      <div>{formatDate(value?.updatedAt)}</div>
                      <div className="text-sm text-gray-400">
                        {calculateTimeSinceJoined(value?.updatedAt)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loader && filteredData?.length > 0 && (
          <div className="flex flex-wrap justify-between items-center mt-6 pb-4">
            <div className="text-sm text-primary-300 mb-2 sm:mb-0">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
              {filteredData.length} entries
            </div>
            <div className="flex flex-wrap items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {getPageNumbers().map((pageNum, idx) => (
                <button
                  key={idx}
                  onClick={() => pageNum !== "..." && setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    pageNum === currentPage
                      ? "bg-primary-400 text-white"
                      : pageNum === "..."
                      ? "cursor-default"
                      : "bg-primary-600 hover:bg-primary-500"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {!loader && filteredData?.length === 0 && (
          <div className="text-center py-8 text-primary-300">
            No results found for "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginLogs;
