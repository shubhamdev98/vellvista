"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthProvider";

function VerifyOtpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const { verifyOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.push("/auth/register");
    }
  }, [email, router]);

  const handleResendOtp = async () => {
    if (!email) return;
    setIsResending(true);
    setError("");
    setResendMessage("");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://172.29.214.47:3001'}/trpc/resendOtp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      setResendMessage("A new OTP has been sent. Please check your email.");
      setOtp("");
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  // Send OTP automatically on initial load if not already sent during registration
  useEffect(() => {
    const sent = searchParams.get("sent");
    if (email && sent !== "true") {
      handleResendOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await verifyOtp(email, otp);
    setIsLoading(false);

    if (result.success) {
      router.push("/account");
    } else {
      const message = result.error || "Invalid OTP. Please try again.";
      setError(message);
    }
  };

  if (!email) {
    return null; // Don't render anything if there's no email, the useEffect will redirect
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-2/5 relative">
        <div className="relative w-full h-full my-auto">
          <Image
            src="/product/fernando-andrade-potCPE_Cw8A-unsplash (1).jpg"
            alt="Luxury Fragrances"
            fill
            className="object-cover"
            loading="eager"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0" />
        </div>
      </div>

      {/* RIGHT SIDE */}
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
              Verify Email
            </h2>

            <p className="text-muted text-sm mb-5">
              We&apos;ve sent a 6-digit OTP to <span className="font-semibold">{email}</span>. Please enter it below.
            </p>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-error-light border border-error text-error text-sm">
                {error}
              </div>
            )}

            {/* Resend message */}
            {resendMessage && (
              <div className="mb-4 p-3 bg-surface border border-light text-secondary text-sm">
                {resendMessage}
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-light text-secondary mb-1">
                  6-Digit OTP
                </label>
                <input
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only allow numbers
                  className="w-full px-3 py-2.5 text-center tracking-[0.5em] text-lg font-light border border-default focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-primary text-inverse py-2.5 text-sm hover:bg-primary-light transition-all font-light tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </button>

              {/* Resend OTP */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-sm text-primary hover:underline disabled:opacity-50"
                >
                  {isResending ? "Resending..." : "Didn't receive it? Resend OTP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background-muted flex items-center justify-center p-6 lg:p-10">
        <p className="text-secondary text-sm">Loading verification page...</p>
      </div>
    }>
      <VerifyOtpForm />
    </Suspense>
  );
}

