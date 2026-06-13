"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { trpc } from "../app/utils/trpc";
import { useAuth } from "../context/AuthProvider";
import { useToast } from "../context/ToastProvider";

interface Review {
  id: number;
  productId: number;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: Date;
}

interface ReviewsProps {
  productId: number;
}

export default function Reviews({ productId }: ReviewsProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: ""
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const data = await trpc.getProductReviews({ productId });
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please login to submit a review", "warning");
      return;
    }

    try {
      await trpc.addReview({
        productId,
        userId: user.id,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment
      });
      showToast("Review submitted for approval!", "success");
      setShowReviewForm(false);
      setFormData({ rating: 5, title: "", comment: "" });
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      showToast("Failed to submit review", "error");
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-accent fill-current" : "text-muted"
        }`}
      />
    ));
  };

  if (isLoading) {
    return <div className="text-primary">Loading reviews...</div>;
  }

  const approvedReviews = reviews.filter(r => r.isApproved);

  return (
    <div className="bg-background-muted p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-primary">
          Reviews ({approvedReviews.length})
        </h3>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-primary text-surface px-4 py-2 hover:bg-surface hover:text-primary transition-colors"
        >
          {showReviewForm ? "Cancel" : "Write a Review"}
        </button>
      </div>

      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="mb-8 bg-surface p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Write Your Review</h3>
          
          <div className="mb-4">
            <label className="block text-primary mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= formData.rating ? "text-accent fill-current" : "text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-primary mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border border-dark text-primary focus:outline-none"
              placeholder="Sum up your review"
            />
          </div>

          <div className="mb-4">
            <label className="block text-primary mb-2">Review</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full p-2 border border-dark text-primary focus:outline-none h-32"
              placeholder="Share your experience with this product"
            />
          </div>

          <button
            type="submit"
            className="bg-primary text-surface px-6 py-2 hover:bg-surface hover:text-primary transition-colors"
          >
            Submit Review
          </button>
        </form>
      )}

      {approvedReviews.length === 0 ? (
        <div className="text-center py-8 text-primary">
          No reviews yet. Be the first to review this product!
        </div>
      ) : (
        <div className="space-y-6">
          {approvedReviews.map((review) => (
            <div key={review.id} className="border-b border-dark pb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">{renderStars(review.rating)}</div>
                <span className="text-sm text-primary">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
                {review.isVerified && (
                  <span className="text-xs bg-secondary text-primary px-2 py-1 rounded">
                    Verified Purchase
                  </span>
                )}
              </div>

              {review.title && (
                <h3 className="font-semibold text-primary mb-2">{review.title}</h3>
              )}

              {review.comment && (
                <p className="text-primary mb-3">{review.comment}</p>
              )}

              <button className="flex items-center gap-1 text-sm text-primary hover:text-surface">
                <ThumbsUp className="h-4 w-4" />
                Helpful ({review.helpfulCount})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
