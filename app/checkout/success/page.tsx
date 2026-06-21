"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ShoppingBag, ArrowRight, ClipboardList, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "ORD-SUCCESS";

  return (
    <main className="flex-1 max-w-2xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center font-light text-primary">
      {/* Animated Checkmark and Sparkles */}
      <div className="relative mb-8 animate-bounce">
        <CheckCircle className="h-20 w-20 text-success-dark" />
        <div className="absolute -top-1 -right-1">
          <Sparkles className="h-6 w-6 text-accent animate-pulse" />
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-3">
        Thank You for Your Order!
      </h1>
      <p className="text-secondary font-light text-sm sm:text-base leading-relaxed max-w-md mb-8">
        Your payment has been successfully verified, and your premium fragrance order is now being processed.
      </p>

      {/* Order Info Card */}
      <div className="w-full bg-background-alt border border-light p-6 mb-10 text-left">
        <h3 className="text-xs uppercase tracking-widest text-secondary font-medium mb-3">Order Details</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-secondary">Order Reference ID:</span>
          <span className="text-sm font-semibold font-mono text-primary">#{orderId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-secondary">Status:</span>
          <span className="text-xs uppercase font-semibold bg-success-light text-success-dark px-2.5 py-0.5 rounded-full">
            Paid & Processing
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Link
          href="/account?tab=orders"
          className="flex-1 bg-primary text-inverse py-3 px-6 hover:bg-primary-light transition-all text-sm uppercase tracking-wider font-light flex items-center justify-center gap-2 border border-primary"
        >
          <ClipboardList className="h-4 w-4" />
          View My Orders
        </Link>
        <Link
          href="/products"
          className="flex-1 bg-surface text-primary border border-dark py-3 px-6 hover:bg-surface-alt transition-all text-sm uppercase tracking-wider font-light flex items-center justify-center gap-2"
        >
          <ShoppingBag className="h-4 w-4" />
          Continue Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Suspense fallback={
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-sm text-secondary animate-pulse">Loading order confirmation...</p>
        </div>
      }>
        <SuccessPageContent />
      </Suspense>
      <Footer />
    </div>
  );
}
