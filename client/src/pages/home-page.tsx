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
      <section className="py-20 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        {/* Background Design Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Discover our hand-picked selection of premium products, carefully chosen for quality and value
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-6 rounded-full"></div>
          </div>
          
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="group relative overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 opacity-80"></div>
                  <div className="relative">
                    <Skeleton className="h-64 w-full" />
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-8 w-24 mb-4" />
                      <Skeleton className="h-12 w-full" />
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {/* Call to Action */}
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={() => setLocation("/products")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  View All Products
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">No Featured Products Yet</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Our featured products collection is being curated. Check back soon for amazing deals!
              </p>
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
