import type {Metadata, Viewport} from 'next';
import Script from 'next/script';
import './globals.css';
import { BottomNav } from '@/components/layout/bottom-nav';

export const metadata: Metadata = {
  title: 'Tempo | Precision Timing',
  description: 'A minimalist high-end time tracking and productivity app.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tempo',
  },
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-white text-foreground min-h-screen flex flex-col pb-24 selection:bg-accent/30">
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-8">
          {children}
        </main>
        <BottomNav />
        <Script
          id="remove-vercel-toolbar"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const observer = new MutationObserver(() => {
                  const elements = [
                    'vercel-live-feedback',
                    '#vercel-live-feedback',
                    '.vercel-toolbar-root',
                    '#vercel-toolbar-root'
                  ];
                  elements.forEach(selector => {
                    const el = document.querySelector(selector);
                    if (el) el.style.display = 'none';
                  });
                });
                observer.observe(document.documentElement, { childList: true, subtree: true });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
