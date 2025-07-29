import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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

  return (
    <Card className="group cursor-pointer overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <span className="text-slate-500 text-lg font-medium">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2">
          {product.isFeatured && (
            <Badge className="bg-green-500 text-white text-xs px-2 py-1 font-medium">
              Featured
            </Badge>
          )}
        </div>
        
        {/* Wishlist Button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8 rounded-full shadow-md hover:bg-slate-50 transition-colors duration-200"
            onClick={handleWishlistToggle}
          >
            <Heart 
              className={`w-4 h-4 transition-colors duration-200 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-slate-400 hover:text-red-500"
              }`} 
            />
          </Button>
        </div>

        {/* Stock indicator */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge variant="destructive" className="text-white">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-slate-600 text-sm mb-3 line-clamp-2">
          {product.description || "No description available"}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-primary">
            ${parseFloat(product.price).toFixed(2)}
          </span>
          
          {rating > 0 && (
            <div className="flex items-center space-x-1">
              <div className="flex">
                {renderStars(rating)}
              </div>
              <span className="text-slate-500 text-sm">
                ({reviewCount > 0 ? reviewCount : rating.toFixed(1)})
              </span>
            </div>
          )}
        </div>
        
        <Button 
          className="w-full bg-primary hover:bg-blue-600 text-white font-medium transition-colors duration-200"
          onClick={handleAddToCart}
          disabled={addToCartMutation.isPending || product.stock === 0}
        >
          {addToCartMutation.isPending ? (
            "Adding..."
          ) : product.stock === 0 ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
