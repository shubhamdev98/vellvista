"use client";

import { useState, useEffect, Suspense } from "react";
import { ShoppingBag, Heart, X, CheckCircle2, Clock, Truck, MapPin, Eye } from "lucide-react";
import { useAuth } from "../../context/AuthProvider";
import { useWishlist } from "../../context/WishlistProvider";
import { useCart } from "../../context/CartProvider";
import Link from "next/link";
import Image from "next/image";
import { useCurrency } from "../../context/CurrencyProvider";
import { getProductImageUrl } from "../utils/image";
import { useRouter, useSearchParams } from "next/navigation";
import AccountLayout from "../../components/AccountLayout";
import { useUserOrders, Order } from "../hooks/useApi";

function AccountPageContent() {
  const { user } = useAuth();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"orders" | "wishlist">("orders");
  const [clickedProductId, setClickedProductId] = useState<number | null>(null);
  const { data: userOrders, isLoading: isLoadingOrders } = useUserOrders(user?.email || undefined);

  // Modal states for order details and tracking
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [selectedOrderTracking, setSelectedOrderTracking] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;

    const tab = searchParams.get("tab");
    if (tab === "orders") {
      setActiveTab("orders");
    } else if (tab === "wishlist") {
      setActiveTab("wishlist");
    } else if (tab === "overview") {
      router.replace("/account/overview");
    } else if (tab === "profile") {
      router.replace("/profile/information");
    } else if (tab === "addresses") {
      router.replace("/address");
    } else {
      router.replace("/account/overview");
    }
  }, [searchParams, router, user]);

  if (!user) return null;

  const renderContent = () => {
    switch (activeTab) {
      case "orders":
        return (
          <div className="bg-surface p-6 border border-light">
            <h3 className="text-xl font-semibold text-primary mb-6">Order History</h3>
            
            {isLoadingOrders ? (
              <div className="space-y-4">
                <div className="h-32 bg-background-alt animate-pulse border border-light" />
                <div className="h-32 bg-background-alt animate-pulse border border-light" />
              </div>
            ) : !userOrders || userOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-muted mx-auto mb-4" />
                <p className="text-secondary mb-4">You have not placed any orders yet</p>
                <Link
                  href="/products"
                  className="inline-block border border-primary text-primary px-6 py-2 hover:bg-primary hover:text-inverse transition-colors text-sm font-light cursor-pointer"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => {
                  const orderDate = order.createdAt 
                    ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "N/A";
                  const displayStatus = order.status.charAt(0).toUpperCase() + order.status.slice(1);
                  const isCompleted = order.status === "completed" || order.status === "shipped" || order.status === "delivered";
                  const isCancelled = order.status === "cancelled";
                  
                  return (
                    <div
                      key={order.id}
                      className="border border-default rounded-none p-6 hover:border-dark transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="font-semibold text-primary text-sm">Order #{order.id}</div>
                            <span
                              className={`inline-block px-2 py-1 text-xs font-light ${
                                isCompleted
                                  ? "bg-success-light text-success-dark"
                                  : isCancelled
                                  ? "bg-error-light text-error-dark"
                                  : "bg-warning-light text-warning-dark"
                              }`}
                            >
                              {displayStatus}
                            </span>
                          </div>
                          <div className="text-xs text-secondary">Placed on {orderDate}</div>
                        </div>
                      </div>

                      {/* Render Product Items & Images */}
                      <div className="mb-4 py-2 space-y-3">
                        {(() => {
                          const orderItemsToRender = order.items && order.items.length > 0 ? order.items : [
                            {
                              id: order.id,
                              productName: "VellVista Silk Luxury Apparel",
                              productImage: "https://res.cloudinary.com/dujjidn0e/image/upload/v1781544157/vellvista/product/a2dhcmalhjnw4xfrj6df.jpg",
                              quantity: 1,
                              unitPrice: order.totalAmount,
                              totalPrice: order.totalAmount,
                            }
                          ];

                          return orderItemsToRender.map((item, idx) => (
                            <div key={item.id || idx} className="flex items-center gap-4 py-3">
                              <div className="w-16 h-16 relative bg-background-alt border border-default overflow-hidden shrink-0">
                                <Image
                                  src={getProductImageUrl(item.productImage || '')}
                                  alt={item.productName || 'Product'}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-primary text-sm truncate">{item.productName || 'VellVista Luxury Item'}</p>
                                <p className="text-xs text-secondary mt-0.5">
                                  Qty: {item.quantity || 1}
                                </p>
                              </div>
                              <span className="font-semibold text-primary text-sm shrink-0">
                                {formatPrice(parseFloat(String(item.totalPrice || order.totalAmount)))}
                              </span>
                            </div>
                          ));
                        })()}
                      </div>

                      <div className="flex space-x-3 pt-2">
                        <button
                          onClick={() => setSelectedOrderDetails(order)}
                          className="px-4 py-2 bg-surface border border-dark rounded-none text-sm font-light text-secondary hover:text-primary hover:bg-background-alt transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => setSelectedOrderTracking(order)}
                          className="px-4 py-2 bg-surface border border-dark rounded-none text-sm font-light text-secondary hover:text-primary hover:bg-background-alt transition-colors cursor-pointer"
                        >
                          Track Order
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "wishlist":
        return (
          <div className="bg-surface p-6 border border-light">
            <h3 className="text-xl font-semibold text-primary mb-6">My Wishlist</h3>
            {wishlistItems.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-muted mx-auto mb-4" />
                <p className="text-secondary mb-4">Your wishlist is empty</p>
                <Link
                  href="/products"
                  className="inline-block border border-primary text-primary px-6 py-2 hover:bg-primary hover:text-inverse transition-colors text-sm font-light cursor-pointer"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-default rounded-none overflow-hidden hover:border-dark transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-square relative w-full bg-surface-alt flex items-center justify-center">
                        <Image
                          src={getProductImageUrl(item.product.image)}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 30vw, 20vw"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-primary mb-1 line-clamp-1">{item.product.name}</h3>
                        <p className="text-xs text-secondary mb-3">{item.product.brand}</p>
                      </div>
                    </div>
                    <div className="p-4 pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-primary">
                          {formatPrice(parseFloat(item.product.price))}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => removeFromWishlist(item.product.id)}
                            className="p-2 text-secondary hover:text-error hover:bg-error-light rounded-none transition-colors cursor-pointer"
                            aria-label="Remove from wishlist"
                          >
                            <Heart className="h-5 w-5 fill-current text-primary" />
                          </button>
                          <button
                            onClick={async () => {
                              setClickedProductId(item.product.id);
                              const timer = setTimeout(() => setClickedProductId(null), 1000);
                              try {
                                await addItem({
                                  id: item.product.id,
                                  name: item.product.name,
                                  price: parseFloat(item.product.price),
                                  image: item.product.image,
                                });
                              } catch (error) {
                                clearTimeout(timer);
                                setClickedProductId(null);
                              }
                            }}
                            className={`px-3 py-2 text-xs font-light rounded-none transition-colors duration-75 cursor-pointer ${
                              clickedProductId === item.product.id
                                ? "bg-green-600 text-white"
                                : "bg-primary text-inverse hover:bg-secondary hover:text-primary"
                            }`}
                          >
                            {clickedProductId === item.product.id ? "Added!" : "Add to Cart"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AccountLayout activeTab={activeTab}>
      {renderContent()}

      {/* VIEW DETAILS MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-surface border border-default p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in">
            <div className="flex items-center justify-between border-b border-light pb-4">
              <div>
                <h3 className="text-xl font-semibold text-primary">
                  Order #{selectedOrderDetails.id} Details
                </h3>
                <p className="text-xs text-secondary mt-1">
                  Placed on {selectedOrderDetails.createdAt ? new Date(selectedOrderDetails.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "N/A"}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-secondary hover:text-primary p-2 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-background-alt p-4 border border-default">
              <div>
                <span className="font-semibold text-primary block mb-1">Customer Information</span>
                <p className="text-secondary">{selectedOrderDetails.customerName}</p>
                <p className="text-secondary">{selectedOrderDetails.customerEmail}</p>
              </div>
              <div>
                <span className="font-semibold text-primary block mb-1">Shipping Address</span>
                <p className="text-secondary leading-relaxed">{selectedOrderDetails.shippingAddress}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-primary border-b border-light pb-2">Order Items</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                {(() => {
                  const modalItemsToRender = selectedOrderDetails.items && selectedOrderDetails.items.length > 0 ? selectedOrderDetails.items : [
                    {
                      id: selectedOrderDetails.id,
                      productName: "VellVista Silk Luxury Apparel",
                      productImage: "https://res.cloudinary.com/dujjidn0e/image/upload/v1781544157/vellvista/product/a2dhcmalhjnw4xfrj6df.jpg",
                      quantity: 1,
                      unitPrice: selectedOrderDetails.totalAmount,
                      totalPrice: selectedOrderDetails.totalAmount,
                    }
                  ];

                  return modalItemsToRender.map((item: any, idx: number) => (
                    <div key={item.id || item.productId || idx} className="flex items-center gap-4 py-3 text-xs">
                      <div className="w-14 h-14 relative bg-surface border border-default overflow-hidden shrink-0">
                        <Image
                          src={getProductImageUrl(item.productImage || 'https://res.cloudinary.com/dujjidn0e/image/upload/v1781544157/vellvista/product/a2dhcmalhjnw4xfrj6df.jpg')}
                          alt={item.productName || 'Product'}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-primary text-sm truncate">{item.productName || 'VellVista Silk Luxury Apparel'}</p>
                        <p className="text-secondary mt-0.5">Quantity: {item.quantity || 1}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{formatPrice(parseFloat(String(item.totalPrice || selectedOrderDetails.totalAmount)))}</p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="border-t border-light pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-secondary">
                <span>Status</span>
                <span className="font-semibold uppercase text-primary">{selectedOrderDetails.status}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-primary pt-2 border-t border-light">
                <span>Total Paid</span>
                <span>{formatPrice(parseFloat(selectedOrderDetails.totalAmount))}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-6 py-2 bg-primary text-inverse text-xs uppercase font-light tracking-wider hover:bg-primary-light transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRACK ORDER MODAL */}
      {selectedOrderTracking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-surface border border-default p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in">
            <div className="flex items-start justify-between border-b border-light pb-4">
              <div className="pr-2">
                <h3 className="text-lg sm:text-xl font-semibold text-primary">
                  Track Order #{selectedOrderTracking.id}
                </h3>
                <div className="text-xs text-secondary mt-1.5 space-y-0.5">
                  <p>
                    Carrier: <span className="font-medium text-primary">VellVista Express Logistics</span>
                  </p>
                  <p>
                    Tracking ID: <span className="font-mono font-medium text-primary">VV-{selectedOrderTracking.id}-9841</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderTracking(null)}
                className="text-secondary hover:text-primary p-2 text-lg cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Tracking Stepper Timeline */}
            <div className="pt-4 pb-6 px-1 sm:px-4">
              {(() => {
                const statusLower = selectedOrderTracking.status.toLowerCase();
                const getProgressPercent = () => {
                  if (statusLower === 'delivered') return 80;
                  if (statusLower === 'shipped') return 60;
                  if (statusLower === 'processing') return 40;
                  if (statusLower === 'confirmed') return 20;
                  return 0;
                };

                const steps = [
                  { label: 'Order Placed', stepStatus: 'completed' },
                  { label: 'Confirmed', stepStatus: ['confirmed', 'processing', 'shipped', 'delivered'].includes(statusLower) ? 'completed' : 'pending' },
                  { label: 'Processing', stepStatus: ['processing', 'shipped', 'delivered'].includes(statusLower) ? 'completed' : 'pending' },
                  { label: 'Out for Delivery', stepStatus: ['shipped', 'delivered'].includes(statusLower) ? 'completed' : 'pending' },
                  { label: 'Delivered', stepStatus: statusLower === 'delivered' ? 'completed' : 'pending' },
                ];

                return (
                  <div className="relative flex items-start justify-between w-full">
                    {/* Background Full Line */}
                    <div className="absolute left-[10%] right-[10%] top-4 -translate-y-1/2 h-[3px] bg-border-default z-0" />
                    
                    {/* Active Completed Progress Line */}
                    <div
                      className="absolute left-[10%] top-4 -translate-y-1/2 h-[3px] bg-emerald-600 z-0 transition-all duration-500"
                      style={{ width: `${getProgressPercent()}%` }}
                    />

                    {steps.map((step, idx) => (
                      <div key={idx} className="relative z-10 flex flex-col items-center flex-1 min-w-0">
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0 ${
                            step.stepStatus === 'completed'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-surface text-secondary border-default'
                          }`}
                        >
                          {step.stepStatus === 'completed' ? '✓' : idx + 1}
                        </div>
                        <span className="mt-2 text-[8px] sm:text-[11px] font-medium text-primary text-center leading-tight break-words w-full px-0.5">
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="bg-background-alt p-4 border border-default space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-light/70">
                <span className="text-secondary font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary shrink-0" /> Estimated Delivery Date
                </span>
                <span className="font-semibold text-primary text-xs pl-6 sm:pl-0">3-5 Business Days</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 pt-0.5">
                <span className="text-secondary font-medium flex items-center gap-2 shrink-0">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Destination
                </span>
                <span className="font-medium text-primary leading-relaxed pl-6 sm:pl-0 sm:text-right break-words max-w-full sm:max-w-[320px]">
                  {selectedOrderTracking.shippingAddress}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrderTracking(null)}
                className="px-6 py-2 bg-primary text-inverse text-xs uppercase font-light tracking-wider hover:bg-primary-light transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AccountPageContent />
    </Suspense>
  );
}
