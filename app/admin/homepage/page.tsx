"use client";

import { useState, useEffect } from "react";
import { 
  useHeroSettings, 
  useUpdateHeroSettings, 
  usePromoBanner, 
  useUpdatePromoBanner,
  useFaqs,
  useCreateFaq,
  useUpdateFaq,
  useDeleteFaq,
  useHomepageCategories,
  useCreateHomepageCategory,
  useUpdateHomepageCategory,
  useDeleteHomepageCategory,
  useMarqueeMessages,
  useCreateMarqueeMessage,
  useUpdateMarqueeMessage,
  useDeleteMarqueeMessage,
  useUpdateBrandSettings
} from "../../hooks/useApi";
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Edit2, 
  Upload, 
  Save, 
  Layout, 
  Video, 
  Image as ImageIcon, 
  Type, 
  HelpCircle,
  X,
  Play,
  GripVertical,
  Shield,
  Eye,
  RefreshCw
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "../../../context/AuthProvider";
import { useToast } from "../../../context/ToastProvider";
import { useBrand } from "../../../context/BrandProvider";
import { getProductImageUrl } from "../../utils/image";

// Helper to parse gridSpan string
function parseGridSpan(gridSpanString: string) {
  const parts = (gridSpanString || "").split(" ");
  
  let mobileSpan = "col-span-1";
  if (parts.includes("col-span-2")) {
    mobileSpan = "col-span-2";
  }

  let desktopSpan = "md:col-span-1";
  for (const part of parts) {
    if (part.startsWith("md:col-span-")) {
      desktopSpan = part;
      break;
    }
  }
  if (!parts.some(p => p.startsWith("md:col-span-"))) {
    if (parts.includes("col-span-1")) desktopSpan = "md:col-span-1";
    else if (parts.includes("col-span-2")) desktopSpan = "md:col-span-2";
    else if (parts.includes("col-span-3")) desktopSpan = "md:col-span-3";
    else if (parts.includes("col-span-4")) desktopSpan = "md:col-span-4";
  }

  let rowSpan = "none";
  if (parts.includes("md:row-span-2")) {
    rowSpan = "md:row-span-2";
  } else if (parts.includes("row-span-2")) {
    rowSpan = "row-span-2";
  }

  return { mobileSpan, desktopSpan, rowSpan };
}

function constructGridSpan(mobileSpan: string, desktopSpan: string, rowSpan: string) {
  const parts = [mobileSpan, desktopSpan];
  if (rowSpan !== "none") {
    parts.push(rowSpan);
  }
  return parts.join(" ");
}

const getSpanLabel = (gridSpan: string) => {
  const parts = (gridSpan || "").split(" ");
  const isMobileFull = parts.includes("col-span-2");
  
  let desktopWidth = "25%";
  if (parts.includes("md:col-span-2")) desktopWidth = "50%";
  else if (parts.includes("md:col-span-3")) desktopWidth = "75%";
  else if (parts.includes("md:col-span-4")) desktopWidth = "100%";
  
  const isTall = parts.includes("row-span-2") || parts.includes("md:row-span-2");
  
  return `Mobile: ${isMobileFull ? "Full" : "Half"} | Desktop: ${desktopWidth}${isTall ? " (Tall)" : ""}`;
};

