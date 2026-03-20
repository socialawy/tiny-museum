import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { Celebrations } from '@/components/ui/Celebrations';

export const metadata: Metadata = {
  title: 'Tiny Museum',
  description: 'Create, collect, and share your art!',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tiny Museum',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,           // prevent unwanted zoom while drawing
  userScalable: false,
  themeColor: '#FECA57',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="font-body bg-museum-canvas text-kid-dark antialiased">
        <div className="app-shell">
          {children}
        </div>
        <nav className="bottom-nav">
          <a href="/gallery" className="nav-item">
            <span className="nav-icon">🏛️</span>
            <span className="nav-label">Gallery</span>
          </a>
          <a href="/" className="nav-item">
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Home</span>
          </a>
          <a href="/studio/canvas" className="nav-item">
            <span className="nav-icon">🎨</span>
            <span className="nav-label">Studio</span>
          </a>
        </nav>
        <Celebrations />
      </body>
    </html>
  );
}