"use client";

import { useAuth } from "../../context/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getInitials } from "../../app/utils/image";
import { LayoutDashboard, ShoppingBag, ShoppingCart, Star, Mail, LogOut, Menu, Users, Globe, X, Truck, CreditCard } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    } else if (!isLoading && user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-muted">
        <p className="text-secondary text-sm">Loading admin workspace...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-muted">
        <p className="text-secondary text-sm">Redirecting...</p>
      </div>
    );
  }

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: ShoppingBag },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Countries", href: "/admin/countries", icon: Globe },
    { name: "Shipping Methods", href: "/admin/shipping", icon: Truck },
    { name: "Payment Methods", href: "/admin/payment", icon: CreditCard },
    { name: "Subscribers", href: "/admin/subscribers", icon: Mail },
  ];

  return (
    <div className="fixed inset-0 flex bg-background-muted overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`bg-surface border-r border-light flex flex-col shrink-0 overflow-x-hidden transition-all duration-300 ease-in-out z-50
        fixed inset-y-0 left-0 md:static
        ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
        ${isCollapsed ? "md:w-20" : "md:w-64"}`}
      >
        {/* Brand logo / Toggle */}
        <div className={`h-16 flex items-center px-4 border-b border-light shrink-0 transition-all duration-300 ${isCollapsed ? "justify-center" : "justify-between"
          }`}>
          {(!isCollapsed || isMobileOpen) && (
            <Link
              href="/admin"
              className="flex items-center relative h-8 w-24 ml-3"
              onClick={() => setIsMobileOpen(false)}
            >
              <Image
                src="https://res.cloudinary.com/dujjidn0e/image/upload/v1781626147/vellvista/logo/w5kkgq9suiw7sk4poxsz.png"
                alt="LuxeScents Admin"
                fill
                className="object-contain object-left"
                priority
                sizes="100px"
              />
            </Link>
          )}
          {/* Desktop Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block p-1.5 rounded hover:bg-surface-alt text-secondary hover:text-primary transition-all cursor-pointer"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded hover:bg-surface-alt text-secondary hover:text-primary transition-all cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center transition-all ${isCollapsed
                  ? "justify-center rounded-lg mx-auto w-12 h-11"
                  : "gap-3 px-4 py-3 text-sm font-light"
                  } ${isActive
                    ? "bg-primary text-inverse"
                    : "text-secondary hover:bg-surface-alt hover:text-primary"
                  }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="truncate whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-light shrink-0">
          <button
            onClick={() => {
              logout();
              setIsMobileOpen(false);
              router.push("/");
            }}
            title={isCollapsed ? "Sign Out" : undefined}
            className={`flex items-center transition-all text-error hover:bg-error-light text-left cursor-pointer ${isCollapsed
              ? "justify-center rounded-lg mx-auto w-12 h-11"
              : "w-full gap-3 px-4 py-2 text-sm"
              }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span className="truncate whitespace-nowrap">Sign Out</span>}
          </button>
        </div>

        {/* User profile brief (moved to last) */}
        <div className={`p-4 border-t border-light flex items-center shrink-0 transition-all duration-300 ${isCollapsed ? "justify-center" : "gap-3"
          }`}>
          <div className="w-10 h-10 bg-surface-alt rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-light">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.fullName}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-secondary text-primary flex items-center justify-center font-semibold text-sm border border-dark select-none">
                {getInitials(user.fullName)}
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1 truncate">
              <p className="text-sm font-semibold text-primary truncate whitespace-nowrap">
                {user.fullName}
              </p>
              <p className="text-xs text-secondary truncate whitespace-nowrap">{user.email}</p>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-light bg-surface flex items-center justify-between px-4 md:px-8 shrink-0">
          {/* Hamburger button on mobile */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-1.5 rounded hover:bg-surface-alt text-secondary hover:text-primary transition-all cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/"
            className="text-sm text-secondary hover:text-primary border border-dark px-3 py-1.5 transition-all ml-auto"
          >
            Visit Live Store
          </Link>
        </header>
        <div className="flex-1 p-8 bg-background-muted">
          {children}
        </div>
      </main>
    </div>
  );
}
