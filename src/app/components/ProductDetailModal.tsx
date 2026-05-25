import { useState } from "react";
import { X, ShoppingCart, Store, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ReviewRating, ReviewCard } from "./ReviewRating";
import { ReviewSubmissionModal } from "./ReviewSubmissionModal";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  farmer: string;
  farmer_id?: number;
  location: string;
  image: string;
  inStock: boolean;
  description: string;
  stock_qty?: number;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

// Mock reviews data
const mockReviews: Record<number, any[]> = {
  1: [
    {
      id: 1,
      buyer_name: "Maria Santos",
      rating: 5,
      comment: "Excellent quality broccoli! Very fresh and crisp. Delivered in perfect condition. Will definitely order again.",
      created_at: "2026-05-20T10:30:00Z",
      verified_purchase: true,
    },
    {
      id: 2,
      buyer_name: "Jose Reyes",
      rating: 4,
      comment: "Good quality vegetables. Fresh and well-packaged. Delivery was on time.",
      created_at: "2026-05-18T14:20:00Z",
      verified_purchase: true,
    },
    {
      id: 3,
      buyer_name: "Ana Cruz",
      rating: 5,
      comment: "The freshest broccoli I've bought online! Great service from the farmer.",
      created_at: "2026-05-15T09:15:00Z",
      verified_purchase: true,
    },
  ],
  2: [
    {
      id: 4,
      buyer_name: "Pedro Garcia",
      rating: 5,
      comment: "These tomatoes are amazing! So fresh and flavorful. Perfect for my recipes.",
      created_at: "2026-05-19T16:45:00Z",
      verified_purchase: true,
    },
  ],
};

export function ProductDetailModal({
  isOpen,
  onClose,
  product,
}: ProductDetailModalProps) {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  if (!isOpen || !product) return null;

  const reviews = mockReviews[product.id] || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      photo: product.image,
      farmer_id: product.farmer_id || 1,
      store_name: product.farmer,
      stock_qty: product.stock_qty || 100,
    });
  };

  const handleReviewSubmit = (review: { rating: number; comment: string }) => {
    console.log("Review submitted:", review);
    // In a real app, this would send to backend
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-background border-b border-border p-6 flex justify-between items-center">
            <h2 className="mb-0">Product Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Product Image */}
              <div className="relative">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
                {product.inStock && (
                  <Badge className="absolute top-4 right-4 bg-green-600">
                    In Stock
                  </Badge>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <ReviewRating
                      rating={averageRating}
                      size="md"
                      showValue={true}
                      interactive={false}
                    />
                    <span className="text-sm text-muted-foreground">
                      ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                  <p className="text-muted-foreground">{product.description}</p>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl">₱{product.price}</span>
                    <span className="text-xl text-muted-foreground">/{product.unit}</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{product.farmer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">📍 {product.location}</span>
                    </div>
                  </div>
                </div>

                {isAuthenticated && user?.role === "buyer" && (
                  <div className="border-t border-border pt-4 space-y-3">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => setIsReviewModalOpen(true)}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Write a Review
                    </Button>
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Please login as a buyer to purchase this product
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs for Details, Reviews, Store Info */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews ({reviews.length})
                </TabsTrigger>
                <TabsTrigger value="store">Store Info</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-6">
                <div>
                  <h4 className="font-medium mb-2">Product Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Product Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <span className="ml-2 font-medium">Fresh Produce</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Unit:</span>
                      <span className="ml-2 font-medium">{product.unit}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Origin:</span>
                      <span className="ml-2 font-medium">{product.location}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stock:</span>
                      <span className="ml-2 font-medium">
                        {product.inStock ? "Available" : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    🌱 Farm Fresh Guarantee
                  </h4>
                  <p className="text-xs text-blue-800">
                    All products are harvested fresh and delivered directly from the farm to ensure maximum freshness and quality.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6 mt-6">
                {reviews.length > 0 ? (
                  <>
                    <div className="bg-muted/50 rounded-lg p-6">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-5xl mb-2">{averageRating.toFixed(1)}</div>
                          <ReviewRating
                            rating={averageRating}
                            size="md"
                            showValue={false}
                            interactive={false}
                          />
                          <p className="text-sm text-muted-foreground mt-2">
                            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                          </p>
                        </div>

                        <div className="flex-1 space-y-2">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = reviews.filter((r) => r.rating === star).length;
                            const percentage = (count / reviews.length) * 100;
                            return (
                              <div key={star} className="flex items-center gap-3">
                                <span className="text-sm w-12">{star} star</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-yellow-400 h-2 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm w-8 text-right">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="mb-2">No reviews yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Be the first to review this product
                    </p>
                    {isAuthenticated && user?.role === "buyer" && (
                      <Button onClick={() => setIsReviewModalOpen(true)}>
                        Write a Review
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="store" className="space-y-4 mt-6">
                <div className="bg-muted/50 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center">
                      <Store className="h-10 w-10 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1">{product.farmer}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        📍 {product.location}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <ReviewRating
                            rating={4.8}
                            size="sm"
                            showValue={false}
                            interactive={false}
                          />
                          <span className="text-sm">4.8</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Store Rating
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">About the Farm</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We are dedicated to providing the freshest produce directly from our farm to your table.
                    Our farming practices focus on sustainability and quality, ensuring that every product
                    meets the highest standards.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <span className="ml-2">{product.location}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Response Time:</span>
                      <span className="ml-2">Within 24 hours</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <ReviewSubmissionModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        product={product ? {
          id: product.id,
          name: product.name,
          photo: product.image,
          store_name: product.farmer,
        } : null}
        onSubmit={handleReviewSubmit}
      />
    </>
  );
}
