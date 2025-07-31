import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { NavigationHeader } from "@/components/navigation-header";
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Package,
  ArrowLeft,
  Store
} from "lucide-react";
import type { WishlistItem, Product } from "@shared/schema";

type WishlistItemWithProduct = WishlistItem & { product: Product };

export default function WishlistPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: wishlistItems, isLoading } = useQuery<WishlistItemWithProduct[]>({
    queryKey: ["/api/wishlist"],
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await apiRequest("DELETE", `/api/wishlist/${productId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await apiRequest("POST", "/api/cart", {
        productId,
        quantity: 1,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlistMutation.mutate(productId);
  };

  const handleAddToCart = (productId: string) => {
    addToCartMutation.mutate(productId);
  };

  const handleViewProduct = (productId: string) => {
    setLocation(`/products/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="bg-slate-50">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="p-2 bg-pink-100 rounded-full">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">My Wishlist</h1>
                <p className="text-slate-600">Items you've saved for later</p>
              </div>
            </div>
          </div>
          {wishlistItems && wishlistItems.length > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
            </Badge>
          )}
        </div>

        {/* Empty State */}
        {!wishlistItems || wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-12 w-12 text-pink-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Your wishlist is empty</h3>
              <p className="text-slate-600 mb-8">
                Start adding items to your wishlist by clicking the heart icon on products you love.
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
                  <Store className="mr-2 h-4 w-4" />
                  Shop by Category
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card 
                key={item.id} 
                className="group cursor-pointer overflow-hidden border-none shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-white to-slate-50"
              >
                <div className="relative overflow-hidden">
                  {item.product.imageUrl ? (
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                      onClick={() => handleViewProduct(item.product.id)}
                    />
                  ) : (
                    <div 
                      className="w-full h-48 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                      onClick={() => handleViewProduct(item.product.id)}
                    >
                      <span className="text-slate-600 text-2xl font-bold">
                        {item.product.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  {/* Featured Badge */}
                  {item.product.isFeatured && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs px-3 py-1.5 font-semibold shadow-lg">
                        ⭐ Featured
                      </Badge>
                    </div>
                  )}
                  
                  {/* Remove from Wishlist Button */}
                  <div className="absolute top-3 right-3">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="w-10 h-10 rounded-full shadow-lg hover:shadow-xl bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200 border border-white/50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromWishlist(item.product.id);
                      }}
                      disabled={removeFromWishlistMutation.isPending}
                    >
                      <Trash2 className="w-5 h-5 text-red-500 hover:text-red-600 transition-colors duration-200" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 
                        className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors duration-200 cursor-pointer line-clamp-2"
                        onClick={() => handleViewProduct(item.product.id)}
                      >
                        {item.product.name}
                      </h3>
                      {item.product.description && (
                        <p className="text-slate-600 text-sm mt-2 line-clamp-2">
                          {item.product.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-slate-900">
                            BD {item.product.price}
                          </span>
                          {item.product.unitOfMeasure && (
                            <span className="text-sm text-slate-500">
                              /{item.product.unitOfMeasure}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          Added {new Date(item.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleAddToCart(item.product.id)}
                        disabled={addToCartMutation.isPending}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleViewProduct(item.product.id)}
                        className="px-4 border-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-200"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}