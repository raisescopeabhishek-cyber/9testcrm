import { useEffect, useRef, useState } from "react";
import { backendApi } from "../../../utils/apiClients";
import {
  AlertCircle,
  Clock,
  Send,
  Share2,
  User,
  X,
  MessageSquare,
} from "lucide-react";
import dayjs from "dayjs";

import { io } from "socket.io-client";
const socket = io(import.meta.env.VITE_API_BASE_URL); // Backend URL

export default function TicketChat({
  ticket,
  setActiveTicket,
  setTickets,
  onClose,
  onSendMessage,
}) {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState(ticket.chats || []);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [shouldScrollSmooth, setShouldScrollSmooth] = useState(false); // 👈 new state
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!ticket?._id) return;

    // Join this ticket room
    socket.emit("joinTicket", ticket._id);

    // Listen for new messages
    socket.on("newMessage", (msg, status) => {
      if (msg.ticket === ticket._id) {
        // ✅ Update chat history
        setChats((prev) => [...prev, msg]);
        setShouldScrollSmooth(true); // 👈 enable smooth scroll for socket messages

        // ✅ Update the currently active ticket
        setActiveTicket((prev) => ({
          ...prev,
          status: status,
        }));

        // ✅ Update the ticket inside tickets[] array
        setTickets((prevTickets) =>
          prevTickets.map((t) =>
            t._id === msg.ticket ? { ...t, status: status } : t
          )
        );
      }
    });

    return () => {
      socket.off("newMessage");
    };
  }, [ticket?._id]);

  // Load chats when ticket changes
  useEffect(() => {
    if (ticket && ticket._id) {
      loadChats();
    } else {
      setChats(ticket.chats || []);
    }
  }, [ticket]);

  // Modified scroll effect
  useEffect(() => {
    if (chatEndRef.current) {
      if (shouldScrollSmooth) {
        // Smooth scroll for new messages
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        setShouldScrollSmooth(false);
      } else {
        // Instant scroll for initial load
        chatEndRef.current.scrollIntoView({ behavior: "instant" });
      }
    }
  }, [chats, shouldScrollSmooth]);

  const loadChats = async () => {
    setLoadingChats(true);
    try {
      const res = await backendApi.get(`/ticket/user/chat/${ticket._id}`);
      console.log(res);

      if (res.data?.success) {
        console.log(res);
        setChats(res.data.data.chats || []);
        // Don't trigger smooth scroll for initial load
      }
    } catch (error) {
      console.error("Error loading chats:", error);
      setChats(ticket.chats || []);
    } finally {
      setLoadingChats(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);

    console.log("hcalalfssd");

    try {
      const res = await backendApi.post("/ticket/user/chat/postMessage", {
        ticketId: ticket._id,
        message: message.trim(),
        senderType: "User",
        sender: ticket.user,
      });
      console.log(res);

      if (res.data?.message === "Message sent successfully") {
        setMessage("");
        setShouldScrollSmooth(true); // 👈 enable smooth scroll for sent messages
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Fallback for UX: push temporary message
      const newChat = {
        _id: Date.now().toString(),
        senderType: "User",
        senderName: "You",
        message: message.trim(),
        createdAt: new Date().toISOString(),
        temp: true,
      };
      setChats((prev) => [...prev, newChat]);
      setShouldScrollSmooth(true); // 👈 enable smooth scroll for temp messages
      onSendMessage?.(ticket._id, message.trim());
      setMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: "text-green-400",
      Medium: "text-yellow-400",
      High: "text-orange-400",
      Critical: "text-red-400",
    };
    return colors[priority] || "text-gray-400";
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "bg-blue-500",
      "in-progress": "bg-yellow-500",
      resolved: "bg-green-500",
      closed: "bg-gray-500",
    };
    return colors[status] || "bg-blue-500";
  };

  const addSystemMessage = (text) => {
    const newSystemChat = {
      _id: Date.now().toString(),
      senderType: "System",
      message: text,
      createdAt: new Date().toISOString(),
    };
    setChats((prev) => [...prev, newSystemChat]);
    setShouldScrollSmooth(true); // 👈 enable smooth scroll for system messages
  };

  const handleUserFeedback = async (feedback) => {
    try {
      await backendApi.post("/ticket/user/feedback", {
        ticketId: ticket._id,
        feedback, // "resolved" | "not-resolved"
      });
      // Update UI immediately
      addSystemMessage(
        feedback === "resolved"
          ? "🙏 Thank you for your feedback. Glad we could help!"
          : "⚠️ We're sorry. Your issue is still open. Our support team will follow up."
      );
    } catch (err) {
      console.error("Feedback failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-indigo-900 via-violet-900 to-indigo-950 backdrop-blur-lg rounded-xl w-full max-w-2xl h-4/5 relative flex flex-col shadow-2xl border border-white/20">
        {console.log(chats)}
        {/* Header */}
        <div className="p-6 border-b border-white/30 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 pr-8">
              {ticket.subject}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              {ticket.priority && (
                <span
                  className={`flex items-center gap-1 font-semibold ${getPriorityColor(
                    ticket.priority
                  )}`}
                >
                  <AlertCircle size={16} />
                  {ticket.priority}
                </span>
              )}

              {ticket.status && (
                <span
                  className={`px-3 py-1 text-xs text-white rounded-full ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {ticket.status.charAt(0).toUpperCase() +
                    ticket.status.slice(1)}
                </span>
              )}

              <span className="flex items-center gap-1 text-gray-300 font-medium">
                <User size={16} />
                {ticket.user?.name || ticket.user?.email || "Customer"}
              </span>

              {ticket.createdAt && (
                <span className="flex items-center gap-1 text-gray-300 font-medium">
                  <Clock size={16} />
                  {dayjs(ticket.createdAt).format("DD/MM/YYYY HH:mm")}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-black/10">
          {loadingChats ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white text-lg font-semibold">
                Loading messages...
              </div>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400 text-center">
                <MessageSquare size={48} className="mx-auto mb-4" />
                <p className="text-lg font-semibold">No messages yet.</p>
                <p className="text-sm">
                  Start the conversation by sending a message!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {chats?.map((chat, i) => {
                if (chat.senderType === "System") {
                  // 🔹 Render system notifications
                  return (
                    <div key={chat._id || i} className="flex justify-center">
                      <div className="text-xs text-gray-300 bg-gray-800/70 px-4 py-2 rounded-full shadow-md">
                        {chat.message}
                      </div>
                    </div>
                  );
                }

                // 🔹 Render normal messages
                return (
                  <div
                    key={chat._id || i}
                    className={`p-4 rounded-lg max-w-[75%] shadow-md ${
                      chat.senderType === "User"
                        ? "bg-blue-600 text-white ml-auto rounded-br-none"
                        : "bg-gray-700 text-gray-200 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm font-semibold opacity-80 mb-1">
                      {chat.senderName ||
                        (chat.senderType === "User" ? "You" : "Support")}
                    </p>
                    <p className="text-base leading-snug">{chat.message}</p>
                    {chat.createdAt && (
                      <p className="text-xs opacity-60 mt-2">
                        {dayjs(chat.createdAt).format("DD/MM/YYYY HH:mm")}
                      </p>
                    )}
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Feedback Section */}
        {ticket.userFeedback === "pending" &&
          (ticket.status === "closed" || ticket.status === "resolved") && (
            <div className="flex justify-center mt-4">
              <div className="bg-gray-800/70 px-6 py-4 rounded-2xl shadow-lg flex flex-col items-center gap-3 border border-gray-700">
                <p className="text-gray-200 text-lg font-bold">
                  Was your issue resolved?
                </p>
                <p className="text-gray-400 text-sm text-center max-w-sm">
                  Help us improve by letting us know if your support ticket was
                  successfully resolved.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleUserFeedback("resolved")}
                    className="px-6 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition transform hover:scale-105"
                  >
                    ✅ Yes, it's resolved!
                  </button>
                  <button
                    onClick={() => handleUserFeedback("not-resolved")}
                    className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition transform hover:scale-105"
                  >
                    ❌ Not resolved
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Show messages after feedback */}
        {ticket.userFeedback === "resolved" && (
          <div className="flex justify-center mb-6 mt-4">
            <div className="bg-green-700/80 px-8 py-5 rounded-2xl shadow-lg text-center border border-green-600 animate-fade-in-up">
              <p className="text-white text-xl font-bold mb-2">🎉 Thank you!</p>
              <p className="text-green-100 text-base leading-snug">
                We're glad your issue was resolved. Have a great day! 💚
              </p>
            </div>
          </div>
        )}

        {ticket.userFeedback === "not-resolved" && (
          <div className="flex justify-center mb-6 mt-4">
            <div className="bg-red-700/80 px-8 py-5 rounded-2xl shadow-lg text-center border border-red-600 animate-fade-in-up">
              <p className="text-white text-xl font-bold mb-2">😔 Sorry!</p>
              <p className="text-red-100 text-base leading-snug">
                We're sorry your issue is still unresolved. Our support team
                will reach out again soon.
              </p>
            </div>
          </div>
        )}

        {/* "open", "in-progress", "closed", "resolved" */}

        {/* Input */}
        {ticket.status === "open" && ticket.userFeedback === "pending" ? (
          // 😀 Open: User can type message
          <div className="p-6 border-t border-white/20">
            <div className="flex items-center gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-50 transition-all duration-200"
                placeholder="Type your message..."
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-semibold text-sm"
              >
                <Send size={18} className="text-white" />
                {isLoading ? (
                  <span className="text-xs text-white">Sending...</span>
                ) : (
                  <span className="hidden sm:inline text-white">Send</span>
                )}
              </button>
            </div>
          </div>
        ) : ticket.status === "in-progress" &&
          ticket.userFeedback === "pending" ? (
          // 🤔 In Progress
          <div className="border-t border-white/20">
            <div className="bg-blue-600 w-full px-4 py-3 flex items-center justify-center gap-2 text-white font-semibold text-sm sm:text-lg">
              🤔 <span>We're working on it... Please wait patiently</span>
            </div>
          </div>
        ) : ticket.status === "closed" && ticket.userFeedback === "pending" ? (
          // 😔 Closed
          <div className="border-t border-white/20">
            <div className="bg-red-600 w-full px-4 py-3 flex items-center justify-center gap-2 text-white font-semibold text-sm sm:text-lg">
              😔 <span>This ticket is closed</span>
            </div>
          </div>
        ) : ticket.status === "resolved" &&
          ticket.userFeedback === "pending" ? (
          // 😍 Resolved
          <div className="border-t border-white/20">
            <div className="bg-green-600 w-full px-4 py-3 flex items-center justify-center gap-2 text-white font-semibold text-sm sm:text-lg">
              😍 <span>Great! Issue resolved successfully</span>
            </div>
          </div>
        ) : ticket.status === "Not Resolved" &&
          ticket.userFeedback === "pending" ? (
          // 😡 Not Resolved
          <div className="border-t border-white/20">
            <div className="bg-red-700 w-full px-4 py-3 flex items-center justify-center gap-2 text-white font-semibold text-sm sm:text-lg">
              😡 <span>Marked as not resolved</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
