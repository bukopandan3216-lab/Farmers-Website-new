import { useState } from "react";
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
    province: user?.buyer_province || "",
  });

  const [orders] = useState([
    {
      id: 1,
      created_at: new Date().toISOString(),
      status: "delivered",
      grand_total: 850,
      delivery_address: "123 Main St, Manila",
      contact_number: "+63 917 987 6543",
      delivery_date: new Date(Date.now() + 86400000).toISOString(),
      store_name: "Green Valley Farm",
      payment_method: "GCash",
      payment_status: "paid",
      rider_name: "Pedro Santos",
      tracking_number: "TRK-2024-001",
      items: [
        { name: "Fresh Broccoli", qty: 2, unit_price: 80, subtotal: 160 },
        { name: "Organic Tomatoes", qty: 5, unit_price: 60, subtotal: 300 },
      ],
    },
    {
      id: 2,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      status: "out for delivery",
      grand_total: 520,
      delivery_address: "123 Main St, Manila",
      contact_number: "+63 917 987 6543",
      delivery_date: new Date(Date.now() + 259200000).toISOString(),
      store_name: "Sunrise Farms",
      payment_method: "PayMaya",
      payment_status: "paid",
      rider_name: "Juan Reyes",
      tracking_number: "TRK-2024-002",
      items: [
        { name: "Fresh Carrots", qty: 3, unit_price: 50, subtotal: 150 },
        { name: "Organic Cabbage", qty: 4, unit_price: 45, subtotal: 180 },
      ],
    },
  ]);

  const [myReviews] = useState([
    {
      id: 1,
      buyer_name: user?.full_name || "Maria Santos",
      rating: 5,
      comment: "Excellent quality broccoli! Very fresh and crisp. Delivered in perfect condition. Will definitely order again.",
      created_at: "2026-05-20T10:30:00Z",
      product_name: "Fresh Broccoli",
      verified_purchase: true,
    },
    {
      id: 2,
      buyer_name: user?.full_name || "Maria Santos",
      rating: 4,
      comment: "Good quality carrots. Fresh and well-packaged. Delivery was on time.",
      created_at: "2026-05-18T14:20:00Z",
      product_name: "Fresh Carrots",
      verified_purchase: true,
    },
  ]);

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  if (!isAuthenticated || user?.role !== "buyer") {
    navigate("/login");
    return null;
  }

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.grand_total, 0);
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
              <div className="text-3xl text-primary">₱{totalSpent.toFixed(2)}</div>
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
                      <div>{user?.buyer_province || "N/A"}</div>
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
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
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
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "out for delivery"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="text-sm mb-3">
                      <div className="mb-1">
                        <strong>Delivery:</strong> {order.delivery_address}
                      </div>
                      <div>
                        <strong>Delivery Date:</strong>{" "}
                        {new Date(order.delivery_date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="bg-muted rounded-lg p-3 mb-3 space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-sm border-b border-border pb-2 last:border-0"
                        >
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-muted-foreground">
                              Qty: {item.qty} × ₱{item.unit_price.toFixed(2)}
                            </div>
                          </div>
                          <div className="font-medium">₱{item.subtotal.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="font-medium">Total</div>
                      <div className="text-lg font-medium text-primary">
                        ₱{order.grand_total.toFixed(2)}
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
              </div>
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
      />
    </div>
  );
}
