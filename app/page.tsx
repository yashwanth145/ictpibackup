"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebaseConfig";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import logo from "../assets/ICTPL_image.png";
import Image from "next/image";
import "../app/globals.css";

interface MemberMap {
  [userId: string]: string; // userID -> email
}

export default function LoginPage() {
  const [userId, setUserId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [memberMap, setMemberMap] = useState<MemberMap>({});
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetMessage, setResetMessage] = useState<string>("");
  const [resetError, setResetError] = useState<string>("");
  const router = useRouter();

  // Load member.json on mount
  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch("/member.json");
        const data = await res.json();
        setMemberMap(data);
      } catch (err) {
        console.error("Error loading member.json:", err);
      }
    }
    fetchMembers();
  }, []);

  async function handleLogin() {
    setError("");
    try {
      const email = memberMap[userId];
      if (!email) {
        setError("Invalid User ID. Please use ICTPI provided credentials.");
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      setUserId("");
      setPassword("");
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Incorrect password or invalid credentials or Check your network connections.");
      } else {
        setError("An unexpected error occurred.");
      }
    }
  }

  async function handleForgotPassword() {
    setResetError("");
    setResetMessage("");

    const email = memberMap[userId];
    if (!userId) {
      setResetError("Please enter your Member ID.");
      return;
    }
    if (!email) {
      setResetError("Invalid Member ID. No associated email found.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Password reset email has been sent to your registered email address.");
     
       setTimeout(() => setShowResetModal(false), 3000);
    } catch (err: any) {
      setResetError(err.message || "Failed to send reset email. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 transform transition-all duration-300 hover:scale-105 max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src={logo} alt="Logo" className="h-16 w-auto" />
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">
          Welcome
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        {/* Form */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Member ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-blue-50 text-blue-900 placeholder-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-blue-50 text-blue-900 placeholder-blue-400"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold shadow-md hover:shadow-lg"
          >
            Sign In
          </button>

          <div className="text-center">
            <button
              onClick={() => setShowResetModal(true)}
              className="text-red-600 hover:underline text-sm"
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-96 max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-800">
              Forgot Password
            </h2>
            <p className="text-sm text-black mb-4 text-center">
              Enter your Member ID to receive a password reset link.
            </p>

            <input
              type="text"
              placeholder="Member ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="text-black w-full p-3 mb-4 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
            />

            {resetError && (
              <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">
                {resetError}
              </p>
            )}

            {resetMessage && (
              <p className="text-green-600 text-sm mb-4 text-center bg-green-50 p-2 rounded">
                {resetMessage}
              </p>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetMessage("");
                  setResetError("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Send Reset Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}