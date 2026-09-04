"use client";

import { useEffect, useState } from "react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, Product } from "../../hooks/useApi";
import { Plus, Edit2, Trash2, Search, X, ChevronDown, Store, Package } from "lucide-react";
import { getProductImageUrl } from "../../utils/image";
import { useToast } from "../../../context/ToastProvider";
import { TableRowSkeleton } from "../../../components/ui/Skeleton";

export default function AdminProducts() {
  const { data: productsData, isLoading } = useProducts(100);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [vendorsList, setVendorsList] = useState<{ id: number; storeName: string; slug: string }[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDeleteId, setProductToDeleteId] = useState<number | null>(null);
  const { showToast } = useToast();

  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    originalPrice: "",
    image: "",
    description: "",
    category: "fragrance",
    vendorId: 1,
    stock: 0,
    isNew: false,
    isSale: false,
  });

  const { mutate: createProduct, isPending: createPending } = useCreateProduct();
  const { mutate: updateProduct, isPending: updatePending } = useUpdateProduct();
  const { mutate: deleteProduct } = useDeleteProduct();

  // Image Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://172.29.214.47:3001";

  // Fetch Vendors for Filter and Assignment
  useEffect(() => {
    async function loadVendors() {
      try {
        const res = await fetch(`${backendUrl}/trpc/adminGetVendors`);
        const data = await res.json();
        if (data.result?.data) {
          setVendorsList(data.result.data);
        }
      } catch (err) {
        console.error("Failed to load vendors:", err);
      }
    }
    loadVendors();
  }, [backendUrl]);

  useEffect(() => {
    if (productsData) {
      setLocalProducts(productsData);
    }
  }, [productsData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      const response = await fetch(`${backendUrl}/api/upload-product-image`, {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      if (result.success && result.url) {
        setFormData((prev) => ({ ...prev, image: result.url }));
      } else {
        throw new Error(result.error || "Failed to upload image");
      }
    } catch (err) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      brand: "",
      price: "",
      originalPrice: "",
      image: "",
      description: "",
      category: "fragrance",
      vendorId: vendorsList[0]?.id || 1,
      stock: 50,
      isNew: true,
      isSale: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      image: product.image,
      description: product.description || "",
      category: product.category || "fragrance",
      vendorId: product.vendorId || 1,
      stock: product.stock || 0,
      isNew: product.isNew || false,
      isSale: product.isSale || false,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setProductToDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (productToDeleteId === null) return;
    try {
      await deleteProduct({ id: productToDeleteId });
      setLocalProducts(localProducts.filter((p) => p.id !== productToDeleteId));
      showToast("Product deleted successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete product", "error");
    } finally {
      setProductToDeleteId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedPrice = Math.max(0, parseFloat(formData.price) || 0).toFixed(2);
      const parsedOriginalPrice = formData.originalPrice 
        ? Math.max(0, parseFloat(formData.originalPrice) || 0).toFixed(2) 
        : undefined;

      const matchedVendor = vendorsList.find(v => v.id === formData.vendorId);

      const payload = {
        name: formData.name,
        brand: formData.brand,
        price: parsedPrice,
        originalPrice: parsedOriginalPrice,
        image: formData.image,
        description: formData.description || undefined,
        category: formData.category,
        vendorId: formData.vendorId,
        vendorStoreName: matchedVendor?.storeName || "VellVista Flagship Store",
        stock: Math.max(0, Number(formData.stock) || 0),
        isNew: formData.isNew,
        isSale: formData.isSale,
      };

      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, data: payload });
        setLocalProducts(
          localProducts.map((p) =>
            p.id === editingProduct.id
              ? { ...p, ...payload, price: payload.price, originalPrice: payload.originalPrice }
              : p
          )
        );
        showToast("Product updated successfully!", "success");
      } else {
        const newProd = await createProduct(payload);
        if (newProd) {
          setLocalProducts([{ ...newProd, vendorId: formData.vendorId, vendorStoreName: matchedVendor?.storeName }, ...localProducts]);
          showToast("Product created successfully!", "success");
        } else {
          window.location.reload();
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to save product", "error");
    }
  };

  const filteredProducts = localProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      (p.vendorStoreName || "").toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      (p.category || "").toLowerCase() === categoryFilter.toLowerCase();

    const matchesVendor =
      vendorFilter === "all" ||
      (p.vendorId ? String(p.vendorId) === vendorFilter : vendorFilter === "1");

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "in_stock" && (p.stock ?? 0) > 0) ||
      (stockFilter === "out_of_stock" && (p.stock ?? 0) === 0) ||
      (stockFilter === "low_stock" && (p.stock ?? 0) > 0 && (p.stock ?? 0) < 10);

    const matchesTag =
      tagFilter === "all" ||
      (tagFilter === "new" && p.isNew) ||
      (tagFilter === "sale" && p.isSale);

    return matchesSearch && matchesCategory && matchesVendor && matchesStock && matchesTag;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 font-inter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary mb-1">Products Manager</h2>
          <p className="text-secondary text-sm">Add, edit, assign vendors, or remove store products.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-inverse px-4 py-2.5 hover:bg-primary-light transition-all text-sm font-light cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters bar (Matching /admin/users reference design) */}
      <div className="bg-surface p-6 border border-light space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        {/* Search bar row */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary" />
          <input
            type="text"
            placeholder="Search products by name, vendor store or brand..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Filters row */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 md:flex md:items-center md:w-auto">
          {/* Category Filter Dropdown */}
          <div className="relative md:w-44">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-2 sm:pl-3 pr-8 py-2 border border-dark bg-background text-primary text-xs sm:text-sm focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none truncate"
            >
              <option value="all">All Categories</option>
              <option value="fragrance">Perfume</option>
              <option value="skincare">Skincare</option>
              <option value="cosmetics">Cosmetics</option>
              <option value="fashion">Fashion</option>
              <option value="electronics">Electronics</option>
              <option value="accessories">Accessories</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-secondary">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* Vendor Filter Dropdown */}
          <div className="relative md:w-44">
            <select
              value={vendorFilter}
              onChange={(e) => {
                setVendorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-2 sm:pl-3 pr-8 py-2 border border-dark bg-background text-primary text-xs sm:text-sm focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none truncate"
            >
              <option value="all">All Seller Stores</option>
              {vendorsList.map((v) => (
                <option key={v.id} value={String(v.id)}>
                  {v.storeName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-secondary">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* Stock Filter Dropdown */}
          <div className="relative md:w-44">
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-2 sm:pl-3 pr-8 py-2 border border-dark bg-background text-primary text-xs sm:text-sm focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none truncate"
            >
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="low_stock">Low Stock (&lt; 10)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-secondary">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-surface border border-light overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-light text-secondary uppercase font-semibold text-[11px] tracking-wider bg-surface-alt whitespace-nowrap">
              <th className="p-4 w-16">Image</th>
              <th className="p-4">Name & Vendor Store</th>
              <th className="p-4">Brand</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light">
            {isLoading && localProducts.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={7} showAction={true} />
              ))
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-secondary">
                  No products found.
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => (
                <tr key={product.id} className="text-primary hover:bg-surface-alt/50 whitespace-nowrap">
                  <td className="p-4">
                    <img
                      src={getProductImageUrl(product.image)}
                      alt={product.name}
                      className="w-10 h-10 object-cover border border-light"
                    />
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-primary">{product.name}</p>
                    <p className="text-[10px] text-secondary flex items-center gap-1 mt-0.5">
                      <Store className="w-2.5 h-2.5 text-accent" />
                      <span>{product.vendorStoreName || "VellVista Flagship Store"}</span>
                    </p>
                  </td>
                  <td className="p-4 text-secondary">{product.brand}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-surface-alt border border-light text-[10px] font-bold text-secondary uppercase tracking-wider">
                      {product.category || "fragrance"}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-primary">${product.price}</td>
                  <td className="p-4 text-secondary">{product.stock !== undefined ? product.stock : "N/A"}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="p-1.5 text-secondary hover:text-primary hover:bg-surface-alt transition-all cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product.id)}
                        className="p-1.5 text-secondary hover:text-error hover:bg-error-light transition-all cursor-pointer"
                        title="Delete Product"
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

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface p-4 border border-light">
          <span className="text-secondary text-xs sm:text-sm font-light">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-dark text-primary text-xs font-semibold hover:bg-surface-alt transition-all disabled:opacity-30 disabled:cursor-not-allowed select-none"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1.5 text-xs font-semibold border transition-all select-none ${
                    currentPage === p
                      ? "bg-primary text-inverse border-primary"
                      : "border-dark text-primary hover:bg-surface-alt"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-dark text-primary text-xs font-semibold hover:bg-surface-alt transition-all disabled:opacity-30 disabled:cursor-not-allowed select-none"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal slider/popover for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface max-w-lg w-full max-h-[90vh] overflow-y-auto border border-light p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-secondary hover:text-primary cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-primary font-manrope">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary bg-background text-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary bg-background text-primary"
                  />
                </div>
              </div>

              {/* Vendor Assignment Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Assign Vendor Store *</label>
                <div className="relative">
                  <select
                    value={formData.vendorId}
                    onChange={(e) => setFormData({ ...formData, vendorId: parseInt(e.target.value) || 1 })}
                    className="w-full pl-3 pr-10 py-2 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary bg-background text-primary cursor-pointer appearance-none font-semibold"
                  >
                    {vendorsList.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.storeName} ({v.slug})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-secondary">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Price ($) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary bg-background text-primary font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary bg-background text-primary font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Category *</label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full pl-3 pr-10 py-2 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary bg-background text-primary cursor-pointer appearance-none font-semibold"
                    >
                      <option value="fragrance">Perfume</option>
                      <option value="skincare">Skincare</option>
                      <option value="cosmetics">Cosmetics</option>
                      <option value="fashion">Fashion</option>
                      <option value="electronics">Electronics</option>
                      <option value="accessories">Accessories</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-secondary">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Math.max(0, Number(e.target.value)) })}
                    className="w-full px-3 py-2 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary bg-background text-primary font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Image URL *</label>
                <input
                  type="text"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary bg-background text-primary"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-light">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-dark text-primary text-xs font-bold uppercase tracking-wider hover:bg-surface-alt cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPending || updatePending}
                  className="px-4 py-2 bg-primary text-inverse text-xs font-bold uppercase tracking-wider hover:bg-primary-light cursor-pointer disabled:opacity-50"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDeleteId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface max-w-sm w-full border border-light p-6 shadow-2xl space-y-4 text-center">
            <h3 className="text-lg font-bold text-primary">Confirm Deletion</h3>
            <p className="text-xs text-secondary">
              Are you sure you want to delete this product from the store catalog? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setProductToDeleteId(null)}
                className="px-4 py-2 border border-dark text-primary text-xs font-bold uppercase tracking-wider hover:bg-surface-alt cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-error text-inverse text-xs font-bold uppercase tracking-wider hover:opacity-90 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
