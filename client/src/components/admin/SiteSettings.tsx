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
import { Settings, Palette, Mail, Upload, Save, Monitor, Loader2, Shield, FileText, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { themes, applyTheme, type ThemeName } from "@/lib/themes";
import { useAuth } from "@/hooks/use-auth";

export function SiteSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  
  // Super Admin Login Page Attachments
  const [uploadedAttachments, setUploadedAttachments] = useState<Array<{id: string, name: string, url: string, type: string}>>([]);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);

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
        headerLogoHeight: settings.headerLogoHeight || 64,
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
      const response = await apiRequest("/api/settings", "PUT", data);
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

  // Super Admin Login Page Attachments Upload Handler
  const handleLoginPageAttachmentsUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingAttachments(true);

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const fileInfo = {
            id: Date.now() + Math.random().toString(),
            name: file.name,
            url: data.imageUrl,
            type: file.type.startsWith('image/') ? 'image' : 'file'
          };
          
          setUploadedAttachments(prev => [...prev, fileInfo]);
          
          toast({
            title: "Success",
            description: `${file.name} uploaded successfully`,
          });
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    setIsUploadingAttachments(false);
    // Reset input
    event.target.value = '';
  };

  const removeAttachment = (fileId: string) => {
    setUploadedAttachments(prev => prev.filter(file => file.id !== fileId));
  };

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    try {
      const response = await apiRequest("/api/test-smtp", "POST", {});
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Test Email Sent",
          description: result.message,
        });
      } else {
        toast({
          title: "Test Email Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Test Email Failed",
        description: "Failed to send test email. Please check your SMTP configuration.",
        variant: "destructive",
      });
    } finally {
      setIsTestingEmail(false);
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
                          Control the height of your logo in the navigation header
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
                        Choose a predefined theme for your site's visual appearance
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-4">Text Colors</h3>
                  <div className="grid grid-cols-2 gap-4">
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

                    <FormField
                      control={form.control}
                      name="headerTextColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Navigation Text Color</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "#64748b"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select header text color" />
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

                    <FormField
                      control={form.control}
                      name="tabTextColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tab Text Color</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "#2563eb"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tab text color" />
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
                              <SelectItem value="#2563eb">Blue</SelectItem>
                              <SelectItem value="#1e40af">Dark Blue</SelectItem>
                              <SelectItem value="#3b82f6">Light Blue</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tabActiveTextColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Active Tab Text Color</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "#2563eb"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select active tab text color" />
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
                              <SelectItem value="#2563eb">Blue</SelectItem>
                              <SelectItem value="#1e40af">Dark Blue</SelectItem>
                              <SelectItem value="#3b82f6">Light Blue</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@innovanceorbit.com" {...field} value={field.value || ""} />
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
                        <Input placeholder="support@innovanceorbit.com" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email (for notifications)</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@innovanceorbit.com" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                        <Textarea placeholder="123 Main Street, Manama, Bahrain" {...field} value={field.value || ""} />
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
                      <FormLabel>Business Hours</FormLabel>
                      <FormControl>
                        <Input placeholder="Mon-Fri: 9:00 AM - 6:00 PM" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
              </TabsContent>

              <TabsContent value="footer" className="space-y-4">
                <FormField
                  control={form.control}
                  name="footerDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Footer Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Your company description for the footer" {...field} value={field.value || ""} />
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
                        <Input placeholder="© 2025 InnovanceOrbit. All rights reserved." {...field} value={field.value || ""} />
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
                        <Textarea placeholder="Additional text to display in footer" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Quick Links Section</h3>
                  <FormField
                    control={form.control}
                    name="quickLinksTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quick Links Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Quick Links" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Social Media</h3>
                  <FormField
                    control={form.control}
                    name="socialTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Media Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Follow Us" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
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
                          <FormLabel>Twitter URL</FormLabel>
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

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Footer Images</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="footer-left-upload">Footer Left Image</Label>
                    <div className="flex items-center gap-4">
                      {form.watch("footerLeftImage") && (
                        <img
                          src={form.watch("footerLeftImage") || ""}
                          alt="Footer Left"
                          className="h-12 w-auto border rounded"
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
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploading ? "Uploading..." : "Upload Footer Image"}
                        </Button>
                      </div>
                    </div>
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

                  <div className="space-y-2">
                    <Label htmlFor="payment-methods-upload">Payment Methods Image</Label>
                    <div className="flex items-center gap-4">
                      {form.watch("paymentMethodsImage") && (
                        <img
                          src={form.watch("paymentMethodsImage") || ""}
                          alt="Payment Methods"
                          className="h-12 w-auto border rounded"
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
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploading ? "Uploading..." : "Upload Payment Methods"}
                        </Button>
                      </div>
                    </div>
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

              <TabsContent value="login" className="space-y-4">
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
                      <FormLabel>Login Page Logo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/login-logo.png" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="loginPageLogoWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Login Page Logo Width (px)</FormLabel>
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

                {/* Super Admin Login Page Attachments Section */}
                {(user as any)?.isSuperAdmin && (
                  <div className="mt-8 p-6 border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Super Admin Login Page Attachments</h3>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                      Upload files and attachments that will be available for reference during login. These are only visible to super admins.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-6 text-center bg-white dark:bg-gray-800">
                        <input
                          id="login-attachments-upload"
                          type="file"
                          multiple
                          accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls"
                          className="hidden"
                          onChange={handleLoginPageAttachmentsUpload}
                          disabled={isUploadingAttachments}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('login-attachments-upload')?.click()}
                          disabled={isUploadingAttachments}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          {isUploadingAttachments ? "Uploading..." : "Upload Login Page Attachments"}
                        </Button>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Supports images, PDFs, documents, spreadsheets (Max 5MB each)
                        </p>
                      </div>

                      {/* Uploaded Attachments List */}
                      {uploadedAttachments.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Uploaded Files:</h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {uploadedAttachments.map((file) => (
                              <div key={file.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  {file.type === 'image' ? (
                                    <img 
                                      src={file.url} 
                                      alt={file.name}
                                      className="w-10 h-10 object-cover rounded border"
                                    />
                                  ) : (
                                    <FileText className="h-10 w-10 text-blue-500" />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate dark:text-white" title={file.name}>
                                      {file.name}
                                    </p>
                                    <a 
                                      href={file.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:underline"
                                    >
                                      Download / View File
                                    </a>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttachment(file.id)}
                                  className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Microsoft 365 Email Setup</h3>
                  <p className="text-sm text-blue-700 mb-2">
                    For Microsoft 365 accounts with MFA enabled, you need to use an App Password instead of your regular password.
                  </p>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Go to your Microsoft 365 Security dashboard</li>
                    <li>Navigate to "Additional security verification"</li>
                    <li>Click "Create and manage app passwords"</li>
                    <li>Generate a new app password for "Email Application"</li>
                    <li>Use this app password in the SMTP Password field below</li>
                  </ol>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border">
                  <h3 className="text-sm font-medium text-amber-900 mb-2">SMTP Authentication Issues?</h3>
                  <p className="text-sm text-amber-700 mb-2">
                    If you get "Authentication unsuccessful" errors, your Microsoft 365 tenant may have SMTP authentication disabled.
                  </p>
                  <p className="text-sm text-amber-700 mb-2">
                    Contact your IT administrator to enable SMTP authentication in the Microsoft 365 Admin Center under Security &amp; Compliance &gt; Basic Authentication policies.
                  </p>
                  <div className="bg-amber-100 p-3 rounded mt-2">
                    <p className="text-xs text-amber-800 font-medium">PowerShell Command for IT Admin:</p>
                    <code className="text-xs text-amber-900 block mt-1">
                      Set-CasMailbox -Identity "itsupport@bayg.bh" -SmtpClientAuthenticationDisabled $false
                    </code>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="emailEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Email Notifications</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Send order confirmations and notifications to customers
                        </div>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value || false}
                          onChange={field.onChange}
                          className="w-4 h-4"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtpHost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Host</FormLabel>
                      <FormControl>
                        <Input placeholder="smtp.office365.com" {...field} value={field.value || ""} />
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
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 587)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtpUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Username (Email Address)</FormLabel>
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
                      <FormLabel>SMTP Password (or App Password for MFA)</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="your-password-or-app-password" 
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
                  name="smtpFromEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="noreply@yourdomain.com" {...field} value={field.value || ""} />
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
                        <Input placeholder="InnovanceOrbit" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderConfirmationTemplate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Confirmation Email Template</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={10} 
                          placeholder="HTML email template with placeholders like {{orderNumber}}, {{customerName}}, etc." 
                          {...field} 
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        Available placeholders: {`{{orderNumber}}, {{customerName}}, {{totalAmount}}, {{orderDate}}, {{paymentMethod}}, {{orderItems}}, {{siteName}}`}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-medium">Email Testing</h3>
                  <div className="bg-amber-50 p-4 rounded-lg border">
                    <p className="text-sm text-amber-800 mb-3">
                      Test your SMTP configuration by sending a test email. Make sure to save your settings first.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestEmail}
                      disabled={isTestingEmail}
                      className="w-full"
                    >
                      {isTestingEmail ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending Test Email...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Test Email
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <div className="flex justify-end pt-6 border-t">
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updateMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </Tabs>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}