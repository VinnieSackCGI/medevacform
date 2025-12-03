/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Official Brand Colors - Exact values
        'black-pearl': 'var(--black-pearl)', // #0a2240
        'tarawera': 'var(--tarawera)',       // #0a314d
        'merlot': 'var(--merlot)',           // #981b1e
        'alizarin-crimson': 'var(--alizarin-crimson)', // #d01319
        'smalt': 'var(--smalt)',             // #002d74
        'matisse': 'var(--matisse)',         // #205493
        'gold-accent': 'var(--gold-accent)', // Alert gold
        
        // Theme-aware colors
        'theme-bg': {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)', 
          tertiary: 'var(--bg-tertiary)',
          accent: 'var(--bg-accent)',
        },
        'theme-text': {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
        },
        'theme-border': {
          primary: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
          accent: 'var(--border-accent)',
        },
        'theme-status': {
          success: 'var(--success)',
          warning: 'var(--gold-accent)',  // Using gold accent
          error: 'var(--alizarin-crimson)', // Using exact crimson
          info: 'var(--matisse)',         // Using exact Matisse
        },
        // Shadcn/ui colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
        'theme-xl': 'var(--shadow-xl)',
      },
      fontFamily: {
        'garamond': ['EB Garamond', 'serif'],
        'open-sans': ['Open Sans', 'sans-serif'],
        'sans': ['Open Sans', 'sans-serif'],
        'serif': ['EB Garamond', 'serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}