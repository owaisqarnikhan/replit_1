import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/navigation-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  X, 
  ArrowLeft,
  ShoppingBag,
  Calendar,
  DollarSign
} from "lucide-react";
import type { Order, OrderItem, Product } from "@shared/schema";

type OrderWithItems = Order & { items: (OrderItem & { product: Product })[] };

export default function OrdersPage() {
  const [, setLocation] = useLocation();

  const { data: orders, isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
      case "confirmed":  
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="bg-slate-50">
        <NavigationHeader />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <NavigationHeader />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
                <p className="text-slate-600">Track your order history and status</p>
              </div>
            </div>
          </div>
          {orders && orders.length > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </Badge>
          )}
        </div>

        {/* Empty State */}
        {!orders || orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">No orders yet</h3>
              <p className="text-slate-600 mb-8">
                You haven't placed any orders yet. Start shopping to see your orders here.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => setLocation("/products")} 
                  className="w-full sm:w-auto"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Browse Products
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/categories")}
                  className="w-full sm:w-auto"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Shop by Category
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-900">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </CardTitle>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(order.createdAt!).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>BD {order.total}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Package className="h-4 w-4" />
                            <span>{order.items?.length || 0} items</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      className={`flex items-center space-x-1 px-3 py-1.5 border ${getStatusColor(order.status)}`}
                      variant="outline"
                    >
                      {getStatusIcon(order.status)}
                      <span className="font-medium">{formatStatus(order.status)}</span>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Order Items */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-900 mb-3">Order Items:</h4>
                    <div className="grid gap-3">
                      {order.items?.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                          {item.product.imageUrl ? (
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded-md border"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-md flex items-center justify-center border">
                              <span className="text-slate-600 font-semibold text-sm">
                                {item.product.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">
                              {item.product.name}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <span>Qty: {item.quantity}</span>
                              <span>BD {item.price}</span>
                              {item.product.unitOfMeasure && (
                                <span>per {item.product.unitOfMeasure}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {order.items && order.items.length > 3 && (
                        <div className="text-center py-2 text-sm text-slate-600">
                          and {order.items.length - 3} more items...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment & Shipping Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-200">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Payment Method</h4>
                      <p className="text-sm text-slate-600">
                        {order.paymentMethod || "Not specified"}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Status: <span className="font-medium">{formatStatus(order.paymentStatus)}</span>
                      </p>
                    </div>
                    
                    {order.shippingAddress && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">Shipping Address</h4>
                        <div className="text-sm text-slate-600 space-y-1">
                          {typeof order.shippingAddress === 'string' ? (
                            <p>{order.shippingAddress}</p>
                          ) : (
                            <>
                              <p>{(order.shippingAddress as any)?.street}</p>
                              <p>{(order.shippingAddress as any)?.city}, {(order.shippingAddress as any)?.country}</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {order.orderNotes && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h4 className="font-medium text-slate-900 mb-2">Order Notes</h4>
                      <p className="text-sm text-slate-600">{order.orderNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}