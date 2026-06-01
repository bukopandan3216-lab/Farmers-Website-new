import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardDescription, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ProductDetailModal } from "../components/ProductDetailModal";
import { Badge } from "../components/ui/badge";
import { ProductCard } from "../components/ProductCard";
import { StoreCard } from "../components/StoreCard";
import { Skeleton } from "../components/ui/skeleton";
import { marketplaceApi } from "../services/api";

export function HomePage() {
  // Fetch featured products
  const { data: featuredProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: marketplaceApi.featured,
  });

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Fetch featured farmers
  const { data: featuredFarmersData = [], isLoading: farmersLoading } = useQuery({
    queryKey: ['featuredFarmers'],
    queryFn: marketplaceApi.featuredFarmers,
  });

  const shopCategories = [
    { value: 'vegetables', title: 'Vegetables', emoji: '🥬', subtitle: '45 items' },
    { value: 'fruits', title: 'Fruits', emoji: '🍎', subtitle: '32 items' },
    { value: 'grains', title: 'Grains & Rice', emoji: '🌾', subtitle: '18 items' },
    { value: 'herbs', title: 'Herbs & Spices', emoji: '🌿', subtitle: '24 items' },
    { value: 'roots', title: 'Root Crops', emoji: '🥔', subtitle: '15 items' },
    { value: 'dairy', title: 'Dairy & Eggs', emoji: '🥚', subtitle: '12 items' },
  ];

  const ProductCardSkeleton = () => <Skeleton className="h-80 rounded-lg" />;
  const StoreCardSkeleton = () => <Skeleton className="h-64 rounded-lg" />;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Gradient */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-emerald-50 via-emerald-50/50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-emerald-100 text-emerald-800">Direct from Farm to Table</Badge>
            <h1 className="mb-6 text-4xl md:text-5xl font-bold text-gray-900">
              Fresh Produce Without the Middleman
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Connect directly with local farmers. Get the freshest produce at fair prices while supporting your community.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/shop">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">Browse Products</Button>
              </Link>
              <Link to="/apply">
                <Button size="lg" variant="outline">Become a Seller</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="mb-2">Shop by Category</h2>
            <p className="text-muted-foreground">Browse our wide selection of fresh farm products</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {shopCategories.map((category) => (
              <Link key={category.value} to={`/shop?category=${category.value}`}>
                <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 text-center pb-2">
                    <div className="text-4xl mb-2">{category.emoji}</div>
                    <CardTitle className="text-base">{category.title}</CardTitle>
                    <CardDescription className="text-muted-foreground text-xs">{category.subtitle}</CardDescription>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Farmers Section - MOVED TO TOP */}
      <section className="py-16 bg-gradient-to-b from-emerald-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="mb-2 text-3xl font-bold">Featured Farmers & Stores</h2>
              <p className="text-gray-600">Trusted local farmers selling quality produce</p>
            </div>
            <Link to="/stores">
              <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                View All Stores
              </Button>
            </Link>
          </div>

          {farmersLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <StoreCardSkeleton key={i} />)}
            </div>
          ) : featuredFarmersData.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredFarmersData.slice(0, 6).map((farmer: any) => (
                <StoreCard
                  key={farmer.id}
                  id={farmer.userId || farmer.id}
                  name={farmer.farmName}
                  location={farmer.farmLocation}
                  coverImage={farmer.coverImage}
                  avatar={farmer.user?.avatar}
                  description={farmer.farmDescription}
                  verified={farmer.verified}
                  followerCount={farmer.followerCount}
                  totalProducts={farmer.productsCount || 0}
                  avgRating={farmer.avgRating || 0}
                  reviewCount={farmer.reviews?.length || 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No featured farmers available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="mb-2 text-3xl font-bold">Featured Products</h2>
              <p className="text-gray-600">Fresh picks from our farmers</p>
            </div>
            <Link to="/shop">
              <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                View All
              </Button>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product: any) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  farmer={product.farmer}
                  farmerId={product.farmerId}
                  image={product.images?.[0]}
                  stock={product.stock}
                  description={product.description}
                  category={product.category}
                  rating={product.avgRating || 0}
                  reviewCount={product.reviewCount || 0}
                  onQuickView={(product) => {
                    setSelectedProduct(product);
                    setIsProductModalOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No featured products available yet.</p>
            </div>
          )}
        </div>
      </section>

      <ProductDetailModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
      />

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to start shopping?</h2>
          <p className="mb-8 text-emerald-50">Discover fresh, farm-direct produce from local farmers in your area.</p>
          <Link to="/shop">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
           