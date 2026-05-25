import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ShoppingCart, Star } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useCart } from "../contexts/CartContext";
import { marketplaceApi } from "../services/api";
import type { Product } from "../types/api";

export function FarmerStorePage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { addToCart } = useCart();
  const storeQuery = useQuery({
    queryKey: ["farmer", storeId],
    queryFn: () => marketplaceApi.farmer(storeId || ""),
    enabled: Boolean(storeId),
  });

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: "kg",
      photo: product.images?.[0],
      farmer_id: product.farmerId,
      store_name: storeQuery.data?.farmName || "FarmDirect Farmer",
      stock_qty: product.stock,
    });
  };

  if (storeQuery.isLoading) {
    return <div className="container mx-auto px-4 py-12"><Skeleton className="h-[520px] rounded-lg" /></div>;
  }

  if (storeQuery.isError || !storeQuery.data) {
    return <div className="container mx-auto px-4 py-12 text-center text-red-700">Store not found.</div>;
  }

  const store = storeQuery.data;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-72 bg-emerald-800">
        <ImageWithFallback src={store.coverImage} alt={store.farmName} className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 bg-white rounded-lg shadow-xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-28 h-28 border-4 border-white shadow-lg">
              <AvatarImage src={store.user?.avatar} alt={store.user?.fullName} />
              <AvatarFallback>{store.farmName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1>{store.farmName}</h1>
                {store.verified && <Badge className="bg-blue-600">Verified Farmer</Badge>}
              </div>
              <p className="text-muted-foreground mb-3">Owned by {store.user?.fullName}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {store.farmLocation}</span>
                <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /> {store.avgRating || "New rating"}</span>
              </div>
              <p className="max-w-3xl">{store.farmDescription}</p>
            </div>
          </div>
        </div>

        <section className="py-10">
          <div className="mb-6">
            <h2>Products</h2>
            <p className="text-muted-foreground">{store.products.length} products available from this farm</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {store.products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <ImageWithFallback src={product.images?.[0]} alt={product.name} className="w-full h-48 object-cover" />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category?.name}</p>
                    </div>
                    {product.organic && <Badge variant="secondary">Organic</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-3">{product.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-xl font-semibold">PHP {product.price}</p>
                      <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
                    </div>
                    <Button size="sm" onClick={() => handleAddToCart(product)} disabled={product.stock <= 0}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
