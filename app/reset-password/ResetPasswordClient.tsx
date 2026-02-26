"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();

  const oobCode = params.get("oobCode")!;
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleReset() {
    try {
      await confirmPasswordReset(auth, oobCode, password);

      // ✅ REDIRECT BACK TO LOGIN PAGE
      router.replace("/");
    } catch {
      setError("Failed to reset password");
    }
  }

  return (
    <div>
      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p>{error}</p>}

      <button onClick={handleReset}>Reset Password</button>
    </div>
  );
}
