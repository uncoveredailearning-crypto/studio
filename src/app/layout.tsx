import type {Metadata, Viewport} from 'next';
import './globals.css';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Tempo | Precision Timing',
  description: 'A minimalist high-end time tracking and productivity app.',
  manifest: '/manifest.json',
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-white text-foreground min-h-screen flex flex-col pb-24">
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-8">
          {children}
        </main>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}