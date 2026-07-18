"use client";

import AccountLayout from "../../../components/AccountLayout";
import { useAuth } from "../../../context/AuthProvider";
import { useWishlist } from "../../../context/WishlistProvider";
import { ShoppingBag, Heart, User } from "lucide-react";
import Link from "next/link";
import { useUserOrders } from "../../hooks/useApi";

export default function AccountOverviewPage() {
  const { user } = useAuth();
  const { wishlistItems } = useWishlist();
  const { data: userOrders, isLoading: isLoadingOrders } = useUserOrders(user?.email || undefined);

  if (!user) return null;

  return (
    <AccountLayout activeTab="overview">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="hidden lg:flex bg-background-alt border border-light p-6 md:p-8 flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-primary">
              Welcome back!
            </h2>
            <p className="text-secondary text-sm mt-1 font-light">
              Here is a summary of your account activity, orders, and details.
            </p>
          </div>
          <Link
            href="/profile/information"
            className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-inverse text-xs font-light transition-all whitespace-nowrap cursor-pointer"
          >
            Edit Profile
          </Link>
        </div>

        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Orders */}
          <div className="bg-surface p-6 border border-light flex items-center justify-between hover:border-dark transition-all">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted font-light">Total Orders</p>
              {isLoadingOrders ? (
                <div className="h-8 w-12 bg-background-alt animate-pulse" />
              ) : (
                <h3 className="text-3xl font-semibold text-primary">{userOrders ? userOrders.length : 0}</h3>
              )}
            </div>
            <div className="p-3 bg-background-alt border border-light">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
          </div>

          {/* Card 2: Wishlist */}
          <div className="bg-surface p-6 border border-light flex items-center justify-between hover:border-dark transition-all">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted font-light">Wishlist Items</p>
              <h3 className="text-3xl font-semibold text-primary">{wishlistItems.length}</h3>
            </div>
            <div className="p-3 bg-background-alt border border-light">
              <Heart className="h-6 w-6 text-primary" />
            </div>
          </div>

          {/* Card 3: Membership */}
          <div className="bg-surface p-6 border border-light flex items-center justify-between hover:border-dark transition-all">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted font-light">Member Status</p>
              <h3 className="text-3xl font-semibold text-primary">VIP</h3>
            </div>
            <div className="p-3 bg-background-alt border border-light">
              <User className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
