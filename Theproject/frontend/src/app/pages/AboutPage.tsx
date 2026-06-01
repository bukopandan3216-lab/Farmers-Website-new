import { Link } from "react-router-dom";
import { Sprout, Heart, ShieldCheck, Truck, Users, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function AboutPage() {
  const features = [
    {
      icon: <Sprout className="w-8 h-8 text-emerald-600" />,
      title: "Fresh & Local Produce",
      description: "Get farm-fresh products delivered straight from local farmers to your doorstep"
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
      title: "Verified Farmers",
      description: "All farmers are verified and certified to ensure quality and authenticity"
    },
    {
      icon: <Heart className="w-8 h-8 text-emerald-600" />,
      title: "Fair Pricing",
      description: "Direct transactions mean fair prices for farmers and affordable produce for you"
    },
    {
      icon: <Truck className="w-8 h-8 text-emerald-600" />,
      title: "Fast Delivery",
      description: "Quick and reliable delivery service to ensure freshness from farm to table"
    },
    {
      icon: <Users className="w-8 h-8 text-emerald-600" />,
      title: "Community Support",
      description: "Join a growing community supporting local agriculture and farmers"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-emerald-600" />,
      title: "Secure Transactions",
      description: "Safe and secure payment options including GCash, PayMaya, and COD"
    }
  ];

  const stats = [
    { value: "500+", label: "Registered Farmers" },
    { value: "2,500+", label: "Products Listed" },
    { value: "10,000+", label: "Orders Delivered" },
    { value: "50+", label: "Cities Served" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-700 to-emerald-600 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80"
            alt="Farm background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-emerald-600/80"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Connecting Farmers Directly to Communities
            </h1>
            <p className="text-xl md:text-2xl text-emerald-50 mb-8 leading-relaxed">
              Empowering Filipino farmers through technology, fair trade, and direct marketplace access.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/shop">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 text-lg px-8">
                  Start Shopping
                </Button>
              </Link>
              <Link to="/apply">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
                  Become a Farmer Seller
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card className="border-2 border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                To revolutionize the agricultural marketplace by providing a direct connection between farmers and consumers,
                ensuring fair compensation for farmers while delivering fresh, quality produce to communities across the Philippines.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-700 leading-relaxed">
                To become the leading digital marketplace empowering Filipino farmers, fostering sustainable agriculture,
                and creating a thriving ecosystem where technology bridges the gap between farm and table.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Goals */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Core Goals</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              "Eliminate middlemen to increase farmer income",
              "Provide consumers with fresh, affordable produce",
              "Build a sustainable agricultural community"
            ].map((goal, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-5 border border-gray-200">
                <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                <p className="text-gray-700 font-medium">{goal}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose FarmDirect?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're more than just a marketplace - we're a movement to support local farmers and provide fresh produce to communities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl md:text-6xl font-bold mb-2">{stat.value}</div>
                <div className="text-emerald-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Empowering Our Community</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="overflow-hidden">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80"
              alt="Farmers using technology"
              className="w-full h-48 object-cover"
            />
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Technology for Farmers</h3>
              <p className="text-gray-600">
                We provide farmers with easy-to-use tools to manage their products, reach more customers, and grow their business.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&q=80"
              alt="Fresh produce delivery"
              className="w-full h-48 object-cover"
            />
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fresh Delivery</h3>
              <p className="text-gray-600">
                Buyers receive farm-fresh produce delivered directly to their homes, ensuring quality and freshness.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80"
              alt="Sustainable agriculture"
              className="w-full h-48 object-cover"
            />
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sustainable Practices</h3>
              <p className="text-gray-600">
                Supporting environmentally-friendly farming methods and promoting organic, sustainable agriculture.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Join the FarmDirect Movement
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you're a farmer looking to sell your produce or a buyer seeking fresh, local products,
            we're here to connect you directly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/shop">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
                Start Shopping Now
              </Button>
            </Link>
            <Link to="/apply">
              <Button size="lg" variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-lg px-8">
                Become a Farmer Seller
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
