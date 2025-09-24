import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Ban } from "lucide-react";
import { PiWarning } from "react-icons/pi";
import { RiErrorWarningFill } from "react-icons/ri";
import { ArrowLeft } from "lucide-react"; // Import ArrowLeft for back button
import { backendApi } from "../../../utils/apiClients";
import ModernHeading from "../../lib/ModernHeading";

const UserReferalWithdrwalHistory = () => {
  const [challengesData, setChallengesData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState(null);
  const loggedUser = useSelector((store) => store.user.loggedUser);

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

  const fetchChallengesData = async () => {
    setLoader(true);
    setError(null);
    try {
      const res = await backendApi.get(`/ib-withdrawals/${loggedUser._id}`);
      setChallengesData(res.data.data.reverse() || []);
    } catch (error) {
      console.error("Error in fetch user challenges", error);
      setError("Failed to fetch withdrawal history. Please try again later.");
      toast.error("Data fetching failed!!");
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchChallengesData();
  }, []);

  return (
    <div className="  bg-gradient-to-br from-indigo-900 via-indigo-900 to-indigo-950 min-h-screen mx-auto p-10 shadow-lg overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
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

          {/* Heading */}
          <div className="text-3xl font-bold">
            <ModernHeading text={"IB Withdrawal History"}></ModernHeading>
          </div>
        </div>
      </div>

      <table className="w-full whitespace-nowrap border-collapse min-w-[640px]">
        <thead>
          <tr className="bg-secondary-500-60 rounded text-white">
            <th className="p-2 sm:p-3 text-left font-semibold rounded-tl-lg">
              Total Amount
            </th>
            <th className="p-2 sm:p-3 text-center font-semibold">
              Withdrawal Amount
            </th>
            <th className="p-2 sm:p-3 text-center font-semibold">Method</th>
            <th className="p-2 sm:p-3 text-center font-semibold">Updated At</th>
            <th className="p-2 sm:p-3 text-center font-semibold rounded-tr-lg">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {loader ? (
            <tr>
              <td colSpan="5" className="p-4">
                <div className="flex justify-center items-center w-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-500"></div>
                </div>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="5" className="p-4 text-center text-red-500">
                {error}
              </td>
            </tr>
          ) : challengesData.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                className="p-4 text-center items-center text-gray-500"
              >
                <div className="flex gap-2 mx-auto justify-center">
                  <RiErrorWarningFill size={24}></RiErrorWarningFill>
                  <p>No withdrawal history available.</p>
                </div>
              </td>
            </tr>
          ) : (
            challengesData.map((value, index) => (
              <tr
                key={index}
                className="border-b border-secondary-700/50 hover:bg-secondary-700/30 transition-colors"
              >
                <td className="p-2 pl-4 sm:p-3 text-sm sm:text-base">
                  ${value?.totalBalance}
                </td>
                <td className="p-2 sm:p-3 text-sm sm:text-base text-center">
                  ${value?.amount}
                </td>
                <td className="p-2 text-center sm:p-3 text-sm sm:text-base">
                  {value?.method}
                </td>
                <td className="py-3 text-center px-4">
                  <div>{formatDate(value?.updatedAt)}</div>
                  <div className="text-sm text-gray-400">
                    {calculateTimeSinceJoined(value?.updatedAt)}
                  </div>
                </td>
                <td className="text-center py-2 px-2">
                  <div
                    className={`inline-block px-3 py-1 font-semibold rounded-full ${
                      value?.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : value?.status === "approved"
                        ? "bg-green-500/10 text-green-500"
                        : value?.status === "rejected"
                        ? "bg-red-500/10 text-red-500"
                        : ""
                    }`}
                  >
                    <p className="first-letter:capitalize">{value?.status}</p>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserReferalWithdrwalHistory;
