"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  useAdminCoupons, 
  useAdminCreateCoupon, 
  useAdminToggleCouponStatus, 
  useAdminDeleteCoupon,
  type Coupon
} from "../../hooks/useApi";
import { 
  Search, 
  Tag, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Loader2, 
  X, 
  AlertCircle,
  ChevronDown,
  Calendar,
  Percent,
  DollarSign
} from "lucide-react";
import { useAuth } from "../../../context/AuthProvider";
import { useToast } from "../../../context/ToastProvider";
import { useCurrency } from "../../../context/CurrencyProvider";
import Skeleton, { TableRowSkeleton } from "../../../components/ui/Skeleton";

export default function AdminOffersPage() {
  const { user: currentUser } = useAuth();
  const { data: rawCoupons, isLoading, error: fetchError } = useAdminCoupons(currentUser?.id);
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();

  const { mutate: createCoupon, isPending: isAdding } = useAdminCreateCoupon();
  const { mutate: toggleStatus } = useAdminToggleCouponStatus();
  const { mutate: deleteCoupon } = useAdminDeleteCoupon();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
    validFrom: "",
    validTo: ""
  });
  const [formError, setFormError] = useState("");

  // Delete confirmation state
  const [pendingDelete, setPendingDelete] = useState<Coupon | null>(null);

  // Map backend data to local state
  useEffect(() => {
    if (rawCoupons) {
      setCouponsList(rawCoupons);
    }
  }, [rawCoupons]);

  // Handle toggle status change
  const handleToggleStatus = async (coupon: Coupon) => {
    if (!currentUser) return;
    try {
      const nextStatus = !coupon.isActive;
      await toggleStatus({
        adminId: currentUser.id,
        couponId: coupon.id,
        isActive: nextStatus
      });
      setCouponsList(prev => 
        prev.map(c => c.id === coupon.id ? { ...c, isActive: nextStatus } : c)
      );
      showToast(`Coupon "${coupon.code}" status successfully updated.`, "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to update coupon status.", "error");
    }
  };

  // Open modal for add
  const handleOpenAdd = () => {
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0] + "T00:00";
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const formattedNextMonth = nextMonth.toISOString().split("T")[0] + "T00:00";

    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minOrderAmount: "",
      maxDiscountAmount: "",
      usageLimit: "",
      validFrom: formattedToday,
      validTo: formattedNextMonth
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // Handle Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFormError("");

    const code = formData.code.trim().toUpperCase();
    const description = formData.description.trim();
    const discountType = formData.discountType;
    const discountValue = formData.discountValue.trim();
    const minOrderAmount = formData.minOrderAmount.trim();
    const maxDiscountAmount = formData.maxDiscountAmount.trim();
    const usageLimit = formData.usageLimit.trim();
    const validFrom = formData.validFrom;
    const validTo = formData.validTo;

    if (!code) {
      setFormError("Promo code is required.");
      return;
    }
    if (!/^[A-Z0-9_-]+$/.test(code)) {
      setFormError("Promo code can only contain letters, numbers, dashes, and underscores.");
      return;
    }
    if (!discountValue || isNaN(Number(discountValue)) || Number(discountValue) <= 0) {
      setFormError("Please enter a valid positive discount value.");
      return;
    }
    if (discountType === "percentage" && Number(discountValue) > 100) {
      setFormError("Percentage discount cannot exceed 100%.");
      return;
    }
    if (minOrderAmount && (isNaN(Number(minOrderAmount)) || Number(minOrderAmount) < 0)) {
      setFormError("Minimum order amount must be a non-negative number.");
      return;
    }
    if (maxDiscountAmount && (isNaN(Number(maxDiscountAmount)) || Number(maxDiscountAmount) < 0)) {
      setFormError("Maximum discount amount must be a non-negative number.");
      return;
    }
    if (usageLimit && (isNaN(Number(usageLimit)) || Number(usageLimit) <= 0 || !Number.isInteger(Number(usageLimit)))) {
      setFormError("Usage limit must be a positive integer.");
      return;
    }
    if (!validFrom || !validTo) {
      setFormError("Validity start and end dates are required.");
      return;
    }
    if (new Date(validFrom) >= new Date(validTo)) {
      setFormError("Validity end date must be after start date.");
      return;
    }

    try {
      await createCoupon({
        adminId: currentUser.id,
        code,
        description: description || undefined,
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount || undefined,
        maxDiscountAmount: maxDiscountAmount || undefined,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        validFrom,
        validTo
      });
      
      showToast(`Promo option "${code}" created successfully.`, "success");
      setIsModalOpen(false);
      // Wait briefly for toast to show and force reload/refresh
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "An error occurred. Please try again.");
    }
  };

  // Handle Delete Coupon
  const handleDeleteCoupon = async () => {
    if (!pendingDelete || !currentUser) return;
    try {
      await deleteCoupon({
        adminId: currentUser.id,
        couponId: pendingDelete.id
      });
      setCouponsList(prev => prev.filter(c => c.id !== pendingDelete.id));
      showToast(`Promo "${pendingDelete.code}" deleted successfully.`, "success");
      setPendingDelete(null);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to delete promo option.", "error");
      setPendingDelete(null);
    }
  };

  // Summary stats
  const stats = useMemo(() => {
    const total = couponsList.length;
    const active = couponsList.filter(c => c.isActive).length;
    
    const now = new Date();
    const expired = couponsList.filter(c => {
      const toDate = new Date(c.validTo);
      return toDate < now;
    }).length;

    const totalUsage = couponsList.reduce((sum, c) => sum + (c.usedCount || 0), 0);

    return { total, active, expired, totalUsage };
  }, [couponsList]);

  // Filtered methods
  const filteredCoupons = useMemo(() => {
    const now = new Date();
    return couponsList.filter(c => {
      const codeMatch = c.code.toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = (c.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = codeMatch || descMatch;

      let matchesStatus = true;
      if (statusFilter === "active") {
        matchesStatus = c.isActive && new Date(c.validTo) >= now;
      } else if (statusFilter === "inactive") {
        matchesStatus = !c.isActive;
      } else if (statusFilter === "expired") {
        matchesStatus = new Date(c.validTo) < now;
      }

      const matchesType = 
        typeFilter === "all" || 
        c.discountType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [couponsList, searchTerm, statusFilter, typeFilter]);

  if (fetchError) {
    return (
      <div className="bg-error-light border border-error text-error p-6 flex items-start gap-3">
        <AlertCircle className="h-6 w-6 shrink-0" />
        <div>
          <h3 className="font-semibold text-lg">Failed to Load Offers & Coupons</h3>
          <p className="text-sm mt-1">{fetchError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary mb-1">Offers & Coupons</h2>
          <p className="text-secondary text-sm">Configure, track, and manage promotional offers, checkout discounts, and promo codes.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-inverse hover:bg-primary-light px-5 py-2.5 transition-all text-sm font-light shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Promo Offer
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Promos */}
        <div className="bg-surface p-4 sm:p-6 border border-light flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">
              Total Offers
            </span>
            <div className="text-lg sm:text-2xl font-semibold text-primary">
              {isLoading ? <Skeleton className="h-6 w-12 rounded inline-block" /> : stats.total}
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-primary/5 rounded-full text-primary shrink-0">
            <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        {/* Active Promos */}
        <div className="bg-surface p-4 sm:p-6 border border-light flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">
              Active & Valid
            </span>
            <div className="text-lg sm:text-2xl font-semibold text-success">
              {isLoading ? <Skeleton className="h-6 w-12 rounded inline-block" /> : stats.active}
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-success/5 rounded-full text-success shrink-0">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        {/* Expired Promos */}
        <div className="bg-surface p-4 sm:p-6 border border-light flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">
              Expired
            </span>
            <div className="text-lg sm:text-2xl font-semibold text-secondary">
              {isLoading ? <Skeleton className="h-6 w-12 rounded inline-block" /> : stats.expired}
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-primary/5 rounded-full text-secondary shrink-0">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 opacity-50" />
          </div>
        </div>

        {/* Total Usage Count */}
        <div className="bg-surface p-4 sm:p-6 border border-light flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">
              Used Count
            </span>
            <div className="text-lg sm:text-2xl font-semibold text-primary">
              {isLoading ? <Skeleton className="h-6 w-12 rounded inline-block" /> : stats.totalUsage}
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-primary/5 rounded-full text-primary shrink-0">
            <Percent className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface p-4 sm:p-6 border border-light">
        <div className="flex gap-3 flex-col sm:flex-row items-center w-full">
          {/* Search bar */}
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary" />
            <input
              type="text"
              placeholder="Search promo code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all bg-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-[150px] shrink-0 relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-2 sm:pl-3 pr-8 py-2 border border-dark bg-background text-primary text-xs sm:text-sm focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none truncate bg-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Disabled Only</option>
              <option value="expired">Expired Only</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-secondary">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* Type Filter */}
          <div className="w-full sm:w-[150px] shrink-0 relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-2 sm:pl-3 pr-8 py-2 border border-dark bg-background text-primary text-xs sm:text-sm focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none truncate bg-transparent"
            >
              <option value="all">All Types</option>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed_amount">Fixed Amount ($)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-secondary">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-surface border border-light overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-light text-secondary font-light bg-surface-alt whitespace-nowrap">
              <th className="p-4">Promo Code</th>
              <th className="p-4">Value</th>
              <th className="p-4">Usage Limit</th>
              <th className="p-4">Min. Spend</th>
              <th className="p-4">Valid Range</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light">
            {isLoading && couponsList.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={6} showAction={true} />
              ))
            ) : filteredCoupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-secondary">
                  No matching promotional records found.
                </td>
              </tr>
            ) : (
              filteredCoupons.map((c) => {
                const now = new Date();
                const validTo = new Date(c.validTo);
                const isExpired = validTo < now;
                return (
                  <tr key={c.id} className="text-primary hover:bg-surface-alt/40 transition-colors whitespace-nowrap">
                    {/* Code & Desc */}
                    <td className="p-4">
                      <div className="font-semibold text-primary select-all tracking-wider font-mono">
                        {c.code}
                      </div>
                      <div className="text-xs text-secondary max-w-[200px] truncate" title={c.description || ""}>
                        {c.description || "No description provided."}
                      </div>
                    </td>

                    {/* Value */}
                    <td className="p-4 font-semibold text-primary">
                      {c.discountType === "percentage" 
                        ? `${parseFloat(c.discountValue)}% Off`
                        : `${formatPrice(Number(c.discountValue))} Off`
                      }
                    </td>

                    {/* Usage */}
                    <td className="p-4 text-secondary text-xs">
                      {c.usedCount !== null ? c.usedCount : 0} / {c.usageLimit !== null ? c.usageLimit : "∞"}
                    </td>

                    {/* Min Spend */}
                    <td className="p-4 text-secondary text-xs">
                      {c.minOrderAmount ? formatPrice(Number(c.minOrderAmount)) : "No Min"}
                    </td>

                    {/* Valid Range */}
                    <td className="p-4 text-secondary text-xs">
                      <div>From: {new Date(c.validFrom).toLocaleDateString()}</div>
                      <div>To: {validTo.toLocaleDateString()}</div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {isExpired ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-secondary border border-light rounded-full">
                          Expired
                        </span>
                      ) : c.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-success-light text-success-dark rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-error-light text-error-dark rounded-full">
                          Disabled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        {/* Toggle active */}
                        <button
                          onClick={() => handleToggleStatus(c)}
                          disabled={isExpired}
                          className={`p-1.5 rounded transition-all select-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                            c.isActive
                              ? "text-success hover:bg-success/10"
                              : "text-secondary hover:bg-surface-alt hover:text-primary"
                          }`}
                          title={c.isActive ? "Disable Promo" : "Enable Promo"}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setPendingDelete(c)}
                          className="p-1.5 rounded transition-all select-none text-secondary hover:text-error hover:bg-error-light cursor-pointer"
                          title="Delete Promo"
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

      {/* ADD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-primary/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-surface w-full max-w-lg border border-light shadow-2xl z-10 p-8 md:p-12 animate-in zoom-in-95 duration-250">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-primary hover:text-secondary transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl text-primary mb-6 pr-8 font-light capitalize">
              Create Promo Offer
            </h2>

            {formError && (
              <div className="bg-error-light border border-error text-error text-sm p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-secondary mb-1">
                    Promo Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LUXE50, WINTER10"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') })}
                    className="w-full px-3 py-2 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all font-mono tracking-wider font-semibold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-secondary mb-1">
                    Discount Type *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full pl-3 pr-10 py-2 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none bg-transparent"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed_amount">Fixed Amount ($)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-secondary">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-secondary mb-1">
                  Discount Value *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder={formData.discountType === "percentage" ? "e.g. 10 for 10%" : "e.g. 15.00 for $15"}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all bg-transparent"
                  />
                  <div className="absolute left-3 top-2.5 text-secondary">
                    {formData.discountType === "percentage" ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-secondary mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10% off Winter items"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-secondary mb-1">
                    Min. Spend ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 50.00"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-secondary mb-1">
                    Max Discount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 20.00"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-secondary mb-1">
                  Usage Limit (Quantity)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Leave empty for unlimited usage"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="w-full px-3 py-2 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-secondary mb-1">
                    Valid From *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all bg-transparent"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-secondary mb-1">
                    Valid To *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.validTo}
                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                    className="w-full px-3 py-2 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all bg-transparent"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-dark text-primary py-2 px-6 font-light hover:bg-surface-alt transition-colors duration-300 cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 bg-primary text-inverse py-2 px-6 font-light hover:bg-primary-light transition-colors duration-300 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {isAdding && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {pendingDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-primary/60 backdrop-blur-sm transition-opacity"
            onClick={() => setPendingDelete(null)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-surface w-full max-w-lg border border-light shadow-2xl z-10 p-8 md:p-12 animate-in zoom-in-95 duration-250">
            <button
              onClick={() => setPendingDelete(null)}
              className="absolute top-6 right-6 text-primary hover:text-secondary transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl text-primary mb-6 pr-8 font-light capitalize">
              Delete Promo Offer
            </h2>

            <div className="text-secondary text-base leading-relaxed mb-8 font-light">
              <p>
                Are you sure you want to permanently delete promo offer <strong>{pendingDelete.code}</strong>? This action cannot be undone and will prevent users from applying this coupon code at checkout.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 border border-dark text-primary py-3 px-6 font-light hover:bg-surface-alt transition-colors duration-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCoupon}
                className="flex-1 bg-error hover:bg-error-light text-inverse py-3 px-6 font-light transition-colors duration-300 cursor-pointer"
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
