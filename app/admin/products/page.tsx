"use client";

import { useEffect, useState } from "react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, Product } from "../../hooks/useApi";
import { Plus, Edit2, Trash2, Search, X, ChevronDown } from "lucide-react";
import { getProductImageUrl } from "../../utils/image";
import { useToast } from "../../../context/ToastProvider";
import { TableRowSkeleton } from "../../../components/ui/Skeleton";

export default function AdminProducts() {
  const { data: productsData, isLoading } = useProducts(100);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDeleteId, setProductToDeleteId] = useState<number | null>(null);
  const { showToast } = useToast();

  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all");
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    const uploadData = new FormData();
    uploadData.append("image", file);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://172.29.214.47:3001";

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

  useEffect(() => {
    if (productsData) {
      setLocalProducts(productsData);
    }
  }, [productsData]);

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

      const payload = {
        name: formData.name,
        brand: formData.brand,
        price: parsedPrice,
        originalPrice: parsedOriginalPrice,
        image: formData.image,
        description: formData.description || undefined,
        category: formData.category,
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
          setLocalProducts([newProd, ...localProducts]);
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
      p.brand.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      (p.category || "").toLowerCase() === categoryFilter.toLowerCase();

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "in_stock" && (p.stock ?? 0) > 0) ||
      (stockFilter === "out_of_stock" && (p.stock ?? 0) === 0) ||
      (stockFilter === "low_stock" && (p.stock ?? 0) > 0 && (p.stock ?? 0) < 10);

    const matchesTag =
      tagFilter === "all" ||
      (tagFilter === "new" && p.isNew) ||
      (tagFilter === "sale" && p.isSale);

    return matchesSearch && matchesCategory && matchesStock && matchesTag;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary mb-1">Products Manager</h2>
          <p className="text-secondary text-sm">Add, edit, or remove store products.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-inverse px-4 py-2.5 hover:bg-primary-light transition-all text-sm font-light cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-surface p-4 border border-light space-y-4">
        {/* Search bar row */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-secondary" />
          <input
            type="text"
            placeholder="Search products by name or brand..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-dark bg-background text-primary text-sm focus:outline-none focus:border-primary transition-all bg-transparent"
          />
        </div>

        {/* Filters row (always shown side-by-side / row-wise, even on mobile) */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-2 sm:pl-3 pr-8 py-2 border border-dark bg-background text-primary text-xs sm:text-sm focus:outline-none focus:border-primary transition-all bg-transparent cursor-pointer appearance-none truncate"
            >
              <option value="all">All Categories</option>
              <option value="fragrance">Fragrance</option>
              <option value="candle">Candle</option>
              <option value="body">Body & Care</option>
              <option value="gift">Gift Sets</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-secondary">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* Stock Filter */}
          <div className="relative">
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-2 sm:pl-3 pr-8 py-2 border border-dark bg-background text-primary text-xs sm:text-sm focus:outline-none focus:border-primary transition-all bg-transparent cursor-pointer appearance-none truncate"
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

          {/* Tag Filter */}
          <div className="relative">
            <select
              value={tagFilter}
              onChange={(e) => {
                setTagFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-2 sm:pl-3 pr-8 py-2 border border-dark bg-background text-primary text-xs sm:text-sm focus:outline-none focus:border-primary transition-all bg-transparent cursor-pointer appearance-none truncate"
            >
              <option value="all">All Tags</option>
              <option value="new">New Arrivals</option>
              <option value="sale">On Sale</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-secondary">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-surface border border-light overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-light text-secondary font-light bg-surface-alt whitespace-nowrap">
              <th className="p-4 w-16">Image</th>
              <th className="p-4">Name</th>
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
                <TableRowSkeleton key={i} cols={6} showAction={true} />
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
                  <td className="p-4 font-semibold">{product.name}</td>
                  <td className="p-4 text-secondary">{product.brand}</td>
                  <td className="p-4 text-secondary capitalize">{product.category || "fragrance"}</td>
                  <td className="p-4 font-semibold">${product.price}</td>
                  <td className="p-4 text-secondary">{product.stock !== undefined ? product.stock : "N/A"}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="p-1.5 text-secondary hover:text-primary hover:bg-surface-alt transition-all"
                        title="Edit Product"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product.id)}
                        className="p-1.5 text-secondary hover:text-error hover:bg-error-light transition-all"
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
          <div className="bg-surface max-w-lg w-full max-h-[90vh] overflow-y-auto border border-light p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-secondary hover:text-primary"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold text-primary mb-6">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Price ($)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val < 0) return;
                      setFormData({ ...formData, price: e.target.value });
                    }}
                    className="w-full px-3 py-2 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary bg-transparent text-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val < 0) return;
                      setFormData({ ...formData, originalPrice: e.target.value });
                    }}
                    className="w-full px-3 py-2 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary bg-transparent text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Category</label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full pl-3 pr-10 py-2 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary bg-transparent text-primary cursor-pointer appearance-none"
                    >
                      <option value="fragrance">Fragrance</option>
                      <option value="candle">Candle</option>
                      <option value="body">Body & Care</option>
                      <option value="gift">Gift Sets</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-secondary">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Math.max(0, Number(e.target.value)) })}
                    className="w-full px-3 py-2 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary bg-transparent text-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Product Image</label>
                <div className="space-y-3">
                  {/* File Input for Local System Upload */}
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
                      <span className="text-xs text-success font-light">✓ Image Selected</span>
                    )}
                  </div>

                  {/* Text Input for Online Link Fallback */}
                  <div>
                    <span className="text-xs text-secondary block mb-1">Or enter image URL:</span>
                    <input
                      type="text"
                      required
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="/product/imagename.jpg or https://example.com/image.jpg"
                    />
                  </div>

                  {uploadError && (
                    <p className="text-xs text-error font-light">{uploadError}</p>
                  )}

                  {/* Preview Container */}
                  {formData.image && (
                    <div className="mt-2 border border-light p-2 bg-surface-alt rounded inline-block">
                      <p className="text-xs text-secondary mb-1">Preview:</p>
                      <img
                        src={getProductImageUrl(formData.image)}
                        alt="Preview"
                        className="h-24 w-24 object-cover border border-default"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-default focus:outline-none focus:ring-1 focus:ring-primary bg-transparent text-primary"
                />
              </div>

              <div className="flex gap-6 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    className="accent-primary"
                  />
                  <span className="text-xs font-semibold text-secondary">New Arrival</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSale}
                    onChange={(e) => setFormData({ ...formData, isSale: e.target.checked })}
                    className="accent-primary"
                  />
                  <span className="text-xs font-semibold text-secondary">On Sale</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={createPending || updatePending}
                className="w-full bg-primary text-inverse py-2.5 text-sm hover:bg-primary-light transition-all font-semibold tracking-wide disabled:opacity-50"
              >
                {createPending || updatePending ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDeleteId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-primary/60 backdrop-blur-sm transition-opacity"
            onClick={() => setProductToDeleteId(null)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-surface w-full max-w-lg border border-light shadow-2xl z-10 p-8 md:p-12 animate-in zoom-in-95 duration-250">
            <button
              onClick={() => setProductToDeleteId(null)}
              className="absolute top-6 right-6 text-primary hover:text-secondary transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl text-primary mb-6 pr-8 font-light">
              Delete Product
            </h2>

            <p className="text-secondary text-base leading-relaxed mb-8 font-light">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setProductToDeleteId(null)}
                className="flex-1 border border-dark text-primary py-3 px-6 font-light hover:bg-surface-alt transition-colors duration-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-error text-inverse py-3 px-6 font-light hover:bg-error-light transition-colors duration-300 cursor-pointer"
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
