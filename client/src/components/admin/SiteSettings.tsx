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
import { Settings, Palette, Mail, Upload, Save } from "lucide-react";
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="branding">
                  <Palette className="h-4 w-4 mr-2" />
                  Branding
                </TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
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
                            <Input placeholder="smtp.sendgrid.net" {...field} value={field.value || "smtp.sendgrid.net"} />
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
                            <Input placeholder="apikey" {...field} value={field.value || "apikey"} />
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
                              placeholder="Your SendGrid API Key" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <div className="text-xs text-muted-foreground">
                            For SendGrid, use your API Key here
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
                      <h4 className="font-semibold text-blue-900 mb-2">SendGrid Setup:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                        <li>Sign up at <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer" className="underline">sendgrid.com</a></li>
                        <li>Verify your sender identity</li>
                        <li>Generate API Key in Settings → API Keys</li>
                        <li>Username: "apikey", Password: Your API Key</li>
                        <li>Host: smtp.sendgrid.net, Port: 587</li>
                      </ol>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">Hostinger Email Setup:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-green-800">
                        <li>Create email account in Hostinger panel</li>
                        <li>Use your domain email as username</li>
                        <li>Enter your email password</li>
                        <li>Host: smtp.hostinger.com, Port: 587</li>
                        <li>Enable STARTTLS encryption</li>
                      </ol>
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