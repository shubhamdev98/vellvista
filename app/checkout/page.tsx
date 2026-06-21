"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useCart } from "@/context/CartProvider";
import { useCurrency } from "@/context/CurrencyProvider";
import { useToast } from "@/context/ToastProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trpc } from "@/app/utils/trpc";
import { ShoppingBag, Lock, MapPin, CreditCard, ChevronLeft, ShieldCheck, Sparkles, Loader2, Plus, Check } from "lucide-react";

interface Address {
  id: number;
  userId: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  addressType?: string;
}

export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { items, clearCart, couponCode, discountRate, applyCoupon, removeCoupon } = useCart();
  const { currency, formatPrice, convertPrice } = useCurrency();
  const { showToast } = useToast();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [activeCountries, setActiveCountries] = useState<{ id: number; name: string; code: string; isActive: boolean }[]>([]);
  const [states, setStates] = useState<{ id: number; name: string; iso2: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [couponInput, setCouponInput] = useState("");

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
    isDefault: false,
  });

  // Calculate pricing summary
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const TAX_RATE = 0.08;
  const tax = subtotal * TAX_RATE;
  const discount = subtotal * discountRate;
  const shippingCost = subtotal >= 50 && shippingMethod === "standard" ? 0 : (shippingMethod === "standard" ? 5.00 : 15.00);
  const total = subtotal + tax - discount + shippingCost;

  // Check login requirement
  useEffect(() => {
    if (!authLoading && !user) {
      showToast("Please sign in to proceed to checkout", "error");
      router.push("/auth/login?redirect=/checkout");
    }
  }, [user, authLoading, router, showToast]);

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoadingAddresses(true);
      const data = await trpc.getAddresses({ userId: user.id });
      setAddresses(data);
      if (data.length > 0) {
        const defaultAddr = data.find((a: Address) => a.isDefault) || data[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (err) {
      console.error("Error loading addresses:", err);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user, fetchAddresses]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await trpc.getCountries({ onlyActive: true });
        setActiveCountries(data);
      } catch (err) {
        console.error("Error fetching countries:", err);
      }
    };
    fetchCountries();
  }, []);

  // Sync country selection with default currency
  useEffect(() => {
    if (!addressForm.country && currency?.country) {
      setAddressForm(prev => ({ ...prev, country: currency.country }));
    }
  }, [currency, addressForm.country]);

  // Fetch states
  useEffect(() => {
    const fetchStates = async () => {
      if (!addressForm.country) {
        setStates([]);
        return;
      }
      const countryObj = activeCountries.find(
        c => c.name.toLowerCase() === addressForm.country.toLowerCase()
      ) || (addressForm.country.toLowerCase() === currency.country.toLowerCase() ? { code: currency.countryCode } : null);

      if (!countryObj) {
        setStates([]);
        return;
      }

      try {
        setIsLoadingStates(true);
        const data = await trpc.getStatesOfCountry({ countryCode: countryObj.code });
        setStates(data);
      } catch (err) {
        console.error("Error fetching states:", err);
        setStates([]);
      } finally {
        setIsLoadingStates(false);
      }
    };
    fetchStates();
  }, [addressForm.country, activeCountries, currency]);

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      if (!addressForm.country || !addressForm.state || states.length === 0) {
        setCities([]);
        return;
      }

      const countryObj = activeCountries.find(
        c => c.name.toLowerCase() === addressForm.country.toLowerCase()
      ) || (addressForm.country.toLowerCase() === currency.country.toLowerCase() ? { code: currency.countryCode } : null);

      const stateObj = states.find(
        s => s.name.toLowerCase() === addressForm.state.toLowerCase()
      );

      if (!countryObj || !stateObj) {
        setCities([]);
        return;
      }

      try {
        setIsLoadingCities(true);
        const data = await trpc.getCitiesOfState({
          countryCode: countryObj.code,
          stateCode: stateObj.iso2
        });
        setCities(data);
      } catch (err) {
        console.error("Error fetching cities:", err);
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    };
    fetchCities();
  }, [addressForm.state, states, addressForm.country, activeCountries, currency]);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setIsProcessing(true);
      await trpc.addAddress({
        userId: user.id,
        ...addressForm
      });
      showToast("Address saved successfully", "success");
      setShowAddressForm(false);
      setAddressForm({
        fullName: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: currency.country || "",
        phone: "",
        isDefault: false,
      });
      await fetchAddresses();
    } catch (err) {
      console.error("Error creating address:", err);
      showToast("Failed to save address", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyCouponCode = () => {
    if (!couponInput) return;
    applyCoupon(couponInput);
    setCouponInput("");
    showToast("Coupon applied", "success");
  };

  const handleRemoveCouponCode = () => {
    removeCoupon();
    showToast("Coupon removed", "info");
  };

  const executePayment = async () => {
    if (!user) return;

    // Determine shipping address
    let activeAddress: Omit<Address, "id" | "userId" | "isDefault"> | null = null;
    if (selectedAddressId) {
      const matched = addresses.find(a => a.id === selectedAddressId);
      if (matched) activeAddress = matched;
    }

    if (!activeAddress) {
      showToast("Please specify a shipping address", "error");
      return;
    }

    const shippingAddressString = `${activeAddress.fullName}, ${activeAddress.addressLine1}${activeAddress.addressLine2 ? ', ' + activeAddress.addressLine2 : ''}, ${activeAddress.city}, ${activeAddress.state} - ${activeAddress.postalCode}, ${activeAddress.country}. Phone: ${activeAddress.phone || 'N/A'}`;

    try {
      setIsProcessing(true);

      // 1. Create order in our local database
      const orderRes = await trpc.createOrder({
        customerName: activeAddress.fullName,
        customerEmail: user.email,
        totalAmount: total.toFixed(2),
        shippingAddress: shippingAddressString,
      });

      if (!orderRes || !orderRes.orderId) {
        throw new Error("Failed to create order in database");
      }

      const orderId = orderRes.orderId;

      // Save shipping details
      await trpc.createOrderShipping({
        orderId,
        shippingMethodId: shippingMethod === "standard" ? 1 : 2,
        shippingAddress: shippingAddressString,
      });

      // Apply coupon details if applied
      if (couponCode && discount > 0) {
        await trpc.applyCoupon({
          orderId,
          couponCode,
          discountAmount: discount.toFixed(2),
        });
      }

      // If mock payment mode is enabled or Razorpay is not configured (indicated by key/dev mode)
      if (isMockMode || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID === "placeholder") {
        showToast("Processing simulated payment...", "info");
        // Simulate latency
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Create mock payment record
        const paymentRes = await trpc.createPayment({
          orderId,
          paymentMethod: "Razorpay (Mock)",
          amount: total.toFixed(2),
          transactionId: "pay_mock_" + Math.random().toString(36).substring(2, 11),
        });

        // Verify/complete payment status
        await trpc.updatePaymentStatus({
          id: paymentRes.paymentId,
          status: "completed",
          transactionId: "pay_mock_" + Math.random().toString(36).substring(2, 11),
        });

        // Update order status to paid (processing)
        await trpc.updateOrderStatus({
          id: orderId,
          status: "processing",
        });

        // Trigger notification
        await trpc.createNotification({
          userId: user.id,
          type: "order",
          title: "Order Placed Successfully",
          message: `Your order #${orderId} of ${formatPrice(total)} has been successfully received.`,
          actionUrl: `/account?tab=orders`,
        });

        await clearCart();
        showToast("Payment Successful!", "success");
        router.push(`/checkout/success?orderId=${orderId}`);
        return;
      }

      // 2. Real Razorpay Integration flow
      // Convert to INR since Razorpay accounts usually default to INR
      const amountInINR = currency.code === "INR" ? convertPrice(total) : total * 83.5;

      const rzOrderRes = await trpc.createRazorpayOrder({
        orderId,
        amount: amountInINR,
        currency: "INR",
      });

      const options = {
        key: rzOrderRes.keyId,
        amount: rzOrderRes.amount,
        currency: rzOrderRes.currency,
        name: "Vellvista",
        description: "Luxury Fragrance Order Checkout",
        order_id: rzOrderRes.razorpayOrderId,
        handler: async function (response: any) {
          try {
            setIsProcessing(true);
            const verifyRes = await trpc.verifyRazorpayPayment({
              orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              // Trigger notification
              await trpc.createNotification({
                userId: user.id,
                type: "order",
                title: "Payment Received",
                message: `Payment of ${formatPrice(total)} for order #${orderId} has been successfully verified.`,
                actionUrl: `/account?tab=orders`,
              });

              await clearCart();
              showToast("Payment Successful!", "success");
              router.push(`/checkout/success?orderId=${orderId}`);
            } else {
              showToast("Payment signature verification failed", "error");
            }
          } catch (err) {
            console.error("Signature verification error:", err);
            showToast("Failed to verify payment with server", "error");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: activeAddress.fullName,
          email: user.email,
          contact: activeAddress.phone || "",
        },
        theme: {
          color: "#020202",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            showToast("Payment cancelled", "warning");
          }
        }
      };

      const Razorpay = (window as any).Razorpay;
      if (Razorpay) {
        const rzp = new Razorpay(options);
        rzp.open();
      } else {
        throw new Error("Razorpay script not loaded");
      }
    } catch (err: any) {
      console.error("Checkout payment failed:", err);
      showToast(err.message || "Failed to process checkout payment", "error");
      setIsProcessing(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-secondary font-light">Loading secure checkout...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-background-alt flex items-center justify-center rounded-none mb-6">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-light text-primary mb-3">Your Cart is Empty</h1>
          <p className="text-secondary max-w-md mx-auto mb-8 font-light leading-relaxed">
            You need to add products to your cart before proceeding to checkout. Explore our premium luxury fragrances collection.
          </p>
          <Link
            href="/products"
            className="bg-primary text-inverse px-8 py-3 hover:bg-primary-light transition-all text-sm font-light uppercase tracking-wider"
          >
            Continue Shopping
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-primary">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-light">
        {/* Navigation Breadcrumb back to cart */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center text-sm text-secondary hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Cart
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Checkout Info & Shipping Form (8 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-surface p-6 border border-light">
              <h2 className="text-2xl font-light mb-6 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Shipping Address
              </h2>

              {isLoadingAddresses ? (
                <div className="flex items-center justify-center py-6 text-sm text-secondary">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading saved addresses...
                </div>
              ) : (
                <div className="space-y-4">
                  {/* List of saved addresses */}
                  {addresses.length > 0 && !showAddressForm && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          onClick={() => setSelectedAddressId(address.id)}
                          className={`p-4 border cursor-pointer transition-all ${
                            selectedAddressId === address.id
                              ? "border-primary bg-background-alt"
                              : "border-light hover:border-dark-borders"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">{address.fullName}</span>
                            {selectedAddressId === address.id && (
                              <span className="h-5 w-5 bg-primary text-inverse flex items-center justify-center rounded-full text-xs">
                                <Check className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-secondary leading-relaxed mt-1">
                            {address.addressLine1}
                            {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                            <br />
                            {address.city}, {address.state} {address.postalCode}
                            <br />
                            {address.country}
                          </p>
                          {address.phone && <p className="text-xs text-secondary mt-2">Ph: {address.phone}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Address Trigger */}
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="w-full flex items-center justify-center gap-2 border border-dashed border-dark py-4 text-sm font-light text-secondary hover:text-primary hover:border-primary transition-all bg-surface"
                    >
                      <Plus className="h-4 w-4" />
                      Add a New Shipping Address
                    </button>
                  )}

                  {/* Address Input Form */}
                  {showAddressForm && (
                    <form onSubmit={handleCreateAddress} className="space-y-4 bg-background-alt p-6 border border-light animate-fade-in">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-base font-medium">New Address Details</h3>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddressForm(false);
                            if (addresses.length > 0 && !selectedAddressId) {
                              setSelectedAddressId(addresses[0].id);
                            }
                          }}
                          className="text-xs text-secondary hover:underline"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-secondary mb-1">Full Name *</label>
                          <input
                            type="text"
                            value={addressForm.fullName}
                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-default text-sm focus:outline-none focus:border-primary"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-secondary mb-1">Phone Number *</label>
                          <input
                            type="text"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-default text-sm focus:outline-none focus:border-primary"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-secondary mb-1">Address Line 1 *</label>
                        <input
                          type="text"
                          value={addressForm.addressLine1}
                          onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                          className="w-full px-3 py-2 bg-surface border border-default text-sm focus:outline-none focus:border-primary"
                          placeholder="Street name, P.O. Box, etc."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-secondary mb-1">Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          value={addressForm.addressLine2}
                          onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                          className="w-full px-3 py-2 bg-surface border border-default text-sm focus:outline-none focus:border-primary"
                          placeholder="Apartment, suite, unit, building, etc."
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-secondary mb-1">Country *</label>
                          <select
                            value={addressForm.country}
                            onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value, state: "", city: "" })}
                            className="w-full px-3 py-2.5 bg-surface border border-default text-sm focus:outline-none focus:border-primary"
                            required
                          >
                            <option value="">Select</option>
                            {activeCountries.map((c) => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-secondary mb-1">State *</label>
                          {isLoadingStates ? (
                            <div className="px-3 py-2.5 border border-default bg-surface text-xs text-muted">Loading...</div>
                          ) : states.length > 0 ? (
                            <select
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value, city: "" })}
                              className="w-full px-3 py-2.5 bg-surface border border-default text-sm focus:outline-none"
                              required
                            >
                              <option value="">Select</option>
                              {states.map((s) => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              className="w-full px-3 py-2 bg-surface border border-default text-sm focus:outline-none"
                              placeholder="State"
                              required
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-xs text-secondary mb-1">City *</label>
                          {isLoadingCities ? (
                            <div className="px-3 py-2.5 border border-default bg-surface text-xs text-muted">Loading...</div>
                          ) : cities.length > 0 ? (
                            <select
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="w-full px-3 py-2.5 bg-surface border border-default text-sm focus:outline-none"
                              required
                            >
                              <option value="">Select</option>
                              {cities.map((c) => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="w-full px-3 py-2 bg-surface border border-default text-sm focus:outline-none"
                              placeholder="City"
                              required
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-xs text-secondary mb-1">Postal Code *</label>
                          <input
                            type="text"
                            value={addressForm.postalCode}
                            onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                            className="w-full px-3 py-2 bg-surface border border-default text-sm focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 items-center">
                        <input
                          id="isDefault"
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          className="accent-primary"
                        />
                        <label htmlFor="isDefault" className="text-xs text-secondary cursor-pointer">
                          Set as default shipping address
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-primary text-inverse py-2.5 text-sm hover:bg-primary-light transition-all flex items-center justify-center"
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save and Use Address
                      </button>
                    </form>
                  )}
                </div>
              )}
            </section>

            {/* Shipping Method */}
            <section className="bg-surface p-6 border border-light">
              <h2 className="text-2xl font-light mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Shipping Options
              </h2>

              <div className="space-y-4">
                <div
                  onClick={() => setShippingMethod("standard")}
                  className={`p-4 border cursor-pointer flex justify-between items-center transition-all ${
                    shippingMethod === "standard" ? "border-primary bg-background-alt" : "border-light"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-primary">Standard Shipping</p>
                    <p className="text-xs text-secondary mt-1">Delivered within 3-5 business days</p>
                  </div>
                  <span className="text-sm font-semibold">
                    {subtotal >= 50 ? "FREE" : formatPrice(5.00)}
                  </span>
                </div>

                <div
                  onClick={() => setShippingMethod("express")}
                  className={`p-4 border cursor-pointer flex justify-between items-center transition-all ${
                    shippingMethod === "express" ? "border-primary bg-background-alt" : "border-light"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-primary">Express Shipping</p>
                    <p className="text-xs text-secondary mt-1">Delivered within 1-2 business days</p>
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(15.00)}</span>
                </div>
              </div>
            </section>

            {/* Developer Simulated Mode Toggle */}
            <section className="p-4 bg-background-alt border border-dashed border-dark flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-primary flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-success-dark" />
                  Developer Sandbox Mode
                </p>
                <p className="text-xs text-secondary mt-0.5">
                  Simulate checkout payment success without active Razorpay API keys.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMockMode}
                  onChange={(e) => setIsMockMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </section>
          </div>

          {/* RIGHT: Order Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface p-6 border border-light sticky top-6">
              <h2 className="text-lg font-semibold border-b border-light pb-4 mb-6">Order Summary</h2>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto no-scrollbar space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-primary">{item.name}</p>
                      <p className="text-xs text-secondary mt-1">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Promo Coupon Form */}
              <div className="border-t border-light pt-6 mb-6">
                <p className="text-xs text-secondary mb-2">Have a coupon code? Try "SAVE10"</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-default text-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleApplyCouponCode}
                    className="bg-primary text-inverse px-4 py-2 text-xs font-light hover:bg-primary-light transition-all uppercase tracking-wider"
                  >
                    Apply
                  </button>
                </div>

                {couponCode && (
                  <div className="mt-3 flex items-center justify-between bg-success-light border border-success/30 px-3 py-2">
                    <span className="text-xs text-success-dark font-medium flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Coupon "{couponCode}" Applied
                    </span>
                    <button onClick={handleRemoveCouponCode} className="text-xs text-error-dark hover:underline">
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Checkout Bill Calculations */}
              <div className="border-t border-light pt-6 space-y-3 mb-6">
                <div className="flex justify-between text-sm text-secondary">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-secondary">
                  <span>Tax (8%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-sm text-secondary">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-success-dark font-medium">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold border-t border-light pt-3 text-primary">
                  <span>Total Amount</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Complete Order Payment Button */}
              <button
                onClick={executePayment}
                disabled={isProcessing || addresses.length === 0 && !showAddressForm}
                className="w-full bg-primary text-inverse py-3 hover:bg-primary-light transition-all flex items-center justify-center font-light uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing Secure Payment...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2 text-xs" />
                    Pay {formatPrice(total)}
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-secondary text-center">
                <ShieldCheck className="h-4 w-4 text-secondary" />
                <span>128-bit SSL Secure Payment checkout powered by Razorpay.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
