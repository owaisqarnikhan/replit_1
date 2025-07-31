import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSiteSettingsSchema, type InsertSiteSettings, type SiteSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Settings, Palette, Mail, Upload, Save, Monitor } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { themes, applyTheme, type ThemeName } from "@/lib/themes";



export function SiteSettings() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const form = useForm<InsertSiteSettings>({
    resolver: zodResolver(insertSiteSettingsSchema),
    defaultValues: {
      siteName: settings?.siteName || "InnovanceOrbit",
      logoUrl: settings?.logoUrl || "",
      contactEmail: settings?.contactEmail || "",
      supportEmail: settings?.supportEmail || "",
      adminEmail: settings?.adminEmail || "",
      contactPhone: settings?.contactPhone || "",
      contactAddress: settings?.contactAddress || "",
      businessHours: settings?.businessHours || "",
      officeHoursTitle: settings?.officeHoursTitle || "Office Hours",
      paymentMethodsImage: settings?.paymentMethodsImage || "",
      footerLeftImage: settings?.footerLeftImage || "",
      footerLeftImageWidth: settings?.footerLeftImageWidth || 200,
      paymentMethodsImageWidth: settings?.paymentMethodsImageWidth || 250,
      loginPageLogoWidth: settings?.loginPageLogoWidth || 80,
      headerLogoHeight: settings?.headerLogoHeight || 64,
      theme: settings?.theme || "default",
      primaryColor: settings?.primaryColor || "#2563eb",
      secondaryColor: settings?.secondaryColor || "#64748b",
      accentColor: settings?.accentColor || "#0ea5e9",
      backgroundColor: settings?.backgroundColor || "#ffffff",
      textColor: settings?.textColor || "#1e293b",
      headerTextColor: settings?.headerTextColor || "#64748b",
      tabTextColor: settings?.tabTextColor || "#2563eb", 
      tabActiveTextColor: settings?.tabActiveTextColor || "#2563eb",
      orderConfirmationTemplate: settings?.orderConfirmationTemplate || "",
      footerDescription: settings?.footerDescription || "",
      footerBackgroundUrl: settings?.footerBackgroundUrl || "/uploads/footer-background.png",
      quickLinksTitle: settings?.quickLinksTitle || "Quick Links",
      quickLinkHome: settings?.quickLinkHome || "Home",
      quickLinkProducts: settings?.quickLinkProducts || "Products",
      quickLinkAbout: settings?.quickLinkAbout || "About",
      quickLinkContact: settings?.quickLinkContact || "Contact",

      socialTitle: settings?.socialTitle || "Follow Us",
      socialFacebook: settings?.socialFacebook || "",
      socialTwitter: settings?.socialTwitter || "",
      socialInstagram: settings?.socialInstagram || "",
      socialLinkedin: settings?.socialLinkedin || "",
      copyrightText: settings?.copyrightText || "",
      additionalFooterText: settings?.additionalFooterText || "",
      // SMTP Configuration
      smtpHost: settings?.smtpHost || "smtp.office365.com",
      smtpPort: settings?.smtpPort || 587,
      smtpUser: settings?.smtpUser || "",
      smtpPassword: settings?.smtpPassword || "",
      smtpFromEmail: settings?.smtpFromEmail || "",
      smtpFromName: settings?.smtpFromName || "InnovanceOrbit",
      emailEnabled: settings?.emailEnabled || false,
      // Login Page Settings
      loginPageLogo: settings?.loginPageLogo || "",
      loginPageTitle: settings?.loginPageTitle || "InnovanceOrbit Store",
    },
  });

  // Update form when settings load - use useEffect to avoid infinite renders
  React.useEffect(() => {
    if (settings) {
      form.reset({
        siteName: settings.siteName,
        logoUrl: settings.logoUrl || "",
        contactEmail: settings.contactEmail || "",
        supportEmail: settings.supportEmail || "",
        adminEmail: settings.adminEmail || "",
        contactPhone: settings.contactPhone || "",
        contactAddress: settings.contactAddress || "",
        businessHours: settings.businessHours || "",
        officeHoursTitle: settings.officeHoursTitle || "Office Hours",
        paymentMethodsImage: settings.paymentMethodsImage || "",
        footerLeftImage: settings.footerLeftImage || "",
        footerLeftImageWidth: settings.footerLeftImageWidth || 200,
        paymentMethodsImageWidth: settings.paymentMethodsImageWidth || 250,
        theme: settings.theme || "default",
        primaryColor: settings.primaryColor || "#2563eb",
        secondaryColor: settings.secondaryColor || "#64748b",
        accentColor: settings.accentColor || "#0ea5e9",
        backgroundColor: settings.backgroundColor || "#ffffff",
        textColor: settings.textColor || "#1e293b",
        headerTextColor: settings.headerTextColor || "#64748b",
        tabTextColor: settings.tabTextColor || "#2563eb",
        tabActiveTextColor: settings.tabActiveTextColor || "#2563eb",
        orderConfirmationTemplate: settings.orderConfirmationTemplate || "",
        footerDescription: settings.footerDescription || "",
        footerBackgroundUrl: settings.footerBackgroundUrl || "/uploads/footer-background.png",
        quickLinksTitle: settings.quickLinksTitle || "Quick Links",
        quickLinkHome: settings.quickLinkHome || "Home",
        quickLinkProducts: settings.quickLinkProducts || "Products",
        quickLinkAbout: settings.quickLinkAbout || "About",
        quickLinkContact: settings.quickLinkContact || "Contact",

        socialTitle: settings.socialTitle || "Follow Us",
        socialFacebook: settings.socialFacebook || "",
        socialTwitter: settings.socialTwitter || "",
        socialInstagram: settings.socialInstagram || "",
        socialLinkedin: settings.socialLinkedin || "",
        copyrightText: settings.copyrightText || "",
        additionalFooterText: settings.additionalFooterText || "",
        // SMTP Configuration
        smtpHost: settings.smtpHost || "smtp.office365.com",
        smtpPort: settings.smtpPort || 587,
        smtpUser: settings.smtpUser || "",
        smtpPassword: settings.smtpPassword || "",
        smtpFromEmail: settings.smtpFromEmail || "",
        smtpFromName: settings.smtpFromName || "InnovanceOrbit",
        emailEnabled: settings.emailEnabled || false,
        // Login Page Settings
        loginPageLogo: settings.loginPageLogo || "",
        loginPageTitle: settings.loginPageTitle || "InnovanceOrbit Store",
        loginPageLogoWidth: settings.loginPageLogoWidth || 80,
      });
      
      // Apply the current theme on load
      if (settings.theme) {
        applyTheme(settings.theme as ThemeName, {
          headerTextColor: settings.headerTextColor || undefined,
          tabTextColor: settings.tabTextColor || undefined,
          tabActiveTextColor: settings.tabActiveTextColor || undefined,
        });
      }
    }
  }, [settings, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: InsertSiteSettings) => {
      const response = await apiRequest("PUT", "/api/settings", data);
      return response.json();
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      
      // Apply the theme immediately after successful save
      if (variables.theme) {
        applyTheme(variables.theme as ThemeName, {
          headerTextColor: variables.headerTextColor || undefined,
          tabTextColor: variables.tabTextColor || undefined,
          tabActiveTextColor: variables.tabActiveTextColor || undefined,
        });
      }
      
      toast({
        title: "Success",
        description: "Site settings and theme updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      form.setValue("logoUrl", data.imageUrl);
      
      toast({
        title: "Logo Uploaded",
        description: "Logo uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaymentMethodsUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      form.setValue("paymentMethodsImage", data.imageUrl);
      
      toast({
        title: "Payment Methods Image Uploaded",
        description: "Payment methods image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload payment methods image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFooterLeftImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      form.setValue("footerLeftImage", data.imageUrl);
      
      toast({
        title: "Footer Image Uploaded",
        description: "Footer left image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload footer image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: InsertSiteSettings) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Site Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="branding">
                  <Palette className="h-4 w-4 mr-2" />
                  Branding
                </TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="footer">Footer</TabsTrigger>
                <TabsTrigger value="login">
                  <Monitor className="h-4 w-4 mr-2" />
                  Login Page
                </TabsTrigger>
                <TabsTrigger value="email">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <FormField
                  control={form.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name</FormLabel>
                      <FormControl>
                        <Input placeholder="InnovanceOrbit" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label htmlFor="logo-upload">Site Logo</Label>
                  <div className="flex items-center gap-4">
                    {form.watch("logoUrl") && (
                      <img
                        src={form.watch("logoUrl") || ""}
                        alt="Site Logo"
                        className="h-12 w-auto border rounded"
                      />
                    )}
                    <div className="flex-1">
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("logo-upload")?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {isUploading ? "Uploading..." : "Upload Logo"}
                      </Button>
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL (Alternative)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.png" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="headerLogoHeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Header Logo Height (px)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="64" 
                            {...field} 
                            value={field.value || 64}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 64)}
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Control the height of the logo in the navigation header (recommended: 48-80px)
                        </p>
                        <FormMessage />
                      </FormItem>  
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="branding" className="space-y-4">
                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme Preset</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          const selectedTheme = themes[value as ThemeName];
                          if (selectedTheme) {
                            // Update form colors when theme changes
                            form.setValue("primaryColor", selectedTheme.primary);
                            form.setValue("secondaryColor", selectedTheme.secondary);
                            form.setValue("accentColor", selectedTheme.accent);
                            form.setValue("backgroundColor", selectedTheme.background);
                            form.setValue("textColor", selectedTheme.text);
                            
                            // Apply theme preview with current text colors
                            applyTheme(value as ThemeName, {
                              headerTextColor: form.getValues("headerTextColor") || "#ffffff",
                              tabTextColor: form.getValues("tabTextColor") || "#64748b", 
                              tabActiveTextColor: form.getValues("tabActiveTextColor") || "#2563eb",
                            });
                          }
                        }} 
                        value={field.value || "default"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a theme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(themes).map(([key, theme]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-4 h-4 rounded-full border-2 border-gray-300"
                                  style={{ backgroundColor: theme.primary }}
                                />
                                <div>
                                  <div className="font-medium">{theme.name}</div>
                                  <div className="text-xs text-muted-foreground">{theme.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Choose a predefined theme or customize colors below
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-4">Custom Colors (Override Theme)</h3>
                  <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "#2563eb"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select primary color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="#ffffff">White</SelectItem>
                            <SelectItem value="#000000">Black</SelectItem>
                            <SelectItem value="#374151">Dark Gray</SelectItem>
                            <SelectItem value="#64748b">Medium Gray</SelectItem>
                            <SelectItem value="#94a3b8">Light Gray</SelectItem>
                            <SelectItem value="#2563eb">Blue</SelectItem>
                            <SelectItem value="#1e40af">Dark Blue</SelectItem>
                            <SelectItem value="#3b82f6">Light Blue</SelectItem>
                            <SelectItem value="#06b6d4">Cyan</SelectItem>
                            <SelectItem value="#0891b2">Teal</SelectItem>
                            <SelectItem value="#059669">Green</SelectItem>
                            <SelectItem value="#16a34a">Light Green</SelectItem>
                            <SelectItem value="#eab308">Yellow</SelectItem>
                            <SelectItem value="#f59e0b">Amber</SelectItem>
                            <SelectItem value="#ea580c">Orange</SelectItem>
                            <SelectItem value="#dc2626">Red</SelectItem>
                            <SelectItem value="#e11d48">Rose</SelectItem>
                            <SelectItem value="#c2410c">Dark Orange</SelectItem>
                            <SelectItem value="#7c3aed">Purple</SelectItem>
                            <SelectItem value="#8b5cf6">Violet</SelectItem>
                            <SelectItem value="#a855f7">Light Purple</SelectItem>
                            <SelectItem value="#ec4899">Pink</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secondaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Color</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "#64748b"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select secondary color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="#ffffff">White</SelectItem>
                            <SelectItem value="#000000">Black</SelectItem>
                            <SelectItem value="#374151">Dark Gray</SelectItem>
                            <SelectItem value="#64748b">Medium Gray</SelectItem>
                            <SelectItem value="#94a3b8">Light Gray</SelectItem>
                            <SelectItem value="#2563eb">Blue</SelectItem>
                            <SelectItem value="#1e40af">Dark Blue</SelectItem>
                            <SelectItem value="#3b82f6">Light Blue</SelectItem>
                            <SelectItem value="#06b6d4">Cyan</SelectItem>
                            <SelectItem value="#0891b2">Teal</SelectItem>
                            <SelectItem value="#059669">Green</SelectItem>
                            <SelectItem value="#16a34a">Light Green</SelectItem>
                            <SelectItem value="#eab308">Yellow</SelectItem>
                            <SelectItem value="#f59e0b">Amber</SelectItem>
                            <SelectItem value="#ea580c">Orange</SelectItem>
                            <SelectItem value="#dc2626">Red</SelectItem>
                            <SelectItem value="#e11d48">Rose</SelectItem>
                            <SelectItem value="#c2410c">Dark Orange</SelectItem>
                            <SelectItem value="#7c3aed">Purple</SelectItem>
                            <SelectItem value="#8b5cf6">Violet</SelectItem>
                            <SelectItem value="#a855f7">Light Purple</SelectItem>
                            <SelectItem value="#ec4899">Pink</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accentColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accent Color</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "#0ea5e9"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select accent color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="#ffffff">White</SelectItem>
                            <SelectItem value="#000000">Black</SelectItem>
                            <SelectItem value="#374151">Dark Gray</SelectItem>
                            <SelectItem value="#64748b">Medium Gray</SelectItem>
                            <SelectItem value="#94a3b8">Light Gray</SelectItem>
                            <SelectItem value="#2563eb">Blue</SelectItem>
                            <SelectItem value="#1e40af">Dark Blue</SelectItem>
                            <SelectItem value="#3b82f6">Light Blue</SelectItem>
                            <SelectItem value="#06b6d4">Cyan</SelectItem>
                            <SelectItem value="#0891b2">Teal</SelectItem>
                            <SelectItem value="#059669">Green</SelectItem>
                            <SelectItem value="#16a34a">Light Green</SelectItem>
                            <SelectItem value="#eab308">Yellow</SelectItem>
                            <SelectItem value="#f59e0b">Amber</SelectItem>
                            <SelectItem value="#ea580c">Orange</SelectItem>
                            <SelectItem value="#dc2626">Red</SelectItem>
                            <SelectItem value="#e11d48">Rose</SelectItem>
                            <SelectItem value="#c2410c">Dark Orange</SelectItem>
                            <SelectItem value="#7c3aed">Purple</SelectItem>
                            <SelectItem value="#8b5cf6">Violet</SelectItem>
                            <SelectItem value="#a855f7">Light Purple</SelectItem>
                            <SelectItem value="#ec4899">Pink</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="backgroundColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Background Color</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "#ffffff"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select background color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="#ffffff">White</SelectItem>
                            <SelectItem value="#f8fafc">Off White</SelectItem>
                            <SelectItem value="#f1f5f9">Light Gray</SelectItem>
                            <SelectItem value="#e2e8f0">Medium Light Gray</SelectItem>
                            <SelectItem value="#cbd5e1">Medium Gray</SelectItem>
                            <SelectItem value="#94a3b8">Dark Gray</SelectItem>
                            <SelectItem value="#64748b">Darker Gray</SelectItem>
                            <SelectItem value="#475569">Very Dark Gray</SelectItem>
                            <SelectItem value="#334155">Almost Black</SelectItem>
                            <SelectItem value="#000000">Black</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="textColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Text Color</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "#1e293b"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select text color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="#ffffff">White</SelectItem>
                            <SelectItem value="#f8fafc">Off White</SelectItem>
                            <SelectItem value="#e2e8f0">Light Gray</SelectItem>
                            <SelectItem value="#94a3b8">Medium Gray</SelectItem>
                            <SelectItem value="#64748b">Dark Gray</SelectItem>
                            <SelectItem value="#475569">Darker Gray</SelectItem>
                            <SelectItem value="#334155">Very Dark Gray</SelectItem>
                            <SelectItem value="#1e293b">Almost Black</SelectItem>
                            <SelectItem value="#000000">Black</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium mb-4">Header & Navigation Text Colors</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="headerTextColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Navigation Text Color</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "#64748b"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select text color" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="#ffffff">White</SelectItem>
                                <SelectItem value="#000000">Black</SelectItem>
                                <SelectItem value="#374151">Dark Gray</SelectItem>
                                <SelectItem value="#64748b">Medium Gray</SelectItem>
                                <SelectItem value="#94a3b8">Light Gray</SelectItem>
                                <SelectItem value="#2563eb">Blue</SelectItem>
                                <SelectItem value="#1e40af">Dark Blue</SelectItem>
                                <SelectItem value="#3b82f6">Light Blue</SelectItem>
                                <SelectItem value="#06b6d4">Cyan</SelectItem>
                                <SelectItem value="#0891b2">Teal</SelectItem>
                                <SelectItem value="#059669">Green</SelectItem>
                                <SelectItem value="#16a34a">Light Green</SelectItem>
                                <SelectItem value="#eab308">Yellow</SelectItem>
                                <SelectItem value="#f59e0b">Amber</SelectItem>
                                <SelectItem value="#ea580c">Orange</SelectItem>
                                <SelectItem value="#dc2626">Red</SelectItem>
                                <SelectItem value="#e11d48">Rose</SelectItem>
                                <SelectItem value="#c2410c">Dark Orange</SelectItem>
                                <SelectItem value="#7c3aed">Purple</SelectItem>
                                <SelectItem value="#8b5cf6">Violet</SelectItem>
                                <SelectItem value="#a855f7">Light Purple</SelectItem>
                                <SelectItem value="#ec4899">Pink</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Default color for navigation items</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tabTextColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hover/Focus Color</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "#2563eb"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select hover color" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="#ffffff">White</SelectItem>
                                <SelectItem value="#000000">Black</SelectItem>
                                <SelectItem value="#374151">Dark Gray</SelectItem>
                                <SelectItem value="#64748b">Medium Gray</SelectItem>
                                <SelectItem value="#94a3b8">Light Gray</SelectItem>
                                <SelectItem value="#2563eb">Blue</SelectItem>
                                <SelectItem value="#1e40af">Dark Blue</SelectItem>
                                <SelectItem value="#3b82f6">Light Blue</SelectItem>
                                <SelectItem value="#06b6d4">Cyan</SelectItem>
                                <SelectItem value="#0891b2">Teal</SelectItem>
                                <SelectItem value="#059669">Green</SelectItem>
                                <SelectItem value="#16a34a">Light Green</SelectItem>
                                <SelectItem value="#eab308">Yellow</SelectItem>
                                <SelectItem value="#f59e0b">Amber</SelectItem>
                                <SelectItem value="#ea580c">Orange</SelectItem>
                                <SelectItem value="#dc2626">Red</SelectItem>
                                <SelectItem value="#e11d48">Rose</SelectItem>
                                <SelectItem value="#c2410c">Dark Orange</SelectItem>
                                <SelectItem value="#7c3aed">Purple</SelectItem>
                                <SelectItem value="#8b5cf6">Violet</SelectItem>
                                <SelectItem value="#a855f7">Light Purple</SelectItem>
                                <SelectItem value="#ec4899">Pink</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Color when hovering over navigation items</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tabActiveTextColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Active/Current Page Color</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "#2563eb"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select active color" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="#ffffff">White</SelectItem>
                                <SelectItem value="#000000">Black</SelectItem>
                                <SelectItem value="#374151">Dark Gray</SelectItem>
                                <SelectItem value="#64748b">Medium Gray</SelectItem>
                                <SelectItem value="#94a3b8">Light Gray</SelectItem>
                                <SelectItem value="#2563eb">Blue</SelectItem>
                                <SelectItem value="#1e40af">Dark Blue</SelectItem>
                                <SelectItem value="#3b82f6">Light Blue</SelectItem>
                                <SelectItem value="#06b6d4">Cyan</SelectItem>
                                <SelectItem value="#0891b2">Teal</SelectItem>
                                <SelectItem value="#059669">Green</SelectItem>
                                <SelectItem value="#16a34a">Light Green</SelectItem>
                                <SelectItem value="#eab308">Yellow</SelectItem>
                                <SelectItem value="#f59e0b">Amber</SelectItem>
                                <SelectItem value="#ea580c">Orange</SelectItem>
                                <SelectItem value="#dc2626">Red</SelectItem>
                                <SelectItem value="#e11d48">Rose</SelectItem>
                                <SelectItem value="#c2410c">Dark Orange</SelectItem>
                                <SelectItem value="#7c3aed">Purple</SelectItem>
                                <SelectItem value="#8b5cf6">Violet</SelectItem>
                                <SelectItem value="#a855f7">Light Purple</SelectItem>
                                <SelectItem value="#ec4899">Pink</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Color for currently active page/tab</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="info@innovanceorbit.com" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supportEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Support Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="support@innovanceorbit.com" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+973 1234 5678" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Business address" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="officeHoursTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office Hours Section Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Office Hours" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office Timing / Business Hours</FormLabel>
                        <FormControl>
                          <Input placeholder="Mon-Fri: 9:00 AM - 6:00 PM, Sat: 10:00 AM - 4:00 PM" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-methods-upload">Payment Methods Image</Label>
                  <div className="flex items-center gap-4">
                    {form.watch("paymentMethodsImage") && (
                      <img
                        src={form.watch("paymentMethodsImage") || ""}
                        alt="Payment methods preview"
                        className="h-16 w-auto border rounded"
                      />
                    )}
                    <div className="flex-1">
                      <input
                        id="payment-methods-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePaymentMethodsUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("payment-methods-upload")?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {isUploading ? "Uploading..." : "Upload Payment Methods Image"}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="paymentMethodsImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Methods Image URL (Alternative)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/payment-methods.png" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="paymentMethodsImageWidth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Methods Image Width (px)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="250" 
                              {...field} 
                              value={field.value || 250}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 250)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="footer" className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Footer Content</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="footer-left-upload">Footer Left Side Image</Label>
                        <div className="flex items-center gap-4">
                          {form.watch("footerLeftImage") && (
                            <img
                              src={form.watch("footerLeftImage") || ""}
                              alt="Footer left image preview"
                              className="h-16 w-auto border rounded"
                            />
                          )}
                          <div className="flex-1">
                            <input
                              id="footer-left-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleFooterLeftImageUpload}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("footer-left-upload")?.click()}
                              disabled={isUploading}
                              className="flex items-center gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              {isUploading ? "Uploading..." : "Upload Footer Left Image"}
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="footerLeftImage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Footer Left Image URL (Alternative)</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com/footer-image.png" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="footerLeftImageWidth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Footer Left Image Width (px)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="200" 
                                    {...field} 
                                    value={field.value || 200}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 200)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="footerDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Footer Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Optional description text below the image..." 
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="copyrightText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Copyright Text</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="© 2025 InnovanceOrbit. All rights reserved." 
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="additionalFooterText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Footer Text</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any additional information to display in the footer" 
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Links Section</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="quickLinksTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Section Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Quick Links" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div></div>

                      <FormField
                        control={form.control}
                        name="quickLinkHome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Home Link Text</FormLabel>
                            <FormControl>
                              <Input placeholder="Home" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="quickLinkProducts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Products Link Text</FormLabel>
                            <FormControl>
                              <Input placeholder="Products" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="quickLinkAbout"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>About Link Text</FormLabel>
                            <FormControl>
                              <Input placeholder="About" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="quickLinkContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Link Text</FormLabel>
                            <FormControl>
                              <Input placeholder="Contact" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>



                  <div>
                    <h3 className="text-lg font-semibold mb-4">Social Media</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="socialTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Section Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Follow Us" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div></div>

                      <FormField
                        control={form.control}
                        name="socialFacebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://facebook.com/yourpage" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="socialTwitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter/X URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://twitter.com/yourhandle" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="socialInstagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://instagram.com/yourhandle" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="socialLinkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://linkedin.com/company/yourcompany" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="login" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Login Page Settings</h3>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="loginPageTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Login Page Title</FormLabel>
                        <FormControl>
                          <Input placeholder="InnovanceOrbit Store" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="loginPageLogo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Login Page Logo</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="Logo URL for login page" {...field} value={field.value || ""} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
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
                                    field.onChange(data.imageUrl);
                                    
                                    toast({
                                      title: "Image Uploaded",
                                      description: "Login page logo has been uploaded successfully.",
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
                                }
                              };
                              input.click();
                            }}
                            disabled={isUploading}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Upload a logo specifically for the login page (separate from header/footer logos)
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="loginPageLogoWidth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Login Page Logo Height (px)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="80" 
                            {...field} 
                            value={field.value || 80}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 80)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("loginPageLogo") && form.watch("loginPageLogo")?.trim() !== "" && (
                    <div className="mt-4">
                      <Label>Preview:</Label>
                      <div className="mt-2 p-4 border rounded-lg bg-gray-50 text-center">
                        <img 
                          src={form.watch("loginPageLogo") || ""} 
                          alt="Login page logo preview" 
                          className="w-auto mx-auto mb-4"
                          style={{ height: `${form.watch("loginPageLogoWidth") || 80}px` }}
                        />
                        {form.watch("loginPageTitle") && form.watch("loginPageTitle")?.trim() !== "" && (
                          <h2 className="text-2xl font-bold text-slate-900">
                            {form.watch("loginPageTitle")}
                          </h2>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {!form.watch("loginPageLogo") || form.watch("loginPageLogo")?.trim() === "" ? (
                    <div className="mt-4">
                      <Label>Preview:</Label>
                      <div className="mt-2 p-4 border rounded-lg bg-gray-50 text-center">
                        <p className="text-gray-500 text-sm">No logo configured</p>
                        {form.watch("loginPageTitle") && form.watch("loginPageTitle")?.trim() !== "" && (
                          <h2 className="text-2xl font-bold text-slate-900 mt-2">
                            {form.watch("loginPageTitle")}
                          </h2>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </TabsContent>

              <TabsContent value="email" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Email Configuration</h3>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="emailEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Enable Email Notifications</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Send order confirmation emails to customers and admin
                          </div>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value || false}
                            onChange={field.onChange}
                            className="rounded border-gray-300"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adminEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Email (Order Notifications)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="admin@innovanceorbit.com" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-slate-900">SMTP Configuration</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="smtpHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Host</FormLabel>
                          <FormControl>
                            <Input placeholder="smtp.office365.com" {...field} value={field.value || "smtp.office365.com"} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="smtpPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Port</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="587" 
                              {...field} 
                              value={field.value || 587}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="smtpUser"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Username</FormLabel>
                          <FormControl>
                            <Input placeholder="your-email@yourdomain.com" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="smtpPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Password / API Key</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Your Microsoft 365 Password" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <div className="text-xs text-muted-foreground">
                            Use your Microsoft 365 password or app password if MFA is enabled
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="smtpFromEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="noreply@yourstore.com" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="smtpFromName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your Store Name" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">Microsoft 365 Setup:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                        <li>Use your full Microsoft 365 email address as username</li>
                        <li>Enter your account password or app password</li>
                        <li>Host: smtp.office365.com, Port: 587</li>
                        <li>STARTTLS encryption (enabled automatically)</li>
                        <li>If MFA is enabled, create an app password in your Microsoft 365 settings</li>
                      </ol>
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h4 className="font-semibold text-amber-900 mb-2">Important Notes:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                        <li>Make sure SMTP authentication is enabled for your account</li>
                        <li>If using multi-factor authentication, you'll need an app password</li>
                        <li>Some organizations may require additional security settings</li>
                        <li>Contact your IT administrator if you encounter issues</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="orderConfirmationTemplate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Confirmation Email Template</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={15}
                          placeholder="HTML email template..."
                          {...field}
                          value={field.value || ""}
                          className="font-mono text-sm"
                        />
                      </FormControl>
                      <div className="text-sm text-muted-foreground">
                        Available variables: orderNumber, customerName, orderDate, totalAmount, paymentMethod, orderItems, siteName (use double curly braces)
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>


            </Tabs>

            <div className="flex justify-end pt-6">
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {updateMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}