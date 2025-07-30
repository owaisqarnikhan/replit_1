// Predefined theme configurations
export const themes = {
  default: {
    name: "Default Blue",
    description: "Classic blue theme",
    primary: "#2563eb",      // Blue 600
    secondary: "#64748b",    // Slate 500
    accent: "#0ea5e9",       // Sky 500
    background: "#ffffff",    // White
    text: "#1e293b",         // Slate 800
    cssVars: {
      '--primary': 'hsl(218, 82%, 58%)',
      '--primary-foreground': 'hsl(0, 0%, 100%)',
      '--secondary': 'hsl(210, 40%, 50%)',
      '--secondary-foreground': 'hsl(0, 0%, 100%)',
      '--accent': 'hsl(199, 89%, 48%)',
      '--accent-foreground': 'hsl(0, 0%, 100%)'
    }
  },
  ocean: {
    name: "Ocean Blue",
    description: "Deep ocean blues and teals",
    primary: "#0f766e",      // Teal 700
    secondary: "#0891b2",    // Cyan 600
    accent: "#06b6d4",       // Cyan 500
    background: "#f0fdfa",   // Teal 50
    text: "#134e4a",         // Teal 800
    cssVars: {
      '--primary': 'hsl(178, 78%, 25%)',
      '--primary-foreground': 'hsl(0, 0%, 100%)',
      '--secondary': 'hsl(192, 85%, 34%)',
      '--secondary-foreground': 'hsl(0, 0%, 100%)',
      '--accent': 'hsl(188, 96%, 43%)',
      '--accent-foreground': 'hsl(0, 0%, 100%)'
    }
  },
  forest: {
    name: "Forest Green",
    description: "Natural greens and earth tones",
    primary: "#15803d",      // Green 700
    secondary: "#65a30d",    // Lime 600
    accent: "#22c55e",       // Green 500
    background: "#f0fdf4",   // Green 50
    text: "#14532d",         // Green 800
    cssVars: {
      '--primary': 'hsl(142, 76%, 29%)',
      '--primary-foreground': 'hsl(0, 0%, 100%)',
      '--secondary': 'hsl(76, 85%, 34%)',
      '--secondary-foreground': 'hsl(0, 0%, 100%)',
      '--accent': 'hsl(142, 71%, 45%)',
      '--accent-foreground': 'hsl(0, 0%, 100%)'
    }
  },
  sunset: {
    name: "Sunset Orange",
    description: "Warm oranges and yellows",
    primary: "#ea580c",      // Orange 600
    secondary: "#f59e0b",    // Amber 500
    accent: "#facc15",       // Yellow 400
    background: "#fffbeb",   // Amber 50
    text: "#92400e",         // Amber 800
    cssVars: {
      '--primary': 'hsl(24, 90%, 48%)',
      '--primary-foreground': 'hsl(0, 0%, 100%)',
      '--secondary': 'hsl(45, 93%, 47%)',
      '--secondary-foreground': 'hsl(0, 0%, 100%)',
      '--accent': 'hsl(50, 98%, 53%)',
      '--accent-foreground': 'hsl(30, 100%, 20%)'
    }
  },
  midnight: {
    name: "Midnight Dark",
    description: "Dark theme with purple accents",
    primary: "#7c3aed",      // Violet 600
    secondary: "#6366f1",    // Indigo 500
    accent: "#a855f7",       // Purple 500
    background: "#0f0f23",   // Very dark blue
    text: "#e2e8f0",         // Slate 200
    cssVars: {
      '--primary': 'hsl(258, 84%, 56%)',
      '--primary-foreground': 'hsl(0, 0%, 100%)',
      '--secondary': 'hsl(239, 84%, 67%)',
      '--secondary-foreground': 'hsl(0, 0%, 100%)',
      '--accent': 'hsl(283, 89%, 64%)',
      '--accent-foreground': 'hsl(0, 0%, 100%)'
    }
  },
  coral: {
    name: "Coral Pink",
    description: "Soft pinks and corals",
    primary: "#ec4899",      // Pink 500
    secondary: "#f97316",    // Orange 500
    accent: "#fb7185",       // Rose 400
    background: "#fef7f7",   // Rose 50
    text: "#881337",         // Rose 900
    cssVars: {
      '--primary': 'hsl(330, 81%, 60%)',
      '--primary-foreground': 'hsl(0, 0%, 100%)',
      '--secondary': 'hsl(27, 96%, 53%)',
      '--secondary-foreground': 'hsl(0, 0%, 100%)',
      '--accent': 'hsl(351, 95%, 71%)',
      '--accent-foreground': 'hsl(0, 0%, 100%)'
    }
  },
  violet: {
    name: "Royal Violet",
    description: "Rich purples and violets",
    primary: "#9333ea",      // Purple 600
    secondary: "#8b5cf6",    // Violet 500
    accent: "#c084fc",       // Purple 400
    background: "#faf5ff",   // Purple 50
    text: "#581c87",         // Purple 900
    cssVars: {
      '--primary': 'hsl(283, 84%, 56%)',
      '--primary-foreground': 'hsl(0, 0%, 100%)',
      '--secondary': 'hsl(258, 90%, 66%)',
      '--secondary-foreground': 'hsl(0, 0%, 100%)',
      '--accent': 'hsl(283, 95%, 76%)',
      '--accent-foreground': 'hsl(283, 100%, 25%)'
    }
  },
  emerald: {
    name: "Emerald Luxury",
    description: "Rich emeralds and gold accents",
    primary: "#059669",      // Emerald 600
    secondary: "#0d9488",    // Teal 600
    accent: "#10b981",       // Emerald 500
    background: "#ecfdf5",   // Emerald 50
    text: "#064e3b",         // Emerald 900
    cssVars: {
      '--primary': 'hsl(158, 94%, 30%)',
      '--primary-foreground': 'hsl(0, 0%, 100%)',
      '--secondary': 'hsl(178, 84%, 32%)',
      '--secondary-foreground': 'hsl(0, 0%, 100%)',
      '--accent': 'hsl(158, 84%, 38%)',
      '--accent-foreground': 'hsl(0, 0%, 100%)'
    }
  }
} as const;

export type ThemeName = keyof typeof themes;

// Function to apply theme to CSS variables
export function applyTheme(themeName: ThemeName) {
  const theme = themes[themeName];
  if (!theme) return;

  const root = document.documentElement;
  
  // Apply custom CSS variables
  Object.entries(theme.cssVars).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  // Also set our custom theme color variables
  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-secondary', theme.secondary);
  root.style.setProperty('--theme-accent', theme.accent);
  root.style.setProperty('--theme-background', theme.background);
  root.style.setProperty('--theme-text', theme.text);
}