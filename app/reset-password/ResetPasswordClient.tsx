"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export default function ResetPasswordClient() {
  const params = useSearchParams();
  const router = useRouter();
  const oobCode = params.get("oobCode");

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleReset() {
    setError("");

    if (!oobCode) {
      setError("Invalid or expired reset link.");
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess("Password reset successful. Redirecting...");
      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Reset Password</h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded mb-4"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">{success}</p>}

        <button
          onClick={handleReset}
          className="w-full bg-blue-600 text-white p-3 rounded"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}
