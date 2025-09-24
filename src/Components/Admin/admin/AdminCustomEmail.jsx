import React, { useState } from "react";
import {
  Mail,
  Send,
  User,
  UsersRound,
  AlertTriangle,
  CheckCircle,
  Hash,
  AtSign,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { backendApi } from "../../..//utils/apiClients";

export default function AdminCustomEmail() {
  const [recipient, setRecipient] = useState("single");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);

  //   custom mail--

  const customContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Withdrawal Request Confirmation - Arena Trade</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 5px;
      background-color: #ffffff;
    }
    .header {
      background-color: #19422df2;
      color: #ffffff;
      padding: 20px 15px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      letter-spacing: 1px;
    }
    .content {
      padding: 10px 20px;
    }
    .cta-button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2d6a4f;
      color: #FFFFFF;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 10px 0;
    }
    .footer {
      background-color: #19422df2;
      color: #ffffff;
      text-align: center;
      padding: 5px 10px;
      font-size: 12px;
      border-radius: 0 0 10px 10px;
    }
    .footer-info {
      margin-top: 6px;
    }
    .footer-info a {
      color: #B6D0E2;
      text-decoration: none;
    }
    
   
    .withdrawal-details {
      background-color: #f8f8f8;
      border-left: 4px solid #2d6a4f;
      padding: 15px;
      margin: 20px 0;
    }
    .withdrawal-details p {
      margin: 5px 0;
    }
    .highlight {
      font-weight: bold;
      color: #0a2342;
    }
    .risk-warning {
      color: #C70039;
      padding: 5px;
      font-size: 12px;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Priority Update</h1>
    </div>
    <div class="content">
    <p>${message}</p>
    
      
      <p>Best regards,<br>${import.meta.env.VITE_WEBSITE_NAME} Team</p>
      <hr>
       <div class="risk-warning">
  <strong>Risk Warning:</strong> Trading CFDs carries high risk and may result in losses beyond your initial investment. Trade only with money you can afford to lose and understand the risks.  
  <br><br>
  ${
    import.meta.env.VITE_WEBSITE_NAME
  } Trade’s services are not for U.S. citizens or in jurisdictions where they violate local laws.
</div>
    

    </div>
  <div class="footer">
      <div class="footer-info">
                  <p>Website: <a href="https://${
                    import.meta.env.VITE_EMAIL_WEBSITE
                  }"> ${
    import.meta.env.VITE_EMAIL_WEBSITE
  } </a> | E-mail: <a href="mailto:${import.meta.env.VITE_EMAIL_EMAIL || ""}">${
    import.meta.env.VITE_EMAIL_EMAIL || ""
  }</a></p>
                  <p>© 2025 ${
                    import.meta.env.VITE_WEBSITE_NAME || ""
                  }. All Rights Reserved</p>
                </div>
    </div>
  </div>
</body>
</html>`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !subject.trim() ||
      !message.trim() ||
      (recipient === "single" && !email.trim())
    ) {
      setStatus("error");
      return;
    }

    try {
      if (recipient === "single") {
        const toastId = toast.loading("Sending..");
        await backendApi.post(`/custom-mail`, {
          email: email,
          content: customContent,
          subject: subject,
        });
        toast.success("Email sent", { id: toastId });
      } else if (recipient === "all") {
        toast.success(
          "Your request is being processed. The time required may vary based on the number of users, so please allow a few moments for completion.",
          {
            duration: 7000,
          }
        );
        setEmail("");
        setSubject("");
        setMessage("");
        await backendApi.post(`/send-emails`, {
          text: message,
          subject: subject,
        });
      }

      setStatus("success");
      setEmail("");
      setSubject("");
      setMessage("");

      // Clear status after 3 seconds
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!!, Try Again");
      setStatus("error");
    }
  };

  return (
    <div className="  flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-primary-700/40 shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div
          className="bg-primary-600
         text-white p-6 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <Mail className="w-8 h-8" />
            <h2 className="text-2xl font-semibold">Custom Email</h2>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 space-y-4">
          {/* Recipient Type Toggle */}
          <div className="flex whitespace-nowrap bg-primary-600/40 font-semibold p-2 rounded-full">
            <button
              onClick={() => setRecipient("single")}
              className={`flex-1 py-2 px-4 rounded-full  flex items-center justify-center space-x-2 transition-all duration-300 ${
                recipient === "single"
                  ? "bg-primary-500/70 text-white"
                  : "text-white hover:bg-primary-700"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-sm">Single User</span>
            </button>
            <button
              onClick={() => setRecipient("all")}
              className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center space-x-2 transition-all duration-300 ${
                recipient === "all"
                  ? "bg-primary-500/70 text-white"
                  : "text-white hover:bg-primary-700"
              }`}
            >
              <UsersRound className="w-5 h-5" />
              <span className="text-sm">All Users</span>
            </button>
          </div>

          {/* Email Input */}
          {recipient === "single" && (
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Recipient Email"
                className="w-full bg-primary-800/30 p-3 px-10 md:px-14 border border-primary-500/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
              />
              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
            </div>
          )}

          {/* Subject Input */}
          <div className="relative">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email Subject"
              className="w-full bg-primary-800/30 p-3 px-10 md:px-14 border border-primary-500/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
            />
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" />
          </div>

          {/* Message Textarea */}
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Compose your message..."
              className="w-full p-3 px-10 md:px-14 border bg-primary-800/30 border-primary-500/40 rounded-lg h-52 resize-none focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
            />
            <Send className="absolute left-4 top-4 text-primary-400" />
          </div>

          {/* Status Messages */}
          {status === "error" && (
            <div className="flex items-center text-red-500 bg-red-500/10 p-3 rounded-lg">
              <AlertTriangle className="mr-2" />
              Something Went wrong.
            </div>
          )}
          {status === "success" && (
            <div className="flex items-center text-green-600 bg-green-500/20 p-3 rounded-lg">
              <CheckCircle className="mr-2" />
              Email sent successfully!
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            className="w-full p-3 bg-blue-600/80 text-white rounded-lg hover:bg-blue-800 transition-all duration-300 flex items-center justify-center space-x-2 group"
          >
            <Send className="mr-2 group-hover:animate-pulse" />
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
}
