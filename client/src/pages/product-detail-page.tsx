import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/navigation-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Star, 
  ShoppingCart, 
  Package, 
  Tag, 
  Info, 
  Calendar,
  DollarSign,
  Minus,
  Plus,
  ArrowLeft
} from "lucide-react";
import type { Product } from "@shared/schema";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const res = await apiRequest("/api/cart", "POST", { productId, quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to Cart",
        description: `${product?.name} has been added to your cart.`,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="outline" onClick={() => setLocation("/products")} className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600">The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCartMutation.mutate({
      productId: product.id,
      quantity
    });
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-4 h-4 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  const rating = parseFloat(product.rating || "0");

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="outline" onClick={() => setLocation("/products")} className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-xl overflow-hidden shadow-lg">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Package className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Product Badges */}
            <div className="flex flex-wrap gap-2">
              {product.isFeatured && (
                <Badge variant="default" className="bg-yellow-500">
                  ⭐ Featured
                </Badge>
              )}
              <Badge variant={product.productType === "sale" ? "default" : "secondary"}>
                {product.productType === "sale" ? "For Sale" : "For Rent"}
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Available
              </Badge>
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              {/* Rating */}
              {rating > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center">
                    {renderStars(rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Pricing */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold text-gray-700">Sale Price:</span>
                    <span className="text-3xl font-bold text-primary">${product.price}</span>
                  </div>
                  
                  {product.productType === "rent" && product.rentalPrice && (
                    <div className="flex items-center justify-between border-t pt-4">
                      <span className="text-xl font-semibold text-gray-700">Rental Price:</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600">${product.rentalPrice}</span>
                        {product.rentalPeriod && (
                          <p className="text-sm text-gray-600">per {product.rentalPeriod}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* VAT Notice */}
                  <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                    <Info className="w-4 h-4 inline mr-2" />
                    Prices exclude 10% VAT
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {product.description || "No description available for this product."}
              </p>
            </div>

            {/* Product Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Product Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium">{product.sku || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600">Unit:</span>
                    <span className="font-medium">{product.unitOfMeasure || 'piece'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{product.productType}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600">Added:</span>
                    <span className="font-medium">
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add to Cart Section */}
            <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-medium text-gray-700">Quantity:</span>
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-10 w-10 p-0"
                          onClick={decrementQuantity}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-16 text-center font-medium text-lg">{quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-10 w-10 p-0"
                          onClick={incrementQuantity}
                          disabled={false}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-2xl font-semibold">
                        Total: ${(parseFloat(product.price) * quantity).toFixed(2)}
                      </span>
                      <Button 
                        onClick={handleAddToCart}
                        disabled={addToCartMutation.isPending}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        size="lg"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>


          </div>
        </div>
      </div>
    </div>
  );
}