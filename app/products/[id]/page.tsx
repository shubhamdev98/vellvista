"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use, useState, useEffect } from "react";
import { useCart } from "../../../context/CartProvider";
import { useAuth } from "../../../context/AuthProvider";
import { useSocket } from "../../../context/SocketProvider";
import { useToast } from "../../../context/ToastProvider";
import { useCurrency } from "../../../context/CurrencyProvider";
import { trpc } from "../../utils/trpc";
import { getImageUrl } from "../../utils/image";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addItem } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();
  const { socket, joinProduct, leaveProduct } = useSocket();
  const [selectedSize, setSelectedSize] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  interface Product {
    id: number;
    name: string;
    brand: string;
    price: string | number;
    originalPrice?: string | number | null;
    rating: string | number;
    reviews: number;
    image: string;
    description?: string | null;
    category?: string;
    isSale?: boolean;
    isNew?: boolean;
    notes?: { top: string[]; middle: string[]; base: string[] };
  }

  interface Variant {
    id: number;
    size?: string | null;
    volume?: string | null;
    price: string | number;
  }

  interface Review {
    id: number;
    rating: number;
    userName: string;
    comment: string;
    title?: string;
    image?: string;
    createdAt: string;
  }

  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, title: "", comment: "" });
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productId = parseInt(id);
        if (isNaN(productId)) {
          setError("Invalid product ID");
          setLoading(false);
          return;
        }
        const [productData, variantsData] = await Promise.all([
          trpc.getProductById({ id: productId }),
          trpc.getProductVariants({ productId }),
        ]);
        if (!productData) {
          setError("Product not found");
        } else {
          setProduct(productData);
          setVariants(variantsData || []);
          if (variantsData && variantsData.length > 0) {
            setSelectedSize(variantsData[0].size || variantsData[0].volume || "");
          }
        }
      } catch (err) {
        setError("Failed to load product");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    // Fetch reviews from database
    const fetchReviews = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://172.29.214.47:3001';
        const response = await fetch(`${backendUrl}/api/reviews/${product.id}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();

    // Socket.io setup
    if (socket) {
      joinProduct(product.id.toString());

      socket.on('new-review', (newReview: Review) => {
        console.log('New review received via Socket.io:', newReview);
        setReviews((prev) => [newReview, ...prev]);
      });

      return () => {
        leaveProduct(product.id.toString());
        socket.off('new-review');
      };
    }
  }, [socket, product, joinProduct, leaveProduct]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating)
            ? "text-accent fill-current"
            : "text-muted"
        }`}
      />
    ));
  };

  const formatReviewDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleAddToCart = async () => {
    if (!product || isAdding) return;
    setIsAdding(true);
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image,
      });
      setIsAdded(true);
      showToast("Added to cart successfully!", "success");
      setTimeout(() => setIsAdded(false), 1500);
    } catch (error: any) {
      showToast(error.message || "Failed to add item to cart.", "warning");
    } finally {
      setIsAdding(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReviewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setReviewImage(null);
    setImagePreview(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit review clicked');
    console.log('User:', user);
    console.log('Review data:', reviewData);
    console.log('Review image:', reviewImage);

    if (!user) {
      showToast("Please login to submit a review", "warning");
      return;
    }

    if (!product) return;
    const formData = new FormData();
    formData.append('productId', product.id.toString());
    formData.append('userId', user.id);
    formData.append('rating', reviewData.rating.toString());
    formData.append('title', reviewData.title);
    formData.append('comment', reviewData.comment);
    formData.append('userName', user.fullName);
    if (reviewImage) {
      formData.append('image', reviewImage);
    }

    console.log('FormData created, sending to backend...');

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://172.29.214.47:3001';
      const response = await fetch(`${backendUrl}/api/reviews`, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('Review submitted successfully:', result);
        // Don't add to state here - Socket.io will handle it
        setShowReviewForm(false);
        setReviewData({ rating: 5, title: "", comment: "" });
        setReviewImage(null);
        setImagePreview(null);
        showToast('Review submitted successfully!', 'success');
      } else {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        showToast('Failed to submit review. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast('Error submitting review. Please check console for details.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-error text-lg mb-4">{error}</p>
            <Link href="/products" className="text-primary underline">
              Back to Shop
            </Link>
          </div>
        )}

        {!loading && !error && product && (
          <>
            {/* Breadcrumb */}
            <nav className="text-sm mb-8">
              <ol className="flex items-center space-x-2 text-muted">
                <li>
                  <Link href="/" className="hover:text-primary">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/products" className="hover:text-primary">
                    Shop
                  </Link>
                </li>
                <li>/</li>
                <li className="text-primary">{product.name}</li>
              </ol>
            </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-background-muted flex items-center justify-center relative">
              <Image
                src={getImageUrl(product.image)}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-background-muted  flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary overflow-hidden relative"
                >
                  <Image
                    src={getImageUrl(product.image)}
                    alt={`${product.name} view ${i}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 20vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-semibold text-primary mb-2">
                {product.name}
              </h1>
              <p className="text-xl text-primary/70 mb-4">{product.brand}</p>

              {/* Rating - based on real reviews only */}
              {reviews.length > 0 ? (
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    {renderStars(
                      Math.round(
                        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length * 10
                      ) / 10
                    )}
                  </div>
                  <span className="text-primary/70">
                    {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              ) : (
                <p className="text-primary/50 text-sm mb-4">No reviews yet</p>
              )}

              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-semibold text-primary">
                  {formatPrice(Number(product.price))}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-primary/50 line-through">
                    {formatPrice(Number(product.originalPrice))}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="bg-primary text-inverse px-3 py-1 text-sm font-semibold">
                    Save {formatPrice(Number(product.originalPrice) - Number(product.price))}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-primary/70 mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Size Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-primary mb-3">
                  Select Size
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {variants.length > 0 ? (
                    variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedSize(variant.size || variant.volume || "")}
                        className={`border  p-3 transition-colors ${
                          selectedSize === (variant.size || variant.volume)
                            ? "border-primary bg-primary/5"
                            : "border-dark hover:border-primary"
                        }`}
                      >
                        <div className="font-light text-primary">
                          {variant.size || variant.volume}
                        </div>
                        <div className="text-sm text-primary/70">
                          {formatPrice(Number(variant.price))}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-3 text-sm text-primary/70">
                      Base price: {formatPrice(Number(product.price))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`flex-1 py-3 font-semibold transition-all duration-300 flex items-center justify-center cursor-pointer ${
                    isAdded
                      ? "bg-green-600 text-white"
                      : isAdding
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-primary text-inverse hover:bg-secondary hover:text-primary"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Added!
                    </>
                  ) : isAdding ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </button>
                <button className="p-3 border border-dark  hover:border-primary transition-colors">
                  <Heart className="h-5 w-5 text-primary" />
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-light">
                <div className="text-center">
                  <Truck className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-light text-primary">
                    Free Shipping
                  </p>
                </div>
                <div className="text-center">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-light text-primary">Authentic</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-light text-primary">
                    30-Day Returns
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="">
          <div className="border-b border-light">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("description")}
                className={`py-4 px-1 border-b-2 font-light ${
                  activeTab === "description"
                    ? "border-primary text-primary"
                    : "border-transparent text-primary/70 hover:text-primary"
                }`}
              >
                Description
              </button>
              {product.notes && (
                <button
                  onClick={() => setActiveTab("fragrance")}
                  className={`py-4 px-1 border-b-2 font-light ${
                    activeTab === "fragrance"
                      ? "border-primary text-primary"
                      : "border-transparent text-primary/70 hover:text-primary"
                  }`}
                >
                  Fragrance Notes
                </button>
              )}
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-4 px-1 border-b-2 font-light ${
                  activeTab === "reviews"
                    ? "border-primary text-primary"
                    : "border-transparent text-primary/70 hover:text-primary"
                }`}
              >
                Reviews
              </button>
            </nav>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Product Description
                </h3>
                <p className="text-primary/70 mb-4 leading-relaxed">
                  {product.description || "No description available."}
                </p>
              </div>
            )}

            {activeTab === "fragrance" && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold text-primary mb-6">
                  Fragrance Notes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-background-muted p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-primary mb-3">
                      Top Notes
                    </h3>
                    <ul className="space-y-2">
                      {product.notes?.top.map((note) => (
                        <li key={note} className="text-primary/70">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-background-muted p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-primary mb-3">
                      Middle Notes
                    </h3>
                    <ul className="space-y-2">
                      {product.notes?.middle.map((note) => (
                        <li key={note} className="text-primary/70">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-background-muted p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-primary mb-3">
                      Base Notes
                    </h3>
                    <ul className="space-y-2">
                      {product.notes?.base.map((note) => (
                        <li key={note} className="text-primary/70">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="prose max-w-none">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-primary">
                    Customer Reviews
                  </h3>
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="bg-primary text-inverse px-4 py-2 hover:bg-secondary hover:text-primary transition-colors "
                  >
                    {showReviewForm ? "Cancel" : "Write a Review"}
                  </button>
                </div>

                {showReviewForm && (
                  <form onSubmit={handleSubmitReview} className="bg-background-muted p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold text-primary mb-4">
                      Write Your Review
                    </h3>
                    <div className="mb-4">
                      <label className="block text-sm font-light text-primary mb-2">
                        Rating
                      </label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= reviewData.rating
                                  ? "text-accent fill-current"
                                  : "text-muted"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-light text-primary mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={reviewData.title}
                        onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                        className="w-full p-2 border border-dark rounded-lg focus:outline-none focus:border-primary"
                        placeholder="Review title"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-light text-primary mb-2">
                        Comment
                      </label>
                      <textarea
                        value={reviewData.comment}
                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                        className="w-full p-2 border border-dark rounded-lg focus:outline-none focus:border-primary"
                        rows={4}
                        placeholder="Share your experience with this product"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-light text-primary mb-2">
                        Upload Image (Optional)
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <Upload className="h-5 w-5 text-primary" />
                          <span className="text-sm text-primary">Choose file</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                        {imagePreview && (
                          <div className="relative">
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              width={80}
                              height={80}
                              unoptimized
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute -top-2 -right-2 bg-error text-inverse rounded-full p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary text-inverse py-2 hover:bg-secondary hover:text-primary transition-colors"
                    >
                      Submit Review
                    </button>
                  </form>
                )}

                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={`${review.id}-${review.createdAt}`} className="bg-background-muted p-6 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                            </div>
                            <span className="font-light text-primary">
                              {review.userName}
                            </span>
                          </div>
                          <span className="text-sm text-primary/70">
                            {formatReviewDate(review.createdAt)}
                          </span>
                        </div>
                        {review.title && (
                          <h3 className="font-semibold text-primary mb-2">
                            {review.title}
                          </h3>
                        )}
                        {review.image && (
                          <div className="overflow-hidden rounded-lg mb-3 w-28 h-28 sm:w-32 sm:h-32">
                            <Image
                              src={getImageUrl(review.image)}
                              alt="Review image"
                              width={128}
                              height={128}
                              unoptimized
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <p className="text-primary/70 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-primary/50 text-lg mb-2">No reviews yet</p>
                    <p className="text-primary/40 text-sm">Be the first to review this product!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </>
        )}
      </main>

      <Footer />
    </div>
  );
}
