import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star, Heart, ShoppingCart, Eye } from "lucide-react";
import { useState } from "react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
  onCardClick?: (product: Product) => void;
  showDetailsButton?: boolean;
}

export function ProductCard({ product, onViewDetails, onCardClick, showDetailsButton = true }: ProductCardProps) {
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCartMutation.mutate();
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} ${isWishlisted ? "removed from" : "added to"} your wishlist`,
    });
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
  const reviewCount = product.reviewCount || 0;

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(product);
    }
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden border-none shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-white to-slate-50 h-full flex flex-col"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-t-xl">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <span className="text-slate-600 text-lg font-bold">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3">
          {product.isFeatured && (
            <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs px-3 py-1.5 font-semibold shadow-lg">
              ⭐ Featured
            </Badge>
          )}
        </div>
        
        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
          <Button
            size="icon"
            variant="secondary"
            className="w-10 h-10 rounded-full shadow-lg hover:shadow-xl bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200 border border-white/50"
            onClick={handleWishlistToggle}
          >
            <Heart 
              className={`w-5 h-5 transition-all duration-200 ${
                isWishlisted ? "fill-red-500 text-red-500 scale-110" : "text-slate-500 hover:text-red-500 hover:scale-110"
              }`} 
            />
          </Button>
        </div>

        {/* Stock indicator */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="destructive" className="text-white text-lg px-4 py-2 font-bold shadow-lg">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-3 bg-gradient-to-b from-transparent to-slate-50/30 flex flex-col h-full">
        <div className="flex-1">
          <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300 min-h-[2.5rem]">
            {product.name}
          </h3>
          
          <p className="text-slate-600 text-xs mb-2 line-clamp-2 leading-relaxed min-h-[2rem]">
            {product.description || "No description available"}
          </p>
          
          <div className="flex items-center justify-between mb-1">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            
            {rating > 0 && (
              <div className="flex items-center space-x-1 bg-yellow-50 px-1.5 py-0.5 rounded-full border border-yellow-200">
                <div className="flex">
                  {renderStars(rating)}
                </div>
                <span className="text-slate-600 text-xs font-medium">
                  ({reviewCount > 0 ? reviewCount : rating.toFixed(1)})
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-auto pt-1">
          {showDetailsButton ? (
            <div className="flex gap-1.5">
              <Button 
                variant="outline"
                size="sm"
                className="flex-1 border-2 border-blue-200 hover:border-blue-400 text-blue-600 hover:text-blue-700 font-semibold py-1.5 px-2 rounded-md shadow-md hover:shadow-lg transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails?.(product);
                }}
              >
                <Eye className="mr-1 h-3 w-3" />
                <span className="text-xs">Details</span>
              </Button>
              
              <Button 
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-1.5 px-2 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group disabled:opacity-50 disabled:hover:scale-100"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCartMutation.mutate();
                }}
                disabled={addToCartMutation.isPending || product.stock === 0}
              >
                {addToCartMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1"></div>
                    <span className="text-xs">Adding...</span>
                  </div>
                ) : product.stock === 0 ? (
                  <span className="text-xs">Out of Stock</span>
                ) : (
                  <>
                    <ShoppingCart className="mr-1 h-3 w-3 group-hover:animate-bounce" />
                    <span className="text-xs">Add to Cart</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button 
              size="sm"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-1.5 px-2 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group disabled:opacity-50 disabled:hover:scale-100"
              onClick={(e) => {
                e.stopPropagation();
                addToCartMutation.mutate();
              }}
              disabled={addToCartMutation.isPending || product.stock === 0}
            >
              {addToCartMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1"></div>
                  <span className="text-xs">Adding...</span>
                </div>
              ) : product.stock === 0 ? (
                <span className="text-xs">Out of Stock</span>
              ) : (
                <>
                  <ShoppingCart className="mr-1 h-3 w-3 group-hover:animate-bounce" />
                  <span className="text-xs">Add to Cart</span>
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
