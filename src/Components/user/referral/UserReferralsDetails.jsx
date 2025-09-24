// Enhanced version of UserReferralsDetails.jsx with comprehensive stats
import { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Info,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Users,
  TrendingUp,
  DollarSign,
  BarChart3,
  Globe,
  Star,
  Activity,
  UserCheck,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DynamicLoder from "../../Loader/DynamicLoder";
import { useGetInfoByAccounts } from "../../../hooks/user/UseGetInfoByAccounts";
import ModernHeading from "../../lib/ModernHeading";
import { backendApi } from "../../../utils/apiClients";

const ITEMS_PER_PAGE = 10;

const UserReferralsDetails = () => {
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const [commissionsData, setCommissionsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEmails, setExpandedEmails] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const allAccounts = commissionsData.map((v) => Number(v.accountNumber));
  useGetInfoByAccounts(allAccounts, "ib");
  const { ibAccountsData } = useSelector((store) => store.user);

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    if (!commissionsData.length) return {};

    const totalUsers = commissionsData.length;
    const uniqueEmails = new Set(commissionsData.map((user) => user.email))
      .size;
    const totalCommission = commissionsData.reduce(
      (sum, user) => sum + (user.totalCommission || 0),
      0
    );
    const totalVolume = commissionsData.reduce(
      (sum, user) => sum + (user.totalLot || 0),
      0
    );

    // Active users (those with commission > 0 or volume > 0)
    const activeUsers = commissionsData.filter(
      (user) =>
        (user.totalCommission && user.totalCommission > 0) ||
        (user.totalLot && user.totalLot > 0)
    ).length;

    // Level distribution
    const levelDistribution = commissionsData.reduce((acc, user) => {
      acc[user.level] = (acc[user.level] || 0) + 1;
      return acc;
    }, {});

    // Country distribution
    const countryDistribution = commissionsData.reduce((acc, user) => {
      const country = user.country === "Unknown" ? "Unknown" : user.country;
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    const topCountry = Object.entries(countryDistribution).sort(
      ([, a], [, b]) => b - a
    )[0];

    // Average commission per user
    const avgCommission = totalUsers > 0 ? totalCommission / totalUsers : 0;
    const avgVolume = totalUsers > 0 ? totalVolume / totalUsers : 0;

    // Top performer
    const topPerformer = commissionsData.reduce(
      (top, user) =>
        (user.totalCommission || 0) > (top.totalCommission || 0) ? user : top,
      commissionsData[0] || {}
    );

    // Total user equity from ibAccountsData
    const totalUserEquity = commissionsData.reduce((sum, user) => {
      if (+user.accountNumber <= 0) return sum;
      const accountData = ibAccountsData?.find(
        (item) => item.MT5Account === +user.accountNumber
      );
      return sum + (accountData?.Equity || 0);
    }, 0);

    return {
      totalUsers,
      uniqueEmails,
      totalCommission,
      totalVolume,
      activeUsers,
      levelDistribution,
      countryDistribution,
      topCountry,
      avgCommission,
      avgVolume,
      topPerformer,
      totalUserEquity,
      activeRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
    };
  }, [commissionsData, ibAccountsData]);

  const fetchCommissions = async () => {
    setIsLoading(true);
    try {
      const res = await backendApi.get(
        `/user-zone-ibs/${loggedUser?.referralAccount}`
      );
      setCommissionsData(res.data.data.reverse());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const toggleDropdown = (email) => {
    setExpandedEmails((prev) => ({ ...prev, [email]: !prev[email] }));
  };

  const filteredData = commissionsData.filter(
    (item) =>
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedData = filteredData.reduce((acc, item) => {
    const key = item.email;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const paginatedEmails = Object.keys(groupedData).slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(
    Object.keys(groupedData).length / ITEMS_PER_PAGE
  );

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color = "text-blue-400",
  }) => (
    <div className="bg-secondary-800/20 rounded-lg p-3 border border-secondary-800/50 hover:border-secondary-800/90 transition-all duration-200">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className={color} />
        <p className="text-xs text-gray-400 font-medium">{title}</p>
      </div>
      <p className="text-lg font-semibold text-white mb-0.5">{value}</p>
      {subtitle && <p className="text-xs text-gray-400/80 ">{subtitle}</p>}
    </div>
  );

  return (
    <div className="mx-auto sm:p-6   bg-gradient-to-br from-indigo-900 via-indigo-900 to-indigo-950  p-10 min-h-screen md:shadow-lg overflow-x-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            className="flex items-center mt-2 gap-2 rounded-xl border-b px-5 py-1 hover:px-6 border-secondary-500 text-secondary-500 transition-all"
          >
            <ArrowLeft size={20} /> Back
          </button>
          <div className="text-3xl font-bold">
            <ModernHeading text="IB Users" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1 rounded-md border border-secondary-700/70 bg-secondary-900 text-gray-200 w-full sm:w-auto"
          />
          <button
            onClick={fetchCommissions}
            className="flex items-center gap-2 px-4 py-2 text-gray-200 rounded-lg hover:text-secondary-500/80 transition-all justify-center sm:justify-start"
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Comprehensive Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.totalUsers || 0}
          subtitle={`${stats.uniqueEmails || 0} unique`}
          color="text-blue-400"
        />

        <StatCard
          icon={DollarSign}
          title="Total Commission"
          value={`${(stats.totalCommission || 0).toFixed(4)}`}
          subtitle={`${(stats.avgCommission || 0).toFixed(4)}/user`}
          color="text-green-400"
        />

        <StatCard
          icon={BarChart3}
          title="Total Volume"
          value={`${(stats.totalVolume || 0).toFixed(4)}`}
          subtitle={`${(stats.avgVolume || 0).toFixed(4)}/user`}
          color="text-purple-400"
        />

        {/* <StatCard
          icon={UserCheck}
          title="Active Users"
          value={stats.activeUsers || 0}
          subtitle={`${(stats.activeRate || 0).toFixed(0)}% rate`}
          color="text-emerald-400"
        /> */}

        <StatCard
          icon={Globe}
          title="Top Country"
          value={stats.topCountry?.[0] || "Unknown"}
          subtitle={`${stats.topCountry?.[1] || 0} users`}
          color="text-cyan-400"
        />

        <StatCard
          icon={TrendingUp}
          title="Users Equity"
          value={`${(stats.totalUserEquity || 0).toFixed(2)}`}
          subtitle="Live balance"
          color="text-rose-400"
        />
      </div>

      {/* Level Distribution */}
      {Object.keys(stats.levelDistribution || {}).length > 0 && (
        <div className="bg-secondary-800/20 rounded-lg p-3 border border-secondary-700/30 mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <BarChart3 size={16} />
            Level Distribution
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.levelDistribution).map(([level, count]) => (
              <div
                key={level}
                className="bg-secondary-700/30 rounded px-2 py-1 text-xs"
              >
                <span className="text-white font-medium">L{level}</span>
                <span className="text-gray-400 ml-1">({count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <DynamicLoder />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-secondary-500-20">
                <th className="p-3 text-left">Name/Email</th>
                <th className="p-3 text-center">Country</th>
                <th className="p-3 text-center">AC NO</th>
                <th className="p-3 text-center">Live Equity</th>
                <th className="p-3 text-center">Level</th>
                <th className="p-3 text-center">Total Volume</th>
                <th className="p-3 text-center">Total Earned</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmails.length === 0 && (
                <tr className="text-red-500">
                  <td colSpan="8" className="text-center py-6">
                    <div className="flex items-center justify-center gap-2">
                      <Info /> No data found
                    </div>
                  </td>
                </tr>
              )}
              {paginatedEmails.map((email) => {
                const users = groupedData[email];
                const isExpanded = expandedEmails[email];
                return (
                  <>
                    <tr
                      key={email}
                      className="border-b border-secondary-800 bg-secondary-700/10 hover:bg-secondary-500-10"
                    >
                      <td
                        className="pl-6 py-3 cursor-pointer"
                        onClick={() => toggleDropdown(email)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p>{users[0]?.name}</p>
                            <p className="text-gray-400">{email}</p>
                          </div>
                          {users.length > 1 &&
                            (isExpanded ? <ChevronUp /> : <ChevronDown />)}
                        </div>
                      </td>
                      <td className="text-center">
                        {users[0]?.country || "-"}
                      </td>
                      <td className="text-center">{users[0]?.accountNumber}</td>
                      <td className="text-green-400 text-center">
                        {ibAccountsData ? (
                          +users[0].accountNumber <= 0 ? (
                            "--"
                          ) : (
                            ibAccountsData?.find(
                              (item) =>
                                item.MT5Account === +users[0].accountNumber
                            )?.Equity ?? "--"
                          )
                        ) : (
                          <Loader2 className="animate-spin mx-auto" />
                        )}
                      </td>

                      <td className="text-center">{users[0]?.level}</td>
                      <td className="text-center">
                        {users[0]?.totalLot?.toFixed(4) || "0"}
                      </td>
                      <td className="text-center">
                        {users[0]?.totalCommission?.toFixed(4) || "0"}
                      </td>
                      <td className="text-center">
                        <Link
                          to={`/user/referral-close-trades/${users[0]?.accountNumber}?level=${users[0]?.level}`}
                        >
                          <ArrowRight className="text-blue-500 hover:text-blue-600 hover:scale-105 transition-all" />
                        </Link>
                      </td>
                    </tr>
                    {isExpanded &&
                      users.slice(1).map((user) => (
                        <tr
                          key={user._id}
                          className="border-b border-secondary-800 hover:bg-secondary-500-10"
                        >
                          <td className="pl-12 py-2">
                            <p>{user.name}</p>
                            <p className="text-gray-400">{user.email}</p>
                          </td>
                          <td className="text-center">{user.country || "-"}</td>
                          <td className="text-center">{user.accountNumber}</td>
                          <td className="text-green-400 text-center">
                            {+user.accountNumber <= 0
                              ? "--"
                              : ibAccountsData?.find(
                                  (item) =>
                                    item.MT5Account === +user.accountNumber
                                )?.Equity ?? "--"}
                          </td>
                          <td className="text-center">{user.level}</td>
                          <td className="text-center">
                            {user.totalLot?.toFixed(4) || "0"}
                          </td>
                          <td className="text-center">
                            {user.totalCommission?.toFixed(4) || "0"}
                          </td>
                          <td className="text-center">
                            <Link
                              to={`/user/referral-close-trades/${user.accountNumber}?level=${user.level}`}
                            >
                              <ArrowRight className="text-blue-500 hover:text-blue-600 hover:scale-105 transition-all" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 py-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-1 border border-secondary-700 rounded text-secondary-400 disabled:opacity-30"
          >
            Prev
          </button>
          <span className="text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-1 border border-secondary-700 rounded text-secondary-400 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserReferralsDetails;
