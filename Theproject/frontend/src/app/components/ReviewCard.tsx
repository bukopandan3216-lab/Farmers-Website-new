import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export interface ReviewCardProps {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  comment?: string;
  createdAt: string;
  isCurrentUserReview?: boolean;
  reviewType?: "product" | "store";
}

export function ReviewCard({
  authorName,
  authorAvatar,
  rating,
  comment,
  createdAt,
  isCurrentUserReview = false,
  reviewType = "product",
}: ReviewCardProps) {
  const safeAuthorName = authorName || "Anonymous";
  const initials = safeAuthorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < rating ? "text-amber-500" : "text-gray-300"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <Card className={isCurrentUserReview ? "border-blue-200 bg-blue-50" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={authorAvatar} alt={authorName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{authorName}</p>
                {isCurrentUserReview && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Your Review
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDate(createdAt)}
              </p>
            </div>
          </div>
          {renderStars(rating)}
        </div>
      </CardHeader>
      {comment && (
        <CardContent>
          <p className="text-sm text-foreground">{comment}</p>
        </CardContent>
      )}
    </Card>
  );
}
