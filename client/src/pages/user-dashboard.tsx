import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/navigation-header";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, DollarSign, Package, Truck, CheckCircle, User } from "lucide-react";
import { useState } from "react";
import type { Order, OrderItem, Product } from "@shared/schema";

type OrderWithItems = Order & { items: (OrderItem & { product: Product })[] };

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: orders, isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
  });

  const stats = {
    totalOrders: orders?.length || 0,
    totalSpent: orders?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0,

  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-slate-50">
      <NavigationHeader />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Navigation */}
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Button
                    variant={activeTab === "dashboard" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("dashboard")}
                  >
                    <ShoppingBag className="mr-3 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant={activeTab === "orders" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("orders")}
                  >
                    <Package className="mr-3 h-4 w-4" />
                    My Orders
                  </Button>
                  <Button
                    variant={activeTab === "profile" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="mr-3 h-4 w-4" />
                    Profile Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === "dashboard" && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">{stats.totalOrders}</h3>
                      <p className="text-slate-600">Total Orders</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">${stats.totalSpent.toFixed(2)}</h3>
                      <p className="text-slate-600">Total Spent</p>
                    </CardContent>
                  </Card>

                </div>

                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-6 w-20" />
                          </div>
                        ))}
                      </div>
                    ) : orders && orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.slice(0, 5).map((order) => (
                          <div key={order.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                            <div>
                              <p className="font-medium text-slate-900">Order #{order.id.slice(0, 8)}</p>
                              <p className="text-sm text-slate-600">
                                {new Date(order.createdAt!).toLocaleDateString()}
                              </p>
                              <div className="flex items-center mt-2">
                                {getStatusIcon(order.status)}
                                <Badge className={`ml-2 ${getStatusColor(order.status)}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900">${order.total}</p>
                              <p className="text-sm text-slate-600">{order.items?.length || 0} items</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600">No orders yet</p>
                        <p className="text-sm text-slate-500">Start shopping to see your orders here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "orders" && (
              <Card>
                <CardHeader>
                  <CardTitle>All Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="border rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-40" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-6 w-24" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : orders && orders.length > 0 ? (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-slate-900">Order #{order.id.slice(0, 8)}</h3>
                              <p className="text-sm text-slate-600">
                                Placed on {new Date(order.createdAt!).toLocaleDateString()}
                              </p>
                              <div className="flex items-center mt-2">
                                {getStatusIcon(order.status)}
                                <Badge className={`ml-2 ${getStatusColor(order.status)}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-slate-900">${order.total}</p>
                              <p className="text-sm text-slate-600">{order.items?.length || 0} items</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {order.items?.map((item) => (
                              <div key={item.id} className="flex justify-between items-center text-sm">
                                <span className="text-slate-700">
                                  {item.product.name} × {item.quantity}
                                </span>
                                <span className="font-medium text-slate-900">
                                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            )) || (
                              <div className="text-sm text-slate-500">Loading order items...</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">No orders found</p>
                      <p className="text-sm text-slate-500">Your order history will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">Profile settings functionality coming soon...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
