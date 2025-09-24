import { useState } from "react";
import { backendApi } from "../../../utils/apiClients";
import { Send, X } from "lucide-react";
import { useSelector } from "react-redux";

export default function RaiseTicket({ onSubmit, onCancel }) {
  const [subject, setSubject] = useState("");
  const loggedUser = useSelector((store) => store.user.loggedUser);

  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [isLoading, setIsLoading] = useState(false);
  const [subjectError, setSubjectError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubjectError("");
    setDescriptionError("");

    let isValid = true;
    if (!subject.trim()) {
      setSubjectError("Subject cannot be empty.");
      isValid = false;
    }
    if (!description.trim()) {
      setDescriptionError("Description cannot be empty.");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await backendApi.post(`/ticket/user/riseTicket`, {
        userId: loggedUser._id,
        subject: subject.trim(),
        description: description.trim(),
        priority,
        createdBy: "Customer",
      });

      if (res.data.success) {
        onSubmit();
        setSubject("");
        setDescription("");
        setPriority("Medium");
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-indigo-950 via-blue-950 to-indigo-950 backdrop-blur-lg rounded-xl w-full max-w-md p-6 relative border border-white/20 shadow-xl">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4 text-white">
          
          <h2 className="text-2xl font-extrabold text-center text-white mb-6">
            Raise a New Support Ticket
          </h2>
          <p className="text-gray-300 text-center text-sm mb-6">
            Please fill out the form below to submit your support request. Our
            team will get back to you as soon as possible.
          </p>

          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-300"
          >
            Subject
          </label>
          <input
            type="text"
            id="subject"
            placeholder="e.g., Issue with withdrawal, Account verification..."
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (subjectError) setSubjectError("");
            }}
            className={`w-full px-4 py-2 rounded-lg bg-black/30 text-white placeholder-gray-400 border ${
              subjectError ? "border-red-500" : "border-white/20"
            } focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
            required
          />
          {subjectError && (
            <p className="text-red-400 text-xs mt-1">{subjectError}</p>
          )}

          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300 mt-4"
          >
            Description
          </label>
          <textarea
            id="description"
            placeholder="Provide a detailed description of your issue..."
            rows="5"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (descriptionError) setDescriptionError("");
            }}
            className={`w-full px-4 py-2 rounded-lg bg-black/30 text-white placeholder-gray-400 border ${
              descriptionError ? "border-red-500" : "border-white/20"
            } focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
            required
          />
          {descriptionError && (
            <p className="text-red-400 text-xs mt-1">{descriptionError}</p>
          )}

          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-300 mt-4"
          >
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-black/30 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
          >
            <option className="text-white bg-blue-950" value="Low">
              Low Priority
            </option>
            <option className="text-white bg-blue-950" value="Medium">
              Medium Priority
            </option>
            <option className="text-white bg-blue-950" value="High">
              High Priority
            </option>
            <option className="text-white bg-blue-950" value="Critical">
              Critical Priority
            </option>
          </select>

          <button
            onClick={handleSubmit}
            disabled={!subject.trim() || !description.trim() || isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-500"
          >
            <Send className="w-5 h-5" />
            {isLoading ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}
