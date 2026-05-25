import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const productCategories = [
  {
    id: "vegetables",
    name: "Vegetables",
    icon: "🥬",
    description: "Fresh leafy greens and vegetables",
    productCount: 45
  },
  {
    id: "fruits",
    name: "Fruits",
    icon: "🍎",
    description: "Seasonal fresh fruits",
    productCount: 32
  },
  {
    id: "grains",
    name: "Grains & Rice",
    icon: "🌾",
    description: "Organic grains and rice",
    productCount: 18
  },
  {
    id: "herbs",
    name: "Herbs & Spices",
    icon: "🌿",
    description: "Fresh herbs and spices",
    productCount: 24
  },
  {
    id: "roots",
    name: "Root Crops",
    icon: "🥔",
    description: "Potatoes, carrots, and more",
    productCount: 15
  },
  {
    id: "dairy",
    name: "Dairy & Eggs",
    icon: "🥚",
    description: "Farm-fresh dairy products",
    productCount: 12
  }
];

const featuredProducts = [
  {
    id: 1,
    name: "Fresh Broccoli",
    category: "Vegetables",
    price: 80,
    unit: "kg",
    farmer: "Green Valley Farm",
    image: "https://images.unsplash.com/photo-1768776847082-9ddb43ec49ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    inStock: true
  },
  {
    id: 2,
    name: "Organic Tomatoes",
    category: "Vegetables",
    price: 60,
    unit: "kg",
    farmer: "Sunrise Farms",
    image: "https://images.unsplash.com/photo-1549248581-cf105cd081f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    inStock: true
  },
  {
    id: 3,
    name: "Fresh Carrots",
    category: "Vegetables",
    price: 50,
    unit: "kg",
    farmer: "Harvest Home",
    image: "https://images.unsplash.com/photo-1741515044901-58696421d24a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    inStock: true
  },
  {
    id: 4,
    name: "Mixed Vegetables",
    category: "Vegetables",
    price: 120,
    unit: "basket",
    farmer: "Farm Fresh Co.",
    image: "https://images.unsplash.com/photo-1657288089316-c0350003ca49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    inStock: true
  },
  {
    id: 5,
    name: "Organic Cabbage",
    category: "Vegetables",
    price: 45,
    unit: "kg",
    farmer: "Green Valley Farm",
    image: "https://images.unsplash.com/photo-1665315302321-46989ca7829a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    inStock: true
  },
  {
    id: 6,
    name: "Fresh Artichokes",
    category: "Vegetables",
    price: 150,
    unit: "kg",
    farmer: "Organic Haven",
    image: "https://images.unsplash.com/photo-1776599562142-bab33ce9bb3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    inStock: true
  }
];

export function HomePage() {
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
            {productCategories.map((category) => (
              <Link key={category.id} to={`/shop?category=${category.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="text-center pb-2">
                    <div className="text-4xl mb-2">{category.icon}</div>
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    <CardDescription className="text-xs">{category.productCount} items</CardDescription>
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
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.inStock && (
                    <Badge className="absolute top-2 right-2 bg-green-600">In Stock</Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.farmer}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl">₱{product.price}</span>
                    <span className="text-muted-foreground">/{product.unit}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Add to Cart</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="mb-2">Featured Farmers & Stores</h2>
              <p className="text-muted-foreground">Trusted local farmers selling quality produce</p>
            </div>
            <Link to="/stores">
              <Button variant="outline">View All Stores</Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1768776847082-9ddb43ec49ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
                  alt="Green Valley Farm"
                  className="w-full h-40 object-cover"
                />
                <Badge className="absolute top-2 right-2 bg-blue-600">✓ Verified</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Green Valley Farm</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span>4.8</span>
                  <span className="mx-1">•</span>
                  <span>Benguet</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Fresh highland vegetables and organic produce
                </p>
                <Link to="/stores">
                  <Button size="sm" className="w-full">Visit Store</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1549248581-cf105cd081f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
                  alt="Sunrise Farms"
                  className="w-full h-40 object-cover"
                />
                <Badge className="absolute top-2 right-2 bg-blue-600">✓ Verified</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Sunrise Farms</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span>4.9</span>
                  <span className="mx-1">•</span>
                  <span>Laguna</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Premium organic tomatoes and leafy greens
                </p>
                <Link to="/stores">
                  <Button size="sm" className="w-full">Visit Store</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1741515044901-58696421d24a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
                  alt="Harvest Home"
                  className="w-full h-40 object-cover"
                />
                <Badge className="absolute top-2 right-2 bg-blue-600">✓ Verified</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Harvest Home</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span>4.7</span>
                  <span className="mx-1">•</span>
                  <span>Nueva Ecija</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Fresh root crops and seasonal vegetables
                </p>
                <Link to="/stores">
                  <Button size="sm" className="w-full">Visit Store</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🚜
              </div>
              <h3 className="mb-2">Direct from Farmers</h3>
              <p className="text-muted-foreground">
                Buy directly from local farmers without middlemen, ensuring fair prices for everyone
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🌱
              </div>
              <h3 className="mb-2">Always Fresh</h3>
              <p className="text-muted-foreground">
                Get the freshest produce delivered straight from the farm to your doorstep
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                💰
              </div>
              <h3 className="mb-2">Fair Pricing</h3>
              <p className="text-muted-foreground">
                Transparent pricing with only a small 3-5% platform fee to maintain the service
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
