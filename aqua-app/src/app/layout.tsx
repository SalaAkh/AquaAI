import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AquaAI — AI-Powered Smart Irrigation for Central Asia',
  description:
    'Smarter irrigation. Every drop counts. Real-time FAO-56 Penman-Monteith crop water modeling, Open-Meteo weather integration, Gemini AI agronomic advisor, and Solana Devnet verification.',
  keywords: [
    'Smart Irrigation',
    'Central Asia',
    'Kazakhstan Agriculture',
    'FAO-56',
    'Evapotranspiration',
    'Open-Meteo',
    'Solana Devnet',
    'Climate Tech',
    'Aral Sea Conservation',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-sky-500 selection:text-white"
      >
        {children}
      </body>
    </html>
  );
}
