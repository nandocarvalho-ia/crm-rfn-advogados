import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
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
        // CRM specific colors - Minimalist Blue Scheme
        crm: {
          primary: "hsl(var(--crm-primary))",
          secondary: "hsl(var(--crm-secondary))",
          tertiary: "hsl(var(--crm-tertiary))",
          accent: "hsl(var(--crm-accent))",
          surface: "hsl(var(--crm-surface))",
          success: "hsl(var(--crm-success))",
          "success-light": "hsl(var(--crm-success-light))",
          error: "hsl(var(--crm-error))",
          "error-light": "hsl(var(--crm-error-light))",
        },
        status: {
          active: "hsl(var(--status-active))",
          "active-bg": "hsl(var(--status-active-bg))",
          high: "hsl(var(--status-high))",
          medium: "hsl(var(--status-medium))",
          low: "hsl(var(--status-low))",
          novo: "hsl(var(--status-novo))",
          "novo-bg": "hsl(var(--status-novo-bg))",
          conversando: "hsl(var(--status-conversando))",
          "conversando-bg": "hsl(var(--status-conversando-bg))",
          convertido: "hsl(var(--status-convertido))",
          "convertido-bg": "hsl(var(--status-convertido-bg))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card-subtle': 'var(--shadow-subtle)',
        'card': 'var(--shadow-card)',
        'modal': 'var(--shadow-modal)',
      },
      backgroundImage: {
        'gradient-primary-soft': 'var(--gradient-primary-soft)',
        'gradient-secondary-soft': 'var(--gradient-secondary-soft)',
        'gradient-tertiary-soft': 'var(--gradient-tertiary-soft)',
        'gradient-accent-soft': 'var(--gradient-accent-soft)',
      },
      backgroundColor: {
        'filter-bg': 'var(--filter-bg)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
