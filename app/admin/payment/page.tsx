"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  useAdminPaymentMethods, 
  useAdminCreatePaymentMethod, 
  useAdminUpdatePaymentMethod, 
  useAdminDeletePaymentMethod,
  type PaymentMethod
} from "../../hooks/useApi";
import { 
  Search, 
  CreditCard, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Loader2, 
  X, 
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { useAuth } from "../../../context/AuthProvider";
import { useToast } from "../../../context/ToastProvider";
import Skeleton, { TableRowSkeleton } from "../../../components/ui/Skeleton";

export default function AdminPaymentMethodsPage() {
  const { user: currentUser } = useAuth();
  const { data: rawMethods, isLoading, error: fetchError } = useAdminPaymentMethods(currentUser?.id);
  const [methodsList, setMethodsList] = useState<PaymentMethod[]>([]);
  const { showToast } = useToast();

  const { mutate: createMethod, isPending: isAdding } = useAdminCreatePaymentMethod();
  const { mutate: updateMethod, isPending: isUpdating } = useAdminUpdatePaymentMethod();
  const { mutate: deleteMethod } = useAdminDeletePaymentMethod();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Add/Edit modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", description: "" });
  const [formError, setFormError] = useState("");

  // Delete confirmation state
  const [pendingDelete, setPendingDelete] = useState<PaymentMethod | null>(null);

  // Map backend data to local state
  useEffect(() => {
    if (rawMethods) {
      setMethodsList(rawMethods);
    }
  }, [rawMethods]);

  // Handle toggle status change
  const handleToggleStatus = async (method: PaymentMethod) => {
    if (!currentUser) return;
    try {
      const nextStatus = !method.isActive;
      await updateMethod({
        adminId: currentUser.id,
        id: method.id,
        name: method.name,
        code: method.code,
        description: method.description || "",
        isActive: nextStatus
      });
      setMethodsList(prev => 
        prev.map(m => m.id === method.id ? { ...m, isActive: nextStatus } : m)
      );
      showToast(`Payment method status successfully updated.`, "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to update status.", "error");
    }
  };

  // Open modal for add
  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedMethod(null);
    setFormData({ name: "", code: "", description: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (method: PaymentMethod) => {
    setModalMode("edit");
    setSelectedMethod(method);
    setFormData({ 
      name: method.name, 
      code: method.code, 
      description: method.description || ""
    });
    setFormError("");
    setIsModalOpen(true);
  };

  // Handle Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFormError("");

    const name = formData.name.trim();
    const code = formData.code.trim().toLowerCase();
    const description = formData.description.trim();

    if (!name) {
      setFormError("Payment method name is required.");
      return;
    }
    if (!code) {
      setFormError("Payment method code is required.");
      return;
    }

    try {
      if (modalMode === "add") {
        await createMethod({
          adminId: currentUser.id,
          name,
          code,
          description: description || undefined
        });
        showToast(`Payment method "${name}" created successfully.`, "success");
      } else {
        if (!selectedMethod) return;
        await updateMethod({
          adminId: currentUser.id,
          id: selectedMethod.id,
          name,
          code,
          description: description || undefined,
          isActive: selectedMethod.isActive
        });
        showToast(`Payment method "${name}" updated successfully.`, "success");
      }
      
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

  // Handle Delete Method
  const handleDeleteMethod = async () => {
    if (!pendingDelete || !currentUser) return;
    try {
      await deleteMethod({
        adminId: currentUser.id,
        id: pendingDelete.id
      });
      setMethodsList(prev => prev.filter(m => m.id !== pendingDelete.id));
      showToast(`Payment method "${pendingDelete.name}" deleted successfully.`, "success");
      setPendingDelete(null);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to delete payment method.", "error");
      setPendingDelete(null);
    }
  };

  // Summary stats
  const stats = useMemo(() => {
    const total = methodsList.length;
    const active = methodsList.filter(m => m.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [methodsList]);

  // Filtered methods
  const filteredMethods = useMemo(() => {
    return methodsList.filter(m => {
      const nameMatch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
      const codeMatch = m.code.toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = (m.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = nameMatch || codeMatch || descMatch;

      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "active" && m.isActive) ||
        (statusFilter === "inactive" && !m.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [methodsList, searchTerm, statusFilter]);

  if (fetchError) {
    return (
      <div className="bg-error-light border border-error text-error p-6 flex items-start gap-3">
        <AlertCircle className="h-6 w-6 shrink-0" />
        <div>
          <h3 className="font-semibold text-lg">Failed to Load Payment Methods</h3>
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
          <h2 className="text-2xl font-semibold text-primary mb-1">Payment Options Configuration</h2>
          <p className="text-secondary text-sm">Configure and monitor checkout payment options, gateway identifiers, and active statuses.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-inverse hover:bg-primary-light px-5 py-2.5 transition-all text-sm font-light shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Payment Method
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-4 md:gap-6">
        {/* Total Options */}
        <div className="bg-surface p-3 sm:p-6 border border-light flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">
              Total Options
            </span>
            <div className="text-lg sm:text-2xl font-semibold text-primary">
              {isLoading ? <Skeleton className="h-6 w-12 rounded inline-block" /> : stats.total}
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-primary/5 rounded-full text-primary shrink-0 hidden sm:flex">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        {/* Active Options */}
        <div className="bg-surface p-3 sm:p-6 border border-light flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">
              Active Options
            </span>
            <div className="text-lg sm:text-2xl font-semibold text-success">
              {isLoading ? <Skeleton className="h-6 w-12 rounded inline-block" /> : stats.active}
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-success/5 rounded-full text-success shrink-0 hidden sm:flex">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Disabled Options */}
        <div className="bg-surface p-3 sm:p-6 border border-light flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">
              Disabled Options
            </span>
            <div className="text-lg sm:text-2xl font-semibold text-secondary">
              {isLoading ? <Skeleton className="h-6 w-12 rounded inline-block" /> : stats.inactive}
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-primary/5 rounded-full text-secondary shrink-0 hidden sm:flex">
            <CreditCard className="h-5 w-5 opacity-40" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface p-4 sm:p-6 border border-light">
        <div className="flex gap-3 items-center w-full">
          {/* Search bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary" />
            <input
              type="text"
              placeholder="Search payment method name, code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all bg-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="w-[120px] sm:w-[150px] shrink-0 relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-2 sm:pl-3 pr-8 py-2 border border-dark bg-background text-primary text-xs sm:text-sm focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none truncate bg-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Disabled Only</option>
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
              <th className="p-4">Name</th>
              <th className="p-4">Gateway Code</th>
              <th className="p-4">Description</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light">
            {isLoading && methodsList.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={4} showAction={true} />
              ))
            ) : filteredMethods.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-secondary">
                  No matching payment records found.
                </td>
              </tr>
            ) : (
              filteredMethods.map((m) => (
                <tr key={m.id} className="text-primary hover:bg-surface-alt/40 transition-colors whitespace-nowrap">
                  {/* Name */}
                  <td className="p-4 font-semibold">{m.name}</td>

                  {/* Gateway Code */}
                  <td className="p-4 text-xs font-mono bg-surface-alt/20 select-all">{m.code}</td>

                  {/* Description */}
                  <td className="p-4 text-secondary max-w-xs truncate">{m.description || "N/A"}</td>

                  {/* Status */}
                  <td className="p-4">
                    {m.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-success-light text-success-dark rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-error-light text-error-dark rounded-full">
                        Disabled
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      {/* Toggle status */}
                      <button
                        onClick={() => handleToggleStatus(m)}
                        className={`p-1.5 rounded transition-all select-none cursor-pointer ${
                          m.isActive
                            ? "text-success hover:bg-success/10"
                            : "text-secondary hover:bg-surface-alt hover:text-primary"
                        }`}
                        title={m.isActive ? "Disable Option" : "Enable Option"}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 rounded transition-all select-none text-secondary hover:bg-surface-alt hover:text-primary cursor-pointer"
                        title="Edit Option"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setPendingDelete(m)}
                        className="p-1.5 rounded transition-all select-none text-secondary hover:text-error hover:bg-error-light cursor-pointer"
                        title="Delete Option"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
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
              {modalMode === "add" ? "Create Payment Option" : "Edit Payment Option"}
            </h2>

            {formError && (
              <div className="bg-error-light border border-error text-error text-sm p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
                  Payment Method Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google Pay, Debit Card"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
                  Gateway Identifier Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. gpay, debit_card, credit_card, upi"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  className="w-full px-3 py-2.5 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pay securely via card details"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-dark text-primary py-3 px-6 font-light hover:bg-surface-alt transition-colors duration-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding || isUpdating}
                  className="flex-1 bg-primary text-inverse py-3 px-6 font-light hover:bg-primary-light transition-colors duration-300 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {(isAdding || isUpdating) && <Loader2 className="h-4 w-4 animate-spin" />}
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
              Delete Payment Method
            </h2>

            <div className="text-secondary text-base leading-relaxed mb-8 font-light">
              <p>
                Are you sure you want to permanently delete payment method <strong>{pendingDelete.name}</strong>? This action cannot be undone and may affect active user checkouts.
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
                onClick={handleDeleteMethod}
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
