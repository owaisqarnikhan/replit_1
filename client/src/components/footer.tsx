import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import type { SiteSettings } from "@shared/schema";

export default function Footer() {
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              {settings?.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt={settings.siteName || "InnovanceOrbit"} 
                  className="h-8 w-auto brightness-0 invert"
                />
              ) : (
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">I</span>
                </div>
              )}
              <h3 className="text-xl font-bold">{settings?.siteName || "InnovanceOrbit"}</h3>
            </div>
            <p className="text-slate-300 mb-6 max-w-md">
              {settings?.footerDescription || "Your trusted partner for premium products and exceptional service in Bahrain."}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              {settings?.contactEmail && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-slate-300">{settings.contactEmail}</span>
                </div>
              )}
              {settings?.contactPhone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-slate-300">{settings.contactPhone}</span>
                </div>
              )}
              {settings?.contactAddress && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-slate-300">{settings.contactAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <nav className="space-y-2">
              <Link href="/" className="block text-slate-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/products" className="block text-slate-300 hover:text-white transition-colors">
                Products
              </Link>
              <Link href="/cart" className="block text-slate-300 hover:text-white transition-colors">
                Cart
              </Link>
              <Link href="/dashboard" className="block text-slate-300 hover:text-white transition-colors">
                Account
              </Link>
            </nav>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <div className="space-y-2 text-slate-300">
              <div>
                <p className="font-medium">Business Hours:</p>
                <p>{settings?.businessHours || "Sun-Thu: 9AM-6PM"}</p>
              </div>
              <div>
                <p className="font-medium">Support:</p>
                <p>{settings?.supportEmail || "support@innovanceorbit.com"}</p>
              </div>
            </div>

            {/* Social Media */}
            {(settings?.socialFacebook || settings?.socialTwitter || settings?.socialInstagram || settings?.socialLinkedin) && (
              <div className="mt-6">
                <h5 className="text-sm font-semibold mb-3">Follow Us</h5>
                <div className="flex space-x-4">
                  {settings?.socialFacebook && (
                    <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" 
                       className="text-slate-400 hover:text-white transition-colors">
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {settings?.socialTwitter && (
                    <a href={settings.socialTwitter} target="_blank" rel="noopener noreferrer"
                       className="text-slate-400 hover:text-white transition-colors">
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {settings?.socialInstagram && (
                    <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer"
                       className="text-slate-400 hover:text-white transition-colors">
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {settings?.socialLinkedin && (
                    <a href={settings.socialLinkedin} target="_blank" rel="noopener noreferrer"
                       className="text-slate-400 hover:text-white transition-colors">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-8 pt-8 text-center">
          <p className="text-slate-400">
            {settings?.copyrightText || `© ${currentYear} InnovanceOrbit. All rights reserved.`}
          </p>
          {settings?.additionalFooterText && (
            <p className="text-slate-500 text-sm mt-2">{settings.additionalFooterText}</p>
          )}
        </div>
      </div>
    </footer>
  );
}