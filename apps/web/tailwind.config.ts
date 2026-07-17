import type { Config } from 'tailwindcss';

// Дизайн-токены Nebula (тёмная тема). Значения — в globals.css через CSS-переменные.
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ground: 'hsl(var(--ground) / <alpha-value>)',
        panel: {
          DEFAULT: 'hsl(var(--panel) / <alpha-value>)',
          2: 'hsl(var(--panel-2) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'hsl(var(--ink) / <alpha-value>)',
          soft: 'hsl(var(--ink-soft) / <alpha-value>)',
          faint: 'hsl(var(--ink-faint) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          2: 'hsl(var(--accent-2) / <alpha-value>)',
        },
        mint: 'hsl(var(--mint) / <alpha-value>)',
        hair: 'hsl(var(--hair) / <alpha-value>)',
        ok: 'hsl(var(--ok) / <alpha-value>)',
        warn: 'hsl(var(--warn) / <alpha-value>)',
        risk: 'hsl(var(--risk) / <alpha-value>)',
        info: 'hsl(var(--info) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '16px',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-2)))',
      },
      boxShadow: {
        card: '0 1px 2px hsl(var(--shadow-1)), 0 20px 50px -30px hsl(var(--shadow-2))',
        glow: '0 6px 22px -6px hsl(var(--glow))',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%,60%,100%': { opacity: '1' },
          '30%': { opacity: '.35' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease both',
        blink: 'blink 2.4s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
