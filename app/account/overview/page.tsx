"use client";

import AccountLayout from "../../../components/AccountLayout";
import { useAuth } from "../../../context/AuthProvider";
import { useWishlist } from "../../../context/WishlistProvider";
import { useCurrency } from "../../../context/CurrencyProvider";
import { ShoppingBag, Heart, User } from "lucide-react";
import Link from "next/link";

export default function AccountOverviewPage() {
  const { user } = useAuth();
  const { wishlistItems } = useWishlist();
  const { formatPrice } = useCurrency();

  if (!user) return null;

  return (
    <AccountLayout activeTab="overview">
      <div className="space-y-6">
        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface p-6 border border-light">
            <div className="flex items-center justify-between mb-4">
              <ShoppingBag className="h-6 w-6 text-secondary" />
              <span className="text-3xl font-semibold text-primary">12</span>
            </div>
            <p className="text-secondary font-light">Total Orders</p>
          </div>
          <div className="bg-surface p-6 border border-light">
            <div className="flex items-center justify-between mb-4">
              <Heart className="h-6 w-6 text-secondary" />
              <span className="text-3xl font-semibold text-primary">{wishlistItems.length}</span>
            </div>
            <p className="text-secondary font-light">Wishlist Items</p>
          </div>
          <div className="bg-surface p-6 border border-light">
            <div className="flex items-center justify-between mb-4">
              <User className="h-6 w-6 text-secondary" />
              <span className="text-3xl font-semibold text-primary">VIP</span>
            </div>
            <p className="text-secondary font-light">Member Status</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-surface p-6 border border-light">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-primary">Recent Orders</h3>
            <Link href="/account?tab=orders" className="text-secondary hover:text-primary font-light flex items-center">
              View all
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="space-y-4">
            {[
              { id: "ORD-1001", date: "May 9, 2026", status: "Shipped", amount: 149.99 },
              { id: "ORD-1002", date: "May 8, 2026", status: "Processing", amount: 89.99 },
              { id: "ORD-1003", date: "May 7, 2026", status: "Shipped", amount: 199.99 },
            ].map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-background-muted hover:bg-surface-alt transition-colors"
              >
                <div className="flex-1">
                  <div className="font-semibold text-primary mb-1">Order #{order.id}</div>
                  <div className="text-sm text-secondary">Placed on {order.date}</div>
                  <div className="text-sm text-secondary mt-1">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-light ${
                        order.status === "Shipped"
                          ? "bg-success-light text-success-dark"
                          : "bg-warning-light text-warning-dark"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="font-semibold text-primary">{formatPrice(order.amount)}</div>
                  </div>
                  <button className="px-4 py-2 bg-surface border border-dark text-sm font-light text-secondary hover:bg-surface-alt transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
