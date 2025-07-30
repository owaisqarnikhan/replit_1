import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, User, MapPin, CreditCard, Calendar, Eye, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    name: string;
    image?: string;
  };
}

interface Order {
  id: string;
  userId: string;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  status: string;
  paymentMethod?: string;
  shippingAddress?: any;
  createdAt: string;
  user?: {
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  items?: OrderItem[];
}

export function OrderManager() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: orderDetails, isLoading: orderDetailsLoading } = useQuery<Order>({
    queryKey: ["/api/orders", selectedOrder?.id],
    enabled: !!selectedOrder?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped": return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Order Management</h2>
        <Button
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/orders"] })}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        Order #{order.id.slice(0, 8)}
                      </h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {order.user?.firstName && order.user?.lastName 
                          ? `${order.user.firstName} ${order.user.lastName}`
                          : order.user?.username || 'Unknown Customer'
                        }
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        {order.paymentMethod || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">${order.total}</div>
                    <div className="text-sm text-slate-600">{order.items?.length || 0} items</div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Select
                      value={order.status}
                      onValueChange={(status) => updateStatusMutation.mutate({ orderId: order.id, status })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Order Details - #{order.id.slice(0, 8)}</DialogTitle>
                      </DialogHeader>
                      
                      {orderDetailsLoading ? (
                        <div className="space-y-4">
                          <Skeleton className="h-32 w-full" />
                          <Skeleton className="h-32 w-full" />
                        </div>
                      ) : orderDetails ? (
                        <div className="space-y-6">
                          {/* Customer Information */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Customer Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div><strong>Name:</strong> {orderDetails.user?.firstName && orderDetails.user?.lastName 
                                ? `${orderDetails.user.firstName} ${orderDetails.user.lastName}`
                                : orderDetails.user?.username || 'Unknown Customer'}</div>
                              <div><strong>Email:</strong> {orderDetails.user?.email || 'Unknown'}</div>
                              <div><strong>Order Date:</strong> {formatDate(orderDetails.createdAt)}</div>
                            </CardContent>
                          </Card>

                          {/* Shipping Address */}
                          {orderDetails.shippingAddress && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <MapPin className="h-5 w-5" />
                                  Shipping Address
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-1">
                                  {typeof orderDetails.shippingAddress === 'string' ? (
                                    <div>{orderDetails.shippingAddress}</div>
                                  ) : (
                                    <>
                                      <div>{orderDetails.shippingAddress.street}</div>
                                      <div>{orderDetails.shippingAddress.city}</div>
                                      <div>{orderDetails.shippingAddress.country}</div>
                                      {orderDetails.shippingAddress.postalCode && (
                                        <div>{orderDetails.shippingAddress.postalCode}</div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Order Items */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Order Items
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {orderDetails.items?.map((item) => (
                                  <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                      {item.product.image && (
                                        <img 
                                          src={item.product.image} 
                                          alt={item.product.name}
                                          className="w-16 h-16 object-cover rounded"
                                        />
                                      )}
                                      <div>
                                        <h4 className="font-medium">{item.product.name}</h4>
                                        <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold">${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                                      <div className="text-sm text-slate-600">${item.price} each</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Order Summary */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span>Subtotal:</span>
                                  <span>${orderDetails.subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tax:</span>
                                  <span>${orderDetails.tax}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Shipping:</span>
                                  <span>${orderDetails.shipping}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2">
                                  <span>Total:</span>
                                  <span>${orderDetails.total}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600">
                                  <span>Payment Method:</span>
                                  <span>{orderDetails.paymentMethod || 'Unknown'}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-slate-600">Failed to load order details</p>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No orders found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}