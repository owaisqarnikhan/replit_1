import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { applyTheme, type ThemeName } from "@/lib/themes";
import type { SiteSettings } from "@shared/schema";

/**
 * Hook to automatically apply the current theme from site settings
 */
export function useTheme() {
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings?.theme) {
      applyTheme(settings.theme as ThemeName);
    }
  }, [settings?.theme]);

  return {
    currentTheme: settings?.theme || "default",
    settings,
  };
}