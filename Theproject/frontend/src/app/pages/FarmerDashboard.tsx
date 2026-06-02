import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { OrderDetailsModal } from "../components/OrderDetailsModal";
import { Star, TrendingUp, Package, ShoppingBag, DollarSign, Plus, Pencil, Trash2, X } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import { analyticsApi, api, applicationApi, marketplaceApi } from "../services/api";
import { toast } from "sonner";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

export function FarmerDashboard() {
  // Prevent unused-import warnings for some analytics icons imported for future use
  function _markUsed<T>(_val: T) { return; }
  _markUsed(TrendingUp);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['farmerDashboard'],
    queryFn: analyticsApi.farmerDashboard,
    enabled: isAuthenticated && user?.role === 'FARMER',
  });

  // Fetch orders
  const { isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { api } = await import('../services/api');
      const response = await api.get('/orders');
      return response.data.data || [];
    },
    enabled: isAuthenticated && user?.role === 'FARMER',
  });

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    price: "",
    stock: "",
    organic: false,
    featured: false,
    images: [] as string[], // existing uploaded image URLs
    imageFiles: [] as File[], // newly selected files
    previews: [] as string[], // preview URLs for selected files
  });
  const [productSubmitting, setProductSubmitting] = useState(false);

  const queryClient = useQueryClient();

  // Fetch all farmer products
  const { data: myProducts = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ["myProducts"],
    queryFn: async () => {
      const response = await api.get("/products", { params: { farmerId: user?.id, take: 100 } });
      return response.data.data?.products || [];
    },
    enabled: isAuthenticated && user?.role === "FARMER",
  });

  // Fetch categories for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: marketplaceApi.categories,
  });

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: "", description: "", categoryId: "", price: "", stock: "", organic: false, featured: false, images: [], imageFiles: [], previews: [] });
    setIsProductModalOpen(true);
  };

  const openEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      categoryId: product.categoryId || "",
      price: String(product.price || ""),
      stock: String(product.stock || ""),
      organic: product.organic || false,
      featured: product.featured || false,
      images: product.images || [],
      imageFiles: [],
      previews: product.images || [],
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async () => {
    if (!productForm.name || !productForm.categoryId || !productForm.price) {
      toast.error("Please fill in all required fields");
      return;
    }
    setProductSubmitting(true);
    try {
      // upload selected files first (if any)
      const uploadedUrls: string[] = [];
      for (const file of productForm.imageFiles || []) {
        const res = await applicationApi.uploadFile('products', file);
        if (res?.url) uploadedUrls.push(res.url);
      }

      const finalImages = [...(productForm.images || []), ...uploadedUrls];

      const payload = {
        name: productForm.name,
        description: productForm.description,
        categoryId: productForm.categoryId,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock) || 0,
        organic: productForm.organic,
        featured: productForm.featured,
        images: finalImages,
      };
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        toast.success("Product updated successfully!");
      } else {
        await api.post("/products", payload);
        toast.success("Product added successfully!");
      }
      setIsProductModalOpen(false);
      refetchProducts();
      queryClient.invalidateQueries({ queryKey: ["farmerDashboard"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally {
      setProductSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${productId}`);
      toast.success("Product deleted");
      refetchProducts();
      queryClient.invalidateQueries({ queryKey: ["farmerDashboard"] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "FARMER") {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  if (!user || user.role !== "FARMER") return null;

  const stats = analyticsData?.stats || { totalProducts: 0, totalOrders: 0, totalRevenue: 0, avgRating: 0 };
  const recentOrders = analyticsData?.recentOrders || [];
  const topProducts = analyticsData?.topProducts || [];
  const productReviews = analyticsData?.productReviews || [];

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

  const StatsCard = ({ title, value, icon: Icon }: any) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
          {title}
          {Icon && <Icon className="h-4 w-4" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  const LoadingCard = () => <Skeleton className="h-24 rounded-lg" />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Farmer Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.full_name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {analyticsLoading ? (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            <>
              <StatsCard title="Total Products" value={stats.totalProducts} icon={Package} />
              <StatsCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} />
              <StatsCard title="Total Revenue" value={`₱${Number(stats.totalRevenue || 0).toFixed(2)}`} icon={DollarSign} />
              <StatsCard title="Average Rating" value={`${Number(stats.avgRating || 0).toFixed(1)}★`} icon={Star} />
            </>
          )}
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
                  {ordersLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16" />
                      <Skeleton className="h-16" />
                    </div>
                  ) : recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrders.slice(0, 5).map((order: any) => (
                        <div
                          key={order.id}
                          className="flex justify-between items-center border-b border-border pb-3 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                          onClick={() => handleOrderClick(order)}
                        >
                          <div>
                            <div className="font-medium">#{order.id?.slice(0, 8)}</div>
                            <div className="text-sm text-muted-foreground">{order.buyer?.fullName}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">₱{Number(order.total || 0).toFixed(2)}</div>
                            <div className="text-sm">
                              <Badge className={order.status === "DELIVERED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                {order.status?.toLowerCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No orders yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12" />
                      <Skeleton className="h-12" />
                    </div>
                  ) : topProducts.length > 0 ? (
                    <div className="space-y-3">
                      {topProducts.slice(0, 5).map((product: any) => (
                        <div key={product.id} className="flex justify-between items-center pb-3 border-b border-border last:border-0">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.salesCount} sold</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₱{(Number(product.price || 0) * Number(product.salesCount || 0)).toFixed(2)}</p>
                            <p className="text-xs text-amber-500">⭐ {Number(product.avgRating || 0).toFixed(1)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No products yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Orders Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyOrders}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#2d7a3a" name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={categoryBreakdown} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Your Products ({myProducts.length})</CardTitle>
                  <Button onClick={openAddProduct} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                    <Plus className="h-4 w-4" /> Add New Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-56" />)}
                  </div>
                ) : myProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {myProducts.map((product: any) => (
                      <Card key={product.id} className="overflow-hidden group">
                        <div className="relative h-36 bg-gray-100">
                          <ImageWithFallback
                            src={product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditProduct(product)}
                              className="bg-white rounded-full p-1.5 shadow hover:bg-emerald-50"
                            >
                              <Pencil className="h-3.5 w-3.5 text-emerald-700" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="bg-white rounded-full p-1.5 shadow hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-600" />
                            </button>
                          </div>
                          {product.featured && (
                            <Badge className="absolute top-2 left-2 bg-amber-500 text-white text-xs">Featured</Badge>
                          )}
                          {product.stock === 0 && (
                            <Badge className="absolute bottom-2 left-2 bg-red-500 text-white text-xs">Out of Stock</Badge>
                          )}
                        </div>
                        <CardHeader className="pb-1 pt-3">
                          <CardTitle className="text-sm line-clamp-1">{product.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{product.category?.name} • {product.stock} in stock</p>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-base font-bold text-emerald-700">₱{Number(product.price || 0).toFixed(2)}</div>
                          {product.organic && <Badge variant="outline" className="text-xs mt-1 border-green-500 text-green-700">Organic</Badge>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No products yet</h3>
                    <p className="text-muted-foreground mb-4">Add your first product to start selling</p>
                    <Button onClick={openAddProduct} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                      <Plus className="h-4 w-4" /> Add First Product
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}
                  </div>
                ) : recentOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Order ID</th>
                          <th className="text-left py-2">Buyer</th>
                          <th className="text-left py-2">Status</th>
                          <th className="text-right py-2">Amount</th>
                          <th className="text-left py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order: any) => (
                          <tr key={order.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => handleOrderClick(order)}>
                            <td className="py-3">{order.id?.slice(0, 8)}</td>
                            <td className="py-3">{order.buyer?.fullName}</td>
                            <td className="py-3"><Badge className={order.status === "DELIVERED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>{order.status?.toLowerCase()}</Badge></td>
                            <td className="py-3 text-right">₱{Number(order.total || 0).toFixed(2)}</td>
                            <td className="py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-12">No orders yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
                  </div>
                //) : productReviews && productReviews.length > 0 ? (
               //   <div className="space-y-4">
                //    {productReviews.map((review: any) => (
                 //     <ReviewCard
                 //       key={review.id}
                 //       authorName={review.user?.fullName || review.buyer_name}
                 //       authorAvatar={review.user?.avatar}
                  //      rating={review.rating}
                  //      comment={review.comment}
                   //     createdAt={review.createdAt}
                  //    />
                 //   ))}
                //  </div>
              //  ) : (
                )
               : productReviews && productReviews.length > 0 ? (
  <div className="space-y-4">
    {productReviews.map((review: any) => (
      <div key={review.id} className="border rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-semibold">{review.user?.fullName || review.buyer_name}</p>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>
                  ★
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{review.comment}</p>
      </div>
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
                  <CardTitle>Store Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Store Name</label>
                    <input type="text" defaultValue={user.store_name || ""} className="w-full px-3 py-2 border rounded-lg mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <input type="text" defaultValue={user.farm_location || ""} className="w-full px-3 py-2 border rounded-lg mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bio</label>
                    <textarea defaultValue={user.bio || ""} className="w-full px-3 py-2 border rounded-lg mt-1" rows={3} />
                  </div>
                  <Button className="w-full">Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Store Cover Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <p className="text-muted-foreground">Click to upload cover image</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Upload Image
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        order={selectedOrder}
      />

      {/* Add / Edit Product Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="prod-name">Product Name <span className="text-red-500">*</span></Label>
              <Input
                id="prod-name"
                placeholder="e.g. Fresh Broccoli"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="prod-desc">Description</Label>
              <Textarea
                id="prod-desc"
                placeholder="Describe your product..."
                rows={3}
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="prod-category">Category <span className="text-red-500">*</span></Label>
              <Select
                value={productForm.categoryId}
                onValueChange={(val) => setProductForm({ ...productForm, categoryId: val })}
              >
                <SelectTrigger id="prod-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prod-price">Price (₱) <span className="text-red-500">*</span></Label>
                <Input
                  id="prod-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="prod-stock">Stock (kg/units)</Label>
                <Input
                  id="prod-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="prod-images">Product Images</Label>
              <input
                id="prod-images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const previews = files.map((f) => URL.createObjectURL(f));

                  // try to auto-suggest category based on filename or existing product name
                  if (!productForm.categoryId && (productForm.name || files.length > 0)) {
                    const hintText = (productForm.name + ' ' + files.map(f => f.name).join(' ')).toLowerCase();
                    const match = categories.find((c: any) => hintText.includes(c.name.toLowerCase()));
                    if (match) {
                      setProductForm({ ...productForm, imageFiles: files, previews, categoryId: match.id });
                      return;
                    }
                  }

                  setProductForm({ ...productForm, imageFiles: files, previews });
                }}
                className="w-full mt-2"
              />

              <div className="mt-3 grid grid-cols-3 gap-2">
                {(productForm.previews || []).map((p, idx) => (
                  <div key={p} className="relative h-24 rounded overflow-hidden border">
                    <img src={p} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        // remove a selected file/preview
                        const newFiles = (productForm.imageFiles || []).filter((_, i) => i !== idx);
                        const newPreviews = (productForm.previews || []).filter((_, i) => i !== idx);
                        setProductForm({ ...productForm, imageFiles: newFiles, previews: newPreviews });
                      }}
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                    >
                      <X className="h-3 w-3 text-red-600" />
                    </button>
                  </div>
                ))}

                {/* show existing uploaded images */}
                {(productForm.images || []).map((url, i) => (
                  <div key={url} className="relative h-24 rounded overflow-hidden border">
                    <img src={url} alt={`uploaded-${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.organic}
                  onChange={(e) => setProductForm({ ...productForm, organic: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">Organic</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.featured}
                  onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">Featured</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductModalOpen(false)} disabled={productSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleProductSubmit}
              disabled={productSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {productSubmitting ? "Saving..." : editingProduct ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}