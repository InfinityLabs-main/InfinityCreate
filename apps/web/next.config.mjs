/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production';
const realtime = process.env.NEXT_PUBLIC_REALTIME_URL ?? 'http://localhost:4000';
// ws(s):// вариант того же хоста для WebSocket-соединения.
const realtimeWs = realtime.replace(/^http/, 'ws');

// CSP: строгая база. 'unsafe-inline' для стилей нужен Next/Tailwind; в dev
// добавляем 'unsafe-eval' для HMR. connect-src разрешает realtime WS и API.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${realtime} ${realtimeWs}${isDev ? ' ws: http:' : ''}`,
  "media-src 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // HSTS применяется браузером только по HTTPS — в dev по HTTP игнорируется.
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone', // для Docker-образа минимального размера
  transpilePackages: ['@nebula/db'],
  // Гарантируем попадание Prisma query-engine (.so.node) в standalone-трейс —
  // иначе в Alpine рантайме «Query Engine not found».
  outputFileTracingIncludes: {
    '**/*': ['../../node_modules/.pnpm/@prisma+client*/**/*.so.node'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
