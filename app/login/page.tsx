"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/Supabase";
import { logoSrc as logo } from "@/lib/logo";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false); // unified for login + reset

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  const router = useRouter();

  // Helper: Lookup single member's email by membership ID
  const lookupEmailByMemberId = async (membershipId: string): Promise<string | null> => {
    const normalized = membershipId.trim().toUpperCase();
    if (!normalized) return null;

    try {
      const { data, error } = await supabase
        .from("memberinformation")
        .select("email")
        .eq("membership_id", normalized)
        .maybeSingle();

      if (error) {
        console.error("Supabase lookup error:", error);
        return null;
      }

      if (!data?.email) return null;

      const email = String(data.email).trim().toLowerCase();
      return email.includes("@") ? email : null;
    } catch (err) {
      console.error("Lookup failed:", err);
      return null;
    }
  };

  const handleLogin = async () => {
    setError("");
    if (isProcessing) return;

    const trimmedId = userId.trim();
    if (!trimmedId) {
      setError("Please enter your Member ID");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsProcessing(true);

    try {
      const email = await lookupEmailByMemberId(trimmedId);
      if (!email) {
        setError("Invalid Member ID – please use your ICTPI provided ID");
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);

      setUserId("");
      setPassword("");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      const code = err.code;
      if (code === "auth/wrong-password") {
        setError("Incorrect password");
      } else if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
        setError("Invalid credentials");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Login failed. Please check your connection and try again.");
        console.error("Login error:", err);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForgotPassword = async () => {
    setResetError("");
    setResetMessage("");

    const trimmedId = userId.trim();
    if (!trimmedId) {
      setResetError("Please enter your Member ID first");
      return;
    }

    setIsProcessing(true);

    try {
      const email = await lookupEmailByMemberId(trimmedId);
      if (!email) {
        setResetError("No registered email found for this Member ID");
        return;
      }

      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
      });

      setResetMessage("Password reset link sent to your registered email. Check spam/junk folder.");
      setTimeout(() => {
        setShowResetModal(false);
        setResetMessage("");
        setResetError("");
      }, 5000);
    } catch (err: any) {
      console.error("Reset error:", err);
      let message = err.message || "Failed to send reset email. Try again.";

      if (err.code === "auth/too-many-requests") {
        message = "Too many requests. Please wait a few minutes.";
      } else if (err.code === "auth/invalid-email") {
        message = "Invalid email format.";
      }

      setResetError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
        <div className="flex justify-center mb-6">
          <Image
            src={logo}
            alt="ICTPI Logo"
            className="h-70 w-auto object-contain"
            priority
          />
        </div>

        
        <p className="text-center text-gray-600 mb-8 text-sm">
          Sign in with your ICTPI Member ID
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <input
            type="text"
            placeholder="Member ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value.toUpperCase())}
            disabled={isProcessing}
            className="w-full px-4 py-3 border border-blue-200 rounded-lg bg-blue-50/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 disabled:opacity-60 uppercase tracking-wide"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isProcessing}
            className="w-full px-4 py-3 border border-blue-200 rounded-lg bg-blue-50/60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 disabled:opacity-60"
          />

          <button
            onClick={handleLogin}
            disabled={isProcessing || !userId.trim() || !password.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Sign In"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              disabled={isProcessing}
              className="text-red-600 hover:text-red-800 text-sm font-medium underline-offset-2 hover:underline disabled:opacity-50"
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-blue-800 mb-5 text-center">
              Reset Password
            </h2>

            <p className="text-gray-600 text-sm mb-5 text-center">
              Enter your Member ID to receive a reset link
            </p>

            <input
              type="text"
              placeholder="Member ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value.toUpperCase())}
              disabled={isProcessing}
              className="w-full px-4 py-3 border border-blue-200 rounded-lg bg-blue-50/60 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-5 uppercase tracking-wide"
            />

            {resetError && (
              <p className="text-red-600 text-sm mb-4 text-center">{resetError}</p>
            )}
            {resetMessage && (
              <p className="text-green-600 text-sm mb-4 text-center font-medium">
                {resetMessage}
              </p>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetError("");
                  setResetMessage("");
                }}
                disabled={isProcessing}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>

              <button
                onClick={handleForgotPassword}
                disabled={isProcessing || !userId.trim()}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {isProcessing ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}