import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
// Removed tabs import - only login now available
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type SiteSettings } from "@shared/schema";
import { z } from "zod";
import { Loader2, Store, Shield, Truck, CreditCard, Upload, FileText, X } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { uploadImage } from "@/lib/imageUpload";
import { useToast } from "@/hooks/use-toast";

const loginSchema = insertUserSchema.pick({ username: true, password: true });
type LoginData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { user, loginMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  
  // Upload state
  const [uploadedFiles, setUploadedFiles] = useState<Array<{id: string, name: string, url: string, type: string}>>([]);
  const [isUploading, setIsUploading] = useState(false);

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

  // Super Admin file upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

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
          
          setUploadedFiles(prev => [...prev, fileInfo]);
          
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

    setIsUploading(false);
    // Reset input
    event.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Registration removed - login only

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Forms */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center">
            {settings?.loginPageLogo && settings.loginPageLogo.trim() !== "" && (
              <img 
                src={settings.loginPageLogo} 
                alt={settings.loginPageTitle || "Login"} 
                className="w-auto mx-auto mb-4 sm:mb-6 max-w-full h-auto"
                style={{ 
                  height: `${Math.min(settings.loginPageLogoWidth || 80, 120)}px`,
                  maxHeight: '120px'
                }}
              />
            )}
            {settings?.loginPageTitle && settings.loginPageTitle.trim() !== "" && (
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {settings.loginPageTitle}
              </h1>
            )}
          </div>

          <Card className="shadow-lg border-0 sm:border bg-white dark:bg-gray-800">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl text-center dark:text-white">
                Sign In to Your Account
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4 sm:space-y-5">
                <div>
                  <Label htmlFor="username" className="text-sm font-medium dark:text-gray-200">
                    Username
                  </Label>
                  <Input
                    id="username"
                    {...loginForm.register("username")}
                    className="mt-2 h-11 text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="Enter your username"
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-sm text-red-500 mt-2">
                      {loginForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-sm font-medium dark:text-gray-200">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    {...loginForm.register("password")}
                    className="mt-2 h-11 text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="Enter your password"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-500 mt-2">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium mt-6" 
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
              
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Need an account?</strong> Contact your store administrator for access credentials.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Super Admin Upload Section - Only visible to logged in super admins */}
          {user && (user as any)?.isSuperAdmin && (
            <Card className="shadow-lg border-0 sm:border bg-white dark:bg-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-center dark:text-white flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Super Admin File Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input
                      id="admin-file-upload"
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('admin-file-upload')?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {isUploading ? "Uploading..." : "Upload Files"}
                    </Button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Supports images, PDFs, documents (Max 5MB each)
                    </p>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium dark:text-white">Uploaded Files:</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded border">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {file.type === 'image' ? (
                                <img 
                                  src={file.url} 
                                  alt={file.name}
                                  className="w-8 h-8 object-cover rounded border"
                                />
                              ) : (
                                <FileText className="h-8 w-8 text-gray-500" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm truncate dark:text-white" title={file.name}>
                                  {file.name}
                                </p>
                                <a 
                                  href={file.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  View File
                                </a>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Right side - Background Image (hidden on mobile, visible on large screens) */}
      <div 
        className="hidden lg:flex lg:flex-1 relative overflow-hidden"
        style={{
          backgroundImage: `url('/uploads/login-separator.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Optional overlay for better contrast */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
    </div>
  );
}
