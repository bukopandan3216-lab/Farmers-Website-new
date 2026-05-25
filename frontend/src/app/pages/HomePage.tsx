import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { marketplaceApi } from "../services/api";

const categoryIcons: Record<string, string> = {
  Vegetables: "🥬",
  Fruits: "🍎",
  Grains: "🌾",
  Herbs: "🌿",
  Dairy: "🥚",
  Meat: "🥩",
  Seafood: "🐟",
};

export function HomePage() {
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: marketplaceApi.categories,
  });

  const { data: featuredData } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => marketplaceApi.products({ featured: true, take: 6 }),
  });

  const { data: farmersData } = useQuery({
    queryKey: ["farmers"],
    queryFn: marketplaceApi.farmers,
  });

  const categories = categoriesData || [];
  const featuredProducts = featuredData?.products || [];
  const farmers = farmersData?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4">Direct from Farm to Table</Badge>
            <h1 className="mb-6">Fresh Produce Without the Middleman</h1>
            <p className="text-muted-foreground mb-8">
              Connect directly with local farmers. Get the freshest produce at fair prices while supporting your community.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/shop">
                <Button size="lg">Browse Products</Button>
              </Link>
              <Link to="/apply">
                <Button size="lg" variant="outline">Become a Seller</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="mb-2">Shop by Category</h2>
            <p className="text-muted-foreground">Browse our wide selection of fresh farm products</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category: any) => (
              <Link key={category.id} to={`/shop?category=${category.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="text-center pb-2">
                    <div className="text-4xl mb-2">{categoryIcons[category.name] || "🌱"}</div>
                    <CardTitle className="text-base">{category.name}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Fresh picks from our farmers</p>
            </div>
            <Link to="/shop">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.length === 0 ? (
              <p className="text-muted-foreground col-span-4">No featured products yet.</p>
            ) : (
              featuredProducts.map((product: any) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <ImageWithFallback
                      src={product.images?.[0] || ""}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {product.stock > 0 && (
                      <Badge className="absolute top-2 right-2 bg-green-600">In Stock</Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>{product.farmer?.fullName || "Local Farmer"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl">₱{product.price}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link to="/shop" className="w-full">
                      <Button className="w-full">View in Shop</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🚜</div>
              <h3 className="mb-2">Direct from Farmers</h3>
              <p className="text-muted-foreground">Buy directly from local farmers without middlemen, ensuring fair prices for everyone</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🌱</div>
              <h3 className="mb-2">Always Fresh</h3>
              <p className="text-muted-foreground">Get the freshest produce delivered straight from the farm to your doorstep</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">💰</div>
              <h3 className="mb-2">Fair Pricing</h3>
              <p className="text-muted-foreground">Transparent pricing with only a small 3-5% platform fee to maintain the service</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}