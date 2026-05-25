import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingCart, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ProductDetailModal } from "../components/ProductDetailModal";
import { useCart } from "../contexts/CartContext";
import { marketplaceApi } from "../services/api";
import type { Product } from "../types/api";

const toCardProduct = (product: Product) => ({
  id: product.id,
  name: product.name,
  price: product.price,
  unit: "kg",
  farmer: product.farmer?.farmerProfile?.farmName || product.farmer?.fullName || "FarmDirect Farmer",
  location: product.farmer?.farmerProfile?.farmLocation || "Philippines",
  image: product.images?.[0],
  inStock: product.stock > 0,
  description: product.description,
  stock: product.stock,
});

export function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();

  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: marketplaceApi.categories });
  const categoryId = categoriesQuery.data?.find((category) => category.name.toLowerCase() === selectedCategory)?.id;
  const productsQuery = useQuery({
    queryKey: ["products", selectedCategory, search],
    queryFn: () => marketplaceApi.products({ categoryId: selectedCategory === "all" ? undefined : categoryId, search, take: 48 }),
    enabled: selectedCategory === "all" || Boolean(categoryId),
  });

  const displayProducts = useMemo(() => productsQuery.data?.products || [], [productsQuery.data]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(toCardProduct(product));
    setIsModalOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: "kg",
      photo: product.images?.[0],
      farmer_id: product.farmerId,
      store_name: product.farmer?.farmerProfile?.farmName || product.farmer?.fullName || "FarmDirect Farmer",
      stock_qty: product.stock,
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mb-2">Shop All Products</h1>
            <p className="text-muted-foreground">Browse fresh products from local farmers</p>
          </div>
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search products..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8" onValueChange={setSelectedCategory}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">All Products</TabsTrigger>
            {categoriesQuery.data?.map((category) => (
              <TabsTrigger key={category.id} value={category.name.toLowerCase()}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-8">
            {productsQuery.isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-96 rounded-lg" />
                ))}
              </div>
            ) : productsQuery.isError ? (
              <div className="text-center py-12 text-red-700">Could not load products. Please try again.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <ImageWithFallback src={product.images?.[0]} alt={product.name} className="w-full h-48 object-cover" />
                      {product.stock > 0 && <Badge className="absolute top-2 right-2 bg-green-600">In Stock</Badge>}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>
                        {product.farmer?.farmerProfile?.farmName || product.farmer?.fullName}
                        <span className="block text-xs mt-1">{product.farmer?.farmerProfile?.farmLocation || product.category?.name}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl">PHP {product.price}</span>
                        <span className="text-muted-foreground">/kg</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button className="flex-1" onClick={() => handleAddToCart(product)} disabled={product.stock <= 0}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleProductClick(product)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {!productsQuery.isLoading && displayProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found. Try another category or search term.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ProductDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={selectedProduct} />
    </div>
  );
}
