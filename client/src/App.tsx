import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProductsPage from "@/pages/products-page";
import CategoriesPage from "@/pages/categories-page";
import ProductDetailPage from "@/pages/product-detail-page";
import CategoryProductsPage from "@/pages/category-products-page";
import CartPage from "@/pages/cart-page";
import CheckoutPage from "@/pages/checkout-page";

import OrdersPage from "@/pages/orders-page";
import UserDashboard from "@/pages/user-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import { ProtectedRoute } from "./lib/protected-route";
import Footer from "@/components/footer";
import { useTheme } from "./hooks/use-theme";
import { useLocation } from "wouter";

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  useTheme(); // This will automatically apply the theme from settings
  return <div>{children}</div>;
}

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/categories" component={CategoriesPage} />
      <ProtectedRoute path="/category-products" component={CategoryProductsPage} />
      <ProtectedRoute path="/products" component={ProductsPage} />
      <ProtectedRoute path="/products/:id" component={ProductDetailPage} />
      <ProtectedRoute path="/cart" component={CartPage} />

      <ProtectedRoute path="/orders" component={OrdersPage} />
      <ProtectedRoute path="/checkout/:orderId" component={CheckoutPage} />
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/dashboard" component={UserDashboard} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isAuthPage = location === "/auth";

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Router />
      </div>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeWrapper>
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </ThemeWrapper>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
