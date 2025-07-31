import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ShoppingCart, 
  Star, 
  Package, 
  Tag, 
  Info, 
  Calendar,
  DollarSign,
  Minus,
  Plus
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;

  sku: string | null;
  categoryId: string | null;
  unitOfMeasure?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  rating: string;
  reviewCount: number;
  productType: "sale" | "rent";
  rentalPeriod?: string | null;
  rentalPrice?: string | null;
  createdAt: string;
  category?: {
    name: string;
  };
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const res = await apiRequest("POST", "/api/cart", { productId, quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to Cart",
        description: `${product?.name} has been added to your cart.`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  if (!product) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Product Details
          </DialogTitle>
          <DialogDescription>
            Complete information about {product.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <Package className="w-16 h-16 text-gray-400" />
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
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
              {product.category && (
                <p className="text-sm text-gray-600 mb-3">
                  Category: {product.category.name}
                </p>
              )}
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= parseFloat(product.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Pricing */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">Sale Price:</span>
                    <span className="text-2xl font-bold text-primary">${product.price}</span>
                  </div>
                  
                  {product.productType === "rent" && product.rentalPrice && (
                    <div className="flex items-center justify-between border-t pt-3">
                      <span className="text-lg font-semibold text-gray-700">Rental Price:</span>
                      <div className="text-right">
                        <span className="text-xl font-bold text-blue-600">${product.rentalPrice}</span>
                        {product.rentalPeriod && (
                          <p className="text-sm text-gray-600">per {product.rentalPeriod}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* VAT Notice */}
                  <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
                    <Info className="w-4 h-4 inline mr-1" />
                    Prices exclude 10% VAT
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || "No description available for this product."}
              </p>
            </div>

            {/* Product Details */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium">{product.sku || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Stock:</span>
                    <span className="font-medium">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{product.productType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Added:</span>
                    <span className="font-medium">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add to Cart Section */}
            {true && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-700">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={decrementQuantity}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={incrementQuantity}
                          disabled={false}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">
                        Total: ${(parseFloat(product.price) * quantity).toFixed(2)}
                      </span>
                      <Button 
                        onClick={handleAddToCart}
                        disabled={addToCartMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {(product.stock || 0) === 0 && (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-red-600 font-medium">This product is currently out of stock</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}