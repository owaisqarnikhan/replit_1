import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSiteSettingsSchema, type InsertSiteSettings, type SiteSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Monitor, Upload, Save, Eye, Image } from "lucide-react";

export function LoginPageManager() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const form = useForm<InsertSiteSettings>({
    resolver: zodResolver(insertSiteSettingsSchema),
    defaultValues: {
      loginPageTitle: settings?.loginPageTitle || "InnovanceOrbit Store",
      loginPageSubtitle: settings?.loginPageSubtitle || "Sign in to access our exclusive products",
      loginCardTitle: settings?.loginCardTitle || "Sign In to Your Account",
      loginBackgroundImage: settings?.loginBackgroundImage || "",
      loginLogoUrl: settings?.loginLogoUrl || "",
      loginSeparatorImage1: settings?.loginSeparatorImage1 || "",
      loginSeparatorImage2: settings?.loginSeparatorImage2 || "",
      loginSeparatorImage3: settings?.loginSeparatorImage3 || "",
      loginFeature1Title: settings?.loginFeature1Title || "Secure Shopping",
      loginFeature1Description: settings?.loginFeature1Description || "Your data is protected with enterprise-grade security",
      loginFeature2Title: settings?.loginFeature2Title || "Fast Delivery",
      loginFeature2Description: settings?.loginFeature2Description || "Quick and reliable delivery across Bahrain",
      loginFeature3Title: settings?.loginFeature3Title || "Premium Quality",
      loginFeature3Description: settings?.loginFeature3Description || "Carefully curated products for discerning customers",
      loginFeature4Title: settings?.loginFeature4Title || "24/7 Support",
      loginFeature4Description: settings?.loginFeature4Description || "Always here to help with your questions",
    },
    values: settings ? {
      loginPageTitle: settings.loginPageTitle || "InnovanceOrbit Store",
      loginPageSubtitle: settings.loginPageSubtitle || "Sign in to access our exclusive products",
      loginCardTitle: settings.loginCardTitle || "Sign In to Your Account",
      loginBackgroundImage: settings.loginBackgroundImage || "",
      loginLogoUrl: settings.loginLogoUrl || "",
      loginSeparatorImage1: settings.loginSeparatorImage1 || "",
      loginSeparatorImage2: settings.loginSeparatorImage2 || "",
      loginSeparatorImage3: settings.loginSeparatorImage3 || "",
      loginFeature1Title: settings.loginFeature1Title || "Secure Shopping",
      loginFeature1Description: settings.loginFeature1Description || "Your data is protected with enterprise-grade security",
      loginFeature2Title: settings.loginFeature2Title || "Fast Delivery",
      loginFeature2Description: settings.loginFeature2Description || "Quick and reliable delivery across Bahrain",
      loginFeature3Title: settings.loginFeature3Title || "Premium Quality",
      loginFeature3Description: settings.loginFeature3Description || "Carefully curated products for discerning customers",
      loginFeature4Title: settings.loginFeature4Title || "24/7 Support",
      loginFeature4Description: settings.loginFeature4Description || "Always here to help with your questions",
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (settingsData: Partial<InsertSiteSettings>) => {
      const response = await apiRequest("PUT", "/api/settings", settingsData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Login Page Updated",
        description: "Login page settings have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update login page settings",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (file: File, fieldName: keyof InsertSiteSettings) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      form.setValue(fieldName, data.imageUrl);
      
      toast({
        title: "Image Uploaded",
        description: "Image has been uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: InsertSiteSettings) => {
    updateMutation.mutate(data);
  };

  const openPreview = () => {
    window.open('/auth', '_blank');
  };

  if (isLoading) {
    return <div>Loading login page settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Login Page Customization
        </CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={openPreview}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview Login Page
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Page Headers Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Page Content</h3>
              
              <FormField
                control={form.control}
                name="loginPageTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Title</FormLabel>
                    <FormControl>
                      <Input placeholder="InnovanceOrbit Store" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="loginPageSubtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Subtitle</FormLabel>
                    <FormControl>
                      <Input placeholder="Sign in to access our exclusive products" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="loginCardTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Login Card Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Sign In to Your Account" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Images & Background</h3>
              
              <FormField
                control={form.control}
                name="loginLogoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Login Page Logo URL</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="Logo URL (optional, falls back to main logo)" {...field} value={field.value || ""} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleImageUpload(file, 'loginLogoUrl');
                          };
                          input.click();
                        }}
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="loginBackgroundImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Image URL</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="Background image URL" {...field} value={field.value || ""} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleImageUpload(file, 'loginBackgroundImage');
                          };
                          input.click();
                        }}
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Separator Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Separator Images</h3>
              
              {[1, 2, 3].map((num) => (
                <FormField
                  key={num}
                  control={form.control}
                  name={`loginSeparatorImage${num}` as keyof InsertSiteSettings}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Separator Image {num} URL</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder={`Separator image ${num} URL (optional)`} {...field} value={field.value || ""} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleImageUpload(file, `loginSeparatorImage${num}` as keyof InsertSiteSettings);
                            };
                            input.click();
                          }}
                          disabled={isUploading}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* Features Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Feature Highlights</h3>
              
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <FormField
                    control={form.control}
                    name={`loginFeature${num}Title` as keyof InsertSiteSettings}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feature {num} Title</FormLabel>
                        <FormControl>
                          <Input placeholder={`Feature ${num} title`} {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`loginFeature${num}Description` as keyof InsertSiteSettings}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feature {num} Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder={`Feature ${num} description`} {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {updateMutation.isPending ? "Saving..." : "Save Login Page Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}