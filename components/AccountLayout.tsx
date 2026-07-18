"use client";

import { useAuth } from "../context/AuthProvider";
import { useWishlist } from "../context/WishlistProvider";
import { User, ShoppingBag, Heart, MapPin, Settings, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Header from "./Header";
import Footer from "./Footer";
import OfferNavBar from "./OfferNavBar";
import Breadcrumb from "./Breadcrumb";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getInitials } from "../app/utils/image";

export default function AccountLayout({
  children,
  activeTab,
}: {
  children: React.ReactNode;
  activeTab: "overview" | "profile" | "orders" | "wishlist" | "addresses";
}) {
  const { user, isLoading, logout } = useAuth();
  const { wishlistItems } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col animate-pulse">
        {/* Header placeholder */}
        <div className="h-16 border-b border-light bg-surface" />

        <main className="flex-1 bg-background-muted py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 space-y-2">
              <div className="h-8 bg-surface-alt rounded w-48" />
              <div className="h-4 bg-surface-alt rounded w-80" />
            </div>

            {/* Mobile Welcome Skeleton (Only for overview tab) */}
            {activeTab === "overview" && (
              <div className="lg:hidden mb-4 bg-surface border border-light p-6 space-y-3 animate-pulse">
                <div className="h-6 bg-surface-alt rounded w-1/3" />
                <div className="h-4 bg-surface-alt rounded w-2/3" />
                <div className="h-8 bg-surface-alt rounded w-24 mt-2" />
              </div>
            )}

            {/* Mobile Skeleton */}
            <div className="lg:hidden mb-6 bg-surface border border-light p-4">
              <div className="flex space-x-2 overflow-x-auto no-scrollbar items-center">
                <div className="h-8 bg-surface-alt rounded w-20 shrink-0" />
                <span className="text-border select-none font-extralight text-xs">|</span>
                <div className="h-8 bg-surface-alt rounded w-20 shrink-0" />
                <span className="text-border select-none font-extralight text-xs">|</span>
                <div className="h-8 bg-surface-alt rounded w-20 shrink-0" />
                <span className="text-border select-none font-extralight text-xs">|</span>
                <div className="h-8 bg-surface-alt rounded w-20 shrink-0" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Skeleton */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="bg-surface p-6 border border-light space-y-3">
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-10 bg-surface-alt rounded w-full" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content Skeleton */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-surface p-6 border border-light space-y-4">
                  <div className="h-6 bg-surface-alt rounded w-1/3 mb-6" />
                  <div className="h-4 bg-surface-alt rounded w-full" />
                  <div className="h-4 bg-surface-alt rounded w-5/6" />
                  <div className="h-4 bg-surface-alt rounded w-4/5" />
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer placeholder */}
        <div className="h-48 bg-primary-light" />
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting to login
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getAvatarSrc = (avatar: string | undefined) => {
    if (!avatar) return undefined;
    return avatar;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <OfferNavBar />
      <Header />

      <main className="flex-1 bg-background-muted py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-primary">My Account</h1>
            <p className="text-secondary">Manage your account and view your orders</p>
          </div>

          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Account" },
            ]}
          />

          {/* Mobile Welcome Section (Only for overview tab) */}
          {activeTab === "overview" && (
            <div className="lg:hidden mb-4 bg-background-alt border border-light p-6">
              <h2 className="text-xl font-semibold text-primary">
                Welcome back!
              </h2>
              <p className="text-secondary text-sm mt-1 font-light">
                Here is a summary of your account activity, orders, and details.
              </p>
              <Link
                href="/profile/information"
                className="inline-block mt-3 px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-inverse text-xs font-light transition-all whitespace-nowrap cursor-pointer"
              >
                Edit Profile
              </Link>
            </div>
          )}

          {/* Mobile Profile & Navigation (Horizontal Scroll) */}
          <div className="lg:hidden mb-6 bg-surface border border-light py-2">
            {/* Horizontal Scroll Navigation */}
            <div className="flex overflow-x-auto no-scrollbar px-2 space-x-2 items-center">
              <Link
                href="/account/overview"
                className={`px-4 py-2 text-sm flex items-center space-x-2 transition-colors whitespace-nowrap ${
                  activeTab === "overview"
                    ? "text-primary font-medium"
                    : "text-secondary hover:text-primary font-light"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Overview</span>
              </Link>
              
              <span className="text-secondary select-none font-extralight text-xs opacity-60">|</span>

              <Link
                href="/profile/information"
                className={`px-4 py-2 text-sm flex items-center space-x-2 transition-colors whitespace-nowrap ${
                  activeTab === "profile"
                    ? "text-primary font-medium"
                    : "text-secondary hover:text-primary font-light"
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>

              <span className="text-secondary select-none font-extralight text-xs opacity-60">|</span>

              <Link
                href="/account?tab=orders"
                className={`px-4 py-2 text-sm flex items-center space-x-2 transition-colors whitespace-nowrap ${
                  activeTab === "orders"
                    ? "text-primary font-medium"
                    : "text-secondary hover:text-primary font-light"
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Orders</span>
              </Link>

              <span className="text-secondary select-none font-extralight text-xs opacity-60">|</span>

              <Link
                href="/account?tab=wishlist"
                className={`px-4 py-2 text-sm flex items-center space-x-2 transition-colors whitespace-nowrap ${
                  activeTab === "wishlist"
                    ? "text-primary font-medium"
                    : "text-secondary hover:text-primary font-light"
                }`}
              >
                <Heart className="h-4 w-4" />
                <span>Wishlist</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 ml-1 ${
                    activeTab === "wishlist"
                      ? "bg-primary text-inverse font-semibold"
                      : "bg-surface-alt text-secondary"
                  }`}
                >
                  {wishlistItems.length}
                </span>
              </Link>

              <span className="text-secondary select-none font-extralight text-xs opacity-60">|</span>

              <Link
                href="/address"
                className={`px-4 py-2 text-sm flex items-center space-x-2 transition-colors whitespace-nowrap ${
                  activeTab === "addresses"
                    ? "text-primary font-medium"
                    : "text-secondary hover:text-primary font-light"
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>Addresses</span>
              </Link>

              {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                <>
                  <span className="text-secondary select-none font-extralight text-xs opacity-60">|</span>
                  <Link
                    href="/admin"
                    className="px-4 py-2 text-sm flex items-center space-x-2 text-secondary hover:text-primary transition-colors whitespace-nowrap font-light"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-surface p-6 border border-light sticky top-8">
                {/* Navigation */}
                <nav className="space-y-1">
                  <Link
                    href="/account/overview"
                    className={`w-full text-left px-4 py-3 rounded-none transition-colors flex items-center space-x-3 ${
                      activeTab === "overview" ? "bg-primary text-inverse" : "text-secondary hover:bg-surface-alt"
                    }`}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="font-light">Account Overview</span>
                  </Link>
                  <Link
                    href="/profile/information"
                    className={`w-full text-left px-4 py-3 rounded-none transition-colors flex items-center space-x-3 ${
                      activeTab === "profile" ? "bg-primary text-inverse" : "text-secondary hover:bg-surface-alt"
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <span className="font-light">Profile Information</span>
                  </Link>
                  <Link
                    href="/account?tab=orders"
                    className={`w-full text-left px-4 py-3 rounded-none transition-colors flex items-center space-x-3 ${
                      activeTab === "orders" ? "bg-primary text-inverse" : "text-secondary hover:bg-surface-alt"
                    }`}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span className="font-light">Order History</span>
                  </Link>
                  <Link
                    href="/account?tab=wishlist"
                    className={`w-full text-left px-4 py-3 rounded-none transition-colors flex items-center justify-between ${
                      activeTab === "wishlist" ? "bg-primary text-inverse" : "text-secondary hover:bg-surface-alt"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Heart className="h-5 w-5" />
                      <span className="font-light">Wishlist</span>
                    </div>
                    <span
                      className={`${
                        activeTab === "wishlist" ? "bg-surface text-primary" : "bg-surface-alt text-secondary"
                      } text-xs font-light px-2 py-1`}
                    >
                      {wishlistItems.length}
                    </span>
                  </Link>
                  <Link
                    href="/address"
                    className={`w-full text-left px-4 py-3 rounded-none transition-colors flex items-center space-x-3 ${
                      activeTab === "addresses" ? "bg-primary text-inverse" : "text-secondary hover:bg-surface-alt"
                    }`}
                  >
                    <MapPin className="h-5 w-5" />
                    <span className="font-light">Addresses</span>
                  </Link>
                  {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                    <Link
                      href="/admin"
                      className="w-full text-left px-4 py-3 text-secondary hover:bg-surface-alt transition-colors flex items-center space-x-3"
                    >
                      <Settings className="h-5 w-5" />
                      <span className="font-light">Admin Panel</span>
                    </Link>
                  )}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">{children}</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
