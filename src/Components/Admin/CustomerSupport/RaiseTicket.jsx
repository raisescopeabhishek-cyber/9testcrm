import { useState, useEffect } from "react";
import { backendApi } from "../../../utils/apiClients";
import { Send, X } from "lucide-react";

export default function RaiseTicket({ onSubmit, onCancel }) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [isLoading, setIsLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  // ✅ Fetch user list on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await backendApi.get("/admin/user-list");
        console.log(res);

        setUsers(res.data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || !selectedUser || isLoading)
      return;

    setIsLoading(true);
    try {
      const res = await backendApi.post(`/ticket/admin/riseTicket`, {
        userId: selectedUser, // ✅ use selected user
        subject: subject.trim(),
        description: description.trim(),
        priority,
        createdBy: "Admin",
      });

      if (res.data.success) {
        onSubmit();
        setSubject("");
        setDescription("");
        setPriority("Medium");
        setSelectedUser("");
        onCancel();
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("Failed to create ticket. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-indigo-900 via-violet-900 to-indigo-950 backdrop-blur-lg rounded-xl w-full max-w-md p-6 relative">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4 text-white">
          <h2 className="text-xl font-bold mb-2">Raise a New Ticket</h2>

          {/* ✅ User Selection */}
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {console.log(users)}
            <option className="text-white bg-blue-900" value="">
              Select User
            </option>
            {users.map((user) => (
              <option
                className="text-white bg-blue-900"
                key={user._id}
                value={user._id}
              >
                {user._id}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Ticket Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/20 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            placeholder="Describe your issue..."
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/20 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option className="text-white bg-blue-900" value="Low">
              Low Priority
            </option>
            <option className="text-white bg-blue-900" value="Medium">
              Medium Priority
            </option>
            <option className="text-white bg-blue-900" value="High">
              High Priority
            </option>
            <option className="text-white bg-blue-900" value="Critical">
              Critical Priority
            </option>
          </select>

          <button
            onClick={handleSubmit}
            disabled={
              !subject.trim() ||
              !description.trim() ||
              !selectedUser ||
              isLoading
            }
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-2 px-4 rounded-lg font-semibold shadow-md hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Send className="w-5 h-5" />
            {isLoading ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}
