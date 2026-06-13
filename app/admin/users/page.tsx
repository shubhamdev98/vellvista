"use client";

import { useState, useMemo, useEffect } from "react";
import { useAdminUsers, useUpdateUserRole, useUpdateUserStatus, useDeleteUser } from "../../hooks/useApi";
import { Search, Users, Shield, Mail, UserCheck, Globe, Key, User, Loader2, X, Trash2, ShieldAlert, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useAuth } from "../../../context/AuthProvider";
import { useToast } from "../../../context/ToastProvider";

interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  avatar: string | null;
  googleId: string | null;
  isActive: boolean;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { data: rawUsers, isLoading } = useAdminUsers(currentUser?.id);
  const [localUsers, setLocalUsers] = useState<UserAccount[]>([]);
  
  const { showToast } = useToast();

  const { mutate: updateRole } = useUpdateUserRole();
  const { mutate: updateStatus } = useUpdateUserStatus();
  const { mutate: deleteUser } = useDeleteUser();
  
  const [selectedRole, setSelectedRole] = useState<'USER' | 'ADMIN' | 'SUPER_ADMIN'>('USER');

  const [pendingAction, setPendingAction] = useState<{
    type: "role" | "status" | "delete";
    userId: string;
    userName: string;
    currentVal?: any;
  } | null>(null);

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (rawUsers) {
      const mapped = ((rawUsers as any[]) || []).map(u => ({
        id: u.id,
        email: u.email || "",
        fullName: u.fullName || u.name || "Anonymous",
        avatar: u.avatar || u.image || null,
        googleId: u.googleId || null,
        isActive: u.isActive !== false,
        role: u.role || "USER",
        createdAt: u.createdAt || "",
      })) as UserAccount[];
      setLocalUsers(mapped);
    }
  }, [rawUsers]);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");

  const handleToggleRoleClick = (id: string, name: string, role: 'USER' | 'ADMIN' | 'SUPER_ADMIN') => {
    if (id === currentUser?.id) {
      showToast("You cannot change your own admin role.", "warning");
      return;
    }
    setSelectedRole(role);
    setPendingAction({ type: "role", userId: id, userName: name, currentVal: role });
  };

  const handleToggleStatusClick = (id: string, name: string, isActive: boolean) => {
    if (id === currentUser?.id) {
      showToast("You cannot suspend your own account.", "warning");
      return;
    }
    setPendingAction({ type: "status", userId: id, userName: name, currentVal: isActive });
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (id === currentUser?.id) {
      showToast("You cannot delete your own account.", "warning");
      return;
    }
    setPendingAction({ type: "delete", userId: id, userName: name });
  };

  const handleConfirmAction = async () => {
    if (!pendingAction || !currentUser) return;
    const { type, userId, currentVal } = pendingAction;
    try {
      if (type === "role") {
        await updateRole({ adminId: currentUser.id, targetUserId: userId, role: selectedRole });
        setLocalUsers(prev => prev.map(u => u.id === userId ? { ...u, role: selectedRole } : u));
        showToast(`User role successfully changed to ${selectedRole === 'SUPER_ADMIN' ? 'Super Admin' : selectedRole === 'ADMIN' ? 'Admin' : 'Customer'}.`, "success");
      } else if (type === "status") {
        const nextVal = !currentVal;
        await updateStatus({ adminId: currentUser.id, targetUserId: userId, isActive: nextVal });
        setLocalUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: nextVal } : u));
        showToast(`User account successfully ${nextVal ? "activated" : "suspended"}.`, "success");
      } else if (type === "delete") {
        await deleteUser({ adminId: currentUser.id, targetUserId: userId });
        setLocalUsers(prev => prev.filter(u => u.id !== userId));
        showToast("User account deleted successfully.", "success");
      }
    } catch (err) {
      console.error(err);
      showToast(`Action failed. Please try again.`, "error");
    } finally {
      setPendingAction(null);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const visibleUsers = localUsers.filter(
      u => (currentUser?.role !== 'ADMIN' || u.role === 'USER') && u.id !== currentUser?.id
    );
    const total = visibleUsers.length;
    const admins = visibleUsers.filter(u => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length;
    const active = visibleUsers.filter(u => u.isActive).length;
    const googleLinked = visibleUsers.filter(u => u.googleId).length;
    
    return { total, admins, active, googleLinked };
  }, [localUsers, currentUser]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return localUsers.filter(u => {
      // Hide the logged-in super admin (or current admin) from their own list
      if (u.id === currentUser?.id) {
        return false;
      }

      const nameMatch = (u.fullName || "").toLowerCase();
      const emailMatch = (u.email || "").toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch = 
        nameMatch.includes(search) ||
        emailMatch.includes(search);
        
      const matchesRole = 
        roleFilter === "all" || 
        (roleFilter === "super_admin" && u.role === "SUPER_ADMIN") ||
        (roleFilter === "admin" && u.role === "ADMIN") || 
        (roleFilter === "customer" && u.role === "USER");
        
      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "active" && u.isActive) || 
        (statusFilter === "pending" && !u.isActive);
        
      const matchesProvider = 
        providerFilter === "all" || 
        (providerFilter === "google" && u.googleId) || 
        (providerFilter === "email" && !u.googleId);

      const isUserVisibleForAdmin = currentUser?.role !== 'ADMIN' || u.role === 'USER';

      return matchesSearch && matchesRole && matchesStatus && matchesProvider && isUserVisibleForAdmin;
    });
  }, [localUsers, searchTerm, roleFilter, statusFilter, providerFilter, currentUser]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">User Management</h2>
        <p className="text-secondary text-sm">Monitor, inspect, and filter user accounts registered in LuxeScents.</p>
      </div>

      {/* Metrics Cards */}
      <div className={`grid grid-cols-2 md:grid-cols-2 ${currentUser?.role === "ADMIN" ? "lg:grid-cols-3" : "lg:grid-cols-4"} gap-4 md:gap-6`}>
        {/* Total Users */}
        <div className="bg-surface p-4 sm:p-6 border border-light flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">Total Users</span>
            <div className="text-xl sm:text-2xl font-semibold text-primary">{isLoading ? "..." : stats.total}</div>
          </div>
          <div className="p-2 sm:p-3 bg-primary/5 rounded-full text-primary shrink-0">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        {/* Admins */}
        {currentUser?.role !== "ADMIN" && (
          <div className="bg-surface p-4 sm:p-6 border border-light flex items-center justify-between">
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">
                <span className="hidden sm:inline">Administrators</span>
                <span className="sm:hidden">Admins</span>
              </span>
              <div className="text-xl sm:text-2xl font-semibold text-primary">{isLoading ? "..." : stats.admins}</div>
            </div>
            <div className="p-2 sm:p-3 bg-amber-500/5 rounded-full text-amber-600 shrink-0">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
        )}

        {/* Active */}
        <div className="bg-surface p-4 sm:p-6 border border-light flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">Active Status</span>
            <div className="text-xl sm:text-2xl font-semibold text-primary">{isLoading ? "..." : stats.active}</div>
          </div>
          <div className="p-2 sm:p-3 bg-success/5 rounded-full text-success shrink-0">
            <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        {/* Google Linked */}
        <div className="bg-surface p-4 sm:p-6 border border-light flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">Google OAuth</span>
            <div className="text-xl sm:text-2xl font-semibold text-primary">{isLoading ? "..." : stats.googleLinked}</div>
          </div>
          <div className="p-2 sm:p-3 bg-info/5 rounded-full text-info shrink-0">
            <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-surface p-6 border border-light space-y-4">
        {/* Search bar row */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Filters row (always shown side-by-side / row-wise, even on mobile) */}
        <div className={`grid gap-3 md:gap-4 ${
          currentUser?.role === "ADMIN" ? "grid-cols-2" : "grid-cols-3"
        }`}>
          {/* Role Filter */}
          {currentUser?.role !== "ADMIN" && (
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-2 sm:pl-3 pr-8 py-2 border border-dark bg-background text-primary text-xs sm:text-sm focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none truncate"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admins</option>
                <option value="admin">Administrators</option>
                <option value="customer">Customers</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-secondary">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          )}

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-2 sm:pl-3 pr-8 py-2 border border-dark bg-background text-primary text-xs sm:text-sm focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none truncate"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-secondary">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* Provider Filter */}
          <div className="relative">
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="w-full pl-2 sm:pl-3 pr-8 py-2 border border-dark bg-background text-primary text-xs sm:text-sm focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none truncate"
            >
              <option value="all">All Providers</option>
              <option value="google">Google Login</option>
              <option value="email">Email Login</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-secondary">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* User Table container */}
      <div className="bg-surface border border-light overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-light text-secondary font-light bg-surface-alt whitespace-nowrap">
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Provider</th>
              <th className="p-4">Status</th>
              <th className="p-4">Registration Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-secondary">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-secondary" />
                    <span>Loading users data...</span>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-secondary">
                  No matching user accounts found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((item) => {
                const canToggleStatus = isSuperAdmin || (currentUser?.role === 'ADMIN' && item.role === 'USER');
                return (
                  <tr key={item.id} className="text-primary hover:bg-surface-alt/40 transition-colors whitespace-nowrap">
                    {/* User Avatar & Name */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-surface-alt rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-light relative">
                          {item.avatar ? (
                            <Image
                              src={item.avatar}
                              alt={item.fullName}
                              fill
                              className="object-cover"
                              sizes="36px"
                            />
                          ) : (
                            <User className="h-4 w-4 text-secondary" />
                          )}
                        </div>
                        <span className="font-semibold text-primary">{item.fullName}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-4 text-secondary">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{item.email}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      {item.role === 'SUPER_ADMIN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-full">
                          <Shield className="h-3 w-3" />
                          Super Admin
                        </span>
                      ) : item.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-primary/5 text-primary border border-light rounded-full">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-primary/5 text-secondary border border-light rounded-full">
                          Customer
                        </span>
                      )}
                    </td>

                    {/* Provider */}
                    <td className="p-4">
                      {item.googleId ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-light bg-info/10 text-info border border-info/20 rounded-md">
                          <Globe className="h-3 w-3" />
                          Google
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-light bg-primary/5 text-primary border border-light rounded-md">
                          <Key className="h-3 w-3" />
                          Email
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-success-light text-success-dark rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-error-light text-error-dark rounded-full">
                          Suspended
                        </span>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="p-4 text-secondary text-xs">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : "N/A"}
                    </td>

                    {/* Actions column */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        {/* Toggle Admin Role */}
                        <button
                          onClick={() => handleToggleRoleClick(item.id, item.fullName, item.role)}
                          disabled={!isSuperAdmin}
                          className={`p-1.5 rounded transition-all select-none ${
                            !isSuperAdmin
                              ? "opacity-30 cursor-not-allowed text-secondary"
                              : item.role === 'SUPER_ADMIN' || item.role === 'ADMIN'
                                ? "text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 cursor-pointer"
                                : "text-secondary hover:bg-surface-alt hover:text-primary cursor-pointer"
                          }`}
                          title={
                            !isSuperAdmin
                              ? "Only Super Admin can manage roles"
                              : "Manage User Role"
                          }
                        >
                          <Shield className="h-4 w-4" />
                        </button>

                        {/* Toggle Account Active/Suspended */}
                        <button
                          onClick={() => handleToggleStatusClick(item.id, item.fullName, item.isActive)}
                          disabled={!canToggleStatus}
                          className={`p-1.5 rounded transition-all select-none ${
                            !canToggleStatus
                              ? "opacity-30 cursor-not-allowed text-secondary"
                              : item.isActive
                                ? "text-success hover:bg-success/10 cursor-pointer"
                                : "text-error hover:bg-error/10 cursor-pointer"
                          }`}
                          title={
                            !canToggleStatus
                              ? "Only Super Admin (or Admin for customers) can change account status"
                              : item.isActive
                                ? "Suspend Account"
                                : "Activate Account"
                          }
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>

                        {/* Delete User Account */}
                        <button
                          onClick={() => handleDeleteClick(item.id, item.fullName)}
                          disabled={!isSuperAdmin}
                          className={`p-1.5 rounded transition-all select-none ${
                            !isSuperAdmin
                              ? "opacity-30 cursor-not-allowed text-secondary"
                              : "text-secondary hover:text-error hover:bg-error-light cursor-pointer"
                          }`}
                          title={
                            !isSuperAdmin
                              ? "Only Super Admin can delete users"
                              : "Delete User Account"
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Super Admin Confirmation Modal */}
      {pendingAction !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-primary/60 backdrop-blur-sm transition-opacity"
            onClick={() => setPendingAction(null)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-surface w-full max-w-lg border border-light shadow-2xl z-10 p-8 md:p-12 animate-in zoom-in-95 duration-250">
            <button
              onClick={() => setPendingAction(null)}
              className="absolute top-6 right-6 text-primary hover:text-secondary transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl text-primary mb-6 pr-8 font-light capitalize">
              {pendingAction.type === "role"
                ? "Manage User Role"
                : pendingAction.type === "status"
                  ? pendingAction.currentVal ? "Suspend Account" : "Activate Account"
                  : "Delete User Account"}
            </h2>

            <div className="text-secondary text-base leading-relaxed mb-8 font-light">
              {pendingAction.type === "role" && (
                <div className="space-y-4">
                  <p>Choose the role mapping for <strong>{pendingAction.userName}</strong>:</p>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-secondary mb-2">Role</label>
                    <div className="relative">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as any)}
                        className="w-full pl-3 pr-10 py-2.5 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none"
                      >
                        <option value="USER">Customer</option>
                        <option value="ADMIN">Administrator</option>
                        <option value="SUPER_ADMIN">Super Administrator</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-secondary">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {pendingAction.type === "status" && (
                <p>
                  {pendingAction.currentVal
                    ? `Are you sure you want to suspend ${pendingAction.userName}'s account? They will not be able to log in.`
                    : `Are you sure you want to activate ${pendingAction.userName}'s account?`}
                </p>
              )}
              {pendingAction.type === "delete" && (
                <p>
                  {`Are you sure you want to permanently delete ${pendingAction.userName}'s account? This action cannot be undone.`}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setPendingAction(null)}
                className="flex-1 border border-dark text-primary py-3 px-6 font-light hover:bg-surface-alt transition-colors duration-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`flex-1 text-inverse py-3 px-6 font-light transition-colors duration-300 cursor-pointer ${
                  pendingAction.type === "delete" || (pendingAction.type === "status" && pendingAction.currentVal)
                    ? "bg-error hover:bg-error-light"
                    : "bg-primary hover:bg-primary-light"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
