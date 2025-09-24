import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  MessageSquare,
  Clock,
  MessageCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import RaiseTicket from "./RaiseTicket";
import TicketChat from "./TicketChat";
import { backendApi } from "../../../utils/apiClients";
import { useSelector } from "react-redux";
import { Switch } from "@headlessui/react";
import { useLocation, useParams } from "react-router-dom";

export default function TicketsDashboard() {
  const [autoReplyStatus, setAutoReplyStatus] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({});
  const [filterStatus, setFilterStatus] = useState("All");
  const AdminId = useSelector((store) => store.admin.adminUser._id);

  const location = useLocation();
  const { id: routeTicketId, chatId: routeChatId } = useParams();

  console.log(routeTicketId, routeChatId);

  // Optional query params
  const queryParams = new URLSearchParams(location.search);
  const highlightedTicketId = queryParams.get("id");
  const queryChatId = queryParams.get("chatId");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await backendApi.get(`/ticket/admin/all-tickets/${AdminId}`);
      const ticketsData = res.data;

      // Map users
      const usersMap = {};
      ticketsData.forEach((ticket) => {
        usersMap[ticket.user._id] = ticket.user;
      });
      setUsers(usersMap);
      setTickets(ticketsData);

      // Auto-reply status
      const initialAutoReply = {};
      ticketsData.forEach((ticket) => {
        initialAutoReply[ticket._id] = !!ticket.autoReply;
      });
      setAutoReplyStatus(initialAutoReply);

      // ✅ Handle route params
      if (routeTicketId) {
        const ticketToOpen = ticketsData.find((t) => t._id === routeTicketId);
        if (ticketToOpen) {
          // Open chat only if route has chatId
          if (routeChatId || queryChatId) {
            setActiveTicket(ticketToOpen);
          }
        }
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [AdminId, routeTicketId, routeChatId, queryChatId]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const handleToggleAutoReply = async (ticketId) => {
    const newStatus = !autoReplyStatus[ticketId];
    setAutoReplyStatus((prev) => ({ ...prev, [ticketId]: newStatus }));

    try {
      await backendApi.post(`/ticket/admin/${ticketId}/auto-reply`, {
        enabled: newStatus,
      });
    } catch (err) {
      console.error("Error updating auto-reply status:", err);
      setAutoReplyStatus((prev) => ({ ...prev, [ticketId]: !newStatus }));
    }
  };

  const handleNewTicket = async () => {
    await fetchTickets();
  };

  const filteredTickets =
    filterStatus === "All"
      ? tickets
      : tickets.filter((t) => t.status === filterStatus);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 p-6 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading tickets...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 p-6 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-lg mb-4">Error loading tickets: {error}</p>
          <button
            onClick={fetchTickets}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );

  const statusColors = {
    open: "bg-red-500/20 text-red-400",
    "in-progress": "bg-yellow-500/20 text-yellow-400",
    closed: "bg-gray-500/20 text-gray-400",
    resolved: "bg-green-500/20 text-green-400",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 p-6 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="w-8 h-8" />
            Customer Support Dashboard
          </h1>

          <div className="flex items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg"
            >
              <option className="text-white bg-blue-900" value="All">
                All
              </option>
              <option className="text-white bg-blue-900" value="open">
                Open
              </option>
              <option className="text-white bg-blue-900" value="in-progress">
                In Progress
              </option>
              <option className="text-white bg-blue-900" value="resolved">
                Resolved
              </option>
              <option className="text-white bg-blue-900" value="closed">
                Closed
              </option>
            </select>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-500 px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition-transform font-medium"
            >
              <PlusCircle className="w-5 h-5" />
              New Ticket
            </button>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/10 text-gray-200">
                <tr>
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Subject</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Auto Reply</th>
                  <th className="p-4 font-semibold">Created</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className={`border-t border-white/10 hover:bg-white/5 transition-colors ${
                      ticket._id === highlightedTicketId ||
                      ticket._id === routeTicketId
                        ? "bg-indigo-700/50"
                        : ""
                    }`}
                  >
                    <td className="p-4 font-mono text-gray-300">#{ticket._id}</td>
                    <td className="p-4">
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{ticket.subject}</p>
                        {ticket.description && (
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {ticket.description.substring(0, 80)}...
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">
                      {ticket.user.firstName} {ticket.user.lastName}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                          statusColors[ticket.status] ||
                          "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Switch
                        checked={!!autoReplyStatus[ticket._id]}
                        onChange={() => handleToggleAutoReply(ticket._id)}
                        className={`${
                          autoReplyStatus[ticket._id]
                            ? "bg-indigo-600"
                            : "bg-gray-500"
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                      >
                        <span
                          className={`${
                            autoReplyStatus[ticket._id]
                              ? "translate-x-6"
                              : "translate-x-1"
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </Switch>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{formatDate(ticket.createdAt)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setActiveTicket(ticket)}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        View Chat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tickets.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No tickets found</p>
              <p className="text-sm">Create your first support ticket to get started</p>
            </div>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl w-full max-w-lg p-6 relative">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
              >
                ✕
              </button>
              <RaiseTicket
                onCancel={() => setShowForm(false)}
                onSubmit={handleNewTicket}
              />
            </div>
          </div>
        )}

        {activeTicket && (
          <TicketChat
            ticket={activeTicket}
            onClose={() => setActiveTicket(null)}
          />
        )}
      </div>
    </div>
  );
}
