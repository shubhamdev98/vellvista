"use client";

import { useProducts, useAdminOrders, useAdminReviews, useAdminSubscribers, Product } from "../hooks/useApi";
import { DollarSign, ShoppingBag, Star, Mail, Clock, ShoppingCart } from "lucide-react";
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
  const { data: products, isLoading: productsLoading } = useProducts(100);
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();
  const { data: reviews, isLoading: reviewsLoading } = useAdminReviews();
  const { data: subscribers, isLoading: subscribersLoading } = useAdminSubscribers();

  const totalRevenue = orders
    ? (orders as Order[])
        .filter((o: Order) => o.status === "completed" || o.status === "shipped")
        .reduce((sum: number, o: Order) => sum + parseFloat(o.totalAmount || "0"), 0)
    : 0;

  const pendingOrders = orders ? (orders as Order[]).filter((o: Order) => o.status === "pending" || o.status === "processing") : [];

  const recentOrders = orders ? (orders as Order[]).slice(0, 5) : [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">Dashboard</h2>
        <p className="text-secondary text-sm">Welcome to your LuxeScents manager dashboard.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-surface p-4 sm:p-6 border border-light flex flex-col justify-between">
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

        <div className="bg-surface p-4 sm:p-6 border border-light flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">Products</span>
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

        <div className="bg-surface p-4 sm:p-6 border border-light flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">Reviews</span>
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

        <div className="bg-surface p-4 sm:p-6 border border-light flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">Subscribers</span>
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-secondary shrink-0" />
          </div>
          {subscribersLoading ? (
            <Skeleton className="h-8 w-16 rounded" />
          ) : (
            <span className="text-xl sm:text-2xl font-semibold text-primary block truncate">
              {subscribers ? subscribers.length : 0}
            </span>
          )}
        </div>
      </div>

      {ordersLoading || productsLoading ? (
        <div className="h-[300px] w-full bg-surface border border-light animate-pulse flex flex-col items-center justify-center gap-2">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-secondary text-sm">Generating analytics visualization...</p>
        </div>
      ) : (
        <AdminCharts orders={(orders as Order[]) || []} products={(products as any[]) || []} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-surface p-6 border border-light">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-primary">Recent Orders</h3>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {ordersLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-light text-secondary font-light">
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
                  <tr className="border-b border-light text-secondary font-light">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light">
                  {recentOrders.map((order: Order) => (
                    <tr key={order.id} className="text-primary">
                      <td className="py-3.5 font-light">#{order.id}</td>
                      <td className="py-3.5">
                        <div className="font-light text-primary">{order.customerName}</div>
                        <div className="text-xs text-secondary">{order.customerEmail}</div>
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-block px-2 py-0.5 text-xs font-light ${
                          order.status === "completed" || order.status === "shipped"
                            ? "bg-success-light text-success-dark"
                            : "bg-warning-light text-warning-dark"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-light text-primary">${parseFloat(order.totalAmount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action items/stats */}
        <div className="bg-surface p-6 border border-light space-y-6">
          <h3 className="text-lg font-semibold text-primary">System Queue</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-primary">Pending Orders</h3>
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
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-primary">Reviews Moderation</h3>
                <div className="text-xs text-secondary mt-0.5">
                  {reviewsLoading ? (
                    <Skeleton className="h-3 w-8 inline-block rounded" />
                  ) : (
                    reviews ? (reviews as Review[]).filter((r: Review) => !r.isApproved).length : 0
                  )}{" "}
                  review(s) awaiting validation.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-primary">Low Stock Alerts</h3>
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
      </div>
    </div>
  );
}
