import type { Metadata } from 'next';
import { Manrope, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Display — Manrope (геометрический гротеск с полной кириллицей; близок к
// Space Grotesk из макета, но, в отличие от него, поддерживает русский).
const display = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

// Body — Inter.
const body = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

// Mono — JetBrains Mono (метрики, лог, чипы, eyebrow).
const mono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Nebula — цифровые продукты под ключ',
    template: '%s · Nebula',
  },
  description:
    'Разработка сайтов, Telegram-ботов, веб- и мобильных приложений, автоматизация бизнеса, CRM, DevOps и SaaS.',
  metadataBase: new URL(process.env.APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Nebula',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      data-theme="dark"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
