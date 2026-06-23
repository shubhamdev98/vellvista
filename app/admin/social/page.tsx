"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  useAdminSocialLinks, 
  useAdminCreateSocialLink, 
  useAdminUpdateSocialLink, 
  useAdminDeleteSocialLink,
  type SocialLink
} from "../../hooks/useApi";
import { 
  Search, 
  Share2, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Loader2, 
  X, 
  AlertCircle,
  ChevronDown,
  Globe
} from "lucide-react";
import { useAuth } from "../../../context/AuthProvider";
import { useToast } from "../../../context/ToastProvider";
import Skeleton, { TableRowSkeleton } from "../../../components/ui/Skeleton";

export default function AdminSocialLinksPage() {
  const { user: currentUser } = useAuth();
  const { data: rawLinks, isLoading, error: fetchError } = useAdminSocialLinks(currentUser?.id);
  const [linksList, setLinksList] = useState<SocialLink[]>([]);
  const { showToast } = useToast();

  const { mutate: createLink, isPending: isAdding } = useAdminCreateSocialLink();
  const { mutate: updateLink, isPending: isUpdating } = useAdminUpdateSocialLink();
  const { mutate: deleteLink } = useAdminDeleteSocialLink();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Add/Edit modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedLink, setSelectedLink] = useState<SocialLink | null>(null);
  const [formData, setFormData] = useState({ name: "", url: "", image: "" });
  const [formError, setFormError] = useState("");
  
  // Image Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Delete confirmation state
  const [pendingDelete, setPendingDelete] = useState<SocialLink | null>(null);

  // Map backend data to local state
  useEffect(() => {
    if (rawLinks) {
      setLinksList(rawLinks);
    }
  }, [rawLinks]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    const uploadData = new FormData();
    uploadData.append("image", file);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://172.29.214.47:3001";

    try {
      const response = await fetch(`${backendUrl}/api/upload-image?folder=social`, {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      if (result.success && result.url) {
        setFormData((prev) => ({ ...prev, image: result.url }));
        showToast("Social media icon uploaded successfully!", "success");
      } else {
        throw new Error(result.error || "Failed to upload image");
      }
    } catch (err) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Failed to upload image");
      showToast("Failed to upload image.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle toggle status change
  const handleToggleStatus = async (link: SocialLink) => {
    if (!currentUser) return;
    try {
      const nextStatus = !link.isActive;
      await updateLink({
        adminId: currentUser.id,
        id: link.id,
        name: link.name,
        url: link.url,
        image: link.image,
        isActive: nextStatus
      });
      setLinksList(prev => 
        prev.map(l => l.id === link.id ? { ...l, isActive: nextStatus } : l)
      );
      showToast(`Social link status successfully updated.`, "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to update status.", "error");
    }
  };

  // Open modal for add
  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedLink(null);
    setFormData({ name: "", url: "", image: "" });
    setFormError("");
    setUploadError("");
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (link: SocialLink) => {
    setModalMode("edit");
    setSelectedLink(link);
    setFormData({ 
      name: link.name, 
      url: link.url, 
      image: link.image
    });
    setFormError("");
    setUploadError("");
    setIsModalOpen(true);
  };

  // Handle Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFormError("");

    const name = formData.name.trim();
    const url = formData.url.trim();
    const image = formData.image.trim();

    if (!name) {
      setFormError("Social platform name is required.");
      return;
    }
    if (!url) {
      setFormError("Platform profile URL is required.");
      return;
    }
    if (!image) {
      setFormError("Platform icon image is required.");
      return;
    }

    try {
      if (modalMode === "add") {
        await createLink({
          adminId: currentUser.id,
          name,
          url,
          image
        });
        showToast(`Social link for "${name}" created successfully.`, "success");
      } else {
        if (!selectedLink) return;
        await updateLink({
          adminId: currentUser.id,
          id: selectedLink.id,
          name,
          url,
          image,
          isActive: selectedLink.isActive
        });
        showToast(`Social link for "${name}" updated successfully.`, "success");
      }
      
      setIsModalOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "An error occurred. Please try again.");
    }
  };

  // Handle Delete Link
  const handleDeleteLink = async () => {
    if (!pendingDelete || !currentUser) return;
    try {
      await deleteLink({
        adminId: currentUser.id,
        id: pendingDelete.id
      });
      setLinksList(prev => prev.filter(l => l.id !== pendingDelete.id));
      showToast(`Social link for "${pendingDelete.name}" deleted successfully.`, "success");
      setPendingDelete(null);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to delete social link.", "error");
      setPendingDelete(null);
    }
  };

  // Summary stats
  const stats = useMemo(() => {
    const total = linksList.length;
    const active = linksList.filter(l => l.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [linksList]);

  // Filtered links
  const filteredLinks = useMemo(() => {
    return linksList.filter(l => {
      const nameMatch = l.name.toLowerCase().includes(searchTerm.toLowerCase());
      const urlMatch = l.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = nameMatch || urlMatch;

      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "active" && l.isActive) ||
        (statusFilter === "inactive" && !l.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [linksList, searchTerm, statusFilter]);

  if (fetchError) {
    return (
      <div className="bg-error-light border border-error text-error p-6 flex items-start gap-3">
        <AlertCircle className="h-6 w-6 shrink-0" />
        <div>
          <h3 className="font-semibold text-lg">Failed to Load Social Links</h3>
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
          <h2 className="text-2xl font-semibold text-primary mb-1">Social Media Configuration</h2>
          <p className="text-secondary text-sm">Configure, upload logos, and set links for your store's social media platforms shown in the footer.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-inverse hover:bg-primary-light px-5 py-2.5 transition-all text-sm font-light shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Social Link
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-4 md:gap-6">
        {/* Total Options */}
        <div className="bg-surface p-3 sm:p-6 border border-light flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">
              Total Platforms
            </span>
            <div className="text-lg sm:text-2xl font-semibold text-primary">
              {isLoading ? <Skeleton className="h-6 w-12 rounded inline-block" /> : stats.total}
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-primary/5 rounded-full text-primary shrink-0 hidden sm:flex">
            <Share2 className="h-5 w-5" />
          </div>
        </div>

        {/* Active Options */}
        <div className="bg-surface p-3 sm:p-6 border border-light flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-secondary uppercase tracking-wider block truncate">
              Active Links
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
              Disabled Links
            </span>
            <div className="text-lg sm:text-2xl font-semibold text-secondary">
              {isLoading ? <Skeleton className="h-6 w-12 rounded inline-block" /> : stats.inactive}
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-primary/5 rounded-full text-secondary shrink-0 hidden sm:flex">
            <Share2 className="h-5 w-5 opacity-40" />
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
              placeholder="Search platform name or profile URL..."
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
              <th className="p-4 w-16">Icon</th>
              <th className="p-4">Platform Name</th>
              <th className="p-4">Profile Link (URL)</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light">
            {isLoading && linksList.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={5} showAction={true} />
              ))
            ) : filteredLinks.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-secondary">
                  No social media platforms configured.
                </td>
              </tr>
            ) : (
              filteredLinks.map((l) => (
                <tr key={l.id} className="text-primary hover:bg-surface-alt/40 transition-colors whitespace-nowrap">
                  {/* Icon */}
                  <td className="p-4">
                    <img src={l.image} alt={l.name} className="h-6 w-6 object-contain border border-light p-0.5 bg-primary brightness-0 invert" />
                  </td>

                  {/* Name */}
                  <td className="p-4 font-semibold">{l.name}</td>

                  {/* URL */}
                  <td className="p-4 text-secondary max-w-sm truncate">
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1.5 text-xs text-primary">
                      <Globe className="h-3 w-3 shrink-0" />
                      <span>{l.url}</span>
                    </a>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    {l.isActive ? (
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
                        onClick={() => handleToggleStatus(l)}
                        className={`p-1.5 rounded transition-all select-none cursor-pointer ${
                          l.isActive
                            ? "text-success hover:bg-success/10"
                            : "text-secondary hover:bg-surface-alt hover:text-primary"
                        }`}
                        title={l.isActive ? "Disable Link" : "Enable Link"}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEdit(l)}
                        className="p-1.5 rounded transition-all select-none text-secondary hover:bg-surface-alt hover:text-primary cursor-pointer"
                        title="Edit Link"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setPendingDelete(l)}
                        className="p-1.5 rounded transition-all select-none text-secondary hover:text-error hover:bg-error-light cursor-pointer"
                        title="Delete Link"
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
              {modalMode === "add" ? "Create Social Platform" : "Edit Social Platform"}
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
                  Platform Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Facebook, Instagram, Twitter"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
                  Profile URL Link *
                </label>
                <input
                  type="url"
                  required
                  placeholder="e.g. https://facebook.com/yourbrand"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2.5 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
                  Platform Icon (Image) *
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-surface-alt hover:bg-light text-primary border border-default px-4 py-2 text-xs font-semibold tracking-wide transition-all select-none">
                      {isUploading ? "Uploading..." : "Choose Local Image"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                    {formData.image && (
                      <span className="text-xs text-success font-light">✓ Icon Uploaded</span>
                    )}
                  </div>

                  <div>
                    <span className="text-xs text-secondary block mb-1">Or enter image URL:</span>
                    <input
                      type="text"
                      placeholder="e.g. https://example.com/social-icon.png"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-2.5 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  {uploadError && (
                    <p className="text-xs text-error font-light">{uploadError}</p>
                  )}

                  {formData.image && (
                    <div className="mt-2 border border-light p-2 bg-primary rounded inline-block">
                      <p className="text-xs text-secondary mb-1">Preview:</p>
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="h-8 w-8 object-contain brightness-0 invert"
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
              Delete Social Link
            </h2>

            <div className="text-secondary text-base leading-relaxed mb-8 font-light">
              <p>
                Are you sure you want to permanently delete the social media link for <strong>{pendingDelete.name}</strong>? This action cannot be undone.
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
                onClick={handleDeleteLink}
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
