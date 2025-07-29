import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/navigation-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct, insertSiteSettingsSchema, type InsertSiteSettings, type SiteSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  Plus, 
  Download,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import type { Product, Order, Category } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAddProduct, setShowAddProduct] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (productData: InsertProduct) => {
      const res = await apiRequest("POST", "/api/products", productData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setShowAddProduct(false);
      addProductForm.reset();
      toast({
        title: "Success",
        description: "Product added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData: Partial<InsertSiteSettings>) => {
      const res = await apiRequest("PUT", "/api/settings", settingsData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "Site settings updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const addProductForm = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stock: 0,
      categoryId: "",
      sku: "",
      imageUrl: "",
      isActive: true,
      isFeatured: false,
    },
  });

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

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

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <Button 
              className="bg-primary hover:bg-blue-600"
              onClick={() => setShowAddProduct(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
            <Button variant="outline" className="bg-green-500 hover:bg-green-600 text-white">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold text-slate-900">{stats?.revenue || "0.00"} BHD</p>
                      <p className="text-green-500 text-sm">↗ +12% from last month</p>
                    </div>
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">Total Orders</p>
                      <p className="text-2xl font-bold text-slate-900">{stats?.orders || 0}</p>
                      <p className="text-green-500 text-sm">↗ +8% from last month</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">Active Products</p>
                      <p className="text-2xl font-bold text-slate-900">{stats?.products || 0}</p>
                      <p className="text-yellow-500 text-sm">2 pending approval</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-slate-900" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">Registered Users</p>
                      <p className="text-2xl font-bold text-slate-900">{stats?.users || 0}</p>
                      <p className="text-green-500 text-sm">↗ +15% from last month</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Management Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="products" className="w-full">
              <div className="border-b border-slate-200">
                <TabsList className="h-auto p-0 bg-transparent">
                  <TabsTrigger 
                    value="products" 
                    className="px-6 py-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Products
                  </TabsTrigger>
                  <TabsTrigger 
                    value="orders" 
                    className="px-6 py-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Orders
                  </TabsTrigger>
                  <TabsTrigger 
                    value="users" 
                    className="px-6 py-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Users
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="px-6 py-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Site Settings
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="products" className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">Product Management</h2>
                  <div className="flex space-x-4">
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                    />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {productsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Skeleton className="h-12 w-12" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-4 flex-1">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                              <span className="text-slate-500 text-xs">{product.name.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{product.name}</p>
                            <p className="text-sm text-slate-500">SKU: {product.sku || "N/A"}</p>
                          </div>
                        </div>
                        
                        <div className="text-sm text-slate-600 w-24">
                          {categories?.find(c => c.id === product.categoryId)?.name || "No Category"}
                        </div>
                        
                        <div className="text-sm font-medium text-slate-900 w-20">
                          {product.price} BHD
                        </div>
                        
                        <div className="text-sm text-slate-600 w-16">
                          {product.stock}
                        </div>
                        
                        <div className="w-20">
                          <Badge className={product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => deleteProductMutation.mutate(product.id)}
                            disabled={deleteProductMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="orders" className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">Order Management</h2>
                </div>

                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="font-medium text-slate-900">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-slate-600">
                            {new Date(order.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">{order.total} BHD</p>
                        </div>
                        
                        <div>
                          <Select
                            value={order.status}
                            onValueChange={(status) => 
                              updateOrderStatusMutation.mutate({ orderId: order.id, status })
                            }
                          >
                            <SelectTrigger className="w-32">
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No orders found</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="users" className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
                </div>
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">User management functionality coming soon...</p>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">Site Settings</h2>
                  <p className="text-slate-600">Manage your site's branding, theme, and contact information</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Branding Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Branding & Logos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input
                          id="siteName"
                          defaultValue={siteSettings?.siteName}
                          placeholder="InnovanceOrbit"
                          onBlur={(e) => updateSettingsMutation.mutate({ siteName: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="headerLogo">Header Logo URL</Label>
                        <Input
                          id="headerLogo"
                          defaultValue={siteSettings?.headerLogo || ""}
                          placeholder="https://example.com/logo.png"
                          onBlur={(e) => updateSettingsMutation.mutate({ headerLogo: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="footerLogo">Footer Logo URL</Label>
                        <Input
                          id="footerLogo"
                          defaultValue={siteSettings?.footerLogo || ""}
                          placeholder="https://example.com/footer-logo.png"
                          onBlur={(e) => updateSettingsMutation.mutate({ footerLogo: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="footerDescription">Footer Description</Label>
                        <Textarea
                          id="footerDescription"
                          defaultValue={siteSettings?.footerDescription || ""}
                          placeholder="Your trusted partner for premium products..."
                          rows={3}
                          onBlur={(e) => updateSettingsMutation.mutate({ footerDescription: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Color Theme Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Color Theme</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="primaryColor"
                            type="color"
                            defaultValue={siteSettings?.primaryColor}
                            className="w-16 h-10"
                            onChange={(e) => updateSettingsMutation.mutate({ primaryColor: e.target.value })}
                          />
                          <Input
                            defaultValue={siteSettings?.primaryColor}
                            placeholder="#2563eb"
                            onBlur={(e) => updateSettingsMutation.mutate({ primaryColor: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="secondaryColor"
                            type="color"
                            defaultValue={siteSettings?.secondaryColor}
                            className="w-16 h-10"
                            onChange={(e) => updateSettingsMutation.mutate({ secondaryColor: e.target.value })}
                          />
                          <Input
                            defaultValue={siteSettings?.secondaryColor}
                            placeholder="#64748b"
                            onBlur={(e) => updateSettingsMutation.mutate({ secondaryColor: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="accentColor">Accent Color</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="accentColor"
                            type="color"
                            defaultValue={siteSettings?.accentColor}
                            className="w-16 h-10"
                            onChange={(e) => updateSettingsMutation.mutate({ accentColor: e.target.value })}
                          />
                          <Input
                            defaultValue={siteSettings?.accentColor}
                            placeholder="#0ea5e9"
                            onBlur={(e) => updateSettingsMutation.mutate({ accentColor: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="backgroundColor">Background Color</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="backgroundColor"
                            type="color"
                            defaultValue={siteSettings?.backgroundColor}
                            className="w-16 h-10"
                            onChange={(e) => updateSettingsMutation.mutate({ backgroundColor: e.target.value })}
                          />
                          <Input
                            defaultValue={siteSettings?.backgroundColor}
                            placeholder="#ffffff"
                            onBlur={(e) => updateSettingsMutation.mutate({ backgroundColor: e.target.value })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          defaultValue={siteSettings?.contactEmail || ""}
                          placeholder="info@innovanceorbit.com"
                          onBlur={(e) => updateSettingsMutation.mutate({ contactEmail: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input
                          id="contactPhone"
                          defaultValue={siteSettings?.contactPhone || ""}
                          placeholder="+973 1234 5678"
                          onBlur={(e) => updateSettingsMutation.mutate({ contactPhone: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="contactAddress">Business Address</Label>
                        <Textarea
                          id="contactAddress"
                          defaultValue={siteSettings?.contactAddress || ""}
                          placeholder="123 Business Street, Manama, Bahrain"
                          rows={2}
                          onBlur={(e) => updateSettingsMutation.mutate({ contactAddress: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="businessHours">Business Hours</Label>
                        <Input
                          id="businessHours"
                          defaultValue={siteSettings?.businessHours || ""}
                          placeholder="Sun-Thu: 9AM-6PM"
                          onBlur={(e) => updateSettingsMutation.mutate({ businessHours: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Media & Footer */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Social Media & Footer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="socialFacebook">Facebook URL</Label>
                        <Input
                          id="socialFacebook"
                          defaultValue={siteSettings?.socialFacebook || ""}
                          placeholder="https://facebook.com/yourpage"
                          onBlur={(e) => updateSettingsMutation.mutate({ socialFacebook: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="socialInstagram">Instagram URL</Label>
                        <Input
                          id="socialInstagram"
                          defaultValue={siteSettings?.socialInstagram || ""}
                          placeholder="https://instagram.com/yourhandle"
                          onBlur={(e) => updateSettingsMutation.mutate({ socialInstagram: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="copyrightText">Copyright Text</Label>
                        <Input
                          id="copyrightText"
                          defaultValue={siteSettings?.copyrightText || ""}
                          placeholder="© 2025 InnovanceOrbit. All rights reserved."
                          onBlur={(e) => updateSettingsMutation.mutate({ copyrightText: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="additionalFooterText">Additional Footer Text</Label>
                        <Textarea
                          id="additionalFooterText"
                          defaultValue={siteSettings?.additionalFooterText || ""}
                          placeholder="Additional footer information"
                          rows={2}
                          onBlur={(e) => updateSettingsMutation.mutate({ additionalFooterText: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={addProductForm.handleSubmit((data) => addProductMutation.mutate(data))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  {...addProductForm.register("name")}
                  placeholder="Enter product name"
                />
                {addProductForm.formState.errors.name && (
                  <p className="text-sm text-red-500">{addProductForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  {...addProductForm.register("sku")}
                  placeholder="Enter SKU"
                />
                {addProductForm.formState.errors.sku && (
                  <p className="text-sm text-red-500">{addProductForm.formState.errors.sku.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...addProductForm.register("description")}
                placeholder="Enter product description"
                rows={3}
              />
              {addProductForm.formState.errors.description && (
                <p className="text-sm text-red-500">{addProductForm.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (BHD)</Label>
                <Input
                  id="price"
                  {...addProductForm.register("price")}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
                {addProductForm.formState.errors.price && (
                  <p className="text-sm text-red-500">{addProductForm.formState.errors.price.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  {...addProductForm.register("stock", { valueAsNumber: true })}
                  placeholder="0"
                  type="number"
                />
                {addProductForm.formState.errors.stock && (
                  <p className="text-sm text-red-500">{addProductForm.formState.errors.stock.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <Select onValueChange={(value) => addProductForm.setValue("categoryId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="home">Home & Garden</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {addProductForm.formState.errors.categoryId && (
                  <p className="text-sm text-red-500">{addProductForm.formState.errors.categoryId.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  {...addProductForm.register("imageUrl")}
                  placeholder="https://example.com/image.jpg"
                />
                {addProductForm.formState.errors.imageUrl && (
                  <p className="text-sm text-red-500">{addProductForm.formState.errors.imageUrl.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...addProductForm.register("isActive")}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  {...addProductForm.register("isFeatured")}
                  className="rounded"
                />
                <Label htmlFor="isFeatured">Featured</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddProduct(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addProductMutation.isPending}>
                {addProductMutation.isPending ? "Adding..." : "Add Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
