"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebaseConfig";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import logo from "../assets/ICTPL_image.png";
import Image from "next/image";
import "../app/globals.css";

interface MemberMap {
  [userId: string]: string;
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

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch("/member.json");
        const data = await res.json();
        setMemberMap(data);
      } catch (err) {
        console.error(err);
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
    } catch {
      setError("Incorrect password or invalid credentials or Check your network connections.");
    }
  }

  async function handleForgotPassword() {
    setResetError("");
    setResetMessage("");

    if (!userId) {
      setResetError("Please enter your Member ID.");
      return;
    }

    const email = memberMap[userId];
    if (!email) {
      setResetError("Invalid Member ID. No associated email found.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/`,
        handleCodeInApp: true,
      });

      setResetMessage("Password reset email has been sent to your registered email address.");
      setTimeout(() => setShowResetModal(false), 3000);
    } catch (err: any) {
      setResetError(err.message || "Failed to send reset email.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 transform transition-all duration-300 hover:scale-105 max-w-md">

        <div className="flex justify-center mb-6">
          <Image src={logo} alt="Logo" className="h-16 w-auto" />
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Welcome</h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Member ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-3 border border-blue-200 rounded-lg bg-blue-50 text-black"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-blue-200 rounded-lg bg-blue-50 text-black"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white p-3 rounded-lg"
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

      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-96">

            <h2 className="text-2xl font-bold mb-4 text-center text-blue-800">
              Forgot Password
            </h2>

            <input
              type="text"
              placeholder="Member ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full p-3 mb-4 border rounded bg-blue-50 text-black"
            />

            {resetError && <p className="text-red-500 text-sm mb-3">{resetError}</p>}
            {resetMessage && <p className="text-green-600 text-sm mb-3">{resetMessage}</p>}

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowResetModal(false)} className="text-black">Cancel</button>
              <button
                onClick={handleForgotPassword}
                className="bg-blue-600 text-white px-5 py-2 rounded"
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
