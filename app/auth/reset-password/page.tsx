"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid or expired reset link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      // Using better-auth reset password flow - call API directly
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://172.29.214.47:3001"}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword: password,
          token: token || "",
        }),
      });

      if (response.ok) {
        setMessage("Password has been reset successfully. You can now sign in with your new password.");
        setPassword("");
        setConfirmPassword("");
      } else {
        setError("Failed to reset password. The link may be invalid or expired.");
      }
    } catch {
      setError("Failed to reset password. The link may be invalid or expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-muted flex items-center justify-center p-6 lg:p-10">
      <div className="w-full max-w-md bg-surface p-8 rounded-xl shadow-sm border border-light">
        <div className="text-center mb-8 flex flex-col items-center justify-center">
          <Link href="/" className="relative h-10 w-[7.5rem] block mb-2">
            <Image
              src="https://res.cloudinary.com/dujjidn0e/image/upload/v1781626147/vellvista/logo/w5kkgq9suiw7sk4poxsz.png"
              alt="Vellvista"
              fill
              className="object-contain"
              priority
            />
          </Link>
          <p className="text-secondary text-sm">Set New Password</p>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-success-light text-success-dark rounded-lg text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-error-light text-error rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-light text-secondary mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-xs font-light text-secondary mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full bg-primary text-inverse py-2.5 text-sm hover:bg-primary-light transition-all font-light tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-secondary text-sm">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-primary font-light hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background-muted flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md bg-surface p-8 rounded-xl shadow-sm border border-light text-center">
          <p className="text-secondary text-sm">Loading reset form...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

