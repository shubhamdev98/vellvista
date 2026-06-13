"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../context/AuthProvider";
import { authClient } from "../../../app/utils/auth-client";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://172.29.214.47:3001";

const isBackendAvailable = async () => {
  try {
    const response = await fetch(`${backendUrl}/health`, {
      method: "GET",
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
};

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      const backendAvailable = await isBackendAvailable();
      if (!backendAvailable) {
        setError("Google login is unavailable because the backend API is not running.");
        return;
      }

      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/account",
      });
    } catch (error: unknown) {
      const message =
        error instanceof TypeError && error.message === "Failed to fetch"
          ? "Google login is unavailable because the backend API is not running."
          : "Google login failed. Please try again.";
      setError(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log('Form data before login:', formData);
    console.log('Email:', formData.email, 'Password:', formData.password);

    const result = await login(formData.email, formData.password);
    setIsLoading(false);

    if (result.success) {
      router.push("/account");
    } else {
      const message = result.error || "Invalid email or password. Please try again.";
      setError(message);
      
      // If the account is unverified, redirect to OTP verification page
      if (result.requireOtp || message.includes("verify your account") || message.includes("OTP")) {
        setTimeout(() => {
          router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}`);
        }, 1500);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE - Reduced image size */}
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
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-2xl font-semibold text-primary mb-1">
              LuxeScents
            </h1>
            <p className="text-muted text-sm">
              Your Signature Scent Awaits
            </p>
          </div>

          {/* Card */}
          <div className="bg-surface/90 backdrop-blur-md p-6 lg:p-7 border border-light">
            <h2 className="text-2xl font-semibold text-primary mb-1">
              Welcome Back
            </h2>

            <p className="text-muted text-sm mb-5">
              Sign in to continue your fragrance journey
            </p>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-error-light border border-error text-error text-sm">
                {error}
              </div>
            )}

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-2 bg-surface border border-dark text-secondary py-2.5 text-sm transition-all disabled:opacity-50 mb-4"
            >
              <span className="text-info font-semibold">G</span>
              <span className="font-light">
                {isGoogleLoading ? "Signing in..." : "Continue with Google"}
              </span>
            </button>

            {/* Divider */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-surface text-muted">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email */}
              <div>
                <label className="block text-xs font-light text-secondary mb-1">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-light text-secondary mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 pr-10 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="accent-primary" />
                  <span className="text-secondary">Remember me</span>
                </label>

                <Link
                  href="/auth/forgot-password"
                  className="text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-primary text-inverse py-2.5 text-sm hover:bg-primary-light transition-all font-light tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Signup */}
            <div className="mt-4 text-center">
              <p className="text-secondary text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/register"
                  className="text-primary font-light hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