export default function AdminHomepageManager() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"hero" | "banner" | "categories" | "marquee" | "faqs" | "brand">("hero");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["hero", "banner", "categories", "marquee", "faqs", "brand"].includes(tab)) {
        setActiveTab(tab as any);
      }
    }
  }, []);

  // Brand Configuration Settings State
  const { brandName, brandLogo, isLoading: isBrandLoading, refetch: refetchBrand } = useBrand();
  const { mutate: updateBrandSettings, isPending: isUpdatingBrand } = useUpdateBrandSettings();
  const [brandFormName, setBrandFormName] = useState("");
  const [brandFormLogo, setBrandFormLogo] = useState("");
  const [isUploadingBrandLogo, setIsUploadingBrandLogo] = useState(false);
  const [brandUploadError, setBrandUploadError] = useState("");

  useEffect(() => {
    if (brandName) setBrandFormName(brandName);
    if (brandLogo) setBrandFormLogo(brandLogo);
  }, [brandName, brandLogo]);

  const handleBrandLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBrandLogo(true);
    setBrandUploadError("");

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
        setBrandFormLogo(result.url);
        showToast("Brand logo uploaded successfully!", "success");
      } else {
        throw new Error(result.error || "Failed to upload image");
      }
    } catch (err) {
      console.error(err);
      setBrandUploadError(err instanceof Error ? err.message : "Failed to upload logo");
      showToast("Failed to upload brand logo.", "error");
    } finally {
      setIsUploadingBrandLogo(false);
    }
  };

  const handleBrandSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!brandFormName.trim()) {
      showToast("Brand name cannot be empty", "error");
      return;
    }
    if (!brandFormLogo.trim()) {
      showToast("Brand logo URL cannot be empty", "error");
      return;
    }

    try {
      await updateBrandSettings({
        adminId: currentUser.id,
        brandName: brandFormName,
        brandLogo: brandFormLogo,
      });
      showToast("Brand settings updated successfully!", "success");
      refetchBrand();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to update brand settings", "error");
    }
  };

  const handleBrandResetDefaults = () => {
    setBrandFormName("VellVista");
    setBrandFormLogo("https://res.cloudinary.com/dujjidn0e/image/upload/v1781626147/vellvista/logo/w5kkgq9suiw7sk4poxsz.png");
    showToast("Form reset to defaults (click Save to apply)", "success");
  };

  // Layout temp states
  const [tempMobileSpan, setTempMobileSpan] = useState("col-span-1");
  const [tempDesktopSpan, setTempDesktopSpan] = useState("md:col-span-1");
  const [tempRowSpan, setTempRowSpan] = useState("none");

  // Hero Section Settings
  const { data: heroData, isLoading: isHeroLoading } = useHeroSettings();
  const { mutate: updateHeroSettings, isPending: isUpdatingHero } = useUpdateHeroSettings();
  const [heroForm, setHeroForm] = useState({
    title: "",
    subtitle: "",
    mobileVideo: "",
    desktopVideo: ""
  });
  const [isUploadingVideo, setIsUploadingVideo] = useState({ mobile: false, desktop: false });

  useEffect(() => {
    if (heroData) {
      setHeroForm({
        title: heroData.title || "",
        subtitle: heroData.subtitle || "",
        mobileVideo: heroData.mobileVideo || "",
        desktopVideo: heroData.desktopVideo || ""
      });
    }
  }, [heroData]);

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await updateHeroSettings({
        adminId: currentUser.id,
        title: heroForm.title,
        subtitle: heroForm.subtitle,
        mobileVideo: heroForm.mobileVideo,
        desktopVideo: heroForm.desktopVideo
      });
      showToast("Hero settings updated successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update hero settings", "error");
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "mobile" | "desktop") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(prev => ({ ...prev, [type]: true }));
    const uploadData = new FormData();
    uploadData.append("video", file);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://172.29.214.47:3001";

    try {
      const response = await fetch(`${backendUrl}/api/upload-hero-video?type=${type}`, {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) throw new Error("Video upload failed");

      const result = await response.json();
      if (result.success && result.url) {
        if (type === "mobile") {
          setHeroForm(prev => ({ ...prev, mobileVideo: result.url }));
        } else {
          setHeroForm(prev => ({ ...prev, desktopVideo: result.url }));
        }
        showToast(`${type === "mobile" ? "Mobile" : "Desktop"} video uploaded successfully`, "success");
      } else {
        throw new Error(result.error || "Failed to upload video");
      }
    } catch (err: any) {
      showToast(err.message || "Video upload failed", "error");
    } finally {
      setIsUploadingVideo(prev => ({ ...prev, [type]: false }));
    }
  };

  // Promo Banner Settings
  const { data: promoData, isLoading: isPromoLoading } = usePromoBanner();
  const { mutate: updatePromoBanner, isPending: isUpdatingPromo } = useUpdatePromoBanner();
  const [promoForm, setPromoForm] = useState({
    title: "",
    description: "",
    image: ""
  });
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  useEffect(() => {
    if (promoData) {
      setPromoForm({
        title: promoData.title || "",
        description: (promoData as any).description || "",
        image: promoData.image || ""
      });
    }
  }, [promoData]);

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await updatePromoBanner({
        adminId: currentUser.id,
        title: promoForm.title,
        description: promoForm.description,
        image: promoForm.image,
        isActive: true,
      });
      showToast("Promo banner updated successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update promo banner", "error");
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    const uploadData = new FormData();
    uploadData.append("image", file);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://172.29.214.47:3001";

    try {
      const response = await fetch(`${backendUrl}/api/upload-product-image`, {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) throw new Error("Image upload failed");

      const result = await response.json();
      if (result.success && result.url) {
        setPromoForm(prev => ({ ...prev, image: result.url }));
        showToast("Banner image uploaded successfully", "success");
      } else {
        throw new Error(result.error || "Failed to upload image");
      }
    } catch (err: any) {
      showToast(err.message || "Image upload failed", "error");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // Categories Grid Settings
  const { data: categoriesData, isLoading: isCategoriesLoading } = useHomepageCategories();
  const { mutate: createCategory } = useCreateHomepageCategory();
  const { mutate: updateCategory } = useUpdateHomepageCategory();
  const { mutate: deleteCategory } = useDeleteHomepageCategory();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<"add" | "edit">("add");
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
    gridSpan: "col-span-1 md:col-span-1",
    sortOrder: 1
  });
  const [isUploadingCatImage, setIsUploadingCatImage] = useState(false);

  useEffect(() => {
    if (categoryForm.gridSpan) {
      const parsed = parseGridSpan(categoryForm.gridSpan);
      setTempMobileSpan(parsed.mobileSpan);
      setTempDesktopSpan(parsed.desktopSpan);
      setTempRowSpan(parsed.rowSpan);
    }
  }, [categoryForm.gridSpan]);

  const handleOpenCatModal = (mode: "add" | "edit", item?: any) => {
    setCategoryModalMode(mode);
    if (mode === "edit" && item) {
      setSelectedCatId(item.id);
      const span = item.gridSpan || "col-span-1 md:col-span-1";
      setCategoryForm({
        title: item.title || "",
        subtitle: item.subtitle || "",
        image: item.image || "",
        link: item.link || "",
        gridSpan: span,
        sortOrder: item.sortOrder || 1
      });
      const parsed = parseGridSpan(span);
      setTempMobileSpan(parsed.mobileSpan);
      setTempDesktopSpan(parsed.desktopSpan);
      setTempRowSpan(parsed.rowSpan);
    } else {
      setSelectedCatId(null);
      const defaultSpan = "col-span-1 md:col-span-1";
      setCategoryForm({
        title: "",
        subtitle: "",
        image: "",
        link: "/search",
        gridSpan: defaultSpan,
        sortOrder: (categoriesData?.length || 0) + 1
      });
      setTempMobileSpan("col-span-1");
      setTempDesktopSpan("md:col-span-1");
      setTempRowSpan("none");
    }
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const finalSpan = constructGridSpan(tempMobileSpan, tempDesktopSpan, tempRowSpan);

    try {
      if (categoryModalMode === "add") {
        await createCategory({
          adminId: currentUser.id,
          title: categoryForm.title,
          subtitle: categoryForm.subtitle,
          image: categoryForm.image,
          categorySlug: categoryForm.link,
          gridSpan: finalSpan,
          sortOrder: categoryForm.sortOrder
        });
        showToast("Category tile added", "success");
      } else if (selectedCatId) {
        await updateCategory({
          adminId: currentUser.id,
          id: selectedCatId,
          title: categoryForm.title,
          subtitle: categoryForm.subtitle,
          image: categoryForm.image,
          categorySlug: categoryForm.link,
          gridSpan: finalSpan,
          sortOrder: categoryForm.sortOrder
        });
        showToast("Category tile updated", "success");
      }
      setIsCategoryModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || "Failed to save category tile", "error");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!currentUser || !confirm("Are you sure you want to delete this category tile?")) return;
    try {
      await deleteCategory({ adminId: currentUser.id, id });
      showToast("Category tile deleted", "success");
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || "Failed to delete category tile", "error");
    }
  };

  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCatImage(true);
    const uploadData = new FormData();
    uploadData.append("image", file);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://172.29.214.47:3001";

    try {
      const response = await fetch(`${backendUrl}/api/upload-product-image`, {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) throw new Error("Image upload failed");

      const result = await response.json();
      if (result.success && result.url) {
        setCategoryForm(prev => ({ ...prev, image: result.url }));
        showToast("Category image uploaded", "success");
      } else {
        throw new Error(result.error || "Failed to upload image");
      }
    } catch (err: any) {
      showToast(err.message || "Image upload failed", "error");
    } finally {
      setIsUploadingCatImage(false);
    }
  };

  // Marquee Messages
  const { data: marqueeData, isLoading: isMarqueeLoading } = useMarqueeMessages();
  const { mutate: createMarquee } = useCreateMarqueeMessage();
  const { mutate: updateMarquee } = useUpdateMarqueeMessage();
  const { mutate: deleteMarquee } = useDeleteMarqueeMessage();

  const [isMarqueeModalOpen, setIsMarqueeModalOpen] = useState(false);
  const [marqueeModalMode, setMarqueeModalMode] = useState<"add" | "edit">("add");
  const [selectedMarqueeId, setSelectedMarqueeId] = useState<number | null>(null);
  const [marqueeForm, setMarqueeForm] = useState({ text: "", sortOrder: 1 });

  const handleOpenMarqueeModal = (mode: "add" | "edit", item?: any) => {
    setMarqueeModalMode(mode);
    if (mode === "edit" && item) {
      setSelectedMarqueeId(item.id);
      setMarqueeForm({ text: item.text || "", sortOrder: item.sortOrder || 1 });
    } else {
      setSelectedMarqueeId(null);
      setMarqueeForm({ text: "", sortOrder: (marqueeData?.length || 0) + 1 });
    }
    setIsMarqueeModalOpen(true);
  };

  const handleMarqueeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      if (marqueeModalMode === "add") {
        await createMarquee({
          adminId: currentUser.id,
          text: marqueeForm.text,
          sortOrder: marqueeForm.sortOrder
        });
        showToast("Marquee text added", "success");
      } else if (selectedMarqueeId) {
        await updateMarquee({
          adminId: currentUser.id,
          id: selectedMarqueeId,
          text: marqueeForm.text,
          sortOrder: marqueeForm.sortOrder
        });
        showToast("Marquee text updated", "success");
      }
      setIsMarqueeModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || "Failed to save marquee text", "error");
    }
  };

  const handleDeleteMarquee = async (id: number) => {
    if (!currentUser || !confirm("Are you sure you want to delete this marquee message?")) return;
    try {
      await deleteMarquee({ adminId: currentUser.id, id });
      showToast("Marquee message deleted", "success");
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || "Failed to delete marquee message", "error");
    }
  };

  // FAQs Settings
  const { data: faqsData, isLoading: isFaqsLoading } = useFaqs();
  const { mutate: createFaq } = useCreateFaq();
  const { mutate: updateFaq } = useUpdateFaq();
  const { mutate: deleteFaq } = useDeleteFaq();

  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [faqModalMode, setFaqModalMode] = useState<"add" | "edit">("add");
  const [selectedFaqId, setSelectedFaqId] = useState<number | null>(null);
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", sortOrder: 1 });

  const handleOpenFaqModal = (mode: "add" | "edit", item?: any) => {
    setFaqModalMode(mode);
    if (mode === "edit" && item) {
      setSelectedFaqId(item.id);
      setFaqForm({ question: item.question || "", answer: item.answer || "", sortOrder: item.sortOrder || 1 });
    } else {
      setSelectedFaqId(null);
      setFaqForm({ question: "", answer: "", sortOrder: (faqsData?.length || 0) + 1 });
    }
    setIsFaqModalOpen(true);
  };

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      if (faqModalMode === "add") {
        await createFaq({
          adminId: currentUser.id,
          question: faqForm.question,
          answer: faqForm.answer,
          sortOrder: faqForm.sortOrder
        });
        showToast("FAQ added", "success");
      } else if (selectedFaqId) {
        await updateFaq({
          adminId: currentUser.id,
          id: selectedFaqId,
          question: faqForm.question,
          answer: faqForm.answer,
          sortOrder: faqForm.sortOrder
        });
        showToast("FAQ updated", "success");
      }
      setIsFaqModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || "Failed to save FAQ", "error");
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (!currentUser || !confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await deleteFaq({ adminId: currentUser.id, id });
      showToast("FAQ deleted", "success");
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || "Failed to delete FAQ", "error");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-inter">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">
          Homepage Content & Branding Manager
        </h2>
        <p className="text-secondary text-sm">
          Customize all sections of your homepage, hero media, categories, and store branding.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-light overflow-x-auto space-x-6 no-scrollbar">
        <button
          onClick={() => setActiveTab("brand")}
          className={`pb-4 px-1 text-sm font-medium flex items-center gap-2 cursor-pointer border-b-2 transition-all whitespace-nowrap ${
            activeTab === "brand" ? "border-primary text-primary" : "border-transparent text-secondary hover:text-primary"
          }`}
        >
          <Shield className="h-4 w-4" />
          Brand Configuration
        </button>
        <button
          onClick={() => setActiveTab("hero")}
          className={`pb-4 px-1 text-sm font-medium flex items-center gap-2 cursor-pointer border-b-2 transition-all whitespace-nowrap ${
            activeTab === "hero" ? "border-primary text-primary" : "border-transparent text-secondary hover:text-primary"
          }`}
        >
          <Video className="h-4 w-4" />
          Hero Section
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`pb-4 px-1 text-sm font-medium flex items-center gap-2 cursor-pointer border-b-2 transition-all whitespace-nowrap ${
            activeTab === "categories" ? "border-primary text-primary" : "border-transparent text-secondary hover:text-primary"
          }`}
        >
          <Layout className="h-4 w-4" />
          Categories Grid
        </button>
        <button
          onClick={() => setActiveTab("marquee")}
          className={`pb-4 px-1 text-sm font-medium flex items-center gap-2 cursor-pointer border-b-2 transition-all whitespace-nowrap ${
            activeTab === "marquee" ? "border-primary text-primary" : "border-transparent text-secondary hover:text-primary"
          }`}
        >
          <Type className="h-4 w-4" />
          Marquee Messages
        </button>
        <button
          onClick={() => setActiveTab("banner")}
          className={`pb-4 px-1 text-sm font-medium flex items-center gap-2 cursor-pointer border-b-2 transition-all whitespace-nowrap ${
            activeTab === "banner" ? "border-primary text-primary" : "border-transparent text-secondary hover:text-primary"
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          Promo Banner
        </button>
        <button
          onClick={() => setActiveTab("faqs")}
          className={`pb-4 px-1 text-sm font-medium flex items-center gap-2 cursor-pointer border-b-2 transition-all whitespace-nowrap ${
            activeTab === "faqs" ? "border-primary text-primary" : "border-transparent text-secondary hover:text-primary"
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          FAQ / QNA Accordion
        </button>
      </div>

      {/* BRAND CONFIGURATION TAB */}
      {activeTab === "brand" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Settings Form */}
          <form onSubmit={handleBrandSave} className="lg:col-span-7 bg-surface border border-light p-6 space-y-6 shadow-sm">
            <h3 className="font-semibold text-lg border-b border-light pb-2 font-manrope">Identity Settings</h3>
            
            {/* Brand Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="brandName" className="block text-xs font-semibold uppercase tracking-wider text-secondary">
                Brand Name
              </label>
              <input
                type="text"
                id="brandName"
                value={brandFormName}
                onChange={(e) => setBrandFormName(e.target.value)}
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
                  value={brandFormLogo}
                  onChange={(e) => setBrandFormLogo(e.target.value)}
                  className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
                  placeholder="e.g. https://example.com/logo.png"
                  required
                />
              </div>

              {/* File Upload Area */}
              <div className="border border-dark p-4 bg-background flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-16 h-16 border border-dark overflow-hidden bg-white shrink-0 flex items-center justify-center">
                  {brandFormLogo ? (
                    <Image
                      src={brandFormLogo}
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
                  {brandUploadError && <p className="text-[10px] text-error mt-1">{brandUploadError}</p>}
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  <label className="flex items-center gap-2 justify-center bg-background border border-dark py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-primary hover:bg-surface-alt cursor-pointer transition-colors duration-200">
                    {isUploadingBrandLogo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Choose Image File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBrandLogoUpload}
                      disabled={isUploadingBrandLogo}
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
                onClick={handleBrandResetDefaults}
                className="flex-1 border border-dark text-primary py-3 px-6 text-xs font-bold uppercase tracking-widest hover:bg-surface-alt transition-colors duration-300 flex items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset Defaults
              </button>

              <button
                type="submit"
                disabled={isUpdatingBrand || isUploadingBrandLogo}
                className="flex-1 bg-primary text-inverse py-3 px-6 text-xs font-bold uppercase tracking-widest hover:bg-primary-light active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingBrand ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
                    {brandFormName || "VELLVISTA"}
                  </div>
                </div>
              </div>

              {/* Footer Logo Preview */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Store Footer (Dark)</span>
                <div className="bg-primary-light border border-dark p-4 h-20 flex items-center justify-center relative select-none">
                  <div className="absolute left-4 top-2 text-[8px] text-inverse/40 font-mono">Footer BG</div>

                  <div className="relative h-10 w-[7.5rem]">
                    {brandFormLogo ? (
                      <Image
                        src={brandFormLogo}
                        alt={brandFormName}
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
                    {brandFormLogo ? (
                      <Image
                        src={brandFormLogo}
                        alt={`${brandFormName} Admin`}
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
      )}

      {/* HERO TAB */}
      {activeTab === "hero" && (
        <form onSubmit={handleHeroSubmit} className="bg-surface border border-light p-6 space-y-6 shadow-sm">
          <h3 className="font-semibold text-lg border-b border-light pb-2 font-manrope">Hero Media & Text Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">Main Title</label>
              <input
                type="text"
                value={heroForm.title}
                onChange={e => setHeroForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">Subtitle / Description</label>
              <input
                type="text"
                value={heroForm.subtitle}
                onChange={e => setHeroForm(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-light">
            {/* Desktop Video */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">Desktop Hero Video MP4 URL</label>
              <input
                type="text"
                value={heroForm.desktopVideo}
                onChange={e => setHeroForm(prev => ({ ...prev, desktopVideo: e.target.value }))}
                className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
              />
              <div className="border border-dark p-4 bg-background flex items-center justify-between gap-4">
                <span className="text-xs text-secondary">Upload Desktop Video (MP4)</span>
                <label className="bg-background border border-dark py-2 px-3 text-xs font-bold uppercase tracking-wider text-primary hover:bg-surface-alt cursor-pointer transition-colors flex items-center gap-1.5">
                  {isUploadingVideo.desktop ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Browse Video
                  <input type="file" accept="video/mp4" onChange={e => handleVideoUpload(e, "desktop")} disabled={isUploadingVideo.desktop} className="hidden" />
                </label>
              </div>
            </div>

            {/* Mobile Video */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">Mobile Hero Video MP4 URL</label>
              <input
                type="text"
                value={heroForm.mobileVideo}
                onChange={e => setHeroForm(prev => ({ ...prev, mobileVideo: e.target.value }))}
                className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
              />
              <div className="border border-dark p-4 bg-background flex items-center justify-between gap-4">
                <span className="text-xs text-secondary">Upload Mobile Video (MP4)</span>
                <label className="bg-background border border-dark py-2 px-3 text-xs font-bold uppercase tracking-wider text-primary hover:bg-surface-alt cursor-pointer transition-colors flex items-center gap-1.5">
                  {isUploadingVideo.mobile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  Browse Video
                  <input type="file" accept="video/mp4" onChange={e => handleVideoUpload(e, "mobile")} disabled={isUploadingVideo.mobile} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-light flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingHero}
              className="bg-primary text-inverse py-3 px-6 text-xs font-bold uppercase tracking-widest hover:bg-primary-light transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              {isUpdatingHero ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Hero Settings
            </button>
          </div>
        </form>
      )}

      {/* CATEGORIES GRID TAB */}
      {activeTab === "categories" && (
        <div className="bg-surface border border-light p-6 space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-light pb-4">
            <div>
              <h3 className="font-semibold text-lg font-manrope text-primary">Homepage Categories Bento Grid</h3>
              <p className="text-xs text-secondary">Manage category banner tiles, titles, image URLs, and grid layouts.</p>
            </div>
            <button
              onClick={() => handleOpenCatModal("add")}
              className="bg-primary text-inverse px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-primary-light transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Category Tile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriesData?.map(item => (
              <div key={item.id} className="border border-light p-4 bg-background flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="relative aspect-video w-full border border-dark overflow-hidden bg-white">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-sm">{item.title}</h4>
                    <p className="text-xs text-secondary">{item.subtitle}</p>
                    <p className="text-[10px] font-mono text-secondary mt-1">Span: {getSpanLabel(item.gridSpan)}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-light">
                  <button
                    onClick={() => handleOpenCatModal("edit", item)}
                    className="p-1.5 border border-dark text-primary hover:bg-surface-alt cursor-pointer text-xs flex items-center gap-1"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(item.id)}
                    className="p-1.5 border border-dark text-error hover:bg-rose-50 cursor-pointer text-xs flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MARQUEE MESSAGES TAB */}
      {activeTab === "marquee" && (
        <div className="bg-surface border border-light p-6 space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-light pb-4">
            <div>
              <h3 className="font-semibold text-lg font-manrope text-primary">Marquee Ticker Messages</h3>
              <p className="text-xs text-secondary">Manage running notification messages shown across the homepage ticker bar.</p>
            </div>
            <button
              onClick={() => handleOpenMarqueeModal("add")}
              className="bg-primary text-inverse px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-primary-light transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Marquee Text
            </button>
          </div>

          <div className="space-y-3">
            {marqueeData?.map(item => (
              <div key={item.id} className="p-4 border border-light bg-background flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Type className="h-4 w-4 text-secondary shrink-0" />
                  <span className="text-sm font-semibold text-primary">{item.text}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenMarqueeModal("edit", item)}
                    className="p-1.5 border border-dark text-primary hover:bg-surface-alt cursor-pointer text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMarquee(item.id)}
                    className="p-1.5 border border-dark text-error hover:bg-rose-50 cursor-pointer text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROMO BANNER TAB */}
      {activeTab === "banner" && (
        <form onSubmit={handlePromoSubmit} className="bg-surface border border-light p-6 space-y-6 shadow-sm">
          <h3 className="font-semibold text-lg border-b border-light pb-2 font-manrope">Promo Banner Content</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">Banner Title</label>
              <input
                type="text"
                value={promoForm.title}
                onChange={e => setPromoForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">Banner Description</label>
              <input
                type="text"
                value={promoForm.description}
                onChange={e => setPromoForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-light">
            <label className="block text-xs font-semibold uppercase tracking-wider text-secondary">Banner Background Image URL</label>
            <input
              type="text"
              value={promoForm.image}
              onChange={e => setPromoForm(prev => ({ ...prev, image: e.target.value }))}
              className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
            />
            <div className="border border-dark p-4 bg-background flex items-center justify-between gap-4">
              <span className="text-xs text-secondary">Upload Local Banner Image</span>
              <label className="bg-background border border-dark py-2 px-3 text-xs font-bold uppercase tracking-wider text-primary hover:bg-surface-alt cursor-pointer transition-colors flex items-center gap-1.5">
                {isUploadingBanner ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                Browse Image
                <input type="file" accept="image/*" onChange={handleBannerUpload} disabled={isUploadingBanner} className="hidden" />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-light flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingPromo}
              className="bg-primary text-inverse py-3 px-6 text-xs font-bold uppercase tracking-widest hover:bg-primary-light transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              {isUpdatingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Promo Banner
            </button>
          </div>
        </form>
      )}

      {/* FAQS TAB */}
      {activeTab === "faqs" && (
        <div className="bg-surface border border-light p-6 space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-light pb-4">
            <div>
              <h3 className="font-semibold text-lg font-manrope text-primary">Frequently Asked Questions</h3>
              <p className="text-xs text-secondary">Manage storefront FAQ accordion items and customer answers.</p>
            </div>
            <button
              onClick={() => handleOpenFaqModal("add")}
              className="bg-primary text-inverse px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-primary-light transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add FAQ Item
            </button>
          </div>

          <div className="space-y-4">
            {faqsData?.map(item => (
              <div key={item.id} className="p-4 border border-light bg-background space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="font-bold text-primary text-sm">{item.question}</h4>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenFaqModal("edit", item)}
                      className="p-1.5 border border-dark text-primary hover:bg-surface-alt cursor-pointer text-xs"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(item.id)}
                      className="p-1.5 border border-dark text-error hover:bg-rose-50 cursor-pointer text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-secondary leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-light p-6 w-full max-w-lg space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-light pb-3">
              <h3 className="font-bold text-lg font-manrope text-primary uppercase tracking-wide">
                {categoryModalMode === "add" ? "Add Category Tile" : "Edit Category Tile"}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-secondary hover:text-primary cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={categoryForm.title}
                  onChange={e => setCategoryForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={categoryForm.subtitle}
                  onChange={e => setCategoryForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={categoryForm.image}
                  onChange={e => setCategoryForm(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
                  required
                />
                <div className="mt-2 border border-dark p-3 bg-background flex items-center justify-between">
                  <span className="text-xs text-secondary">Upload Image</span>
                  <label className="bg-background border border-dark py-1.5 px-3 text-xs font-bold uppercase tracking-wider text-primary hover:bg-surface-alt cursor-pointer flex items-center gap-1">
                    {isUploadingCatImage ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    Browse
                    <input type="file" accept="image/*" onChange={handleCatImageUpload} disabled={isUploadingCatImage} className="hidden" />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                  Link Target
                </label>
                <input
                  type="text"
                  value={categoryForm.link}
                  onChange={e => setCategoryForm(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={categoryForm.sortOrder}
                  onChange={e => setCategoryForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 1 }))}
                  className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-inverse py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary-light transition-all active:scale-95 cursor-pointer"
              >
                Save Category Tile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Marquee Modal */}
      {isMarqueeModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-light p-6 w-full max-w-lg space-y-6">
            <div className="flex justify-between items-center border-b border-light pb-3">
              <h3 className="font-bold text-lg font-manrope text-primary uppercase tracking-wide">
                {marqueeModalMode === "add" ? "Add Marquee Text" : "Edit Marquee Text"}
              </h3>
              <button onClick={() => setIsMarqueeModalOpen(false)} className="text-secondary hover:text-primary cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleMarqueeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                  Message Text
                </label>
                <input
                  type="text"
                  value={marqueeForm.text}
                  onChange={e => setMarqueeForm(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={marqueeForm.sortOrder}
                  onChange={e => setMarqueeForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 1 }))}
                  className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-inverse py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary-light transition-all active:scale-95 cursor-pointer"
              >
                Save Marquee Text
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-light p-6 w-full max-w-lg space-y-6">
            <div className="flex justify-between items-center border-b border-light pb-3">
              <h3 className="font-bold text-lg font-manrope text-primary uppercase tracking-wide">
                {faqModalMode === "add" ? "Add FAQ Item" : "Edit FAQ Item"}
              </h3>
              <button onClick={() => setIsFaqModalOpen(false)} className="text-secondary hover:text-primary cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleFaqSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={faqForm.question}
                  onChange={e => setFaqForm(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                  Answer
                </label>
                <textarea
                  value={faqForm.answer}
                  onChange={e => setFaqForm(prev => ({ ...prev, answer: e.target.value }))}
                  rows={4}
                  className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={faqForm.sortOrder}
                  onChange={e => setFaqForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 1 }))}
                  className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-inverse py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary-light transition-all active:scale-95 cursor-pointer"
              >
                Save FAQ Item
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
