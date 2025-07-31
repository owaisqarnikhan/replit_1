import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/navigation-header";
import { ProductCard } from "@/components/product-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, ShoppingBag } from "lucide-react";
import { useLocation } from "wouter";
import type { Product, Category } from "@shared/schema";

export default function CategoryProductsPage() {
  const [, setLocation] = useLocation();

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Group products by category
  const productsByCategory = categories?.reduce((acc, category) => {
    const categoryProducts = products?.filter(product => product.categoryId === category.id) || [];
    if (categoryProducts.length > 0) {
      acc[category.id] = {
        category,
        products: categoryProducts
      };
    }
    return acc;
  }, {} as Record<string, { category: Category; products: Product[] }>) || {};

  const isLoading = categoriesLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          {[...Array(3)].map((_, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, productIndex) => (
                  <Card key={productIndex} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-8 w-20 mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const categoryEntries = Object.values(productsByCategory);

  return (
    <div className="bg-slate-50 min-h-screen">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/")} 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Products by Category
          </h1>
          <p className="text-lg text-slate-600">
            Browse our products organized by categories
          </p>
        </div>

        {categoryEntries.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Products Available</h2>
            <p className="text-slate-600 mb-8">There are currently no products in any category.</p>
            <Button onClick={() => setLocation("/")}>
              Return to Home
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {categoryEntries.map(({ category, products }) => (
              <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-8 py-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="text-slate-600">{category.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-primary">
                      <ShoppingBag className="w-5 h-5" />
                      <span className="font-semibold">{products.length} Products</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={product}
                        onCardClick={(product) => setLocation(`/products/${product.id}`)}
                        showDetailsButton={false}
                      />
                    ))}
                  </div>
                  
                  {products.length > 4 && (
                    <div className="mt-8 text-center">
                      <Button 
                        variant="outline"
                        onClick={() => setLocation(`/products?category=${category.id}`)}
                      >
                        View All {category.name} Products
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}