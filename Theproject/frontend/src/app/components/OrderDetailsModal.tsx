import { useState } from "react";
import { X, MapPin, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { OrderTrackingComponent } from "./OrderTrackingComponent";
import { orderApi } from "../services/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface OrderItem {
  name: string;
  qty: number;
  unit_price: number;
  subtotal: number;
}

interface Order {
  id: number;
  buyer_name?: string;
  farmer_name?: string;
  store_name?: string;
  delivery_address: string;
  contact_number?: string;
  delivery_date?: string;
  status: string;
  created_at: string;
  grand_total: number;
  items: OrderItem[];
  payment_method?: string;
  payment_status?: string;
  rider_name?: string;
  tracking_number?: string;
  estimated_delivery?: string;
}

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  userRole?: "farmer" | "buyer" | "admin";
  onStatusUpdated?: () => void;
}

export function OrderDetailsModal({ order, isOpen, onClose, userRole, onStatusUpdated }: OrderDetailsModalProps) {
  // ALL hooks must be called unconditionally before any early return
  const [isUpdating, setIsUpdating] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const queryClient = useQueryClient();

  if (!isOpen || !order) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-purple-100 text-purple-800";
      case "out for delivery":
      case "out_for_delivery": return "bg-orange-100 text-orange-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return <Clock className="h-5 w-5" />;
      case "confirmed":
      case "preparing": return <Package className="h-5 w-5" />;
      case "out for delivery":
      case "out_for_delivery": return <Truck className="h-5 w-5" />;
      case "delivered": return <CheckCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };
  const deliveryAddress = order.delivery_address ?? (order as any).deliveryAddress ?? "";
  const createdAt = order.created_at ?? (order as any).createdAt ?? "";
  const currentStatus = ((order.status || "").replace(/\s+/g, "_").toUpperCase() || "PENDING") as any;
  const trackingHistory = (order as any).trackingHistory || (order as any).tracking_history || [];
  const estimatedDelivery = (order as any).estimated_delivery || (order as any).estimatedDelivery || undefined;

  const normalizedStatus = (order.status || "").toUpperCase().replace(/\s+/g, "_");

  const orderSteps = [
    { label: "Order Placed", key: "PENDING", completed: true },
    { label: "Confirmed", key: "CONFIRMED", completed: ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "SHIPPED", "DELIVERED"].includes(normalizedStatus) },
    { label: "Preparing", key: "PREPARING", completed: ["PREPARING", "OUT_FOR_DELIVERY", "SHIPPED", "DELIVERED"].includes(normalizedStatus) },
    { label: "Out for Delivery", key: "OUT_FOR_DELIVERY", completed: ["OUT_FOR_DELIVERY", "SHIPPED", "DELIVERED"].includes(normalizedStatus) },
    { label: "Delivered", key: "DELIVERED", completed: normalizedStatus === "DELIVERED" },
  ];

  const currentStepIndex = orderSteps.findIndex(s => !s.completed) - 1;
  const progressPercent = Math.max(0, Math.min(100, ((currentStepIndex < 0 ? orderSteps.length - 1 : currentStepIndex) / (orderSteps.length - 1)) * 100));

  const handleFarmerStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const orderId = String((order as any).id);
      await orderApi.updateStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus.toLowerCase().replace(/_/g, " ")}`);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["farmerDashboard"] });
      if (onStatusUpdated) onStatusUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBuyerComplete = async () => {
    setIsUpdating(true);
    try {
      const orderId = String((order as any).id);
      await orderApi.confirmDelivery(orderId);
      toast.success("Order marked as completed!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["completedOrders"] });
      if (onStatusUpdated) onStatusUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to mark order as complete");
    } finally {
      setIsUpdating(false);
    }
  };

  const statusLabel = (order.status || "").toLowerCase().replace(/_/g, " ");

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background border-b border-border p-6 flex justify-between items-center">
          <div>
            <h2 className="mb-1">Order Details</h2>
            <p className="text-sm text-muted-foreground">Order #{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Status Timeline */}
          <div className="bg-muted/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                Order Status
              </h3>
              <Badge className={getStatusColor(order.status)}>
                {statusLabel}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex justify-between">
                {orderSteps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        step.completed
                          ? "bg-green-500 text-white"
                          : normalizedStatus === step.key
                          ? "bg-blue-500 text-white ring-2 ring-blue-300"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step.completed ? "✓" : index + 1}
                    </div>
                    <div className="text-xs mt-2 text-center max-w-20 leading-tight">
                      {step.label}
                    </div>
                    {index < orderSteps.length - 1 && (
                      <div
                        className={`absolute top-5 h-0.5 ${
                          step.completed ? "bg-green-500" : "bg-gray-300"
                        }`}
                        style={{
                          left: `${(100 / orderSteps.length) * (index + 0.5)}%`,
                          width: `${100 / orderSteps.length}%`,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Delivery Information */}
            <div className="space-y-4">
              <h3>Delivery Information</h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm text-muted-foreground">Delivery Address</div>
                    <div>{deliveryAddress}</div>
                  </div>
                </div>

                {order.contact_number && (
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Contact Number</div>
                      <div>{order.contact_number}</div>
                    </div>
                  </div>
                )}

                {order.delivery_date && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Delivery Date</div>
                      <div>{new Date(order.delivery_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}

                {order.rider_name && (
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Rider</div>
                      <div>{order.rider_name}</div>
                    </div>
                  </div>
                )}

                {order.tracking_number && (
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Tracking Number</div>
                      <div className="font-mono text-sm">{order.tracking_number}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Information */}
            <div className="space-y-4">
              <h3>Order Information</h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Order Date</div>
                  <div>{createdAt ? new Date(createdAt).toLocaleString() : "N/A"}</div>
                </div>

                {userRole === "buyer" && order.store_name && (
                  <div>
                    <div className="text-sm text-muted-foreground">Store</div>
                    <div>{order.store_name}</div>
                  </div>
                )}

                {userRole === "farmer" && order.buyer_name && (
                  <div>
                    <div className="text-sm text-muted-foreground">Buyer</div>
                    <div>{order.buyer_name}</div>
                  </div>
                )}

                {order.payment_method && (
                  <div>
                    <div className="text-sm text-muted-foreground">Payment Method</div>
                    <div>{order.payment_method}</div>
                  </div>
                )}

                {order.payment_status && (
                  <div>
                    <div className="text-sm text-muted-foreground">Payment Status</div>
                    <Badge className={order.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {order.payment_status}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="mb-4">Order Items</h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              {(order.items ?? (order as any).orderItems ?? []).map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between items-center pb-3 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.name ?? item.product?.name ?? "Product"}</div>
                    <div className="text-sm text-muted-foreground">
                      Qty: {item.qty ?? item.quantity} × ₱{Number(item.unit_price ?? item.price ?? 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="font-medium">
                    ₱{Number(item.subtotal ?? ((item.price ?? 0) * (item.quantity ?? 1))).toFixed(2)}
                  </div>
                </div>
              ))}

              <div className="border-t border-border pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <div className="font-medium">Total Amount</div>
                  <div className="text-2xl font-medium text-primary">
                    ₱{Number(order.grand_total ?? (order as any).total ?? 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isUpdating}>
              Close
            </Button>

            {/* Farmer Action Buttons */}
            {userRole === "farmer" && normalizedStatus === "PENDING" && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleFarmerStatusUpdate("CONFIRMED")}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "✓ Confirm Order"}
              </Button>
            )}
            {userRole === "farmer" && normalizedStatus === "CONFIRMED" && (
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => handleFarmerStatusUpdate("PREPARING")}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "📦 Preparing"}
              </Button>
            )}
            {userRole === "farmer" && normalizedStatus === "PREPARING" && (
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => handleFarmerStatusUpdate("OUT_FOR_DELIVERY")}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "🚚 Out for Delivery"}
              </Button>
            )}

            {/* Buyer Complete Button */}
            {userRole === "buyer" && normalizedStatus === "OUT_FOR_DELIVERY" && (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleBuyerComplete}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "✅ Mark as Complete"}
              </Button>
            )}

            {/* Track Order button */}
            {normalizedStatus === "OUT_FOR_DELIVERY" && (
              <Button variant="outline" onClick={() => setShowTracking(true)}>
                Track Order
              </Button>
            )}
          </div>

          {showTracking && (
            <div className="mt-6">
              <OrderTrackingComponent
                orderId={order.id?.toString?.() || String(order.id)}
                currentStatus={currentStatus as any}
                trackingHistory={trackingHistory}
                estimatedDelivery={estimatedDelivery}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}