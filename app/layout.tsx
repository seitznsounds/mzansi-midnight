import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PwaRegistrar } from '../components/PwaRegistrar';

export const viewport: Viewport = {
  themeColor: '#f59e0b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'eThekwini-Gold // Mzansi Midnight',
  description:
    'A Dice-and-Node Noir RPG set in a captured South African metropolis.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mzansi Midnight',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 text-zinc-100">
        <PwaRegistrar />
        {children}
      </body>
    </html>
  );
}
