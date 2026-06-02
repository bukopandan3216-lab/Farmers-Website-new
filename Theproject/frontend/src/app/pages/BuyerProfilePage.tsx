import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { OrderDetailsModal } from "../components/OrderDetailsModal";
import { ReviewCard } from "../components/ReviewRating";
import { Star } from "lucide-react";
import { orderApi, marketplaceApi } from "../services/api";

export function BuyerProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    contact: user?.contact || "",
    delivery_address: user?.delivery_address || "",
    city: user?.city || "",
    province: user?.province || "",
  });

  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: orderApi.list,
    enabled: isAuthenticated,
  });

  const reviewsQuery = useQuery({
    queryKey: ["myReviews"],
    queryFn: marketplaceApi.myReviews,
    enabled: isAuthenticated,
  });

  const orders = ordersQuery.data || [];
  const myReviews = reviewsQuery.data?.productReviews || [];

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  if (!isAuthenticated || user?.role !== "BUYER") {
    navigate("/login");
    return null;
  }

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const totalOrders = orders.length;
  const totalSpent = Number(
    orders.reduce((sum, order) => {
      const amount = Number(
        order.total ?? order.grand_total ?? order.total_amount ?? order.final_amount ?? 0
      );
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0)
  ) || 0;
  const memberDays = user?.created_at
    ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account and view order history</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-primary">
                ₱{Number.isFinite(totalSpent) ? totalSpent.toFixed(2) : "0.00"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Favorite Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl">Vegetables</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Member For</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{memberDays} days</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profile Information</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact">Contact Number</Label>
                    <Input
                      id="contact"
                      value={formData.contact}
                      onChange={(e) =>
                        setFormData({ ...formData, contact: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="delivery_address">Delivery Address</Label>
                    <Textarea
                      id="delivery_address"
                      value={formData.delivery_address}
                      onChange={(e) =>
                        setFormData({ ...formData, delivery_address: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="province">Province</Label>
                      <Input
                        id="province"
                        value={formData.province}
                        onChange={(e) =>
                          setFormData({ ...formData, province: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={handleSave} className="w-full">
                    Save Changes
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Full Name</div>
                    <div>{user?.full_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Email</div>
                    <div>{user?.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Contact</div>
                    <div>{user?.contact || "Not set"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Delivery Address</div>
                    <div>{user?.delivery_address || "Not set"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">City</div>
                      <div>{user?.city || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Province</div>
                      <div>{user?.province || "N/A"}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Username</div>
                <div>{user?.username}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Account Type</div>
                <div className="capitalize">{user?.role}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    {user?.status}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Member Since</div>
                <div>
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order History</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/completed-orders")}
                className="border-green-500 text-green-700 hover:bg-green-50"
              >
                ✓ Completed Orders
              </Button>
            </CardHeader>
            <CardContent>
              {ordersQuery.isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="h-40 rounded-lg border border-border bg-muted/50 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleOrderClick(order)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium">Order #{order.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            order.status === "DELIVERED"
                              ? "bg-green-100 text-green-800"
                              : order.status === "OUT_FOR_DELIVERY"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status.toLowerCase().replaceAll("_", " ")}
                        </span>
                      </div>

                      <div className="text-sm mb-3">
                        <div className="mb-1">
                          <strong>Delivery:</strong> {order.deliveryAddress}
                        </div>
                      </div>

                      <div className="bg-muted rounded-lg p-3 mb-3 space-y-2">
                        {order.orderItems?.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm border-b border-border pb-2 last:border-0"
                          >
                            <div>
                              <div className="font-medium">{item.product?.name || item.productName || "Product"}</div>
                              <div className="text-muted-foreground">
                                Qty: {item.quantity} × ₱{Number(item.price || 0).toFixed(2)}
                              </div>
                            </div>
                            <div className="font-medium">₱{Number((item.price || 0) * (item.quantity || 0)).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="font-medium">Total</div>
                        <div className="text-lg font-medium text-primary">
                          ₱{Number(order.total || 0).toFixed(2)}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border">
                        <Button variant="outline" size="sm" className="w-full" onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(order);
                        }}>
                          View Details →
                        </Button>
                      </div>
                    </div>
                  ))}

                  {orders.length === 0 && (
                    <div className="text-center py-12 text-sm text-muted-foreground">
                      You don't have any orders yet.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                My Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myReviews.length > 0 ? (
                <div className="space-y-4">
                  {myReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    You haven't written any reviews yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    After receiving your orders, you can write reviews for the products
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        userRole="buyer"
        onStatusUpdated={() => {
          ordersQuery.refetch();
        }}
      />
    </div>
  );
}
