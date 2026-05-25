import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { OrderDetailsModal } from "../components/OrderDetailsModal";
import { ReviewCard, ReviewRating } from "../components/ReviewRating";
import { Star, TrendingUp, BarChart3, Package, ShoppingBag, DollarSign, ArrowUpRight } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

export function FarmerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState<"6m" | "12m">("6m");

  const monthlySales = [
    { month: "Dec", revenue: 5200, orders: 11, customers: 8 },
    { month: "Jan", revenue: 8200, orders: 15, customers: 12 },
    { month: "Feb", revenue: 7800, orders: 14, customers: 10 },
    { month: "Mar", revenue: 9100, orders: 18, customers: 14 },
    { month: "Apr", revenue: 10500, orders: 22, customers: 16 },
    { month: "May", revenue: 12400, orders: 27, customers: 19 },
  ];

  const topProducts = [
    { name: "Fresh Broccoli", sold: 180, revenue: 14400, rating: 4.9 },
    { name: "Organic Tomatoes", sold: 145, revenue: 8700, rating: 4.7 },
    { name: "Sweet Corn", sold: 98, revenue: 4410, rating: 4.6 },
    { name: "Purple Eggplant", sold: 72, revenue: 2520, rating: 4.4 },
    { name: "Fresh Carrots", sold: 55, revenue: 2750, rating: 4.8 },
  ];

  const categoryBreakdown = [
    { name: "Vegetables", value: 68, color: "#2d7a3a" },
    { name: "Fruits", value: 15, color: "#f0a500" },
    { name: "Grains", value: 12, color: "#4da8da" },
    { name: "Herbs", value: 5, color: "#8b5cf6" },
  ];

  const weeklyOrders = [
    { day: "Mon", orders: 3 }, { day: "Tue", orders: 5 }, { day: "Wed", orders: 4 },
    { day: "Thu", orders: 8 }, { day: "Fri", orders: 6 }, { day: "Sat", orders: 11 }, { day: "Sun", orders: 7 },
  ];

  const [stats, setStats] = useState({
    totalProducts: 12,
    totalOrders: 45,
    totalRevenue: 24500,
    rating: 4.8,
  });

  const [products] = useState([
    {
      id: 1,
      name: "Fresh Broccoli",
      category: "Vegetables",
      price: 80,
      stock: 50,
      image: "https://images.unsplash.com/photo-1768776847082-9ddb43ec49ea?w=400&q=80",
    },
    {
      id: 2,
      name: "Organic Tomatoes",
      category: "Vegetables",
      price: 60,
      stock: 75,
      image: "https://images.unsplash.com/photo-1549248581-cf105cd081f8?w=400&q=80",
    },
  ]);

  const [orders] = useState([
    {
      id: 1,
      buyer_name: "Maria Santos",
      total_amount: 520,
      grand_total: 520,
      status: "confirmed",
      created_at: new Date().toISOString(),
      item_count: 3,
      delivery_address: "456 Market St, Quezon City",
      contact_number: "+63 917 555 1234",
      delivery_date: new Date(Date.now() + 172800000).toISOString(),
      payment_method: "GCash",
      payment_status: "paid",
      items: [
        { name: "Fresh Broccoli", qty: 3, unit_price: 80, subtotal: 240 },
        { name: "Organic Tomatoes", qty: 4, unit_price: 60, subtotal: 240 },
      ],
    },
    {
      id: 2,
      buyer_name: "Pedro Cruz",
      total_amount: 340,
      grand_total: 340,
      status: "delivered",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      item_count: 2,
      delivery_address: "789 Street Ave, Makati",
      contact_number: "+63 917 555 5678",
      delivery_date: new Date(Date.now() - 43200000).toISOString(),
      payment_method: "PayMaya",
      payment_status: "paid",
      rider_name: "Juan dela Cruz",
      tracking_number: "TRK-2024-003",
      items: [
        { name: "Fresh Carrots", qty: 4, unit_price: 50, subtotal: 200 },
        { name: "Organic Cabbage", qty: 3, unit_price: 45, subtotal: 135 },
      ],
    },
  ]);

  const [productReviews] = useState([
    {
      id: 1,
      buyer_name: "Maria Santos",
      rating: 5,
      comment: "Excellent quality broccoli! Very fresh and crisp. Delivered in perfect condition. Will definitely order again.",
      created_at: "2026-05-20T10:30:00Z",
      product_name: "Fresh Broccoli",
      verified_purchase: true,
    },
    {
      id: 2,
      buyer_name: "Jose Reyes",
      rating: 4,
      comment: "Good quality vegetables. Fresh and well-packaged. Delivery was on time.",
      created_at: "2026-05-18T14:20:00Z",
      product_name: "Fresh Broccoli",
      verified_purchase: true,
    },
    {
      id: 3,
      buyer_name: "Ana Cruz",
      rating: 5,
      comment: "The freshest broccoli I've bought online! Great service from the farmer.",
      created_at: "2026-05-15T09:15:00Z",
      product_name: "Fresh Broccoli",
      verified_purchase: true,
    },
    {
      id: 4,
      buyer_name: "Pedro Garcia",
      rating: 5,
      comment: "These tomatoes are amazing! So fresh and flavorful. Perfect for my recipes.",
      created_at: "2026-05-19T16:45:00Z",
      product_name: "Organic Tomatoes",
      verified_purchase: true,
    },
    {
      id: 5,
      buyer_name: "Rosa Lim",
      rating: 4,
      comment: "Very good quality. The packaging was excellent and everything arrived fresh.",
      created_at: "2026-05-17T11:20:00Z",
      product_name: "Organic Tomatoes",
      verified_purchase: true,
    },
  ]);

  const averageRating = productReviews.length > 0
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
    : 0;

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "farmer") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  if (!user || user.role !== "farmer") return null;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="mb-2">Farmer Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.full_name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-primary">₱{stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{stats.rating}★</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="store">Store Info</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex justify-between items-center border-b border-border pb-3 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                        onClick={() => handleOrderClick(order)}
                      >
                        <div>
                          <div className="font-medium">#{order.id}</div>
                          <div className="text-sm text-muted-foreground">{order.buyer_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₱{order.total_amount.toFixed(2)}</div>
                          <div className="text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Store Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Store Name</div>
                    <div>{user.store_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Location</div>
                    <div>{user.farm_location}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Province</div>
                    <div>{user.province}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Bio</div>
                    <div className="text-sm">{user.bio || "Add a bio to your store"}</div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Edit Store Info
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── ANALYTICS TAB ─────────────────────────────────── */}
          <TabsContent value="analytics" className="mt-6">
            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Revenue", value: "₱53,200", change: "+18%", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Total Orders", value: "107", change: "+12%", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Avg Order Value", value: "₱497", change: "+6%", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Active Products", value: "12", change: "+2", icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
              ].map(kpi => (
                <Card key={kpi.label}>
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                        <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3" />{kpi.change}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Revenue Area Chart */}
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Monthly Revenue</CardTitle>
                  <div className="flex gap-1">
                    {(["6m", "12m"] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => setAnalyticsRange(r)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${analyticsRange === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={monthlySales}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2d7a3a" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#2d7a3a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₱${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: any) => [`₱${v.toLocaleString()}`, "Revenue"]} />
                      <Area type="monotone" dataKey="revenue" stroke="#2d7a3a" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: "#2d7a3a", r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Sales by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                        {categoryBreakdown.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`${v}%`, "Share"]} />
                      <Legend iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Weekly Orders Bar */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Orders This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={weeklyOrders} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#2d7a3a" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Products Table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Top Products by Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topProducts.map((p, i) => (
                      <div key={p.name} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-muted text-xs flex items-center justify-center font-semibold text-muted-foreground">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(p.revenue / topProducts[0].revenue) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{p.sold} sold</span>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-primary">₱{p.revenue.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Orders vs Customers Line */}
            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Orders vs Customers Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="orders" stroke="#2d7a3a" strokeWidth={2} dot={{ r: 4 }} name="Orders" />
                    <Line type="monotone" dataKey="customers" stroke="#f0a500" strokeWidth={2} dot={{ r: 4 }} name="Customers" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2>My Products</h2>
              <Button>+ Add Product</Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-cover"
                  />
                  <CardHeader>
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg text-primary">₱{product.price.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2">Order ID</th>
                        <th className="text-left py-3 px-2">Buyer</th>
                        <th className="text-left py-3 px-2">Items</th>
                        <th className="text-left py-3 px-2">Total</th>
                        <th className="text-left py-3 px-2">Status</th>
                        <th className="text-left py-3 px-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-border hover:bg-muted/50 cursor-pointer" onClick={() => handleOrderClick(order)}>
                          <td className="py-3 px-2">#{order.id}</td>
                          <td className="py-3 px-2">{order.buyer_name}</td>
                          <td className="py-3 px-2">{order.item_count} items</td>
                          <td className="py-3 px-2">₱{order.total_amount.toFixed(2)}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <Button
                              variant="link"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOrderClick(order);
                              }}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Average Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{averageRating.toFixed(1)}</div>
                    <div>
                      <ReviewRating
                        rating={averageRating}
                        size="md"
                        showValue={false}
                        interactive={false}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {productReviews.length} {productReviews.length === 1 ? "review" : "reviews"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Total Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl">{productReviews.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +3 this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">5-Star Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl text-yellow-500">
                    {productReviews.filter((r) => r.rating === 5).length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((productReviews.filter((r) => r.rating === 5).length / productReviews.length) * 100)}% of all reviews
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Product Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productReviews.length > 0 ? (
                  <div className="space-y-4">
                    {productReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="mb-2">No reviews yet</h4>
                    <p className="text-sm text-muted-foreground">
                      Your products don't have any reviews yet. Encourage customers to leave feedback!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="store" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Store Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageWithFallback
                    src={user.store_photo || "https://images.unsplash.com/photo-1501004318641-b39e6451bec6"}
                    alt={user.store_name || "Store"}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <Button variant="outline" className="w-full">
                    Change Photo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Store Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Store Name</label>
                    <div className="text-lg">{user.store_name}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Location</label>
                    <div>{user.farm_location}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Province</label>
                    <div>{user.province}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Bio</label>
                    <div className="text-sm">{user.bio}</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Member Since</label>
                    <div className="text-sm">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                  <Button className="w-full">Edit Store Info</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        userRole="farmer"
      />
    </div>
  );
}
