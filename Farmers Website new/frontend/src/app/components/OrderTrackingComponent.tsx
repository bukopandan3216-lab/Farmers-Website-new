import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface TrackingStep {
  status: string;
  timestamp?: string;
  notes?: string;
}

interface OrderTrackingProps {
  orderId: string;
  currentStatus: "PENDING" | "CONFIRMED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
  trackingHistory: TrackingStep[];
  estimatedDelivery?: string;
}

const STATUS_ORDER = ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
const STATUS_LABELS = {
  PENDING: "Order Placed",
  CONFIRMED: "Confirmed by Farmer",
  PREPARING: "Preparing for Shipment",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS = {
  PENDING: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-purple-100 text-purple-800",
  PREPARING: "bg-yellow-100 text-yellow-800",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const STATUS_ICONS = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  PREPARING: Clock,
  OUT_FOR_DELIVERY: Clock,
  DELIVERED: CheckCircle2,
  CANCELLED: AlertCircle,
};

export function OrderTrackingComponent({
  orderId,
  currentStatus,
  trackingHistory = [],
  estimatedDelivery,
}: OrderTrackingProps) {
  const getStatusIndex = (status: string) => STATUS_ORDER.indexOf(status);
  const currentStatusIndex = getStatusIndex(currentStatus);

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="text-lg">Order Tracking - {orderId.slice(0, 8)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline */}
        <div className="space-y-4">
          {STATUS_ORDER.map((status, index) => {
            const statusIndex = getStatusIndex(status);
            const isCompleted = statusIndex < currentStatusIndex;
            const isCurrent = statusIndex === currentStatusIndex;
            const Icon = STATUS_ICONS[status as keyof typeof STATUS_ICONS];

            return (
              <div key={status} className="flex gap-4">
                {/* Timeline Dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted || isCurrent
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {/* Timeline Line */}
                  {index < STATUS_ORDER.length - 1 && (
                    <div
                      className={`w-0.5 h-12 mt-2 ${
                        isCompleted ? "bg-emerald-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>

                {/* Status Info */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className={`font-medium ${
                        isCurrent ? "text-emerald-600" : isCompleted ? "text-gray-700" : "text-gray-500"
                      }`}
                    >
                      {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                    </h4>
                    {isCurrent && (
                      <Badge className="bg-emerald-500 text-white text-xs">Current</Badge>
                    )}
                  </div>

                  {/* Timestamp from tracking history */}
                  {trackingHistory.length > 0 && (
                    <div className="text-sm text-gray-600">
                      {trackingHistory
                        .filter((h) => h.status === status)
                        .map((h) => (
                          <div key={`${status}-${h.timestamp}`}>
                            <p>
                              {h.timestamp ? new Date(h.timestamp).toLocaleString() : "Pending"}
                            </p>
                            {h.notes && (
                              <p className="text-xs text-gray-500 mt-1">{h.notes}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Estimated Delivery */}
        {estimatedDelivery && currentStatus !== "DELIVERED" && currentStatus !== "CANCELLED" && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Estimated Delivery:</span>{" "}
              {new Date(estimatedDelivery).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Status Summary */}
        <div className={`p-4 rounded-lg ${STATUS_COLORS[currentStatus as keyof typeof STATUS_COLORS] || "bg-gray-100"}`}>
          <p className="font-medium">
            {STATUS_LABELS[currentStatus as keyof typeof STATUS_LABELS]}
          </p>
          <p className="text-sm mt-1">
            {currentStatus === "PENDING" && "Your order has been placed. Waiting for farmer confirmation."}
            {currentStatus === "CONFIRMED" && "Farmer has accepted your order and is preparing it."}
            {currentStatus === "PREPARING" && "Your order is being prepared for shipment."}
            {currentStatus === "OUT_FOR_DELIVERY" && "Your order is on the way!"}
            {currentStatus === "DELIVERED" && "Your order has been delivered. Thank you for your purchase!"}
            {currentStatus === "CANCELLED" && "Your order has been cancelled."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
