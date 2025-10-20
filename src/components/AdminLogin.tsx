import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useLocation, useNavigate } from "react-router-dom";
import { FaLock, FaEnvelope, FaShieldAlt } from "react-icons/fa";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Invalid email or password. Please try again.",
  "auth/user-not-found": "No user found with this email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/too-many-requests": "Too many failed attempts. Please try again later.",
  "auth/network-request-failed": "Network error. Please check your connection.",
};

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as any)?.from?.pathname || "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const code = err.code || "";
      setError(ERROR_MESSAGES[code] || "Login failed. Please try again.");
    }
    setLoading(false);
  };

  console.log(auth.currentUser?.uid);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Orange Orb */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-orange-500/15 to-red-500/15 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Bottom Left Orb */}
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gradient-to-tr from-orange-600/10 to-transparent rounded-full blur-3xl" style={{ animationDelay: '1s' }}></div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 border-4 border-orange-500/25 rounded-lg rotate-45 animate-float"></div>
        <div className="absolute bottom-32 right-20 w-16 h-16 border-4 border-orange-400/15 rounded-full" style={{ animation: 'float 8s ease-in-out infinite', animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-gradient-to-br from-orange-500/8 to-red-500/8 rounded-xl rotate-12 animate-bounce-slow"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-black/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border-2 border-orange-500/30 hover:border-orange-500/60 transition-all duration-500">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/50 animate-pulse">
                <FaShieldAlt className="text-4xl text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-black animate-pulse"></div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="text-gray-400 text-sm">Secure access to dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl animate-slideDown">
              <p className="text-red-400 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6" aria-label="Admin login form">
            {/* Email Field */}
            <div className="relative">
              <label className="flex flex-col gap-2">
                <span className="font-semibold text-gray-300 text-sm uppercase tracking-wide">Email Address</span>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <FaEnvelope className="text-lg" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-black border-2 border-orange-500/20 rounded-xl pl-12 pr-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all duration-300"
                    placeholder="admin@example.com"
                    required
                    autoComplete="username"
                  />
                </div>
              </label>
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="flex flex-col gap-2">
                <span className="font-semibold text-gray-300 text-sm uppercase tracking-wide">Password</span>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <FaLock className="text-lg" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-black border-2 border-orange-500/20 rounded-xl pl-12 pr-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all duration-300"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4 group"
              disabled={loading}
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <FaShieldAlt className="text-xl" />
                    Access Dashboard
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-orange-500/20">
            <p className="text-center text-gray-600 text-xs">
              Protected by secure authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 