import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/navigation-header";
import Footer from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { PromotionalBanner } from "@/components/promotional-banner";
import { ImageSlider } from "@/components/image-slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import type { Category, Product, SliderImage } from "@shared/schema";

export default function HomePage() {
  const [, setLocation] = useLocation();

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  const { data: sliderImages } = useQuery<SliderImage[]>({
    queryKey: ["/api/slider-images/active"],
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationHeader />
      
      {/* Image Slider Section */}
      <section className="w-full">
        <ImageSlider 
          images={sliderImages || []} 
          height="h-96 md:h-[500px]"
          autoplay={true}
          autoplayInterval={5000}
          showControls={true}
          showIndicators={true}
        />
      </section>

      {/* Product Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Shop by Category</h2>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories.map((category) => (
                <Card 
                  key={category.id} 
                  className="group cursor-pointer overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  onClick={() => setLocation(`/products?category=${category.id}`)}
                >
                  <div className="bg-slate-100">
                    {category.imageUrl ? (
                      <img 
                        src={category.imageUrl} 
                        alt={category.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                        <span className="text-slate-500 text-lg font-medium">{category.name}</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{category.name}</h3>
                    <p className="text-slate-600">{category.description || "Browse our collection"}</p>
                    <span className="inline-block mt-3 text-primary font-medium group-hover:underline">
                      View Products →
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600">No categories available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="relative py-16 bg-slate-50 overflow-hidden">
        <div 
          className="absolute top-0 right-0 w-1/3 h-full opacity-5"
          style={{
            backgroundImage: `url('/src/assets/geometric-design.png')`,
            backgroundSize: 'contain',
            backgroundPosition: 'top right',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Featured Products</h2>
          
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
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
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600">No featured products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PromotionalBanner
            title="Exclusive Member Benefits"
            description="Enjoy premium products, priority support, and special pricing as a valued member"
            buttonText="Learn More"
            variant="gradient"
            icon="gift"
            onButtonClick={() => setLocation("/products")}
          />
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
