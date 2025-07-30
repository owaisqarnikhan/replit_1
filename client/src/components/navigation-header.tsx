import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  User, 
  Package, 
  Settings, 
  LogOut,
  Menu,
  Store
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { CartItem, Product, SiteSettings } from "@shared/schema";

type CartItemWithProduct = CartItem & { product: Product };

export function NavigationHeader() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: cartItems } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account",
        });
        setLocation("/auth");
      },
    });
  };

  const navItems = [
    { label: "Dashboard", href: "/", icon: Store },
    { label: "Categories", href: "/categories", icon: Package },
    { label: "Products", href: "/products", icon: Package },
    { label: "My Orders", href: "/dashboard", icon: Package },
  ];

  if (user?.isAdmin) {
    navItems.push({ label: "Admin", href: "/admin", icon: Settings });
  }

  const NavigationItems = ({ mobile = false }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.href}
            variant="ghost"
            className={`${mobile ? 'justify-start w-full' : ''} transition-colors duration-200 font-medium`}
            style={{ 
              color: siteSettings?.headerTextColor || '#64748b',
              '--hover-color': siteSettings?.tabTextColor || '#2563eb'
            } as React.CSSProperties & { '--hover-color': string }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = siteSettings?.tabTextColor || '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = siteSettings?.headerTextColor || '#64748b';
            }}
            onClick={() => {
              setLocation(item.href);
              if (mobile) setIsMobileMenuOpen(false);
            }}
          >
            {mobile && <Icon className="mr-2 h-4 w-4" />}
            {item.label}
          </Button>
        );
      })}
    </>
  );

  const logoComponent = (
    <div className="flex items-center space-x-2">
      {siteSettings?.logoUrl ? (
        <img
          src={siteSettings.logoUrl}
          alt={siteSettings.siteName || "InnovanceOrbit"}
          className="h-16 w-auto"
          onError={(e) => {
            // Fallback to text logo if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      <span className={`text-3xl font-bold ${siteSettings?.logoUrl ? 'hidden' : ''}`}>
        {siteSettings?.siteName || "InnovanceOrbit"}
      </span>
    </div>
  );

  return (
    <header 
      className="bg-white shadow-sm border-b sticky top-0 z-50 nav-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                className="text-2xl font-bold hover:bg-transparent flex items-center space-x-3 transition-colors duration-200"
                style={{ color: siteSettings?.headerTextColor || '#2563eb' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = siteSettings?.tabTextColor || '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = siteSettings?.headerTextColor || '#2563eb';
                }}
                onClick={() => setLocation("/")}
              >
                {siteSettings?.logoUrl ? (
                  <img 
                    src={siteSettings.logoUrl} 
                    alt={siteSettings.siteName || "InnovanceOrbit"} 
                    className="h-16 w-auto"
                  />
                ) : (
                  <Store className="w-12 h-12" />
                )}
                <span>{siteSettings?.siteName || "InnovanceOrbit"}</span>
              </Button>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <NavigationItems />
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Shopping Cart */}
            <Button
              variant="ghost"
              className="relative transition-colors duration-200"
              style={{ color: siteSettings?.headerTextColor || '#64748b' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = siteSettings?.tabTextColor || '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = siteSettings?.headerTextColor || '#64748b';
              }}
              onClick={() => setLocation("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center"
                  style={{ 
                    backgroundColor: siteSettings?.accentColor || '#0ea5e9',
                    color: '#ffffff'
                  }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback 
                      className="text-white text-sm"
                      style={{ backgroundColor: siteSettings?.primaryColor || '#2563eb' }}
                    >
                      {user?.username.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span 
                    className="hidden sm:block font-medium"
                    style={{ color: siteSettings?.headerTextColor || '#374151' }}
                  >
                    {user?.username || "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
                  <User className="mr-2 h-4 w-4" />
                  My Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
                  <Package className="mr-2 h-4 w-4" />
                  My Orders
                </DropdownMenuItem>
                {user?.isAdmin && (
                  <DropdownMenuItem onClick={() => setLocation("/admin")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden"
                  style={{ color: siteSettings?.headerTextColor || '#374151' }}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-6">
                  <NavigationItems mobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
