import React from "react";
import { Send, Mail, Clock, ArrowRight, TicketPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserCustomerSupport() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-700 via-blue-950 to-indigo-950 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 backdrop-blur-2xl">
        <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-6000"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-4xl mx-auto bg-gradient-to-br from-indigo-950 via-blue-950 to-indigo-700">
        <div
          className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 hover:shadow-primary-500/30"
        >
          {/* Floating Raise Ticket Button */}
          <button
            onClick={() => navigate("/user/ticketDashboard")}
            className="absolute top-4 right-4 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:scale-105 hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 ease-out z-20"
          >
            <TicketPlus className="w-5 h-5" />
            Raise Ticket
          </button>
          <div className="p-6 sm:p-10">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-5 rounded-full shadow-lg">
                <Mail className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 text-center tracking-tight">
              Customer Support Center
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-gray-300 mb-10 text-center max-w-2xl mx-auto leading-relaxed">
              Our dedicated email support team is committed to providing
              comprehensive and timely assistance for all your inquiries.
            </p>

            {/* Support Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:border-blue-500 hover:shadow-xl">
                <Mail className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">
                  Support Email
                </h3>
                <p className="text-sm text-gray-400">
                  {import.meta.env.VITE_EMAIL_EMAIL}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:border-green-500 hover:shadow-xl">
                <Clock className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">
                  Response Times
                </h3>
                <p className="text-sm text-gray-400">
                  Weekdays (Mon-Sat): 8 AM to 8 PM
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10 transition-all duration-300 hover:border-purple-500 hover:shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">
                How to Get Effective Support
              </h3>
              <ul className="list-disc list-inside text-gray-400 text-sm space-y-2">
                <li>Provide a clear and concise description of your issue</li>
                <li>Include any error messages or screenshots</li>
                <li>
                  Describe steps you've already taken to resolve the problem
                </li>
                <li>Mention your system or product details</li>
              </ul>
            </div>

            {/* Send Email Button */}
            <a
              href={`mailto:${import.meta.env.VITE_EMAIL_EMAIL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-full py-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center overflow-hidden group hover:from-blue-700 hover:to-purple-800 transition-all duration-500 ease-out"
            >
              <span className="absolute left-0 w-full h-full bg-white opacity-0 transform -translate-x-full group-hover:translate-x-0 group-hover:opacity-10 transition-all duration-500"></span>
              <Send
                className={`w-6 h-6 mr-3 transform transition-transform duration-300 group-hover:-translate-x-1 `}
              />
              Send Support Email
              <ArrowRight
                className={`w-6 h-6 ml-2 transform transition-transform duration-300 opacity-0 group-hover:translate-x-1 group-hover:opacity-100 `}
              />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 mt-8 text-sm">
          We strive to provide the most helpful support possible
          <div className="text-xs mt-2 text-gray-600">
            Your satisfaction is our top priority
          </div>
        </div>
      </div>
    </div>
  );
}
