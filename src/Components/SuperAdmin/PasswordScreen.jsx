import React, { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";

const PasswordScreen = ({ onAuthenticate }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${baseUrl}/api/auth/s-admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) throw new Error("Invalid password");

      // Success → store auth with expiry
      const expiryDate = new Date();
      expiryDate.setTime(expiryDate.getTime() + 60 * 60 * 1000); // 1 hour

      const authData = {
        isAuthenticated: true,
        expiry: expiryDate.getTime(),
      };

      sessionStorage.setItem("adminAuth", JSON.stringify(authData));
      onAuthenticate(true);
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Decorative gradients */}
        <div className="absolute inset-0 blur-3xl bg-green-800/20 rounded-full transform -rotate-12" />
        <div className="absolute inset-0 blur-3xl bg-green-400/20 rounded-full transform rotate-12" />

        {/* Login Card */}
        <div className="relative bg-gray-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/50">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-green-600/10 rounded-full mb-4">
              <KeyRound size={32} className="text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-100 text-center">
              Super Admin
            </h1>
            <p className="text-gray-400 mt-2 text-center">
              Enter your credentials to access the dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              {/* Focus Glow */}
              <div
                className={`absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 transition-opacity duration-300 ${
                  isFocused ? "opacity-100" : "opacity-0"
                }`}
                style={{ padding: "1px" }}
              >
                <div className="w-full h-full bg-gray-800 rounded-lg" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Enter password"
                className="relative w-full p-4 bg-gray-800 rounded-lg text-gray-100 border border-gray-700 focus:outline-none transition-shadow duration-300"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-400/10 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-4 bg-gradient-to-r to-green-700 from-gray-800/40 text-white rounded-lg font-medium relative overflow-hidden group hover:shadow-lg transition-shadow duration-300"
            >
              <span className="absolute inset-0 bg-green-600/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              <span className="relative flex items-center justify-center">
                {isLoading && <Loader2 className="animate-spin mr-2" size={20} />}
                {isLoading ? "Authenticating..." : "Access Dashboard"}
              </span>
            </button>
          </form>

          {/* Footer */}
          <p className="text-gray-500 text-sm text-center mt-6">
            Protected Area • Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordScreen;
