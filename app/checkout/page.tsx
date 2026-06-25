"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import { getProductImageUrl } from "@/app/utils/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useCart } from "@/context/CartProvider";
import { useCurrency } from "@/context/CurrencyProvider";
import { useToast } from "@/context/ToastProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trpc } from "@/app/utils/trpc";
import { ShoppingBag, Lock, MapPin, CreditCard, ChevronLeft, ShieldCheck, Sparkles, Loader2, Plus, Check, Smartphone, Landmark, Wallet, QrCode } from "lucide-react";

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

const getPaymentIcon = (code: string) => {
  switch (code.toLowerCase()) {
    case 'credit_card':
    case 'debit_card':
      return <CreditCard className="h-5 w-5 text-primary shrink-0" />;
    case 'gpay':
      return <Smartphone className="h-5 w-5 text-primary shrink-0" />;
    case 'upi':
      return <QrCode className="h-5 w-5 text-primary shrink-0" />;
    case 'net_banking':
      return <Landmark className="h-5 w-5 text-primary shrink-0" />;
    default:
      return <Wallet className="h-5 w-5 text-primary shrink-0" />;
  }
};

export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { items, clearCart, couponCode, discountRate, applyCoupon, removeCoupon, isLoading: isCartLoading } = useCart();
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

  const [shippingMethodsList, setShippingMethodsList] = useState<{ id: number; name: string; description: string | null; cost: string; estimatedDays: number | null; isActive: boolean }[]>([]);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<number | null>(null);
  const [paymentMethodsList, setPaymentMethodsList] = useState<{ id: number; name: string; code: string; description: string | null; isActive: boolean }[]>([]);
  const [selectedPaymentMethodCode, setSelectedPaymentMethodCode] = useState<string>("");
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

  const [addressErrors, setAddressErrors] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    postalCode: "",
  });

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const validateAddressForm = () => {
    const errors = {
      fullName: "",
      phone: "",
      addressLine1: "",
      postalCode: "",
    };
    let isValid = true;

    // Full Name validation
    const fullNameTrimmed = addressForm.fullName.trim();
    if (!fullNameTrimmed) {
      errors.fullName = "Full name is required";
      isValid = false;
    } else if (fullNameTrimmed.length < 3) {
      errors.fullName = "Full name must be at least 3 characters";
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(fullNameTrimmed)) {
      errors.fullName = "Full name can only contain letters and spaces";
      isValid = false;
    }

    // Phone validation
    const phoneTrimmed = addressForm.phone.trim();
    if (!phoneTrimmed) {
      errors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\+?[0-9]{8,15}$/.test(phoneTrimmed)) {
      errors.phone = "Please enter a valid phone number (8-15 digits)";
      isValid = false;
    }

    // Address Line 1 validation
    const addressLine1Trimmed = addressForm.addressLine1.trim();
    if (!addressLine1Trimmed) {
      errors.addressLine1 = "Address Line 1 is required";
      isValid = false;
    } else if (addressLine1Trimmed.length < 5) {
      errors.addressLine1 = "Address must be at least 5 characters";
      isValid = false;
    }

    // Postal Code validation
    const postalCodeTrimmed = addressForm.postalCode.trim();
    if (!postalCodeTrimmed) {
      errors.postalCode = "Postal code is required";
      isValid = false;
    } else if (!/^[a-zA-Z0-9\s-]{4,10}$/.test(postalCodeTrimmed)) {
      errors.postalCode = "Please enter a valid postal code (4-10 alphanumeric characters)";
      isValid = false;
    }

    setAddressErrors(errors);
    return isValid;
  };

  // Fetch shipping methods from DB
  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        const data = await trpc.getShippingMethods();
        setShippingMethodsList(data);
        if (data.length > 0) {
          setSelectedShippingMethodId(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching shipping methods:", err);
      }
    };
    fetchShippingMethods();
  }, []);

  // Fetch payment methods from DB
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const data = await trpc.getPaymentMethods();
        setPaymentMethodsList(data);
        if (data.length > 0) {
          setSelectedPaymentMethodCode(data[0].code);
        }
      } catch (err) {
        console.error("Error fetching payment methods:", err);
      }
    };
    fetchPaymentMethods();
  }, []);

  // Calculate pricing summary
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const TAX_RATE = 0.08;
  const tax = subtotal * TAX_RATE;
  const discount = subtotal * discountRate;

  const activeShippingMethod = shippingMethodsList.find(m => m.id === selectedShippingMethodId);
  const isFreeStandard = activeShippingMethod && subtotal >= 50 && activeShippingMethod.name.toLowerCase().includes("standard");
  const shippingCost = activeShippingMethod ? (isFreeStandard ? 0 : parseFloat(activeShippingMethod.cost)) : 0;

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

    if (!validateAddressForm()) {
      showToast("Please fix the validation errors in the address form", "error");
      return;
    }

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
      setAddressErrors({
        fullName: "",
        phone: "",
        addressLine1: "",
        postalCode: "",
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
    showToast("Coupon removed", "success");
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
        shippingMethodId: selectedShippingMethodId || 1,
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

      const activePaymentMethod = paymentMethodsList.find(pm => pm.code === selectedPaymentMethodCode);
      const isRealPayment = !isMockMode || !isAdmin;

      // If mock payment mode is enabled
      if (!isRealPayment) {
        showToast(`Processing simulated payment via ${activePaymentMethod?.name || "Payment Method"}...`, "warning");
        // Simulate latency
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Create payment record
        const paymentRes = await trpc.createPayment({
          orderId,
          paymentMethod: activePaymentMethod ? activePaymentMethod.name : "Simulated Payment",
          amount: total.toFixed(2),
          transactionId: "pay_" + selectedPaymentMethodCode + "_" + Math.random().toString(36).substring(2, 11),
        });

        // Verify/complete payment status
        await trpc.updatePaymentStatus({
          id: paymentRes.paymentId,
          status: "completed",
          transactionId: "pay_" + selectedPaymentMethodCode + "_" + Math.random().toString(36).substring(2, 11),
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
        paymentMethod: activePaymentMethod?.name || "Razorpay",
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
          method: selectedPaymentMethodCode === "credit_card" || selectedPaymentMethodCode === "debit_card"
            ? "card"
            : selectedPaymentMethodCode === "upi" || selectedPaymentMethodCode === "gpay"
            ? "upi"
            : selectedPaymentMethodCode === "net_banking"
            ? "netbanking"
            : undefined,
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
    return <CheckoutSkeleton />;
  }

  if (isCartLoading) {
    return <CheckoutSkeleton />;
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
          <Link href="/cart" className="inline-flex items-center text-sm text-secondary hover:text-primary transition-colors gap-1.5">
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span>Back to Cart</span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-32 bg-background-alt animate-pulse border border-light" />
                  <div className="h-32 bg-background-alt animate-pulse border border-light" />
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
                      className="w-full border border-dashed border-dark py-4 text-sm font-light text-secondary hover:text-primary hover:border-primary transition-all bg-surface"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Plus className="h-4 w-4 shrink-0" />
                        <span>Add a New Shipping Address</span>
                      </span>
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
                            setAddressErrors({
                              fullName: "",
                              phone: "",
                              addressLine1: "",
                              postalCode: "",
                            });
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
                            onChange={(e) => {
                              setAddressForm({ ...addressForm, fullName: e.target.value });
                              if (addressErrors.fullName) {
                                setAddressErrors(prev => ({ ...prev, fullName: "" }));
                              }
                            }}
                            className={`w-full px-3 py-2 bg-surface border text-sm focus:outline-none focus:border-primary ${
                              addressErrors.fullName ? "border-error" : "border-default"
                            }`}
                            required
                          />
                          {addressErrors.fullName && (
                            <p className="text-xs text-error mt-1">{addressErrors.fullName}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-secondary mb-1">Phone Number *</label>
                          <input
                            type="text"
                            value={addressForm.phone}
                            onChange={(e) => {
                              setAddressForm({ ...addressForm, phone: e.target.value });
                              if (addressErrors.phone) {
                                setAddressErrors(prev => ({ ...prev, phone: "" }));
                              }
                            }}
                            className={`w-full px-3 py-2 bg-surface border text-sm focus:outline-none focus:border-primary ${
                              addressErrors.phone ? "border-error" : "border-default"
                            }`}
                            required
                          />
                          {addressErrors.phone && (
                            <p className="text-xs text-error mt-1">{addressErrors.phone}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-secondary mb-1">Address Line 1 *</label>
                        <input
                          type="text"
                          value={addressForm.addressLine1}
                          onChange={(e) => {
                            setAddressForm({ ...addressForm, addressLine1: e.target.value });
                            if (addressErrors.addressLine1) {
                              setAddressErrors(prev => ({ ...prev, addressLine1: "" }));
                            }
                          }}
                          className={`w-full px-3 py-2 bg-surface border text-sm focus:outline-none focus:border-primary ${
                            addressErrors.addressLine1 ? "border-error" : "border-default"
                          }`}
                          placeholder="Street name, P.O. Box, etc."
                          required
                        />
                        {addressErrors.addressLine1 && (
                          <p className="text-xs text-error mt-1">{addressErrors.addressLine1}</p>
                        )}
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
                            onChange={(e) => {
                              setAddressForm({ ...addressForm, postalCode: e.target.value });
                              if (addressErrors.postalCode) {
                                setAddressErrors(prev => ({ ...prev, postalCode: "" }));
                              }
                            }}
                            className={`w-full px-3 py-2 bg-surface border text-sm focus:outline-none focus:border-primary ${
                              addressErrors.postalCode ? "border-error" : "border-default"
                            }`}
                            required
                          />
                          {addressErrors.postalCode && (
                            <p className="text-xs text-error mt-1">{addressErrors.postalCode}</p>
                          )}
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
                        className="w-full bg-primary text-inverse py-2.5 text-sm hover:bg-primary-light transition-all"
                      >
                        <span className="flex items-center justify-center gap-2">
                          {isProcessing && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
                          <span>Save and Use Address</span>
                        </span>
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
                {shippingMethodsList.length === 0 ? (
                  <div className="space-y-4">
                    <div className="h-16 bg-background-alt animate-pulse border border-light" />
                    <div className="h-16 bg-background-alt animate-pulse border border-light" />
                  </div>
                ) : (
                  shippingMethodsList.map((method) => {
                    const isFree = subtotal >= 50 && method.name.toLowerCase().includes("standard");
                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedShippingMethodId(method.id)}
                        className={`p-4 border cursor-pointer flex justify-between items-center transition-all ${
                          selectedShippingMethodId === method.id ? "border-primary bg-background-alt" : "border-light hover:border-dark-borders"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-primary">{method.name}</p>
                          {method.description && (
                            <p className="text-xs text-secondary mt-1">{method.description}</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold">
                          {isFree ? "FREE" : formatPrice(parseFloat(method.cost))}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Payment Methods */}
            <section className="bg-surface p-6 border border-light">
              <h2 className="text-2xl font-light mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Options
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentMethodsList.length === 0 ? (
                  <>
                    <div className="h-20 bg-background-alt animate-pulse border border-light" />
                    <div className="h-20 bg-background-alt animate-pulse border border-light" />
                    <div className="h-20 bg-background-alt animate-pulse border border-light" />
                    <div className="h-20 bg-background-alt animate-pulse border border-light" />
                  </>
                ) : (
                  paymentMethodsList.map((method) => {
                    const isSelected = selectedPaymentMethodCode === method.code;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPaymentMethodCode(method.code)}
                        className={`p-4 border cursor-pointer flex gap-3 transition-all relative select-none ${
                          isSelected ? "border-primary bg-background-alt font-medium" : "border-light hover:border-dark-borders"
                        }`}
                      >
                        <div className="mt-0.5">
                          {getPaymentIcon(method.code)}
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                          <p className="text-sm font-semibold text-primary">{method.name}</p>
                          {method.description && (
                            <p className="text-xs text-secondary mt-1 leading-snug">{method.description}</p>
                          )}
                        </div>
                        <div className="absolute top-4 right-4 h-4 w-4 border border-primary rounded-full flex items-center justify-center shrink-0">
                          {isSelected && (
                            <div className="h-2 w-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Developer Simulated Mode Toggle - Admin Only */}
            {isAdmin && (
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
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isMockMode}
                    onChange={(e) => setIsMockMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-white border border-black rounded-full transition-all duration-200 ease-in-out peer-checked:bg-black relative after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-black after:rounded-full after:h-4 after:w-4 after:transition-all duration-200 ease-in-out peer-checked:after:translate-x-4 peer-checked:after:bg-white"></div>
                </label>
              </section>
            )}
          </div>

          {/* RIGHT: Order Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="bg-surface p-6 border border-light">
              <h2 className="text-lg font-semibold border-b border-light pb-4 mb-6">Order Summary</h2>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto no-scrollbar space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex items-center gap-4">
                    <div className="w-12 h-12 relative flex-shrink-0 border border-light bg-background-alt">
                      <Image
                        src={getProductImageUrl(item.image)}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-primary">{item.name}</p>
                      <p className="text-xs text-secondary mt-1">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
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
                className="w-full bg-primary text-inverse py-3 hover:bg-primary-light transition-all font-light uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    <span>Processing Secure Payment...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="h-4 w-4 shrink-0" />
                    <span>Pay {formatPrice(total)}</span>
                  </span>
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

function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-background text-primary">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-light">
        <div className="mb-8">
          <div className="h-4 w-24 bg-background-alt animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Checkout Info & Shipping Form (8 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-surface p-6 border border-light">
              <div className="h-6 w-48 bg-background-alt animate-pulse mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-32 bg-background-alt animate-pulse border border-light" />
                <div className="h-32 bg-background-alt animate-pulse border border-light" />
              </div>
            </section>

            <section className="bg-surface p-6 border border-light">
              <div className="h-6 w-48 bg-background-alt animate-pulse mb-6" />
              <div className="space-y-4">
                <div className="h-16 bg-background-alt animate-pulse border border-light" />
                <div className="h-16 bg-background-alt animate-pulse border border-light" />
              </div>
            </section>

            <section className="bg-surface p-6 border border-light">
              <div className="h-6 w-48 bg-background-alt animate-pulse mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-20 bg-background-alt animate-pulse border border-light" />
                <div className="h-20 bg-background-alt animate-pulse border border-light" />
                <div className="h-20 bg-background-alt animate-pulse border border-light" />
                <div className="h-20 bg-background-alt animate-pulse border border-light" />
              </div>
            </section>
          </div>

          {/* RIGHT: Order Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface p-6 border border-light space-y-6">
              <div className="h-6 w-36 bg-background-alt animate-pulse pb-4" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-background-alt animate-pulse flex-shrink-0 border border-light" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-background-alt animate-pulse" />
                    <div className="h-3 w-16 bg-background-alt animate-pulse" />
                  </div>
                  <div className="h-4 w-12 bg-background-alt animate-pulse shrink-0" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-background-alt animate-pulse flex-shrink-0 border border-light" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-background-alt animate-pulse" />
                    <div className="h-3 w-16 bg-background-alt animate-pulse" />
                  </div>
                  <div className="h-4 w-12 bg-background-alt animate-pulse shrink-0" />
                </div>
              </div>

              <div className="border-t border-light pt-6 flex gap-2">
                <div className="h-10 bg-background-alt animate-pulse flex-1 border border-light" />
                <div className="h-10 w-20 bg-background-alt animate-pulse" />
              </div>

              <div className="border-t border-light pt-6 space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-background-alt animate-pulse" />
                  <div className="h-4 w-12 bg-background-alt animate-pulse" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-background-alt animate-pulse" />
                  <div className="h-4 w-12 bg-background-alt animate-pulse" />
                </div>
                <div className="flex justify-between border-t border-light pt-3">
                  <div className="h-5 w-24 bg-background-alt animate-pulse" />
                  <div className="h-5 w-16 bg-background-alt animate-pulse" />
                </div>
              </div>

              <div className="h-12 bg-background-alt animate-pulse w-full" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
