import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { OrderDetailsModal } from "../components/OrderDetailsModal";
import { orderApi } from "../services/api";
import { CheckCircle, Package, ShoppingBag } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";

export function CompletedOrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: completedOrders = [], isLoading, refetch } = useQuery({
    queryKey: ["completedOrders"],
    queryFn: orderApi.listCompleted,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const isFarmer = user?.role === "FARMER";
  const isBuyer = user?.role === "BUYER";

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold">Completed Orders</h1>
            </div>
            <p className="text-muted-foreground">
              {isFarmer
                ? "All orders that have been successfully delivered to buyers"
                : "All your orders that have been received and completed"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(isFarmer ? "/farmer-dashboard" : "/profile")}
          >
            ← Back to {isFarmer ? "Dashboard" : "Profile"}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Total Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{completedOrders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                {isFarmer ? <ShoppingBag className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                {isFarmer ? "Total Revenue" : "Total Spent"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ₱{completedOrders
                  .reduce((sum: number, o: any) => sum + Number(o.total ?? o.grand_total ?? 0), 0)
                  .toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Most Recent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {completedOrders.length > 0
                  ? new Date((completedOrders[0] as any).createdAt).toLocaleDateString()
                  : "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : completedOrders.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-medium mb-2">No completed orders yet</h3>
              <p className="text-sm text-muted-foreground">
                {isFarmer
                  ? "Once buyers confirm delivery of their orders, they'll appear here."
                  : "Once you receive your orders and mark them complete, they'll appear here."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {completedOrders.map((order: any) => (
              <Card
                key={order.id}
                className="cursor-pointer hover:border-green-400 hover:shadow-md transition-all"
                onClick={() => handleOrderClick(order)}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-base">
                          Order #{String(order.id).slice(0, 8)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-PH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        {isFarmer && order.buyer?.fullName && (
                          <div className="text-sm text-muted-foreground">
                            Buyer: <span className="font-medium text-foreground">{order.buyer.fullName}</span>
                          </div>
                        )}
                        {isBuyer && order.orderItems?.[0]?.product?.farmer?.farmerProfile?.farmName && (
                          <div className="text-sm text-muted-foreground">
                            From:{" "}
                            <span className="font-medium text-foreground">
                              {order.orderItems[0].product.farmer.farmerProfile.farmName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-2">
                      <Badge className="bg-green-100 text-green-800 w-fit">✓ Delivered</Badge>
                      <div className="text-lg font-bold text-primary">
                        ₱{Number(order.total ?? order.grand_total ?? 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.orderItems?.length ?? 0} item(s)
                      </div>
                    </div>
                  </div>

                  {/* Items preview */}
                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex flex-wrap gap-2">
                        {order.orderItems.slice(0, 3).map((item: any, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground"
                          >
                            {item.product?.name ?? "Product"} × {item.quantity}
                          </span>
                        ))}
                        {order.orderItems.length > 3 && (
                          <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                            +{order.orderItems.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userRole={isFarmer ? "farmer" : "buyer"}
        onStatusUpdated={refetch}
      />
    </div>
  );
}
