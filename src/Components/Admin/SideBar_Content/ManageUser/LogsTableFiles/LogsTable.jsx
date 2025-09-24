import React, { useEffect, useState } from "react";
import axios from "axios";
import { Mail, Search } from "lucide-react";

const LogsTable = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const API_KEY = import.meta.env.VITE_API_KEY;

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("admin_password_ref");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": API_KEY,
        },
      };
      const res = await axios.get(`${API_URL}/api/auth/logs`, config);
      setLogs(res?.data?.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs based on search query
  const filteredLogs = logs.filter((log) => {
    if (!log?.userId) return false; // Skip logs without userId
    const fields = [
      log?.userId?.firstName,
      log?.userId?.lastName,
      log?.userId?.email,
      log?.userId?.phone,
      log?.ip,
      log?.browser,
      log?.os,
      log?.country,
    ];
    return fields.some((field) =>
      field?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900 rounded-xl p-6 shadow-lg text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <h2 className="text-lg font-semibold">📜 User Login Logs</h2>
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search logs..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-indigo-800/40 border border-indigo-700 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading logs...</p>
      ) : filteredLogs.length === 0 ? (
        <p className="text-gray-400 text-sm">No matching logs found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-indigo-800 text-sm">
            <thead>
              <tr className="bg-indigo-800/50">
                <th className="p-3 text-left border border-indigo-800">Name</th>
                <th className="p-3 text-left border border-indigo-800">Email</th>
                <th className="p-3 text-left border border-indigo-800">Phone</th>
                <th className="p-3 text-left border border-indigo-800">IP</th>
                <th className="p-3 text-left border border-indigo-800">Browser</th>
                <th className="p-3 text-left border border-indigo-800">OS</th>
                <th className="p-3 text-left border border-indigo-800">Country</th>
                <th className="p-3 text-left border border-indigo-800">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log._id}
                  className="hover:bg-indigo-800/30 transition duration-200"
                >
                  <td className="p-3 border border-indigo-800">
                    {log?.userId?.firstName} {log?.userId?.lastName}
                  </td>
                  <td className="p-3 border border-indigo-800 flex items-center gap-2">
                    <Mail size={16} /> {log?.userId?.email}
                  </td>
                  <td className="p-3 border border-indigo-800">
                    {log?.userId?.phone}
                  </td>
                  <td className="p-3 border border-indigo-800">{log?.ip}</td>
                  <td className="p-3 border border-indigo-800">{log?.browser}</td>
                  <td className="p-3 border border-indigo-800">{log?.os}</td>
                  <td className="p-3 border border-indigo-800">{log?.country}</td>
                  <td className="p-3 border border-indigo-800">
                    {new Date(log?.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LogsTable;
