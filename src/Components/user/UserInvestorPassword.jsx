import { useState } from "react";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { backendApi, metaApi } from "../../utils/apiClients";
import ModernHeading from "../lib/ModernHeading";




const UserInvesterPassword = () => {
  const [passwords, setPasswords] = useState({
    new: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const [currentAccount, setCurrentAccount] = useState(
    loggedUser.accounts[0] || "000"
  );

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setError(""); // Clear the error when the user starts typing
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?]).{8,}$/;
    return passwordRegex.test(password);
  };

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
          <h1>Investor Password Updated</h1>
        </div>
        <div class="content">
          <p>Dear ${loggedUser?.firstName + " " + loggedUser?.lastName},</p>
  <p>Your account's investor password has been successfully updated.</p>
         <div class="withdrawal-details">
          
          <p>Account No: <span class="highlight">${
            currentAccount.accountNumber
          }</span></p>
            <p>Old password: <span class="highlight">${
              currentAccount.investorPassword
            }</span></p>
            <p>New password: <span class="highlight">${
              passwords.confirm
            }</span></p>
          </div>
    
    <p>Thank you for choosing us.</p>
    <p>Happy trading!</p>
          
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
    const toastId = toast.loading("Please wait...");

    // Validate new password
    if (!validatePassword(passwords.new)) {
      setError(
        "Password must be at least 8 characters long, including one uppercase letter, one lowercase letter, one number, and one special symbol."
      );
      toast.error("Invalid password format", { id: toastId });
      return;
    }
    // Validate confirm password

    if (passwords.new !== passwords.confirm) {
      setError("Passwords do not match. Please try again.");
      toast.error("Passwords do not match", { id: toastId });
      return;
    }

    try {
      const res = await metaApi.get(
        `/ChangeMasterPassword?Manager_Index=${
          import.meta.env.VITE_MANAGER_INDEX
        }&Account=${currentAccount.accountNumber}&password=${passwords.confirm}`
      );

      const backendRes = await backendApi.post(`/update-investor-password`, {
        userId: loggedUser._id,
        accountId: currentAccount._id,
        newPassword: passwords.confirm,
      });
      console.log("backendRes--", backendRes);

      await backendApi.post(`/custom-mail`, {
        email: loggedUser.email,
        content: customContent,
        subject: "Investor Password Changed",
      });

      toast.success(res.data.MESSAGE, { id: toastId });
      navigate("/user/dashboard");
    } catch (error) {
      toast.error("An error occurred. Please try again.", { id: toastId });
    }

    setPasswords({ new: "", confirm: "" });
    setError("");
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto p-6 sm:p-10 bg-gradient-to-br from-secondary-800/40 to-secondary-800/60 rounded-xl shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className=" flex flex-col md:flex-row justify-between">
        <div className=" mb-6">
          <ModernHeading text={"Change Investor Password"}></ModernHeading>
        </div>
        <div className=" my-2">
          {loggedUser?.accounts.length > 0 && (
            <select
              onChange={(e) => {
                const selectedValue = loggedUser.accounts?.find(
                  (value) => value.accountNumber === e.target.value
                );
                setCurrentAccount(selectedValue);
              }}
              id="accountNumber"
              name="accountNumber"
              className="w-full border-none  py-2 text-sm md:py1 rounded-full border bg-secondary-500-10 px-2 outline-none font-semibold border-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 border-b"
            >
              <option
                disabled
                className=" bg-secondary-800 text-gray-500"
                value=""
              >
                Select Account
              </option>
              {loggedUser.accounts?.map((value, index) => (
                <option
                  key={index}
                  className=" bg-secondary-800 font-semibold text-white"
                  onClick={() => setCurrentAccount(value)}
                  value={value.accountNumber}
                >
                  {value.accountNumber}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {["new", "confirm"].map((field) => (
          <motion.div
            key={field}
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: field === "new" ? 0 : 0.1 }}
          >
            <label htmlFor={field} className="block text-sm font-medium mb-2">
              {field.charAt(0).toUpperCase() + field.slice(1)} Password
            </label>
            <div className="relative group">
              <input
                id={field}
                type="password"
                name={field}
                value={passwords[field]}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-none bg-secondary-800 pl-12 pr-10 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition duration-300 ${
                  error && "ring-red-500 border-red-500"
                }`}
                required
              />
              <Lock
                className="absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:secondary-700 transition-colors duration-300"
                size={20}
              />
            </div>
          </motion.div>
        ))}
        {error && (
          <motion.div
            className="text-red-500 flex items-center mt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AlertCircle className="mr-2" size={20} />
            {error}
          </motion.div>
        )}
        <div className="flex flex-col-reverse gap-4 sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
          <Link
            to={"/user/dashboard"}
            type="button"
            className="w-full text-center sm:w-auto bg-red-600/10 text-red-200 py-3 px-6 rounded-lg hover:bg-red-600/30 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Cancel
          </Link>
          <motion.button
            type="submit"
            className="w-full sm:w-auto bg-secondary-500-60 hover:bg-secondary-500-50 text-white py-3 px-6 rounded-lg secondary-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary-500 flex items-center justify-center"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.95 }}
          >
            <CheckCircle className="mr-2" size={20} />
            Change Password
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default UserInvesterPassword;
