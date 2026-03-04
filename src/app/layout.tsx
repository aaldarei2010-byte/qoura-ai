import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/language-context';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Qoura AI | قرى للذكاء الاصطناعي',
  description: 'فريق إماراتي متخصص في تدريب واستشارات وحلول الذكاء الاصطناعي - Emirati team specialized in AI training, consulting, and solutions for government, private sector, and education in UAE',
  keywords: ['AI', 'artificial intelligence', 'AI training UAE', 'AI consulting Abu Dhabi', 'AI solutions', 'تدريب ذكاء اصطناعي', 'استشارات ذكاء اصطناعي', 'قرى للذكاء الاصطناعي', 'Qoura AI', 'UAE AI company', 'AI training programs', 'children AI program', 'digital transformation UAE'],
  authors: [{ name: 'Qoura AI' }],
  metadataBase: new URL('https://qoura.ai'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/icon-192.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Qoura AI | قرى للذكاء الاصطناعي',
    description: 'Emirati team specialized in AI training, consulting, and solutions for government, private sector, and education in UAE',
    type: 'website',
    url: 'https://qoura.ai',
    siteName: 'Qoura AI',
    locale: 'ar_AE',
    alternateLocale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qoura AI | قرى للذكاء الاصطناعي',
    description: 'Emirati team specialized in AI training, consulting, and solutions in UAE',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://qoura.ai/#organization',
      name: 'Qoura AI',
      alternateName: 'قرى للذكاء الاصطناعي',
      url: 'https://qoura.ai',
      logo: 'https://qoura.ai/logo.png',
      email: 'info@qoura.ai',
      telephone: '+971507300052',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Abu Dhabi',
        addressCountry: 'AE',
      },
      sameAs: [],
      description: 'Emirati team specialized in AI training, consulting, and solutions for government, private sector, and education in UAE',
    },
    {
      '@type': 'LocalBusiness',
      '@id': 'https://qoura.ai/#localbusiness',
      name: 'Qoura AI',
      image: 'https://qoura.ai/logo.png',
      url: 'https://qoura.ai',
      telephone: '+971507300052',
      email: 'info@qoura.ai',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Abu Dhabi',
        addressCountry: 'AE',
      },
      openingHours: 'Mo-Fr 09:00-18:00',
      priceRange: '$$',
      areaServed: {
        '@type': 'Country',
        name: 'United Arab Emirates',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://qoura.ai/#website',
      url: 'https://qoura.ai',
      name: 'Qoura AI',
      publisher: { '@id': 'https://qoura.ai/#organization' },
      inLanguage: ['ar', 'en'],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <LanguageProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
