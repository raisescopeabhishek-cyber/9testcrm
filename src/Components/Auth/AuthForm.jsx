import React from 'react';
import useLogin from './useLogin';

const AuthForm = () => {
  const {
    formData,
    loading,
    message,
    handleInput,
    handleSubmit,
  } = useLogin();

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">


    {/* Left Side - Branding & Highlights */}
<div className="relative flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-indigo-900 to-indigo-950 text-white p-10 overflow-hidden">
  {/* Gradient Blobs (5 layers) */}
  <div className="absolute inset-0 z-0">
    <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
    <div className="absolute top-10 right-0 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000" />
    <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
    <div className="absolute bottom-20 right-1/2 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-2xl opacity-25 animate-blob animation-delay-1000" />
    <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-700 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-3000" />
  </div>

  {/* Main Content */}
  <div className="z-10 text-center space-y-6 max-w-lg">
    <img
      src="https://i.imgur.com/ISl7el8.png" // Replace this with actual logo path
      alt="CRM Logo"
      className="mx-auto w-28 h-28 object-contain"
    />
    <h2 className="text-xl font-semibold text-indigo-200 uppercase tracking-widest">
      Admin Portal
    </h2>
    <p className="text-lg text-gray-300 font-medium mt-4">
      Streamline your operations with:
    </p>
    <ul className="text-md text-gray-200 space-y-2 mt-2">
      <li>• Real-time market data</li>
      <li>• Advanced analytics</li>
      <li>• Client management</li>
    </ul>
  </div>
</div>









  {/* Right Side - Admin Login Form */}
<div className="flex items-center justify-center bg-gray-100 p-6 sm:p-12">
  <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-gray-200">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-extrabold text-gray-800">Admin Login</h2>
      <p className="text-gray-500 text-sm mt-2">Please enter your credentials to continue</p>
    </div>

    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleInput}
          placeholder="admin@example.com"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
      </div>

      <div className="relative">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleInput}
          placeholder="••••••••"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition duration-300 shadow-md hover:shadow-lg"
      >
        {loading ? (
          <span className="animate-pulse">Please wait...</span>
        ) : (
          "Login"
        )}
      </button>
    </form>

    {message && (
      <p className="text-center text-sm text-red-500 mt-4">{message}</p>
    )}

    <div className="mt-6 text-center text-sm text-gray-500">
      &copy; {new Date().getFullYear()} Admin Portal. All rights reserved.
    </div>
  </div>
</div>



    </div>
  );
};

export default AuthForm;
