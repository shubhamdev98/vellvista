"use client";

import { useEffect, useState } from "react";
import { useProducts, useAdminOrders, useAdminReviews, useAdminSubscribers, Product } from "../hooks/useApi";
import { DollarSign, ShoppingBag, Star, Mail, Clock, ShoppingCart, Store, Building2, Plus, ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import AdminCharts from "../../components/AdminCharts";
import Skeleton, { TableRowSkeleton } from "../../components/ui/Skeleton";

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  totalAmount: string;
  status: string;
  shippingAddress: string;
  createdAt?: string;
}

interface Review {
  id: number;
  productId: number;
  userId: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  userName: string | null;
  isApproved: boolean;
  createdAt?: string;
}

export default function AdminDashboard() {
  const { data: products, isLoading: productsLoading } = useProducts(500);
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();
  const { data: reviews, isLoading: reviewsLoading } = useAdminReviews();
  const { data: subscribers, isLoading: subscribersLoading } = useAdminSubscribers();

  const [marketplaceStats, setMarketplaceStats] = useState<{
    totalVendors: number;
    pendingVendors: number;
    commissionRate: string;
    totalGMV: string;
  } | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://172.29.214.47:3001";

  // Fetch live vendor marketplace analytics
  useEffect(() => {
    async function loadMarketplaceData() {
      try {
        const res = await fetch(`${backendUrl}/trpc/adminGetMarketplaceAnalytics`);
        const data = await res.json();
        if (data.result?.data) {
          setMarketplaceStats(data.result.data);
        }
      } catch (err) {
        console.error("Failed to load marketplace analytics:", err);
      }
    }
    loadMarketplaceData();
  }, [backendUrl]);

  const totalRevenue = orders
    ? (orders as Order[])
        .filter((o: Order) => o.status === "completed" || o.status === "shipped")
        .reduce((sum: number, o: Order) => sum + parseFloat(o.totalAmount || "0"), 0)
    : 0;

  const pendingOrders = orders ? (orders as Order[]).filter((o: Order) => o.status === "pending" || o.status === "processing") : [];
  const recentOrders = orders ? (orders as Order[]).slice(0, 5) : [];

  // Calculate category inventory breakdown with robust normalization
  const categoryCounts = (Array.isArray(products) ? products : []).reduce((acc: Record<string, number>, p: Product) => {
    let catKey = (p.category || "fragrance").toLowerCase().trim();
    if (catKey.includes("perfume") || catKey.includes("fragrance")) catKey = "fragrance";
    else if (catKey.includes("skin") || catKey.includes("care")) catKey = "skincare";
    else if (catKey.includes("cosmetic") || catKey.includes("makeup")) catKey = "cosmetics";
    else if (catKey.includes("fashion") || catKey.includes("apparel") || catKey.includes("clothing")) catKey = "fashion";
    else if (catKey.includes("electronic") || catKey.includes("tech") || catKey.includes("audio")) catKey = "electronics";
    else if (catKey.includes("accessori") || catKey.includes("watch")) catKey = "accessories";
    
    acc[catKey] = (acc[catKey] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8 font-inter">
      {/* Header with Quick Functional Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary mb-1">Marketplace Overview</h2>
          <p className="text-secondary text-sm">Monitor multi-vendor sales, inventory breakdown, and pending seller queues.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/admin/products"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-primary text-inverse px-4 py-2.5 hover:bg-primary-light transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/vendors"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 border border-dark text-primary px-4 py-2.5 hover:bg-surface-alt transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <Building2 className="h-4 w-4 text-secondary" />
            <span>Manage Vendors</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-surface p-4 sm:p-6 border border-light flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">Total Sales</span>
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-secondary shrink-0" />
          </div>
          {ordersLoading ? (
            <Skeleton className="h-8 w-24 rounded" />
          ) : (
            <span className="text-xl sm:text-2xl font-semibold text-primary block truncate">
              ${totalRevenue.toFixed(2)}
            </span>
          )}
        </div>

        <div className="bg-surface p-4 sm:p-6 border border-light flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">Active Products</span>
            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-secondary shrink-0" />
          </div>
          {productsLoading ? (
            <Skeleton className="h-8 w-16 rounded" />
          ) : (
            <span className="text-xl sm:text-2xl font-semibold text-primary block truncate">
              {products ? products.length : 0}
            </span>
          )}
        </div>

        <div className="bg-surface p-4 sm:p-6 border border-light flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">Seller Stores</span>
            <Store className="h-4 w-4 sm:h-5 sm:w-5 text-secondary shrink-0" />
          </div>
          <span className="text-xl sm:text-2xl font-semibold text-primary block truncate">
            {marketplaceStats?.totalVendors || 3}
          </span>
        </div>

        <div className="bg-surface p-4 sm:p-6 border border-light flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">Reviews & Rating</span>
            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-secondary shrink-0" />
          </div>
          {reviewsLoading ? (
            <Skeleton className="h-8 w-16 rounded" />
          ) : (
            <span className="text-xl sm:text-2xl font-semibold text-primary block truncate">
              {reviews ? reviews.length : 0}
            </span>
          )}
        </div>
      </div>

      {/* Analytics Charts */}
      {ordersLoading || productsLoading ? (
        <div className="h-[300px] w-full bg-surface border border-light animate-pulse p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div className="h-4 bg-surface-alt rounded w-1/3" />
            <div className="flex gap-2">
              <div className="h-8 bg-surface-alt rounded w-16" />
              <div className="h-8 bg-surface-alt rounded w-16" />
            </div>
          </div>
          <div className="flex items-end gap-3 h-[200px] w-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface-alt w-full rounded-t"
                style={{ height: `${[60, 45, 80, 55, 70, 90, 65, 50, 75, 40, 85, 95][i]}%` }}
              />
            ))}
          </div>
        </div>
      ) : (
        <AdminCharts orders={(orders as Order[]) || []} products={(products as any[]) || []} />
      )}



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-surface p-6 border border-light shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-light pb-4">
            <h3 className="text-lg font-semibold text-primary font-manrope">Recent Customer Checkout Orders</h3>
            <Link href="/admin/orders" className="text-xs font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {ordersLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-light text-secondary uppercase font-semibold text-[11px]">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={4} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-secondary">No customer orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-light text-secondary uppercase font-semibold text-[11px]">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light">
                  {recentOrders.map((order: Order) => (
                    <tr key={order.id} className="text-primary hover:bg-surface-alt/50">
                      <td className="py-3.5 font-bold">#{order.id}</td>
                      <td className="py-3.5">
                        <div className="font-semibold text-primary">{order.customerName}</div>
                        <div className="text-xs text-secondary">{order.customerEmail}</div>
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          order.status === "completed" || order.status === "shipped"
                            ? "border-success text-success bg-emerald-50/50"
                            : "border-warning text-warning bg-amber-50/50"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-primary">${parseFloat(order.totalAmount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* System Queue & Pending Seller Approvals */}
        <div className="bg-surface p-6 border border-light space-y-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary font-manrope border-b border-light pb-4 mb-4">Marketplace Action Items</h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-primary">Pending Seller Applications</h4>
                  <p className="text-xs text-secondary mt-0.5">
                    {marketplaceStats?.pendingVendors || 0} seller application(s) awaiting onboarding review.
                  </p>
                  <Link href="/admin/vendors" className="text-[11px] font-bold text-primary underline mt-1 block">
                    Review Seller Applications →
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-primary">Pending Order Fulfillment</h4>
                  <div className="text-xs text-secondary mt-0.5">
                    {ordersLoading ? (
                      <Skeleton className="h-3 w-8 inline-block rounded" />
                    ) : (
                      pendingOrders.length
                    )}{" "}
                    order(s) require shipping fulfillment.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-primary">Low Stock Alerts</h4>
                  <div className="text-xs text-secondary mt-0.5">
                    {productsLoading ? (
                      <Skeleton className="h-3 w-8 inline-block rounded" />
                    ) : (
                      products ? (products as Product[]).filter((p: Product) => (p.stock ?? 0) < 10).length : 0
                    )}{" "}
                    product(s) running low on stock.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-light">
            <Link
              href="/admin/brand"
              className="w-full py-2.5 px-4 border border-dark text-primary text-xs font-bold uppercase tracking-wider hover:bg-surface-alt flex items-center justify-center gap-1.5 transition-colors"
            >
              Configure Store Branding
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
