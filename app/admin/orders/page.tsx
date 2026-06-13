"use client";

import { useEffect, useState } from "react";
import { useAdminOrders, useUpdateOrderStatus } from "../../hooks/useApi";
import { Search, ChevronDown } from "lucide-react";

export default function AdminOrders() {
  const { data: ordersData, isLoading } = useAdminOrders();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const { mutate: updateOrderStatus } = useUpdateOrderStatus();

  useEffect(() => {
    if (ordersData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalOrders(ordersData);
    }
  }, [ordersData]);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateOrderStatus({ id, status });
      setLocalOrders(
        localOrders.map((o) => (o.id === id ? { ...o, status } : o))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const filteredOrders = localOrders.filter(
    (o) =>
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">Orders Manager</h2>
        <p className="text-secondary text-sm">Monitor client transactions and fulfill orders.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-surface p-4 border border-light flex items-center gap-3">
        <Search className="h-5 w-5 text-secondary shrink-0" />
        <input
          type="text"
          placeholder="Search orders by customer name, email, or Order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-primary text-sm focus:outline-none w-full"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-surface border border-light overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-light text-secondary font-light bg-surface-alt whitespace-nowrap">
              <th className="p-4 w-24">Order ID</th>
              <th className="p-4">Customer Info</th>
              <th className="p-4">Shipping Address</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light">
            {isLoading && localOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-secondary">
                  Loading customer orders...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-secondary">
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="text-primary hover:bg-surface-alt/50 font-light whitespace-nowrap">
                  <td className="p-4 font-semibold text-primary">#{order.id}</td>
                  <td className="p-4">
                    <div className="font-semibold text-primary">{order.customerName}</div>
                    <div className="text-xs text-secondary">{order.customerEmail}</div>
                  </td>
                  <td className="p-4 text-secondary text-xs max-w-[200px] truncate" title={order.shippingAddress}>
                    {order.shippingAddress}
                  </td>
                  <td className="p-4 font-semibold text-primary">${parseFloat(order.totalAmount).toFixed(2)}</td>
                  <td className="p-4 text-secondary text-xs">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="p-4 text-right">
                    <div className="relative inline-block text-left">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-semibold pl-2.5 pr-8 py-1.5 border border-light focus:outline-none bg-surface text-primary cursor-pointer appearance-none ${
                          order.status === "completed" || order.status === "shipped"
                            ? "text-success-dark bg-success-light/30"
                            : "text-warning-dark bg-warning-light/30"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-primary">
                        <ChevronDown className="h-3 w-3" />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
