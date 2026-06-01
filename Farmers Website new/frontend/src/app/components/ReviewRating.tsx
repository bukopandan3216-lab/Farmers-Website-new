import { Star } from "lucide-react";
import type { Review as ApiReview } from "../types/api";

interface ReviewRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function ReviewRating({
  rating,
  maxRating = 5,
  size = "md",
  showValue = true,
  interactive = false,
  onRatingChange,
}: ReviewRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.floor(rating);
        const isHalf = starValue === Math.ceil(rating) && rating % 1 !== 0;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starValue)}
            disabled={!interactive}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled || isHalf
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        );
      })}
      {showValue && (
        <span className={`ml-1 ${size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"} text-muted-foreground`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

type ReviewCardData = ApiReview & {
  buyer_name?: string;
  created_at?: string;
  product_name?: string;
  verified_purchase?: boolean;
};

interface ReviewCardProps {
  review: ReviewCardData;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const reviewerName = review.buyer_name || review.user?.fullName || "Anonymous";
  const reviewDate = review.created_at || review.createdAt || new Date().toISOString();

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{reviewerName}</span>
            {review.verified_purchase && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                Verified Purchase
              </span>
            )}
          </div>
          <ReviewRating rating={review.rating} size="sm" showValue={false} />
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(reviewDate).toLocaleDateString()}
        </span>
      </div>

      {review.product_name && (
        <div className="text-sm text-muted-foreground">
          Product: {review.product_name}
        </div>
      )}

      <p className="text-sm leading-relaxed">{review.comment}</p>
    </div>
  );
}
