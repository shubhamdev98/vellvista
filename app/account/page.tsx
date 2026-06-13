"use client";

import { useState, useEffect, Suspense } from "react";
import { ShoppingBag, Heart } from "lucide-react";
import { useAuth } from "../../context/AuthProvider";
import { useWishlist } from "../../context/WishlistProvider";
import { useCart } from "../../context/CartProvider";
import Link from "next/link";
import Image from "next/image";
import { useCurrency } from "../../context/CurrencyProvider";
import { getProductImageUrl } from "../utils/image";
import { useRouter, useSearchParams } from "next/navigation";
import AccountLayout from "../../components/AccountLayout";

function AccountPageContent() {
  const { user } = useAuth();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"orders" | "wishlist">("orders");

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
      // Default: redirect to /account/overview
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
            <div className="space-y-4">
              {[
                { id: "ORD-1001", date: "May 9, 2026", status: "Shipped", amount: 149.99, product: "Chanel No. 5", qty: 1 },
                { id: "ORD-1002", date: "May 8, 2026", status: "Delivered", amount: 89.99, product: "Dior Sauvage", qty: 1 },
                { id: "ORD-1003", date: "May 7, 2026", status: "Processing", amount: 199.99, product: "Tom Ford Black Orchid", qty: 2 },
                { id: "ORD-1004", date: "May 6, 2026", status: "Shipped", amount: 129.99, product: "Yves Saint Laurent", qty: 1 },
                { id: "ORD-1005", date: "May 5, 2026", status: "Delivered", amount: 79.99, product: "Gucci Guilty", qty: 1 },
              ].map((order) => (
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
                            order.status === "Delivered"
                              ? "bg-success-light text-success-dark"
                              : order.status === "Shipped"
                              ? "bg-info-light text-info-dark"
                              : "bg-warning-light text-warning-dark"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="text-xs text-secondary">Placed on {order.date}</div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-semibold text-primary text-sm">{formatPrice(order.amount)}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-surface-alt rounded-none flex items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-muted" />
                    </div>
                    <div className="flex-1">
                      <div className="font-light text-primary text-sm">{order.product}</div>
                      <div className="text-xs text-secondary">Quantity: {order.qty}</div>
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-4 border-t border-light">
                    <button className="px-4 py-2 bg-surface border border-dark rounded-none text-sm font-light text-secondary hover:bg-surface-alt transition-colors">
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-surface border border-dark rounded-none text-sm font-light text-secondary hover:bg-surface-alt transition-colors">
                      Track Order
                    </button>
                    <button className="px-4 py-2 bg-surface border border-dark text-sm font-light text-secondary hover:bg-surface-alt transition-colors">
                      Reorder
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
                  className="inline-block border border-primary text-primary px-6 py-2 hover:bg-primary hover:text-inverse transition-colors text-sm font-light"
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
                            className="p-2 text-secondary hover:text-error hover:bg-error-light rounded-none transition-colors"
                            aria-label="Remove from wishlist"
                          >
                            <Heart className="h-5 w-5 fill-current text-primary" />
                          </button>
                          <button
                            onClick={() =>
                              addItem({
                                id: item.product.id,
                                name: item.product.name,
                                price: parseFloat(item.product.price),
                                image: item.product.image,
                              })
                            }
                            className="px-3 py-2 bg-primary text-inverse text-xs font-light rounded-none hover:bg-primary-light transition-colors"
                          >
                            Add to Cart
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

  return <AccountLayout activeTab={activeTab}>{renderContent()}</AccountLayout>;
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AccountPageContent />
    </Suspense>
  );
}
