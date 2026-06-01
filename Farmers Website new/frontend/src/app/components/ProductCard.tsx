import { ShoppingCart, Eye, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  farmer?: {
    fullName?: string;
    farmerProfile?: {
      farmName: string;
      farmLocation: string;
    };
    id?: string;
  };
  farmerId: string;
  image?: string;
  stock: number;
  description?: string;
  category?: {
    name: string;
  };
  rating?: number;
  reviewCount?: number;
  isFavorite?: boolean;
  onQuickView?: (product: any) => void;
  onFavoriteClick?: (productId: string) => void;
}

export function ProductCard({
  id,
  name,
  price,
  farmer,
  farmerId,
  image,
  stock,
  description,
  category,
  rating = 0,
  reviewCount = 0,
  isFavorite = false,
  onQuickView,
  onFavoriteClick,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const storeId = farmerId || farmer?.id?.toString() || "";

  const farmerName = farmer?.farmerProfile?.farmName || farmer?.fullName || "FarmDirect Farmer";
  const farmLocation = farmer?.farmerProfile?.farmLocation || category?.name || "Philippines";

  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      price,
      unit: "kg",
      //photo: image, //Disabled photo cause it causes error when image is not available, original: photo: image
      photo: image || "/placeholder-product.png", //Added fallback for product image to prevent errors, original: photo: image
      farmer_id: farmerId,
      store_name: farmerName,
      stock_qty: stock,
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="relative">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-48 object-cover"
        />
        {stock > 0 && (
          <Badge className="absolute top-2 right-2 bg-green-600">In Stock</Badge>
        )}
        {stock === 0 && (
          <Badge className="absolute top-2 right-2 bg-red-600">Out of Stock</Badge>
        )}
      </div>

      <CardHeader className="flex-1">
        <CardTitle className="text-lg line-clamp-2">{name}</CardTitle>
        <CardDescription>
          <div
            className={`text-sm font-medium text-foreground ${storeId ? "cursor-pointer hover:underline" : "cursor-default"}`}
            onClick={() => storeId && navigate(`/store/${storeId}`)}
            title={storeId ? `View store: ${farmerName}` : farmerName}
          >
            {farmerName}
          </div>
          <div className="text-xs text-muted-foreground">{farmLocation}</div>
          {reviewCount > 0 && (
            <div className="text-xs text-amber-500 mt-1">
              ⭐ {Number(rating || 0).toFixed(1)} ({reviewCount} reviews)
            </div>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">PHP {Number(price || 0).toFixed(2)}</span>
          <span className="text-muted-foreground">/kg</span>
        </div>
      </CardContent>

      <CardFooter className="gap-2 flex-wrap">
        <Button
          className="flex-1"
          onClick={handleAddToCart}
          disabled={stock <= 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onQuickView?.({ id, name, price, farmer, farmerId, image, stock, description, category })}
          title="Quick view"
        >
          <Eye className="h-4 w-4" />
        </Button>
        {onFavoriteClick && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onFavoriteClick(id)}
            className={isFavorite ? "bg-red-50" : ""}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
