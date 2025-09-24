import { useEffect, useRef, useState } from "react";
import { backendApi } from "../../../utils/apiClients";
import { Send, X, User, AlertCircle } from "lucide-react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL);

export default function TicketChat({ ticket, onClose }) {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState(ticket.chats || []);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [showEndOptions, setShowEndOptions] = useState(false);
  const [shouldScrollSmooth, setShouldScrollSmooth] = useState(false); // 👈 new state
  const chatEndRef = useRef(null);

  // Colors
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

  // Join room + listen for socket messages
  useEffect(() => {
    if (!ticket?._id) return;

    socket.emit("joinTicket", ticket._id);

    socket.on("newMessage", (msg) => {
      if (msg.ticket === ticket._id) {
        setChats((prev) => [...prev, msg]);
        setShouldScrollSmooth(true); // 👈 enable smooth scroll for new messages
      }
    });

    return () => socket.off("newMessage");
  }, [ticket?._id]);

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
      const res = await backendApi.get(`/ticket/admin/getchat/${ticket._id}`);
      if (res.data?.success) {
        setChats(res.data.data.chats || []);
        // Don't trigger smooth scroll for initial load
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    if (ticket?._id) loadChats();
  }, [ticket]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);

    const msgText = message.trim();

    try {
      const res = await backendApi.post("/ticket/admin/chat/postMessage", {
        ticketId: ticket._id,
        senderType: "Admin",
        sender: ticket.assignedAdmin,
        message: msgText,
      });

      if (res.data?.success) {
        setMessage("");
        setShouldScrollSmooth(true); // 👈 enable smooth scroll for sent messages
      }
    } catch (err) {
      console.error("Error sending:", err);
      const newChat = {
        _id: Date.now().toString(),
        senderType: "Admin",
        senderName: "You (Admin)",
        message: msgText,
        createdAt: new Date().toISOString(),
        temp: true,
      };
      setChats((prev) => [...prev, newChat]);
      setMessage("");
      setShouldScrollSmooth(true); // 👈 enable smooth scroll for temp messages
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

  const addSystemMessage = (text) => {
    const sysChat = {
      _id: Date.now().toString(),
      senderType: "System",
      message: text,
      createdAt: new Date().toISOString(),
    };
    setChats((prev) => [...prev, sysChat]);
    setShouldScrollSmooth(true); // 👈 enable smooth scroll for system messages
  };

  const handleEndChat = async (status) => {
    try {
      await backendApi.post("/ticket/admin/closechat", {
        ticketId: ticket._id,
        status,
      });
      addSystemMessage(
        status === "resolved"
          ? "✅ Ticket marked as resolved by Admin"
          : "❌ Ticket closed by Admin"
      );
      onClose();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl w-full max-w-2xl h-4/5 relative flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          {/* End Chat Button */}
          {(ticket.status === "open" || ticket.status === "in-progress") && (
            <button
              onClick={() => setShowEndOptions(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              End Chat
            </button>
          )}

          <div className="flex-1 text-center">
            <h2 className="text-xl font-bold text-white mb-2">
              {ticket.subject}
            </h2>
            <div className="flex items-center gap-4 text-sm justify-center">
              {ticket.priority && (
                <span
                  className={`flex items-center gap-1 ${getPriorityColor(
                    ticket.priority
                  )}`}
                >
                  <AlertCircle size={16} /> {ticket.priority}
                </span>
              )}
              {ticket.status && (
                <span
                  className={`px-2 py-1 text-xs text-white rounded-full ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {ticket.status}
                </span>
              )}
              <span className="flex items-center gap-1 text-gray-400">
                <User size={16} />{" "}
                {ticket.user?.name || ticket.user?.email || "Customer"}
              </span>
            </div>
          </div>

          {/* Close Modal Button */}
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingChats ? (
            <div className="flex items-center justify-center h-full text-white">
              Loading chats...
            </div>
          ) : (
            <div className="space-y-3">
              {chats.map((chat, i) => {
                if (chat.senderType === "System") {
                  return (
                    <div key={chat._id || i} className="flex justify-center">
                      <div className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                        {chat.message}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={chat._id || i}
                    className={`p-3 rounded-lg max-w-[75%] ${
                      chat.senderType === "Admin"
                        ? "bg-green-600 text-white ml-auto"
                        : "bg-gray-700 text-gray-200"
                    }`}
                  >
                    <p className="text-xs opacity-75 mb-1">
                      {chat.senderName ||
                        (chat.senderType === "Admin" ? "You (Admin)" : "User")}
                    </p>
                    <p className="text-sm">{chat.message}</p>
                    {chat.createdAt && (
                      <p className="text-xs opacity-50 mt-1">
                        {new Date(chat.createdAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input / Status Banner */}
        {ticket.status === "open" ? (
          <div className="p-6 border-t border-white/20 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Reply to user..."
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
            >
              <Send size={18} />
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        ) : ticket.status === "in-progress" ? (
          <div className="p-6 border-t border-white/20 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Reply to user..."
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white"
            >
              <Send size={18} />
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        ) : ticket.status === "closed" ? (
          <div className="bg-red-600 w-full px-4 py-3 flex items-center justify-center text-white font-semibold">
            ❌ Ticket is closed
          </div>
        ) : ticket.status === "resolved" ? (
          <div className="bg-green-600 w-full px-4 py-3 flex items-center justify-center text-white font-semibold">
            ✅ Ticket resolved
          </div>
        ) : null}

        {/* End Chat Options Modal */}
        {showEndOptions && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-900 text-white p-6 rounded-xl w-80 space-y-4 shadow-lg">
              <h3 className="text-lg font-semibold text-center">End Chat</h3>
              <p className="text-gray-300 text-sm text-center">
                Do you want to mark this ticket as{" "}
                <span className="text-green-400 font-semibold">Resolved</span>{" "}
                or <span className="text-red-400 font-semibold">Closed</span>?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEndChat("resolved")}
                  className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => handleEndChat("closed")}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg"
                >
                  Mark Closed
                </button>
              </div>
              <button
                onClick={() => setShowEndOptions(false)}
                className="w-full bg-gray-700 hover:bg-gray-600 py-2 rounded-lg mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}