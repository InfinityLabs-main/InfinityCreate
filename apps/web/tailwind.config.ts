import type { Config } from 'tailwindcss';

// Дизайн-токены Nebula. Значения экспонируются в CSS через переменные
// (см. globals.css), сюда мапятся семантические имена для утилит Tailwind.
const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ground: 'hsl(var(--ground) / <alpha-value>)',
        panel: 'hsl(var(--panel) / <alpha-value>)',
        ink: {
          DEFAULT: 'hsl(var(--ink) / <alpha-value>)',
          soft: 'hsl(var(--ink-soft) / <alpha-value>)',
          faint: 'hsl(var(--ink-faint) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          2: 'hsl(var(--accent-2) / <alpha-value>)',
        },
        hair: 'hsl(var(--hair) / <alpha-value>)',
        ok: 'hsl(var(--ok) / <alpha-value>)',
        warn: 'hsl(var(--warn) / <alpha-value>)',
        risk: 'hsl(var(--risk) / <alpha-value>)',
        info: 'hsl(var(--info) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '20px',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-2)))',
      },
      boxShadow: {
        card: '0 1px 2px hsl(var(--shadow-1)), 0 12px 32px -12px hsl(var(--shadow-2))',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease both',
      },
    },
  },
  plugins: [],
};

export default config;
