import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
// Using a simple custom tab bar instead of Radix Tabs for category selection
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ProductCard } from "../components/ProductCard";
import { ProductDetailModal } from "../components/ProductDetailModal";
import { useCart } from "../contexts/CartContext";
import { marketplaceApi } from "../services/api";
import type { Product } from "../types/api";

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Sync URL with state
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    setSearchParams(params);
  }, [selectedCategory, setSearchParams]);

  const categoriesQuery = useQuery({ 
    queryKey: ["categories"], 
    queryFn: marketplaceApi.categories 
  });

  const categoryId = categoriesQuery.data?.find((category) => 
    category.name.toLowerCase() === selectedCategory
  )?.id;

  const productsQuery = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: () => marketplaceApi.products({ 
      categoryId: selectedCategory === "all" ? undefined : categoryId, 
      take: 48,
    }),
    enabled: selectedCategory === "all" || Boolean(categoryId),
  });

  const displayProducts = useMemo(() => {
    return productsQuery.data?.products || [];
  }, [productsQuery.data]);

  const ProductSkeleton = () => <Skeleton className="h-80 rounded-lg" />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold mb-2">Shop Fresh Products</h1>
          <p className="text-emerald-100">Discover fresh farm produce from trusted local farmers</p>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <Link to="/stores">
            <Button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[&>svg]:px-3 border-emerald-600 text-emerald-600 hover:bg-emerald-50">
              View All Stores
            </Button>
          </Link>
        </div>

        {/* Category Tabs (custom) */}
        <div className="mb-8">
          <div className="bg-muted text-muted-foreground h-9 items-center rounded-xl p-[3px] flex w-full justify-start overflow-x-auto">
            <div className="category-tabs flex w-full">
              <button
                className={`tab-btn inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap ${selectedCategory === 'all' ? 'bg-card' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Products
              </button>
              {categoriesQuery.data?.map((category) => (
                <button
                  key={category.id}
                  className={`tab-btn inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap ${selectedCategory === category.name.toLowerCase() ? 'bg-card' : ''}`}
                  onClick={() => setSelectedCategory(category.name.toLowerCase())}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            {productsQuery.isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : productsQuery.isError ? (
              <Card className="p-12 text-center border-red-200">
                <p className="text-red-600 text-lg font-medium">Could not load products</p>
                <p className="text-gray-600">Please try again later</p>
              </Card>
            ) : displayProducts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayProducts.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    farmer={product.farmer?.farmerProfile?.farmName || product.farmer?.fullName}
                    farmerId={product.farmerId}
                    image={product.images?.[0]}
                    stock={product.stock}
                    description={product.description}
                    category={product.category?.name}
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
              <Card className="p-12 text-center border-emerald-200 bg-emerald-50">
                <p className="text-gray-600 text-lg font-medium">No products found</p>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </Card>
            )}
          </div>
        </div>

        <ProductDetailModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          product={selectedProduct}
        />

        {/* Results Summary */}
        {!productsQuery.isLoading && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
            Showing <span className="font-semibold">{displayProducts.length}</span> products
            {selectedCategory !== "all" && <span> in <span className="font-semibold">{selectedCategory}</span></span>}
          </div>
        )}
      </div>
    </div>
  );
}
