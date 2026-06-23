"use client";

import { useAdminSubscribers } from "../../hooks/useApi";
import { TableRowSkeleton } from "../../../components/ui/Skeleton";

export default function AdminSubscribers() {
  const { data: subscribers, isLoading } = useAdminSubscribers();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">Newsletter Subscribers</h2>
        <p className="text-secondary text-sm">View and manage email newsletter subscriptions.</p>
      </div>

      {/* Subscribers Table */}
      <div className="bg-surface border border-light overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-light text-secondary font-light bg-surface-alt">
              <th className="p-4 w-24">Subscriber ID</th>
              <th className="p-4">Email Address</th>
              <th className="p-4">Status</th>
              <th className="p-4">Subscribed Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={4} />
              ))
            ) : !subscribers || subscribers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-secondary">
                  No subscribers found.
                </td>
              </tr>
            ) : (
              subscribers.map((sub) => (
                <tr key={sub.id} className="text-primary hover:bg-surface-alt/50 font-light">
                  <td className="p-4 font-semibold text-primary">#{sub.id}</td>
                  <td className="p-4 font-semibold text-primary">{sub.email}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold ${
                      sub.isActive
                        ? "bg-success-light text-success-dark"
                        : "bg-error-light text-error"
                    }`}>
                      {sub.isActive ? "Active" : "Unsubscribed"}
                    </span>
                  </td>
                  <td className="p-4 text-secondary text-xs">
                    {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "N/A"}
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
