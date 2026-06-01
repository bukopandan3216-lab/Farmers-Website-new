import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Star, MessageCircle, Heart } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ProductCard } from "../components/ProductCard";
import { ProductDetailModal } from "../components/ProductDetailModal";
import { ReviewSubmissionModal } from "../components/ReviewSubmissionModal";
import { ReviewCard } from "../components/ReviewCard";
import { useAuth } from "../contexts/AuthContext";
import { marketplaceApi } from "../services/api";

export function FarmerStorePage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const storeQuery = useQuery({
    queryKey: ["farmer", storeId],
    queryFn: () => marketplaceApi.farmer(storeId || ""),
    enabled: Boolean(storeId),
  });

  // Fetch store reviews
  const reviewsQuery = useQuery({
    queryKey: ["storeReviews", storeId],
    queryFn: () => marketplaceApi.storeReviews(storeId || ""),
    enabled: Boolean(storeId),
  });

  const handleStoreReviewSuccess = () => {
    if (!storeId) return;
    queryClient.invalidateQueries({ queryKey: ["storeReviews", storeId] as const });
  };

  // Fetch store products
  const productsQuery = useQuery({
    queryKey: ["farmerProducts", storeId, storeQuery.data?.userId],
    queryFn: () => marketplaceApi.products({ farmerId: storeQuery.data?.userId || storeId }),
    enabled: Boolean(storeId && storeQuery.data),
  });

  const handleFollow = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    // TODO: Implement follow functionality
    setIsFollowing(!isFollowing);
  };

  const handleMessage = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const farmerUserId = storeQuery.data?.userId || storeQuery.data?.user?.id;
    if (!farmerUserId) {
      console.error("Cannot open conversation: farmer user id missing");
      return;
    }

    navigate(`/messages/${farmerUserId}`);
  };

  if (storeQuery.isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Skeleton className="h-72 rounded-none" />
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-40 rounded-lg mb-8" />
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  if (storeQuery.isError || !storeQuery.data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Store Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Sorry, we couldn't find this store. It may have been removed or the link is broken.</p>
            <Button onClick={() => navigate("/stores")} className="w-full">Browse All Stores</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const store = storeQuery.data;
  const products = productsQuery.data?.products || [];
  const reviews = reviewsQuery.data || [];

  const ProductSkeleton = () => <Skeleton className="h-80 rounded-lg" />;
  const ReviewSkeleton = () => <Skeleton className="h-24 rounded-lg" />;

  return (
    <div className="min-h-screen bg-white">
      {/* Store Header */}
      <div className="relative h-72 bg-gradient-to-br from-emerald-600 to-emerald-800">
        <ImageWithFallback 
          src={store.coverImage} 
          alt={store.farmName} 
          className="w-full h-full object-cover opacity-40" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Store Info Card */}
        <div className="relative -mt-24 bg-white rounded-lg shadow-xl p-6 sm:p-8 mb-12 border-t-4 border-emerald-500">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-32 h-32 border-4 border-emerald-500 shadow-lg flex-shrink-0">
              <AvatarImage src={store.user?.avatar} alt={store.user?.fullName} />
              <AvatarFallback className="text-2xl">{store.farmName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{store.farmName}</h1>
                {store.verified && (
                  <Badge className="bg-blue-600 text-white">✓ Verified</Badge>
                )}
                {store.featured && (
                  <Badge className="bg-amber-600 text-white">⭐ Featured</Badge>
                )}
              </div>

              <p className="text-gray-600 mb-4">Owned by {store.user?.fullName}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 py-4 border-y border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Products</p>
                  <p className="text-2xl font-bold text-emerald-600">{products.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    <p className="text-2xl font-bold">{store.avgRating == null ? "N/A" : Number(store.avgRating).toFixed(1)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Followers</p>
                  <p className="text-2xl font-bold text-emerald-600">{store.followerCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-sm">{store.farmLocation}</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">{store.farmDescription}</p>

              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleFollow}
                  className={isFollowing ? "bg-emerald-600 text-white" : "border-emerald-600 text-emerald-600"}
                  variant={isFollowing ? "default" : "outline"}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button 
                  onClick={handleMessage}
                  variant="outline"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate("/login");
                      return;
                    }
                    setIsReviewModalOpen(true);
                  }}
                  variant="outline"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Review Store
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Products</h2>
            <p className="text-gray-600">{products.length} fresh products available from this farm</p>
          </div>

          {productsQuery.isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                 // farmer={store.farmName} //Disabled casue it causes error when farmer name is not available, original: farmer={store.farmName}
                  farmer={product.farmer?.farmerProfile?.farmName || product.farmer?.fullName} //Added fallback for farmer name to prevent errors, original: farmer={store.farmName}
                  farmerId={product.farmerId}
                  image={product.images?.[0]}
                  stock={product.stock}
                  description={product.description}
                  category={product.category?.name}
                  rating={product.avgRating || 0}
                  reviewCount={product.reviewCount || 0}
                  onQuickView={(selected) => {
                    setSelectedProduct(selected);
                    setIsProductModalOpen(true);
                  }}
                  onFavoriteClick={() => {}}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-emerald-200">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 text-lg">No products available yet from this farm</p>
            </Card>
          )}
        </section>

        <ProductDetailModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          product={selectedProduct}
        />

        {/* Reviews Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Store Reviews</h2>
            <p className="text-gray-600">{reviews.length} reviews from customers</p>
          </div>

          {reviewsQuery.isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <ReviewSkeleton key={i} />)}
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.slice(0, 6).map((review: any) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  authorName={review.user?.fullName}
                  authorAvatar={review.user?.avatar}
                  rating={review.rating}
                  comment={review.comment}
                  createdAt={review.createdAt}
                  isCurrentUserReview={user?.id === review.userId}
                  reviewType="store"
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-emerald-200">
              <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 text-lg">No reviews yet. Be the first to review this store!</p>
            </Card>
          )}
        </section>

        <ReviewSubmissionModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          type="store"
          farmerId={storeId}
          storeName={store.farmName}
          onSubmit={handleStoreReviewSuccess}
        />

        {/* About Section */}
        <section className="mb-16 p-8 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">About {store.farmName}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-2">Quality Commitment</h3>
              <p className="text-gray-700">We provide fresh, farm-direct produce to ensure the highest quality standards for our customers.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Shipping Policy</h3>
              <p className="text-gray-700">All orders are carefully packaged and shipped within 24 hours to ensure freshness upon delivery.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
