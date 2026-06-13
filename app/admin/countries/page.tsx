"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  useCountries, 
  useAddCountry, 
  useUpdateCountry, 
  useToggleCountryStatus, 
  useDeleteCountry 
} from "../../hooks/useApi";
import { 
  Search, 
  Globe, 
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

interface CountryData {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminCountriesPage() {
  const { user: currentUser } = useAuth();
  const { data: rawCountries, isLoading, error: fetchError } = useCountries(false);
  const [countriesList, setCountriesList] = useState<CountryData[]>([]);
  const { showToast } = useToast();

  const { mutate: addCountry, isPending: isAdding } = useAddCountry();
  const { mutate: updateCountry, isPending: isUpdating } = useUpdateCountry();
  const { mutate: toggleStatus } = useToggleCountryStatus();
  const { mutate: deleteCountry } = useDeleteCountry();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Add/Edit modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "" });
  const [formError, setFormError] = useState("");

  // Delete confirmation state
  const [pendingDelete, setPendingDelete] = useState<CountryData | null>(null);

  // Map backend data to local state
  useEffect(() => {
    if (rawCountries) {
      setCountriesList(rawCountries as CountryData[]);
    }
  }, [rawCountries]);

  // Handle toggle status change
  const handleToggleStatus = async (countryId: number, currentStatus: boolean) => {
    if (!currentUser) return;
    try {
      const nextStatus = !currentStatus;
      await toggleStatus({
        adminId: currentUser.id,
        countryId,
        isActive: nextStatus
      });
      setCountriesList(prev => 
        prev.map(c => c.id === countryId ? { ...c, isActive: nextStatus } : c)
      );
      showToast(`Country status successfully updated.`, "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to update country status.", "error");
    }
  };

  // Open modal for add
  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedCountry(null);
    setFormData({ name: "", code: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (country: CountryData) => {
    setModalMode("edit");
    setSelectedCountry(country);
    setFormData({ name: country.name, code: country.code });
    setFormError("");
    setIsModalOpen(true);
  };

  // Handle Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFormError("");

    const name = formData.name.trim();
    const code = formData.code.trim().toUpperCase();

    if (!name) {
      setFormError("Country name is required.");
      return;
    }
    if (code.length !== 2) {
      setFormError("ISO Code must be exactly 2 characters (e.g. US, IN).");
      return;
    }

    try {
      if (modalMode === "add") {
        await addCountry({
          adminId: currentUser.id,
          name,
          code
        });
        showToast(`Country "${name}" added successfully.`, "success");
      } else {
        if (!selectedCountry) return;
        await updateCountry({
          adminId: currentUser.id,
          countryId: selectedCountry.id,
          name,
          code
        });
        showToast(`Country "${name}" updated successfully.`, "success");
      }
      
      setIsModalOpen(false);
      // Wait briefly for toast to show and force state reload
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "An error occurred. Please try again.");
    }
  };

  // Handle Delete Country
  const handleDeleteCountry = async () => {
    if (!pendingDelete || !currentUser) return;
    try {
      await deleteCountry({
        adminId: currentUser.id,
        countryId: pendingDelete.id
      });
      setCountriesList(prev => prev.filter(c => c.id !== pendingDelete.id));
      showToast(`Country "${pendingDelete.name}" deleted successfully.`, "success");
      setPendingDelete(null);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to delete country.", "error");
      setPendingDelete(null);
    }
  };

  // Summary stats
  const stats = useMemo(() => {
    const total = countriesList.length;
    const active = countriesList.filter(c => c.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [countriesList]);

  // Filtered countries
  const filteredCountries = useMemo(() => {
    return countriesList.filter(c => {
      const nameMatch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const codeMatch = c.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = nameMatch || codeMatch;

      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "active" && c.isActive) ||
        (statusFilter === "inactive" && !c.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [countriesList, searchTerm, statusFilter]);

  if (fetchError) {
    return (
      <div className="bg-error-light border border-error text-error p-6 flex items-start gap-3">
        <AlertCircle className="h-6 w-6 shrink-0" />
        <div>
          <h3 className="font-semibold text-lg">Failed to Load Countries</h3>
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
          <h2 className="text-2xl font-semibold text-primary mb-1">Country Management</h2>
          <p className="text-secondary text-sm">Configure and monitor countries enabled for address registration and shipping.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-inverse hover:bg-primary-light px-5 py-2.5 transition-all text-sm font-light shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Country
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-6">
        {/* Total Countries */}
        <div className="bg-surface p-3 sm:p-6 border border-light flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">
              <span className="hidden sm:inline">Total Countries</span>
              <span className="sm:hidden">Total</span>
            </span>
            <div className="text-lg sm:text-2xl font-semibold text-primary">{isLoading ? "..." : stats.total}</div>
          </div>
          <div className="p-2 sm:p-3 bg-primary/5 rounded-full text-primary shrink-0 hidden sm:flex">
            <Globe className="h-5 w-5" />
          </div>
        </div>

        {/* Active Countries */}
        <div className="bg-surface p-3 sm:p-6 border border-light flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">
              <span className="hidden sm:inline">Active Countries</span>
              <span className="sm:hidden">Active</span>
            </span>
            <div className="text-lg sm:text-2xl font-semibold text-success">{isLoading ? "..." : stats.active}</div>
          </div>
          <div className="p-2 sm:p-3 bg-success/5 rounded-full text-success shrink-0 hidden sm:flex">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Disabled Countries */}
        <div className="bg-surface p-3 sm:p-6 border border-light flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">
              <span className="hidden sm:inline">Disabled Countries</span>
              <span className="sm:hidden">Disabled</span>
            </span>
            <div className="text-lg sm:text-2xl font-semibold text-secondary">{isLoading ? "..." : stats.inactive}</div>
          </div>
          <div className="p-2 sm:p-3 bg-primary/5 rounded-full text-secondary shrink-0 hidden sm:flex">
            <Globe className="h-5 w-5 opacity-40" />
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
              placeholder="Search name or ISO code..."
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
              <th className="p-4">Country Name</th>
              <th className="p-4">ISO Code</th>
              <th className="p-4">Added Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-secondary">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-secondary" />
                    <span>Loading countries registry...</span>
                  </div>
                </td>
              </tr>
            ) : filteredCountries.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-secondary">
                  No matching country records found.
                </td>
              </tr>
            ) : (
              filteredCountries.map((c) => (
                <tr key={c.id} className="text-primary hover:bg-surface-alt/40 transition-colors whitespace-nowrap">
                  {/* Name */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-4 relative shrink-0 border border-light overflow-hidden bg-background-muted">
                        <img
                          src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                          alt={`${c.name} Flag`}
                          className="w-full h-full object-cover animate-fade-in"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                      <span className="font-semibold text-primary">{c.name}</span>
                    </div>
                  </td>

                  {/* ISO Code */}
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-primary/5 text-primary border border-light rounded-md tracking-wider">
                      {c.code}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="p-4 text-secondary text-xs">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : "N/A"}
                  </td>

                  {/* Status Badge */}
                  <td className="p-4">
                    {c.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-success-light text-success-dark rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-error-light text-error-dark rounded-full">
                        Disabled
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      {/* Toggle Active Status */}
                      <button
                        onClick={() => handleToggleStatus(c.id, c.isActive)}
                        className={`p-1.5 rounded transition-all select-none cursor-pointer ${
                          c.isActive
                            ? "text-success hover:bg-success/10"
                            : "text-secondary hover:bg-surface-alt hover:text-primary"
                        }`}
                        title={c.isActive ? "Disable Country" : "Enable Country"}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>

                      {/* Edit Country Details */}
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 rounded transition-all select-none text-secondary hover:bg-surface-alt hover:text-primary cursor-pointer"
                        title="Edit Country"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      {/* Delete Country */}
                      <button
                        onClick={() => setPendingDelete(c)}
                        className="p-1.5 rounded transition-all select-none text-secondary hover:text-error hover:bg-error-light cursor-pointer"
                        title="Delete Country"
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
              {modalMode === "add" ? "Add New Country" : "Edit Country"}
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
                  Country Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. United States, India"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
                  ISO Code (2-Char) *
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    required
                    maxLength={2}
                    placeholder="e.g. US, IN"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="flex-1 px-3 py-2.5 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all tracking-widest font-semibold uppercase"
                  />
                  {formData.code.length === 2 && (
                    <div className="w-8 h-5 border border-light overflow-hidden shrink-0 bg-background-muted">
                      <img
                        src={`https://flagcdn.com/w40/${formData.code.toLowerCase()}.png`}
                        alt="Flag Preview"
                        className="w-full h-full object-cover animate-fade-in"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
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
              Delete Country Account
            </h2>

            <div className="text-secondary text-base leading-relaxed mb-8 font-light">
              <p>
                Are you sure you want to permanently delete <strong>{pendingDelete.name}</strong> ({pendingDelete.code})? This action cannot be undone and may affect address lists.
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
                onClick={handleDeleteCountry}
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
