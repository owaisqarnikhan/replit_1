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
    <footer 
      className="text-white relative bg-cover bg-center bg-no-repeat min-h-[280px]"
      style={{
        backgroundImage: `url('${settings?.footerBackgroundUrl || '/uploads/footer-background.png'}')`,
      }}
    >
      <div className="absolute inset-0 bg-slate-900/85"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              {settings?.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt={settings.siteName || "InnovanceOrbit"} 
                  className="h-16 w-auto brightness-0 invert"
                />
              ) : (
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">I</span>
                </div>
              )}
              <h3 className="text-2xl font-bold">{settings?.siteName || "InnovanceOrbit"}</h3>
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
            <h4 className="text-lg font-semibold mb-4">{settings?.quickLinksTitle || "Quick Links"}</h4>
            <nav className="space-y-2">
              <Link href="/" className="block text-slate-300 hover:text-white transition-colors">
                {settings?.quickLinkHome || "Home"}
              </Link>
              <Link href="/products" className="block text-slate-300 hover:text-white transition-colors">
                {settings?.quickLinkProducts || "Products"}
              </Link>
              <Link href="/about" className="block text-slate-300 hover:text-white transition-colors">
                {settings?.quickLinkAbout || "About"}
              </Link>
              <Link href="/contact" className="block text-slate-300 hover:text-white transition-colors">
                {settings?.quickLinkContact || "Contact"}
              </Link>
            </nav>
          </div>

          {/* Office Hours & Social Media */}
          <div>
            {/* Office Hours */}
            {settings?.businessHours && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">{settings?.officeHoursTitle || "Office Hours"}</h4>
                <div className="flex items-center space-x-2 text-slate-300">
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{settings.businessHours}</span>
                </div>
              </div>
            )}

            {/* Social Media */}
            {(settings?.socialFacebook || settings?.socialTwitter || settings?.socialInstagram || settings?.socialLinkedin) && (
              <>
                <h4 className="text-lg font-semibold mb-4">{settings?.socialTitle || "Follow Us"}</h4>
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
              </>
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