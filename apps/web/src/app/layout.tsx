import type { Metadata } from 'next';
import './globals.css';

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

// Инлайн-скрипт до гидрации: применяет сохранённую тему без вспышки.
const themeScript = `
(function(){try{
  var t=localStorage.getItem('theme');
  if(t){document.documentElement.setAttribute('data-theme',t);}
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
