import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Nunito } from 'next/font/google';
import { Celebrations } from '@/components/ui/Celebrations';
import '@/styles/globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-nunito',
});

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
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FECA57',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable} suppressHydrationWarning>
      <body
        className="font-body bg-museum-canvas text-kid-dark antialiased"
        suppressHydrationWarning
      >
        <div className="app-shell">{children}</div>
        <nav className="bottom-nav">
          <Link href="/gallery" className="nav-item">
            <span className="nav-icon">🏛️</span>
            <span className="nav-label">Gallery</span>
          </Link>
          <Link href="/" className="nav-item">
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Home</span>
          </Link>
          <Link href="/studio/canvas" className="nav-item">
            <span className="nav-icon">🎨</span>
            <span className="nav-label">Studio</span>
          </Link>
        </nav>
        <Celebrations />
      </body>
    </html>
  );
}
