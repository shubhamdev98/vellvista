"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../context/AuthProvider";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      await loginWithGoogle();
      router.push("/account");
    } catch (error) {
      setError("Google signup failed. Please try again.");
      console.error(error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const userData = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
    };
    const result = await register(userData);
    setIsLoading(false);

    if (result.success) {
      if (result.requireOtp) {
        router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}&sent=true`);
      } else {
        router.push("/account");
      }
    } else {
      const message = result.error || "Registration failed. Please try again.";
      setError(message);
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

      {/* RIGHT SIDE - Takes remaining space */}
      <div className="w-full lg:w-3/5 bg-background-muted flex items-center justify-center p-4 lg:py-4 lg:px-10">
        <div className="max-w-md w-full">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-4">
            <h1 className="text-2xl font-semibold text-primary mb-1">
              LuxeScents
            </h1>
            <p className="text-muted text-sm">
              Your Signature Scent Awaits
            </p>
          </div>

          {/* Card */}
          <div className="bg-surface/90 backdrop-blur-md p-5 lg:py-5 lg:px-7 border border-light">
            <h2 className="text-2xl font-semibold text-primary mb-1">
              Create Account
            </h2>

            <p className="text-muted text-sm mb-4">
              Join us and start your fragrance journey
            </p>

            {/* Error */}
            {error && (
              <div className="mb-3 p-3 bg-error-light border border-error text-error text-sm">
                {error}
              </div>
            )}

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-2 bg-surface border border-dark text-secondary py-2 text-sm transition-all disabled:opacity-50 mb-3"
            >
              <span className="text-info font-semibold">G</span>
              <span className="font-light">
                {isGoogleLoading ? "Creating..." : "Continue with Google"}
              </span>
            </button>

            {/* Divider */}
            <div className="relative mb-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-surface text-muted">
                  Or create with email
                </span>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-2.5">
              {/* Name */}
              <input
                name="fullName"
                type="text"
                required
                placeholder="Full name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary"
              />

              {/* Email */}
              <input
                name="email"
                type="email"
                required
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary"
              />

              {/* Password */}
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Terms */}
              <div className="flex items-center text-xs py-0.5">
                <input type="checkbox" required className="accent-primary" />
                <span className="ml-2 text-secondary">
                  I agree to{" "}
                  <Link href="/terms" className="text-primary underline">
                    Terms
                  </Link>{" "}
                  &{" "}
                  <Link href="/privacy" className="text-primary underline">
                    Privacy
                  </Link>
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-primary text-inverse py-2 text-sm hover:bg-primary-light transition-all font-light tracking-wide"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Login */}
            <div className="mt-3 text-center">
              <p className="text-secondary text-sm">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-primary font-light hover:underline"
                >
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