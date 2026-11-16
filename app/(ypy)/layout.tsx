import type { Metadata, Viewport } from 'next';
import { Archivo, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import './ypy.css';

const display = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--f-display',
  display: 'swap',
});

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--f-serif',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--f-mono',
  display: 'swap',
});

const title = 'YPY — The intelligence beneath the surface';
const description =
  'YPY is a Brazilian deep-tech startup building an ecosystem of autonomous robotics, intelligent sensing and agricultural intelligence that turns what happens below the soil surface into operational insight.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'YPY',
    'agricultural intelligence',
    'autonomous rover',
    'soil moisture monitoring',
    'territorial intelligence',
    'agtech',
    'deep tech',
    'precision agriculture',
  ],
  openGraph: { title, description, type: 'website', siteName: 'YPY', locale: 'en_US' },
  twitter: { card: 'summary', title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0c0b09',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function YpyLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${mono.variable}`}>
      <head>
        {/* Marks the document as JS-capable before paint so scroll reveals never flash. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="ypy">{children}</body>
    </html>
  );
}
