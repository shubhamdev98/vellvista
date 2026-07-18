"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthProvider";
import { useToast } from "../../../context/ToastProvider";
import { useBrand } from "../../../context/BrandProvider";
import { useUpdateBrandSettings } from "../../../app/hooks/useApi";
import { 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  Save,
  Eye,
  RefreshCw
} from "lucide-react";
import Image from "next/image";

export default function AdminBrandSettingsPage() {
  const { user: currentUser } = useAuth();
  const { brandName, brandLogo, isLoading: isBrandLoading, refetch } = useBrand();
  const { mutate: updateSettings, isPending: isUpdating } = useUpdateBrandSettings();
  const { showToast } = useToast();

  const [formName, setFormName] = useState("");
  const [formLogo, setFormLogo] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Sync form states with global brand context
  useEffect(() => {
    if (brandName) setFormName(brandName);
    if (brandLogo) setFormLogo(brandLogo);
  }, [brandName, brandLogo]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    const uploadData = new FormData();
    uploadData.append("image", file);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://172.29.214.47:3001";

    try {
      const response = await fetch(`${backendUrl}/api/upload-image?folder=logo`, {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      if (result.success && result.url) {
        setFormLogo(result.url);
        showToast("Brand logo uploaded successfully!", "success");
      } else {
        throw new Error(result.error || "Failed to upload image");
      }
    } catch (err) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Failed to upload logo");
      showToast("Failed to upload brand logo.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!formName.trim()) {
      showToast("Brand name cannot be empty", "error");
      return;
    }
    if (!formLogo.trim()) {
      showToast("Brand logo URL cannot be empty", "error");
      return;
    }

    try {
      await updateSettings({
        adminId: currentUser.id,
        brandName: formName,
        brandLogo: formLogo,
      });
      showToast("Brand settings updated successfully!", "success");
      refetch(); // Instantly update context
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to update brand settings", "error");
    }
  };

  const handleResetDefaults = () => {
    setFormName("VellVista");
    setFormLogo("https://res.cloudinary.com/dujjidn0e/image/upload/v1781626147/vellvista/logo/w5kkgq9suiw7sk4poxsz.png");
    showToast("Form reset to defaults (click Save to apply)", "success");
  };

  if (isBrandLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 bg-surface-alt rounded w-48" />
        <div className="h-4 bg-surface-alt rounded w-96" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-surface border border-light rounded" />
          <div className="h-96 bg-surface border border-light rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">
          Brand Configuration
        </h2>
        <p className="text-secondary text-sm">
          Configure your store's brand logo and name shown across the storefront and admin panel.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-surface border border-light p-6 space-y-6 shadow-sm">
          <h3 className="font-semibold text-lg border-b border-light pb-2 font-manrope">Identity Settings</h3>
          
          {/* Brand Name Input */}
          <div className="space-y-1.5">
            <label htmlFor="brandName" className="block text-xs font-semibold uppercase tracking-wider text-secondary">
              Brand Name
            </label>
            <input
              type="text"
              id="brandName"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
              placeholder="e.g. VellVista"
              required
            />
            <p className="text-[11px] text-secondary">
              Used in the main header text logo, document metadata title, and transactional email footers.
            </p>
          </div>

          {/* Brand Logo URL & Upload */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="brandLogoUrl" className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                Brand Logo Image URL
              </label>
              <input
                type="text"
                id="brandLogoUrl"
                value={formLogo}
                onChange={(e) => setFormLogo(e.target.value)}
                className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
                placeholder="e.g. https://example.com/logo.png"
                required
              />
            </div>

            {/* File Upload Area */}
            <div className="border border-dark p-4 bg-background flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-16 h-16 border border-dark overflow-hidden bg-white shrink-0 flex items-center justify-center">
                {formLogo ? (
                  <Image
                    src={formLogo}
                    alt="Logo preview"
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-secondary/40" />
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <p className="text-xs font-semibold text-primary">Upload Local Image</p>
                <p className="text-[10px] text-secondary">
                  Recommended size: 300x80px with transparent background.
                </p>
                {uploadError && <p className="text-[10px] text-error mt-1">{uploadError}</p>}
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                <label className="flex items-center gap-2 justify-center bg-background border border-dark py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-primary hover:bg-surface-alt cursor-pointer transition-colors duration-200">
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Choose Image File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-light">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex-1 border border-dark text-primary py-3 px-6 text-xs font-bold uppercase tracking-widest hover:bg-surface-alt transition-colors duration-300 flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Defaults
            </button>

            <button
              type="submit"
              disabled={isUpdating || isUploading}
              className="flex-1 bg-primary text-inverse py-3 px-6 text-xs font-bold uppercase tracking-widest hover:bg-primary-light active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Brand Settings
            </button>
          </div>
        </form>

        {/* Live Preview Panel */}
        <div className="lg:col-span-5 bg-surface border border-light p-6 space-y-6 shadow-sm flex flex-col">
          <h3 className="font-semibold text-lg border-b border-light pb-2 font-manrope flex items-center gap-2">
            <Eye className="h-5 w-5 text-secondary" />
            Live Previews
          </h3>

          <div className="flex-1 space-y-6">
            {/* Header Preview */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Store Header fallback</span>
              <div className="bg-[#f9f9f9] border border-dark p-4 h-16 flex items-center justify-center relative select-none">
                <div className="absolute left-4 top-2 text-[8px] text-secondary font-mono">1:1 Navbar</div>
                <div className="text-base font-bold uppercase tracking-[0.25em] text-primary font-manrope text-center">
                  {formName || "VELLVISTA"}
                </div>
              </div>
            </div>

            {/* Footer Logo Preview */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Store Footer (Dark)</span>
              <div className="bg-primary-light border border-dark p-4 h-20 flex items-center justify-center relative select-none">
                <div className="absolute left-4 top-2 text-[8px] text-inverse/40 font-mono">Footer BG</div>

                <div className="relative h-10 w-[7.5rem]">
                  {formLogo ? (
                    <Image
                      src={formLogo}
                      alt={formName}
                      fill
                      className="object-contain brightness-0 invert"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full border border-dashed border-inverse/25 flex items-center justify-center text-xs text-inverse/50">
                      No Logo
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Panel Logo Preview */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Admin Dashboard Sidebar</span>
              <div className="bg-white border border-dark p-4 h-16 flex items-center justify-start gap-4 relative select-none">
                <div className="absolute right-4 top-2 text-[8px] text-secondary font-mono">Sidebar BG</div>

                <div className="relative h-8 w-24">
                  {formLogo ? (
                    <Image
                      src={formLogo}
                      alt={`${formName} Admin`}
                      fill
                      className="object-contain object-left"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full border border-dashed border-light flex items-center justify-center text-[10px] text-secondary">
                      No Logo
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Visual Guidelines */}
            <div className="p-4 bg-surface-alt border border-light text-[11px] text-secondary leading-relaxed space-y-1">
              <p className="font-semibold text-primary">💡 Graphic specifications:</p>
              <p>• Logo transparency allows proper inversion inside the dark footer layout.</p>
              <p>• Modifications affect branding globally across public & backend systems.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
