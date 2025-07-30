import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Removed tabs import - only login now available
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type SiteSettings } from "@shared/schema";
import { z } from "zod";
import { Loader2, Store, Shield, Truck, CreditCard } from "lucide-react";

const loginSchema = insertUserSchema.pick({ username: true, password: true });
type LoginData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { user, loginMutation } = useAuth();
  const [, setLocation] = useLocation();

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  // Redirect if already logged in (use effect to avoid render issues)
  if (user) {
    setTimeout(() => setLocation("/"), 0);
    return null;
  }

  const onLogin = (data: LoginData) => {
    loginMutation.mutate(data, {
      onSuccess: () => setLocation("/"),
    });
  };

  // Registration removed - login only

  return (
    <div className="min-h-screen flex">
      {/* Left side - Forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            {settings?.loginLogoUrl ? (
              <img 
                src={settings.loginLogoUrl} 
                alt={settings.loginPageTitle || "InnovanceOrbit Store"} 
                className="h-16 w-auto mx-auto mb-4"
              />
            ) : settings?.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.loginPageTitle || "InnovanceOrbit Store"} 
                className="h-16 w-auto mx-auto mb-4"
              />
            ) : null}
            <h1 className="text-3xl font-bold text-slate-900">
              {settings?.loginPageTitle || "InnovanceOrbit Store"}
            </h1>
            <p className="mt-2 text-slate-600">
              {settings?.loginPageSubtitle || "Sign in to access our exclusive products"}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{settings?.loginCardTitle || "Sign In to Your Account"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...loginForm.register("username")}
                    className="mt-1"
                    placeholder="Enter your username"
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-sm text-red-500 mt-1">
                      {loginForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...loginForm.register("password")}
                    className="mt-1"
                    placeholder="Enter your password"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Need an account?</strong> Contact your store administrator for access credentials.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="flex-1 relative bg-gradient-to-br from-primary to-blue-600 text-white p-8 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: settings?.loginBackgroundImage ? `url('${settings.loginBackgroundImage}')` : `url('/src/assets/geometric-design.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-primary/80" />
        <div className="max-w-md text-center space-y-8 relative z-10">
          <div>
            <Store className="w-20 h-20 mx-auto mb-6 text-blue-100" />
            <h2 className="text-3xl font-bold mb-4">Welcome to {settings?.siteName || "InnovanceOrbit"}</h2>
            <p className="text-xl text-blue-100 mb-8">
              Your exclusive eCommerce destination for premium products
            </p>
          </div>

          {/* Custom Separator Image 1 */}
          {settings?.loginSeparatorImage1 && (
            <div className="flex justify-center my-6">
              <img 
                src={settings.loginSeparatorImage1} 
                alt="Separator" 
                className="h-8 w-auto opacity-80"
              />
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-blue-200" />
              <div className="text-left">
                <h3 className="font-semibold">{settings?.loginFeature1Title || "Secure Shopping"}</h3>
                <p className="text-sm text-blue-100">{settings?.loginFeature1Description || "Protected transactions and data"}</p>
              </div>
            </div>

            {/* Custom Separator Image 2 */}
            {settings?.loginSeparatorImage2 && (
              <div className="flex justify-center my-4">
                <img 
                  src={settings.loginSeparatorImage2} 
                  alt="Separator" 
                  className="h-6 w-auto opacity-60"
                />
              </div>
            )}

            <div className="flex items-center space-x-4">
              <Truck className="w-8 h-8 text-blue-200" />
              <div className="text-left">
                <h3 className="font-semibold">{settings?.loginFeature2Title || "Fast Delivery"}</h3>
                <p className="text-sm text-blue-100">{settings?.loginFeature2Description || "Quick and reliable shipping"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <CreditCard className="w-8 h-8 text-blue-200" />
              <div className="text-left">
                <h3 className="font-semibold">{settings?.loginFeature3Title || "Premium Quality"}</h3>
                <p className="text-sm text-blue-100">{settings?.loginFeature3Description || "Carefully curated products for discerning customers"}</p>
              </div>
            </div>

            {/* Custom Separator Image 3 */}
            {settings?.loginSeparatorImage3 && (
              <div className="flex justify-center my-4">
                <img 
                  src={settings.loginSeparatorImage3} 
                  alt="Separator" 
                  className="h-6 w-auto opacity-60"
                />
              </div>
            )}

            <div className="flex items-center space-x-4">
              <Store className="w-8 h-8 text-blue-200" />
              <div className="text-left">
                <h3 className="font-semibold">{settings?.loginFeature4Title || "24/7 Support"}</h3>
                <p className="text-sm text-blue-100">{settings?.loginFeature4Description || "Always here to help with your questions"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
