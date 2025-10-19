import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useLocation, useNavigate } from "react-router-dom";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-12 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col gap-8"
        aria-label="Admin login form"
      >
        <h1 className="text-4xl font-bold mb-4 text-center text-black">Admin Login</h1>
        {error && <div className="text-red-600 text-lg text-center">{error}</div>}
        <label className="flex flex-col gap-2">
          <span className="font-semibold text-lg">Email</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border rounded-xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-black)]"
            required
            autoComplete="username"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-semibold text-lg">Password</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border rounded-xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-black)]"
            required
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          className="bg-[var(--color-black)] hover:bg-[var(--first-color)] text-white font-bold text-xl py-4 rounded-xl transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin; 