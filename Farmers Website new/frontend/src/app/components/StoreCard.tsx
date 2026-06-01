import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { MessageSquare, Heart } from "lucide-react";

export interface StoreCardProps {
  id: string;
  name: string;
  location: string;
  coverImage?: string;
  avatar?: string;
  description?: string;
  verified?: boolean;
  followerCount?: number;
  totalProducts?: number;
  avgRating?: number;
  reviewCount?: number;
  isFollowing?: boolean;
  onFollowClick?: (farmerId: string) => void;
  onMessageClick?: (farmerId: string) => void;
}

export function StoreCard({
  id,
  name,
  location,
  coverImage,
  avatar,
  description,
  verified = false,
  followerCount = 0,
  totalProducts = 0,
  avgRating = 0,
  reviewCount = 0,
  isFollowing = false,
  onFollowClick,
  onMessageClick,
}: StoreCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Cover Image */}
      {coverImage && (
        <div className="relative h-24 bg-gray-100">
          <ImageWithFallback
            src={coverImage}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{name}</CardTitle>
              {verified && <Badge className="bg-blue-500 text-xs">Verified</Badge>}
            </div>
            <CardDescription className="text-sm">{location}</CardDescription>
            {avgRating > 0 && (
              <div className="text-xs text-amber-500 mt-1">
                ⭐ {avgRating.toFixed(1)} ({reviewCount} reviews)
              </div>
            )}
          </div>
          {avatar && (
            <ImageWithFallback
              src={avatar}
              alt={name}
              className="w-12 h-12 rounded-full border-2 border-white -mt-6"
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {description}
          </p>
        )}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Products</p>
            <p className="font-semibold text-lg">{totalProducts}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Followers</p>
            <p className="font-semibold text-lg">{followerCount}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Link to={`/store/${id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Store
          </Button>
        </Link>
        <Button
          variant={isFollowing ? "default" : "outline"}
          size="icon"
          onClick={() => onFollowClick?.(id)}
          className={isFollowing ? "bg-green-600" : ""}
        >
          <Heart className={`h-4 w-4 ${isFollowing ? "fill-white" : ""}`} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onMessageClick?.(id)}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
