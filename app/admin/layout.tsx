"use client";

import { useAuth } from "../../context/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { getInitials } from "../../app/utils/image";
import { LayoutDashboard, ShoppingBag, ShoppingCart, Star, Mail, LogOut, Menu, Users, Globe, X, Truck, CreditCard, Tag, Share2, Bell } from "lucide-react";
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, type AppNotification } from "../hooks/useApi";
import { useSocket } from "../../context/SocketProvider";
import { useToast } from "../../context/ToastProvider";

function formatRelativeTime(dateInput: Date | string) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 0) return 'just now';

  if (diffInSeconds < 60) {
    return 'just now';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  }
  return date.toLocaleDateString();
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { socket } = useSocket();
  const { showToast } = useToast();
  const [localNotifications, setLocalNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: dbNotifications } = useNotifications(user?.id);
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllRead } = useMarkAllNotificationsAsRead();

  // Sync DB notifications to local state
  useEffect(() => {
    if (dbNotifications) {
      setLocalNotifications(dbNotifications);
    }
  }, [dbNotifications]);

  // Real-time socket listener
  useEffect(() => {
    if (!socket) return;

    socket.on('admin-notification', (notif: any) => {
      console.log('Real-time admin notification received:', notif);
      setLocalNotifications(prev => [
        {
          id: notif.id || Date.now(),
          userId: user?.id || '',
          type: notif.type,
          title: notif.title,
          message: notif.message,
          isRead: false,
          actionUrl: notif.actionUrl,
          createdAt: new Date()
        },
        ...prev
      ]);
      showToast(`${notif.title}: ${notif.message}`, 'success');
    });

    return () => {
      socket.off('admin-notification');
    };
  }, [socket, user, showToast]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkRead = (id: number) => {
    markAsRead({ id });
    setLocalNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllRead = () => {
    if (!user) return;
    markAllRead({ userId: user.id });
    setLocalNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
    showToast("All notifications marked as read", "success");
  };

  const handleNotifClick = (notif: AppNotification) => {
    handleMarkRead(notif.id);
    setIsNotifOpen(false);
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  const unreadNotifications = localNotifications.filter(n => !n.isRead);
  const unreadCount = unreadNotifications.length;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    } else if (!isLoading && user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex bg-background-muted overflow-hidden animate-pulse">
        {/* Skeleton Sidebar */}
        <aside className="bg-surface border-r border-light flex flex-col shrink-0 w-64 h-full">
          <div className="h-16 border-b border-light flex items-center px-6">
            <div className="h-8 bg-surface-alt rounded w-24" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 bg-surface-alt rounded w-full" />
            ))}
          </div>
          <div className="p-4 border-t border-light flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-alt rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-surface-alt rounded w-3/4" />
              <div className="h-2.5 bg-surface-alt rounded w-1/2" />
            </div>
          </div>
        </aside>

        {/* Skeleton Main Panel */}
        <div className="flex-1 flex flex-col h-full">
          <header className="h-16 border-b border-light bg-surface flex items-center justify-between px-8">
            <div className="h-8 bg-surface-alt rounded w-24 ml-auto" />
          </header>
          <div className="flex-1 p-8 space-y-8 bg-background-muted">
            <div className="space-y-2">
              <div className="h-6 bg-surface-alt rounded w-48" />
              <div className="h-4 bg-surface-alt rounded w-96" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 bg-surface border border-light p-6 flex flex-col justify-between">
                  <div className="h-3 bg-surface-alt rounded w-1/2" />
                  <div className="h-6 bg-surface-alt rounded w-1/3" />
                </div>
              ))}
            </div>
            <div className="h-64 bg-surface border border-light w-full rounded" />
          </div>
        </div>
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
    { name: "Social Links", href: "/admin/social", icon: Share2 },
    { name: "Subscribers", href: "/admin/subscribers", icon: Mail },
    { name: "Offers & Coupons", href: "/admin/offers", icon: Tag },
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
        <header className="sticky top-0 z-30 h-16 border-b border-light bg-surface flex items-center justify-between px-4 md:px-8 shrink-0">
          {/* Hamburger button on mobile */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-1.5 rounded hover:bg-surface-alt text-secondary hover:text-primary transition-all cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded hover:bg-surface-alt text-secondary hover:text-primary transition-all cursor-pointer flex items-center justify-center border border-transparent"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-inverse animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface border border-light shadow-xl z-50 p-4 rounded flex flex-col max-h-[480px]">
                  <div className="flex items-center justify-between pb-3 border-b border-light">
                    <span className="font-semibold text-primary text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-primary hover:underline font-light cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto py-2 divide-y divide-light max-h-[350px]">
                    {unreadNotifications.length === 0 ? (
                      <div className="py-8 text-center text-secondary text-xs">
                        No notifications
                      </div>
                    ) : (
                      unreadNotifications.slice(0, 10).map((notif) => {
                        const NotifIcon = notif.type === 'order' ? ShoppingCart : Star;
                        return (
                          <div
                            key={notif.id}
                            onClick={() => handleNotifClick(notif)}
                            className="flex gap-3 py-3 px-2 cursor-pointer hover:bg-surface-alt transition-colors items-start bg-surface-alt/30"
                          >
                            <div className={`p-1.5 rounded-full shrink-0 ${
                              notif.type === 'order' 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-warning-light text-warning'
                            }`}>
                              <NotifIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs truncate font-semibold text-primary">
                                  {notif.title}
                                </p>
                                <span className="text-[10px] text-secondary shrink-0">
                                  {formatRelativeTime(notif.createdAt)}
                                </span>
                              </div>
                              <p className="text-[11px] text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                                {notif.message}
                              </p>
                            </div>
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0 self-center" />
                          </div>
                        );
                      })
                    )}
                  </div>
                  {unreadNotifications.length > 10 && (
                    <div className="pt-2 border-t border-light text-center">
                      <Link
                        href="/admin/orders"
                        onClick={() => setIsNotifOpen(false)}
                        className="text-xs text-secondary hover:text-primary transition-all hover:underline"
                      >
                        View all activity
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/"
              className="text-sm text-secondary hover:text-primary border border-dark px-3 py-1.5 transition-all"
            >
              Visit Live Store
            </Link>
          </div>
        </header>
        <div className="flex-1 p-8 bg-background-muted">
          {children}
        </div>
      </main>
    </div>
  );
}
