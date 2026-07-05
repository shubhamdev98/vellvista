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
  useDeleteMarqueeMessage
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
  GripVertical
} from "lucide-react";
import { useAuth } from "../../../context/AuthProvider";
import { useToast } from "../../../context/ToastProvider";
import { getProductImageUrl } from "../../utils/image";

// Helper to parse gridSpan string
function parseGridSpan(gridSpanString: string) {
  const parts = (gridSpanString || "").split(" ");
  
  // Find mobile span (col-span-1 or col-span-2)
  let mobileSpan = "col-span-1";
  if (parts.includes("col-span-2")) {
    mobileSpan = "col-span-2";
  }

  // Find desktop span (md:col-span-X)
  let desktopSpan = "md:col-span-1";
  for (const part of parts) {
    if (part.startsWith("md:col-span-")) {
      desktopSpan = part;
      break;
    }
  }
  // If no md:col-span-X is found, but a plain col-span exists, it applies to md as well.
  if (!parts.some(p => p.startsWith("md:col-span-"))) {
    if (parts.includes("col-span-1")) desktopSpan = "md:col-span-1";
    else if (parts.includes("col-span-2")) desktopSpan = "md:col-span-2";
    else if (parts.includes("col-span-3")) desktopSpan = "md:col-span-3";
    else if (parts.includes("col-span-4")) desktopSpan = "md:col-span-4";
  }

  // Find row span
  let rowSpan = "none";
  if (parts.includes("md:row-span-2")) {
    rowSpan = "md:row-span-2";
  } else if (parts.includes("row-span-2")) {
    rowSpan = "row-span-2";
  }

  return { mobileSpan, desktopSpan, rowSpan };
}

// Helper to construct gridSpan string
function constructGridSpan(mobileSpan: string, desktopSpan: string, rowSpan: string) {
  const parts = [mobileSpan, desktopSpan];
  if (rowSpan !== "none") {
    parts.push(rowSpan);
  }
  return parts.join(" ");
}

