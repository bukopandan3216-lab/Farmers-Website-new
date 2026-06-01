import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Package, Truck, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";

export function DeliveryDashboard() {
  const [stats] = useState({
    totalDeliveries: 245,
    pendingDeliveries: 12,
    inTransit: 8,
    completedToday: 15,
    activeRiders: 6,
    avgDeliveryTime: "45 min",
  });

  const [recentActivity] = useState([
    {
      id: 1,
      type: "delivery",
      message: "Order #1234 delivered to Maria Santos",
      time: "5 mins ago",
      status: "completed",
    },
    {
      id: 2,
      type: "pickup",
      message: "Order #1235 picked up by Juan Reyes",
      time: "12 mins ago",
      status: "in_transit",
    },
    {
      id: 3,
      type: "assigned",
      message: "Order #1236 assigned to Pedro Santos",
      time: "20 mins ago",
      status: "assigned",
    },
    {
      id: 4,
      type: "pending",
      message: "New order #1237 waiting for assignment",
      time: "25 mins ago",
      status: "pending",
    },
  ]);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="mb-2">Delivery Coordination</h1>
          <p className="text-muted-foreground">
            Manage deliveries, track orders, and coordinate with riders
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">Total Deliveries</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{stats.totalDeliveries}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +12% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-yellow-600">{stats.pendingDeliveries}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting assignment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-blue-600">{stats.inTransit}</div>
              <p className="text-xs text-muted-foreground mt-1">Out for delivery</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-green-600">{stats.completedToday}</div>
              <p className="text-xs text-muted-foreground mt-1">Avg: {stats.avgDeliveryTime}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === "completed"
                          ? "bg-green-500"
                          : activity.status === "in_transit"
                          ? "bg-blue-500"
                          : activity.status === "assigned"
                          ? "bg-purple-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/delivery/coordination" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  Manage Orders
                </Button>
              </Link>
              <Link to="/delivery/riders" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Truck className="mr-2 h-4 w-4" />
                  Manage Riders
                </Button>
              </Link>
              <Link to="/delivery/tracking" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="mr-2 h-4 w-4" />
                  Track Deliveries
                </Button>
              </Link>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm mb-3">Active Riders Today</h4>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{stats.activeRiders}</span>
                  <Button variant="link" size="sm">View All →</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
