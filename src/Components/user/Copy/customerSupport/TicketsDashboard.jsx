import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { PlusCircle, MessageSquare, Clock, MessageCircle } from "lucide-react";
import { backendApi } from "../../../utils/apiClients";
import RaiseTicket from "./RaiseTicket";
import { useDispatch, useSelector } from "react-redux";
import TicketChat from "./TicketChat";
import dayjs from "dayjs";

import { io } from "socket.io-client";
import { fetchUserNotifications } from "../../utils/authService";
import { setNotification } from "../../../redux/user/userSlice";
const socket = io(import.meta.env.VITE_API_BASE_URL);

export default function TicketsDashboard() {
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const { ticketId, chatId } = useParams();

  const [showForm, setShowForm] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null); // only for chat modal
  const [highlightTicketId, setHighlightTicketId] = useState(null); // for row highlight
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");

    console.log("sddddddddddd");

  // Join socket room for user
  useEffect(() => {
    console.log(loggedUser);
    
    if (!loggedUser._id) return;


    socket.emit("joinUserTicket", loggedUser._id);

    socket.on("newTicket", (ticket) => {
      setTickets((prev) => {
        const exists = prev.some((t) => t._id === ticket._id);
        if (exists) return prev.map((t) => (t._id === ticket._id ? ticket : t));
        return [ticket, ...prev];
      });
    });

    return () => socket.off("newTicket");
  }, [loggedUser._id]);

  // Fetch tickets from backend
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await backendApi.get(`/ticket/user/${loggedUser._id}`);
        setTickets(res.data);

        // Highlight ticket row if ticketId is in the URL
        if (ticketId) {
          const foundTicket = res.data.find((t) => t._id === ticketId);
          if (foundTicket) setHighlightTicketId(foundTicket._id);

          if (chatId) {
            setActiveTicket(foundTicket);
          }
        }
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [loggedUser._id, ticketId, chatId]);

  const handleNewTicket = async () => {
    try {
      const res = await backendApi.get(`/ticket/user/${loggedUser._id}`);
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  const handleSendMessage = async (ticketId, message) => {
    // implement message sending logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 p-6 text-white">
      <div className="max-w-5xl mx-auto">
        {/* Header & New Ticket Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            My Support Tickets
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-2 rounded-lg shadow-md hover:scale-105 transition-transform"
          >
            <PlusCircle className="w-5 h-5" />
            New Ticket
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search tickets by ID or subject..."
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tickets Table */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <p className="p-4 text-center text-gray-300">Loading tickets...</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-white/10 text-gray-200">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets
                  .filter(
                    (ticket) =>
                      ticket._id
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      ticket.subject
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((ticket) => (
                    <tr
                      key={ticket._id}
                      className={`border-t border-white/10 hover:bg-white/5 ${
                        highlightTicketId === ticket._id
                          ? "bg-indigo-700/30"
                          : ""
                      }`}
                    >
                      <td className="p-3">
                        <span className="font-mono text-gray-300">
                          #{ticket._id.substring(0, 8)}
                        </span>
                      </td>
                      <td className="p-3 font-medium">{ticket.subject}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                            ticket.status === "open"
                              ? "bg-red-500/20 text-red-400"
                              : ticket.status === "in-progress"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {ticket.status.charAt(0).toUpperCase() +
                            ticket.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-3 flex items-center gap-1 text-gray-300">
                        <Clock className="w-4 h-4" />{" "}
                        {dayjs(ticket.createdAt).format("DD/MM/YYYY HH:mm")}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => setActiveTicket(ticket)} // opens chat modal
                          className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Chat
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
          {!loading && tickets.length === 0 && (
            <p className="p-4 text-center text-gray-400">
              No tickets found. Create one!
            </p>
          )}
        </div>

        {/* Ticket Form Modal */}
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

        {/* Chat Modal */}
        {activeTicket && (
          <TicketChat
            ticket={activeTicket}
            setActiveTicket={setActiveTicket}
            setTickets={setTickets}
            onClose={() => setActiveTicket(null)}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
}
