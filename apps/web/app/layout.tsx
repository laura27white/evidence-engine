import { IBM_Plex_Sans, JetBrains_Mono, Source_Serif_4 } from 'next/font/google';

import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const display = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Evidence Engine',
  description:
    'Forecast-driven early warning system for project assumption drift. MPA Challenge 5.',
  applicationName: 'Evidence Engine',
  authors: [{ name: 'Laura White' }],
  creator: 'Laura White',
  robots: { index: false, follow: false },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
