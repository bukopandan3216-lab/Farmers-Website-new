import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { marketplaceApi } from "../services/api";

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  farmerId?: string;
  productName?: string;
  productImage?: string;
  storeName?: string;
  type?: "product" | "store";
  onSubmit?: (review: { rating: number; comment: string }) => void;
}

export function ReviewSubmissionModal({
  isOpen,
  onClose,
  productId,
  farmerId,
  productName,
  productImage,
  storeName,
  type = "product",
  onSubmit,
}: ReviewSubmissionModalProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (type === "product") {
        if (!productId) {
          throw new Error("Product ID is required for product reviews");
        }
        return marketplaceApi.createProductReview(productId, rating, comment);
      }

      if (!farmerId) {
        throw new Error("Farmer ID is required for store reviews");
      }

      return marketplaceApi.createStoreReview(farmerId, rating, comment);
    },
    onSuccess: () => {
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ["productDetail", productId] });
        queryClient.invalidateQueries({ queryKey: ["productReviews", productId] });
      }
      if (farmerId) {
        queryClient.invalidateQueries({ queryKey: ["storeReviews", farmerId] });
      }
      queryClient.invalidateQueries({ queryKey: ["myReviews"] });

      if (onSubmit) {
        onSubmit({ rating, comment });
      }

      toast.success("Review submitted successfully.");
      setComment("");
      setRating(0);
      setError("");
      onClose();
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || err.message || "Failed to submit review";
      setError(message);
      toast.error(message);
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (comment.trim().length < 10) {
      setError("Please write at least 10 characters in your review");
      return;
    }
    mutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Write a Review {productName ? `for ${productName}` : storeName ? `for ${storeName}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product/Store Preview */}
          {(productImage || productName || storeName) && (
            <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              {productImage && (
                <ImageWithFallback
                  src={productImage}
                  alt={productName}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div>
                <p className="font-medium text-sm">{productName || storeName}</p>
                <p className="text-xs text-gray-600">You purchased from this</p>
              </div>
            </div>
          )}

          {/* Rating Stars */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setRating(star);
                    if (error) setError("");
                  }}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium">
              Your Review
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this product or store..."
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) setError("");
              }}
              className="min-h-32 border-gray-300"
            />
            <p className="text-xs text-gray-500">{comment.length}/500 characters</p>
          </div>

          {/* Error Message */}
          {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {mutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
