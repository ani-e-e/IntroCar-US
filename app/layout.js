import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';

export const metadata = {
  metadataBase: new URL('https://intro-car-us.vercel.app'),
  title: {
    default: 'IntroCar USA | Rolls-Royce & Bentley Parts Specialist',
    template: '%s | IntroCar USA',
  },
  description: 'IntroCar® is the leading international supplier of Rolls-Royce & Bentley parts. 230,000+ genuine, aftermarket & reconditioned spares. 3-year warranty on Prestige Parts®. Fast shipping to USA.',
  keywords: [
    'Bentley parts',
    'Rolls-Royce parts',
    'Prestige Parts',
    'Bentley spares',
    'Rolls-Royce spares',
    'Continental GT parts',
    'Flying Spur parts',
    'Bentayga parts',
    'Silver Shadow parts',
    'Silver Spirit parts',
    'Arnage parts',
    'Mulsanne parts',
    'OEM Bentley',
    'OEM Rolls-Royce',
    'aftermarket luxury car parts',
    'reconditioned Bentley parts',
    'vintage Rolls-Royce parts',
  ],
  authors: [{ name: 'IntroCar Ltd' }],
  creator: 'IntroCar Ltd',
  publisher: 'IntroCar Ltd',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://intro-car-us.vercel.app',
    siteName: 'IntroCar USA',
    title: 'IntroCar USA | Rolls-Royce & Bentley Parts Specialist',
    description: 'The leading international supplier of Rolls-Royce & Bentley parts since 1988. 230,000+ parts available with fast shipping to USA.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'IntroCar - Rolls-Royce & Bentley Parts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IntroCar USA | Rolls-Royce & Bentley Parts',
    description: 'The leading international supplier of Rolls-Royce & Bentley parts since 1988.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://intro-car-us.vercel.app',
  },
  verification: {
    // Add these when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  category: 'automotive',
};

// JSON-LD structured data for the organization
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'IntroCar',
  alternateName: 'IntroCar Ltd',
  url: 'https://intro-car-us.vercel.app',
  logo: 'https://intro-car-us.vercel.app/logo.png',
  description: 'The leading international supplier of Rolls-Royce & Bentley parts since 1988.',
  foundingDate: '1988',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-555-123-4567',
    contactType: 'customer service',
    areaServed: 'US',
    availableLanguage: 'English',
  },
  sameAs: [
    'https://www.introcar.com',
    'https://www.introcar.co.uk',
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-white text-introcar-charcoal antialiased">
        <CurrencyProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
