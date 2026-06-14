"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      // Using better-auth forgot password flow - call API directly
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://172.29.214.47:3001"}/api/auth/request-password-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }),
      });

      if (response.ok) {
        setMessage("If an account exists with this email, you will receive a password reset link.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } catch {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE - Split screen image */}
      <div className="hidden lg:flex lg:w-2/5 relative">
        <div className="relative w-full h-full my-auto">
          <Image
            src="/product/fernando-andrade-potCPE_Cw8A-unsplash (1).jpg" // cspell:disable-line
            alt="Luxury Fragrances"
            fill
            className="object-cover"
            loading="eager"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0" />
        </div>
      </div>

      {/* RIGHT SIDE - Takes remaining space */}
      <div className="w-full lg:w-3/5 bg-background-muted flex items-center justify-center p-6 lg:p-10">
        <div className="max-w-md w-full">
          {/* Header Section */}
          <div className="text-center mb-6 flex flex-col items-center justify-center">
            <Link href="/" className="relative h-10 w-[7.5rem] block mb-2">
              <Image
                src="/logo/vv.png"
                alt="Vellvista"
                fill
                className="object-contain"
                priority
              />
            </Link>
            <p className="text-muted text-sm">
              Your Signature Scent Awaits
            </p>
          </div>

          {/* Card */}
          <div className="bg-surface/90 backdrop-blur-md p-6 lg:p-7 border border-light">
            <h2 className="text-2xl font-semibold text-primary mb-1">
              Reset Password
            </h2>

            <p className="text-muted text-sm mb-5">
              Enter your email to receive a password reset link
            </p>

            {message && (
              <div className="mb-4 p-3 bg-success-light border border-success text-success-dark text-sm">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-error-light border border-error text-error text-sm">
                {error}
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-light text-secondary mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-inverse py-2.5 text-sm hover:bg-primary-light transition-all font-light tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
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
      </div>
    </div>
  );
}

