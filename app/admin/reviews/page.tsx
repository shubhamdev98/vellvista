"use client";

import { useEffect, useState } from "react";
import { useAdminReviews, useApproveReview, useDeleteReview } from "../../hooks/useApi";
import { Star, CheckCircle, Trash2, X } from "lucide-react";
import { useToast } from "../../../context/ToastProvider";

export default function AdminReviews() {
  const { data: reviewsData, isLoading } = useAdminReviews();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [localReviews, setLocalReviews] = useState<any[]>([]);
  const [reviewToDeleteId, setReviewToDeleteId] = useState<number | null>(null);

  const { showToast } = useToast();
  const { mutate: approveReview } = useApproveReview();
  const { mutate: deleteReview } = useDeleteReview();

  useEffect(() => {
    if (reviewsData) {
      setLocalReviews(reviewsData);
    }
  }, [reviewsData]);

  const handleApprove = async (id: number) => {
    try {
      await approveReview({ id });
      setLocalReviews(
        localReviews.map((r) => (r.id === id ? { ...r, isApproved: true } : r))
      );
      showToast("Review approved successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to approve review", "error");
    }
  };

  const handleDeleteClick = (id: number) => {
    setReviewToDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (reviewToDeleteId === null) return;
    try {
      await deleteReview({ id: reviewToDeleteId });
      setLocalReviews(localReviews.filter((r) => r.id !== reviewToDeleteId));
      showToast("Review deleted successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete review", "error");
    } finally {
      setReviewToDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-1">Reviews Manager</h2>
        <p className="text-secondary text-sm">Approve customer feedback or moderate spam.</p>
      </div>

      {/* Reviews Table */}
      <div className="bg-surface border border-light overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-light text-secondary font-light bg-surface-alt">
              <th className="p-4">Customer</th>
              <th className="p-4 w-32">Rating</th>
              <th className="p-4">Comments</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light">
            {isLoading && localReviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-secondary">
                  Loading product reviews...
                </td>
              </tr>
            ) : localReviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-secondary">
                  No reviews found.
                </td>
              </tr>
            ) : (
              localReviews.map((review) => (
                <tr key={review.id} className="text-primary hover:bg-surface-alt/50">
                  <td className="p-4">
                    <div className="font-semibold text-primary">{review.userName || `User #${review.userId}`}</div>
                    <div className="text-xs text-secondary font-light">Product ID: {review.productId}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-0.5 text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? "fill-current" : "text-light"
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-primary text-xs">{review.title}</div>
                    <div className="text-secondary text-xs mt-0.5 max-w-[300px] truncate" title={review.comment}>
                      {review.comment}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold ${
                      review.isApproved
                        ? "bg-success-light text-success-dark"
                        : "bg-warning-light text-warning-dark"
                    }`}>
                      {review.isApproved ? "Approved" : "Awaiting Approval"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {!review.isApproved && (
                        <button
                          onClick={() => handleApprove(review.id)}
                          className="p-1.5 text-secondary hover:text-success hover:bg-success-light/30 transition-all"
                          title="Approve Review"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(review.id)}
                        className="p-1.5 text-secondary hover:text-error hover:bg-error-light transition-all"
                        title="Delete Review"
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

      {/* Delete Confirmation Modal */}
      {reviewToDeleteId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-primary/60 backdrop-blur-sm transition-opacity"
            onClick={() => setReviewToDeleteId(null)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-surface w-full max-w-lg border border-light shadow-2xl z-10 p-8 md:p-12 animate-in zoom-in-95 duration-250">
            <button
              onClick={() => setReviewToDeleteId(null)}
              className="absolute top-6 right-6 text-primary hover:text-secondary transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl text-primary mb-6 pr-8 font-light">
              Delete Review
            </h2>

            <p className="text-secondary text-base leading-relaxed mb-8 font-light">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setReviewToDeleteId(null)}
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