// Helper to get human readable layout summary
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

  const [activeTab, setActiveTab] = useState<"hero" | "banner" | "categories" | "marquee" | "faqs">("hero");

  // Temporary state for layout configurations
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
    const formData = new FormData();
    formData.append("video", file);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://172.29.214.47:3001";
    try {
      const res = await fetch(`${backendUrl}/api/upload-video`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (data.success && data.url) {
        setHeroForm(prev => ({ ...prev, [type === "mobile" ? "mobileVideo" : "desktopVideo"]: data.url }));
        showToast(`${type === "mobile" ? "Mobile" : "Desktop"} video uploaded`, "success");
      }
    } catch (err: any) {
      showToast(err.message || "Video upload failed", "error");
    } finally {
      setIsUploadingVideo(prev => ({ ...prev, [type]: false }));
    }
  };

  // Promo Banner Settings
  const { data: bannerData, isLoading: isBannerLoading } = usePromoBanner();
  const { mutate: updatePromoBanner, isPending: isUpdatingBanner } = useUpdatePromoBanner();
  const [bannerForm, setBannerForm] = useState({
    title: "",
    description: "",
    image: "",
    isActive: true
  });
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  useEffect(() => {
    if (bannerData) {
      setBannerForm({
        title: bannerData.title || "",
        description: bannerData.description || "",
        image: bannerData.image || "",
        isActive: bannerData.isActive
      });
    }
  }, [bannerData]);

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await updatePromoBanner({
        adminId: currentUser.id,
        title: bannerForm.title,
        description: bannerForm.description,
        image: bannerForm.image,
        isActive: bannerForm.isActive
      });
      showToast("Promo banner updated successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update promo banner", "error");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "banner" | "category") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (target === "banner") setIsUploadingBanner(true);
    else setIsUploadingCatImage(true);

    const formData = new FormData();
    formData.append("image", file);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://172.29.214.47:3001";
    try {
      const res = await fetch(`${backendUrl}/api/upload-image?folder=homepage`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (data.success && data.url) {
        if (target === "banner") {
          setBannerForm(prev => ({ ...prev, image: data.url }));
        } else {
          setCategoryForm(prev => ({ ...prev, image: data.url }));
        }
        showToast("Image uploaded successfully", "success");
      }
    } catch (err: any) {
      showToast(err.message || "Image upload failed", "error");
    } finally {
      if (target === "banner") setIsUploadingBanner(false);
      else setIsUploadingCatImage(false);
    }
  };

  // Categories Settings
  const { data: categories, isLoading: isCategoriesLoading } = useHomepageCategories();
  const { mutate: createCategory } = useCreateHomepageCategory();
  const { mutate: updateCategory } = useUpdateHomepageCategory();
  const { mutate: deleteCategory } = useDeleteHomepageCategory();

  // Category drag-and-drop state
  const [localCategories, setLocalCategories] = useState<any[]>([]);
  const [isCategoriesSortingModified, setIsCategoriesSortingModified] = useState(false);
  const [draggedCategoryIndex, setDraggedCategoryIndex] = useState<number | null>(null);

  useEffect(() => {
    if (categories) {
      setLocalCategories(categories);
    }
  }, [categories]);

  const handleCategoryDragStart = (e: React.DragEvent, index: number) => {
    setDraggedCategoryIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCategoryDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedCategoryIndex === null || draggedCategoryIndex === index) return;
    
    const updated = [...localCategories];
    const draggedItem = updated[draggedCategoryIndex];
    updated.splice(draggedCategoryIndex, 1);
    updated.splice(index, 0, draggedItem);
    
    setDraggedCategoryIndex(index);
    setLocalCategories(updated);
    setIsCategoriesSortingModified(true);
  };

  const handleCategoryDragEnd = async () => {
    setDraggedCategoryIndex(null);
    if (!isCategoriesSortingModified || !currentUser) return;
    setIsCategoriesSortingModified(false);
    
    try {
      const promises = localCategories.map((item, i) => {
        return updateCategory({
          adminId: currentUser.id,
          id: item.id,
          title: item.title,
          subtitle: item.subtitle || "",
          categorySlug: item.categorySlug,
          image: item.image,
          gridSpan: item.gridSpan,
          height: item.height,
          sortOrder: i + 1
        });
      });
      await Promise.all(promises);
      showToast("Categories order updated successfully", "success");
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || "Failed to update category order", "error");
    }
  };

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<"add" | "edit">("add");
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isUploadingCatImage, setIsUploadingCatImage] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    title: "",
    subtitle: "",
    categorySlug: "",
    image: "",
    gridSpan: "col-span-1",
    height: "h-[192px]",
    sortOrder: 1
  });

  const handleCategoryEditClick = (cat: any) => {
    setSelectedCategory(cat);
    const parsed = parseGridSpan(cat.gridSpan || "col-span-1");
    setTempMobileSpan(parsed.mobileSpan);
    setTempDesktopSpan(parsed.desktopSpan);
    setTempRowSpan(parsed.rowSpan);

    setCategoryForm({
      title: cat.title,
      subtitle: cat.subtitle || "",
      categorySlug: cat.categorySlug,
      image: cat.image,
      gridSpan: cat.gridSpan || "col-span-1",
      height: cat.height || "h-[192px]",
      sortOrder: cat.sortOrder
    });
    setCategoryModalMode("edit");
    setIsCategoryModalOpen(true);
  };

  const handleCategoryAddClick = () => {
    setTempMobileSpan("col-span-1");
    setTempDesktopSpan("md:col-span-1");
    setTempRowSpan("none");

    setCategoryForm({
      title: "",
      subtitle: "",
      categorySlug: "",
      image: "",
      gridSpan: "col-span-1",
      height: "h-[192px]",
      sortOrder: (categories?.length || 0) + 1
    });
    setCategoryModalMode("add");
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const finalGridSpan = constructGridSpan(tempMobileSpan, tempDesktopSpan, tempRowSpan);
    try {
      if (categoryModalMode === "add") {
        await createCategory({
          adminId: currentUser.id,
          ...categoryForm,
          gridSpan: finalGridSpan
        });
        showToast("Category block created", "success");
      } else {
        await updateCategory({
          adminId: currentUser.id,
          id: selectedCategory.id,
          ...categoryForm,
          gridSpan: finalGridSpan
        });
        showToast("Category block updated", "success");
      }
      setIsCategoryModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || "Failed to save category block", "error");
    }
  };

  const handleCategoryDelete = async (id: number) => {
    if (!currentUser || !confirm("Are you sure you want to delete this category block?")) return;
    try {
      await deleteCategory({ adminId: currentUser.id, id });
      showToast("Category block deleted", "success");
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || "Failed to delete category block", "error");
    }
  };

  // Marquee Messages Settings
  const { data: marqueeMessages, isLoading: isMarqueeLoading } = useMarqueeMessages();
  const { mutate: createMarquee } = useCreateMarqueeMessage();
  const { mutate: updateMarquee } = useUpdateMarqueeMessage();
  const { mutate: deleteMarquee } = useDeleteMarqueeMessage();

  const [isMarqueeModalOpen, setIsMarqueeModalOpen] = useState(false);
  const [marqueeModalMode, setMarqueeModalMode] = useState<"add" | "edit">("add");
  const [selectedMarquee, setSelectedMarquee] = useState<any>(null);
  const [marqueeForm, setMarqueeForm] = useState({
    text: "",
    sortOrder: 1
  });

  const handleMarqueeEditClick = (msg: any) => {
    setSelectedMarquee(msg);
    setMarqueeForm({
      text: msg.text,
      sortOrder: msg.sortOrder
    });
    setMarqueeModalMode("edit");
    setIsMarqueeModalOpen(true);
  };

  const handleMarqueeAddClick = () => {
    setMarqueeForm({
      text: "",
      sortOrder: (marqueeMessages?.length || 0) + 1
    });
    setMarqueeModalMode("add");
    setIsMarqueeModalOpen(true);
  };

  const handleMarqueeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      if (marqueeModalMode === "add") {
        await createMarquee({
          adminId: currentUser.id,
          ...marqueeForm
        });
        showToast("Marquee text added", "success");
      } else {
        await updateMarquee({
          adminId: currentUser.id,
          id: selectedMarquee.id,
          ...marqueeForm
        });
        showToast("Marquee text updated", "success");
      }
      setIsMarqueeModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || "Failed to save marquee text", "error");
    }
  };

  const handleMarqueeDelete = async (id: number) => {
    if (!currentUser || !confirm("Are you sure you want to delete this marquee message?")) return;
    try {
      await deleteMarquee({ adminId: currentUser.id, id });
      showToast("Marquee text deleted", "success");
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || "Failed to delete marquee text", "error");
    }
  };

  // FAQ/QNA Settings
  const { data: faqs, isLoading: isFaqLoading } = useFaqs();
  const { mutate: createFaq } = useCreateFaq();
  const { mutate: updateFaq } = useUpdateFaq();
  const { mutate: deleteFaq } = useDeleteFaq();

  const [localFaqs, setLocalFaqs] = useState<any[]>([]);
  const [isSortingModified, setIsSortingModified] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (faqs) {
      setLocalFaqs(faqs);
    }
  }, [faqs]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const updated = [...localFaqs];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setLocalFaqs(updated);
    setIsSortingModified(true);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    if (!isSortingModified || !currentUser) return;
    setIsSortingModified(false);
    
    localFaqs.forEach((item, i) => {
      updateFaq({
        adminId: currentUser.id,
        id: item.id,
        question: item.question,
        answer: item.answer,
        sortOrder: i + 1
      });
    });
  };

  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [faqModalMode, setFaqModalMode] = useState<"add" | "edit">("add");
  const [selectedFaq, setSelectedFaq] = useState<any>(null);
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    sortOrder: 1
  });

  const handleFaqEditClick = (faq: any) => {
    setSelectedFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      sortOrder: faq.sortOrder
    });
    setFaqModalMode("edit");
    setIsFaqModalOpen(true);
  };

  const handleFaqAddClick = () => {
    setFaqForm({
      question: "",
      answer: "",
      sortOrder: (faqs?.length || 0) + 1
    });
    setFaqModalMode("add");
    setIsFaqModalOpen(true);
  };

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      if (faqModalMode === "add") {
        await createFaq({
          adminId: currentUser.id,
          ...faqForm
        });
        showToast("FAQ added", "success");
      } else {
        await updateFaq({
          adminId: currentUser.id,
          id: selectedFaq.id,
          ...faqForm
        });
        showToast("FAQ updated", "success");
      }
      setIsFaqModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      showToast(err.message || "Failed to save FAQ", "error");
    }
  };

  const handleFaqDelete = async (id: number) => {
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
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">
          Homepage Content Manager
        </h2>
        <p className="text-secondary text-sm">
          Customize all sections of your homepage dynamically.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-light overflow-x-auto space-x-6 no-scrollbar">
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

      {/* Hero Tab */}
      {activeTab === "hero" && (
        <form onSubmit={handleHeroSubmit} className="bg-surface border border-light p-6 space-y-6 w-full">
          <h3 className="font-semibold text-lg border-b border-light pb-2 font-manrope">Hero Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                Main Title Text
              </label>
              <input
                type="text"
                value={heroForm.title}
                onChange={e => setHeroForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                Subtitle Text
              </label>
              <input
                type="text"
                value={heroForm.subtitle}
                onChange={e => setHeroForm(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                  Desktop Video Upload (MP4)
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={heroForm.desktopVideo}
                    onChange={e => setHeroForm(prev => ({ ...prev, desktopVideo: e.target.value }))}
                    className="border border-dark p-3 text-sm focus:outline-none bg-background text-primary"
                    placeholder="or paste URL"
                  />
                  <label className="flex items-center gap-2 justify-center bg-background border border-dark py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-primary hover:bg-surface-alt cursor-pointer transition-colors duration-200">
                    {isUploadingVideo.desktop ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload Desktop Video
                    <input
                      type="file"
                      accept="video/mp4"
                      onChange={e => handleVideoUpload(e, "desktop")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                  Mobile Video Upload (MP4)
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={heroForm.mobileVideo}
                    onChange={e => setHeroForm(prev => ({ ...prev, mobileVideo: e.target.value }))}
                    className="border border-dark p-3 text-sm focus:outline-none bg-background text-primary"
                    placeholder="or paste URL"
                  />
                  <label className="flex items-center gap-2 justify-center bg-background border border-dark py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-primary hover:bg-surface-alt cursor-pointer transition-colors duration-200">
                    {isUploadingVideo.mobile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload Mobile Video
                    <input
                      type="file"
                      accept="video/mp4"
                      onChange={e => handleVideoUpload(e, "mobile")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isUpdatingHero}
            className="flex items-center justify-center gap-2 bg-primary text-inverse w-full py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary-light active:scale-95 transition-all duration-150 cursor-pointer"
          >
            {isUpdatingHero ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Hero Configuration
          </button>
        </form>
      )}

      {/* Promo Banner Tab */}
      {activeTab === "banner" && (
        <form onSubmit={handleBannerSubmit} className="bg-surface border border-light p-6 space-y-6 w-full">
          <h3 className="font-semibold text-lg border-b border-light pb-2 font-manrope">Promo Banner Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                Banner Title
              </label>
              <input
                type="text"
                value={bannerForm.title}
                onChange={e => setBannerForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                Banner Description
              </label>
              <textarea
                value={bannerForm.description}
                onChange={e => setBannerForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                Banner Image
              </label>
              <div className="flex flex-col gap-2">
                {bannerForm.image && (
                  <div className="relative w-48 h-24 border border-light">
                    <img
                      src={getProductImageUrl(bannerForm.image)}
                      alt="Banner Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <input
                  type="text"
                  value={bannerForm.image}
                  onChange={e => setBannerForm(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full border border-dark p-3 text-sm focus:outline-none bg-background text-primary"
                  placeholder="Image URL"
                />
                <label className="flex items-center gap-2 justify-center bg-background border border-dark py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-primary hover:bg-surface-alt cursor-pointer transition-colors duration-200">
                  {isUploadingBanner ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Upload Banner Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageUpload(e, "banner")}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="bannerActive"
                checked={bannerForm.isActive}
                onChange={e => setBannerForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 accent-primary"
              />
              <label htmlFor="bannerActive" className="text-sm text-primary cursor-pointer select-none">
                Show Banner on Homepage
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={isUpdatingBanner}
            className="flex items-center justify-center gap-2 bg-primary text-inverse w-full py-3 text-xs font-bold uppercase tracking-widest hover:bg-primary-light active:scale-95 transition-all duration-150 cursor-pointer"
          >
            {isUpdatingBanner ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Banner Settings
          </button>
        </form>
      )}

      {/* Categories Grid Tab */}
      {activeTab === "categories" && (
        <div className="space-y-6 w-full">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg font-manrope">Homepage Category Blocks</h3>
            <button
              onClick={handleCategoryAddClick}
              className="flex items-center gap-2 bg-primary text-inverse py-2.5 px-4 text-xs font-bold uppercase tracking-wider hover:bg-primary-light transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Category Block
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {isCategoriesLoading ? (
              <div className="col-span-full py-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
              </div>
            ) : localCategories && localCategories.length > 0 ? (
              localCategories.map((cat, index) => (
                <div 
                  key={cat.id} 
                  draggable
                  onDragStart={(e) => handleCategoryDragStart(e, index)}
                  onDragOver={(e) => handleCategoryDragOver(e, index)}
                  onDragEnd={handleCategoryDragEnd}
                  className={`bg-surface border p-4 space-y-4 flex flex-col justify-between cursor-move transition-all duration-150 relative select-none ${
                    draggedCategoryIndex === index ? "border-primary bg-surface-alt opacity-50 scale-[0.98]" : "border-light hover:border-primary/40"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="relative aspect-video bg-background-muted overflow-hidden">
                      <div className="absolute top-2 left-2 z-20 bg-black/60 text-white p-1 rounded cursor-grab hover:bg-black/80 transition-colors">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <img
                        src={getProductImageUrl(cat.image)}
                        alt={cat.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-base text-primary font-manrope">{cat.title}</h4>
                      {cat.subtitle && <p className="text-secondary text-xs">{cat.subtitle}</p>}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="bg-surface-alt px-2 py-0.5 text-[10px] text-secondary font-mono">
                          Slug: {cat.categorySlug}
                        </span>
                        <span className="bg-surface-alt px-2 py-0.5 text-[10px] text-secondary font-mono">
                          Layout: {getSpanLabel(cat.gridSpan)}
                        </span>
                        <span className="bg-surface-alt px-2 py-0.5 text-[10px] text-secondary font-mono">
                          Order: {cat.sortOrder}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-light pt-3">
                    <button
                      onClick={() => handleCategoryEditClick(cat)}
                      className="flex-1 flex justify-center items-center gap-1.5 border border-dark py-2 px-3 text-xs text-primary hover:bg-surface-alt cursor-pointer transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleCategoryDelete(cat.id)}
                      className="flex-1 flex justify-center items-center gap-1.5 border border-error text-error py-2 px-3 text-xs hover:bg-error-light cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-secondary border border-dashed border-light">
                No category blocks configured. Add one above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Marquee Messages Tab */}
      {activeTab === "marquee" && (
        <div className="space-y-6 w-full">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg font-manrope">Scrolling Marquee Messages</h3>
            <button
              onClick={handleMarqueeAddClick}
              className="flex items-center gap-2 bg-primary text-inverse py-2.5 px-4 text-xs font-bold uppercase tracking-wider hover:bg-primary-light transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Marquee Text
            </button>
          </div>

          <div className="bg-surface border border-light overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-alt text-secondary text-xs uppercase tracking-wider border-b border-light font-inter">
                  <th className="py-4 px-6 font-medium">Text Message</th>
                  <th className="py-4 px-6 font-medium w-32">Sort Order</th>
                  <th className="py-4 px-6 font-medium w-48 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light text-sm font-light">
                {isMarqueeLoading ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-secondary mx-auto" />
                    </td>
                  </tr>
                ) : marqueeMessages && marqueeMessages.length > 0 ? (
                  marqueeMessages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-surface-alt transition-colors duration-150">
                      <td className="py-4 px-6 font-medium text-primary">{msg.text}</td>
                      <td className="py-4 px-6 font-mono text-secondary">{msg.sortOrder}</td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleMarqueeEditClick(msg)}
                          className="inline-flex items-center gap-1 border border-dark px-2.5 py-1.5 text-xs text-primary hover:bg-surface hover:text-primary transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleMarqueeDelete(msg.id)}
                          className="inline-flex items-center gap-1 border border-error px-2.5 py-1.5 text-xs text-error hover:bg-error-light transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-secondary font-light">
                      No marquee text items found. Add one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === "faqs" && (
        <div className="space-y-6 w-full animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg font-manrope">FAQ / QNA Accordion Items</h3>
              <p className="text-xs text-secondary font-light mt-0.5">Drag and drop any item to change its display order.</p>
            </div>
            <button
              onClick={handleFaqAddClick}
              className="flex items-center gap-2 bg-primary text-inverse py-2.5 px-4 text-xs font-bold uppercase tracking-wider hover:bg-primary-light transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add FAQ Item
            </button>
          </div>


          <div className="space-y-4">
            {isFaqLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
              </div>
            ) : localFaqs && localFaqs.length > 0 ? (
              localFaqs.map((faq, index) => (
                <div
                  key={faq.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`bg-surface border p-5 space-y-3 cursor-move transition-all duration-150 relative select-none ${
                    draggedIndex === index ? "border-primary bg-surface-alt opacity-50 scale-[0.98]" : "border-light hover:border-primary/40"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3 items-start">
                      <div className="text-secondary hover:text-primary p-0.5 mt-1 shrink-0">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-base text-primary font-manrope">{faq.question}</h4>
                        <p className="text-secondary text-sm font-light mt-2 leading-relaxed">{faq.answer}</p>
                        <div className="mt-3">
                          <span className="bg-surface-alt px-2.5 py-1 text-[10px] text-secondary font-mono">
                            Sort Order: {index + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleFaqEditClick(faq)}
                        className="inline-flex items-center gap-1 border border-dark p-2 text-primary hover:bg-surface-alt transition-colors cursor-pointer"
                        title="Edit FAQ"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleFaqDelete(faq.id)}
                        className="inline-flex items-center gap-1 border border-error p-2 text-error hover:bg-error-light transition-colors cursor-pointer"
                        title="Delete FAQ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-secondary border border-dashed border-light">
                No FAQ items configured. Add one above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-light p-6 w-full max-w-lg space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-light pb-3">
              <h3 className="font-bold text-lg font-manrope text-primary uppercase tracking-wide">
                {categoryModalMode === "add" ? "Add Category Block" : "Edit Category Block"}
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
                  Subtitle (e.g. COLLECTION 01)
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
                  Category Slug / Redirect URL
                </label>
                <input
                  type="text"
                  value={categoryForm.categorySlug}
                  onChange={e => setCategoryForm(prev => ({ ...prev, categorySlug: e.target.value }))}
                  className="w-full border border-dark p-3 text-sm focus:outline-none focus:border-primary bg-background text-primary"
                  placeholder="e.g. women or /products?category=accessories"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                  Category Image
                </label>
                <div className="flex flex-col gap-2">
                  {categoryForm.image && (
                    <div className="relative w-full h-32 border border-light">
                      <img
                        src={getProductImageUrl(categoryForm.image)}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <input
                    type="text"
                    value={categoryForm.image}
                    onChange={e => setCategoryForm(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full border border-dark p-3 text-sm focus:outline-none bg-background text-primary"
                    placeholder="Image URL"
                    required
                  />
                  <label className="flex items-center gap-2 justify-center bg-background border border-dark py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-primary hover:bg-surface-alt cursor-pointer transition-colors duration-200">
                    {isUploadingCatImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleImageUpload(e, "category")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-4 border-t border-light pt-4 mt-2">
                <h4 className="text-sm font-semibold text-primary font-manrope">Grid Layout Configuration</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                      Mobile Span
                    </label>
                    <select
                      value={tempMobileSpan}
                      onChange={e => setTempMobileSpan(e.target.value)}
                      className="w-full border border-dark p-3 text-sm focus:outline-none bg-background text-primary"
                    >
                      <option value="col-span-1">Half Width (col-span-1)</option>
                      <option value="col-span-2">Full Width (col-span-2)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                      Desktop Span
                    </label>
                    <select
                      value={tempDesktopSpan}
                      onChange={e => setTempDesktopSpan(e.target.value)}
                      className="w-full border border-dark p-3 text-sm focus:outline-none bg-background text-primary"
                    >
                      <option value="md:col-span-1">25% Width (md:col-span-1)</option>
                      <option value="md:col-span-2">50% Width (md:col-span-2)</option>
                      <option value="md:col-span-3">75% Width (md:col-span-3)</option>
                      <option value="md:col-span-4">100% Width (md:col-span-4)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                      Bento Height (Row Span)
                    </label>
                    <select
                      value={tempRowSpan}
                      onChange={e => setTempRowSpan(e.target.value)}
                      className="w-full border border-dark p-3 text-sm focus:outline-none bg-background text-primary"
                    >
                      <option value="none">Standard Height (1 Row)</option>
                      <option value="row-span-2">Tall - Mobile & Desktop (row-span-2)</option>
                      <option value="md:row-span-2">Tall - Desktop Only (md:row-span-2)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                      Block Height Class
                    </label>
                    <select
                      value={categoryForm.height}
                      onChange={e => setCategoryForm(prev => ({ ...prev, height: e.target.value }))}
                      className="w-full border border-dark p-3 text-sm focus:outline-none bg-background text-primary"
                    >
                      <option value="h-[192px]">h-[192px] (Small)</option>
                      <option value="h-[250px]">h-[250px] (Medium)</option>
                      <option value="h-[300px]">h-[300px] (Semi-Large)</option>
                      <option value="h-[400px]">h-[400px] (Large)</option>
                    </select>
                  </div>
                </div>
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
                Save Category Block
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Marquee Modal */}
      {isMarqueeModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-light p-6 w-full max-w-md space-y-6">
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
                  Marquee text message
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
