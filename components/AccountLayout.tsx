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
      <div className="min-h-screen flex items-center justify-center bg-background-muted">
        <p className="text-secondary text-sm">Loading account...</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-surface p-6 border border-light sticky top-8">
                {/* User Profile Card */}
                <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-light">
                  {user.avatar ? (
                    <div className="w-14 h-14 rounded-full overflow-hidden relative flex-shrink-0 border border-light">
                      <Image
                        src={getAvatarSrc(user.avatar) || ""}
                        alt="Profile"
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-surface-alt rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-7 w-7 text-secondary" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-primary truncate">
                      {user.fullName}
                    </div>
                    <div className="text-sm text-secondary truncate">{user.email}</div>
                  </div>
                </div>

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
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-error hover:bg-error-light transition-colors flex items-center space-x-3 mt-4"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-light">Sign Out</span>
                  </button>
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
