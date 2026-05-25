import { useState } from "react";
import { X, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { ReviewRating } from "./ReviewRating";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    photo: string;
    store_name?: string;
  } | null;
  onSubmit?: (review: { rating: number; comment: string }) => void;
}

export function ReviewSubmissionModal({
  isOpen,
  onClose,
  product,
  onSubmit,
}: ReviewSubmissionModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    if (comment.trim().length < 10) {
      alert("Please write at least 10 characters in your review");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (onSubmit) {
      onSubmit({ rating, comment });
    }

    alert("Thank you for your review! 🌟");
    setRating(0);
    setComment("");
    setIsSubmitting(false);
    onClose();
  };

  const ratingLabels = [
    "",
    "Poor - Not satisfied",
    "Fair - Below expectations",
    "Good - Met expectations",
    "Very Good - Exceeded expectations",
    "Excellent - Outstanding!",
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background border-b border-border p-6 flex justify-between items-center">
          <div>
            <h2 className="mb-1">Write a Review</h2>
            <p className="text-sm text-muted-foreground">Share your experience with this product</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="flex gap-4 bg-muted/50 rounded-lg p-4">
            <ImageWithFallback
              src={product.photo}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-medium mb-1">{product.name}</h3>
              {product.store_name && (
                <p className="text-sm text-muted-foreground">{product.store_name}</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Selection */}
            <div>
              <Label className="mb-3 block">How would you rate this product? *</Label>
              <div className="flex flex-col items-center gap-4 bg-muted/50 rounded-lg p-6">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 ${
                          value <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm font-medium text-primary">
                    {ratingLabels[rating]}
                  </p>
                )}
              </div>
            </div>

            {/* Review Comment */}
            <div>
              <Label htmlFor="review-comment" className="mb-2 block">
                Your Review *
              </Label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this product. What did you like or dislike? How was the quality, freshness, and packaging?"
                rows={6}
                required
                minLength={10}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Minimum 10 characters ({comment.length}/10)
              </p>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Review Tips:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Be specific about product quality, freshness, and packaging</li>
                <li>• Mention delivery time and condition of products received</li>
                <li>• Share how the product met (or didn't meet) your expectations</li>
                <li>• Keep it honest and helpful for other buyers</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || rating === 0}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
