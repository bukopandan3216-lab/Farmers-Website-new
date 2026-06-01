import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { marketplaceApi } from "../services/api";
import { Star } from "lucide-react";

export function StoresPage() {
  const farmersQuery = useQuery({ queryKey: ["farmers"], queryFn: marketplaceApi.farmers });

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="mb-2">Featured Farmers & Stores</h1>
          <p className="text-muted-foreground">Discover trusted farmers and stores selling fresh produce directly to you</p>
        </div>

        {farmersQuery.isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-96 rounded-lg" />)}
          </div>
        ) : farmersQuery.isError ? (
          <div className="text-center py-12 text-red-700">Could not load farmers.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmersQuery.data?.map((store) => (
              <Card key={store.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <ImageWithFallback src={store.coverImage} alt={store.farmName} className="w-full h-48 object-cover" />
                  {store.verified && <Badge className="absolute top-2 right-2 bg-blue-600">Verified</Badge>}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{store.farmName}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span>{store.avgRating || "New"}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">Owner: {store.user?.fullName}</p>
                  <p className="text-sm text-muted-foreground mb-2">{store.farmLocation}</p>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{store.farmDescription}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{store.productsCount || 0} products</span>
                    <Link to={`/store/${store.userId}`}>
                      <Button size="sm">View Store</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
