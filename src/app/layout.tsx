import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/language-context';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Qoura AI | قرى للذكاء الاصطناعي',
  description: 'فريق إماراتي متخصص في تدريب واستشارات وحلول الذكاء الاصطناعي - Emirati team specialized in AI training, consulting, and solutions',
  keywords: ['AI', 'artificial intelligence', 'training', 'consulting', 'UAE', 'Abu Dhabi', 'Al Ain', 'ذكاء اصطناعي', 'تدريب', 'استشارات', 'قرى'],
  authors: [{ name: 'Qoura AI' }],
  icons: {
    icon: '/favicon.png',
    apple: '/icon-192.png',
  },
  openGraph: {
    title: 'Qoura AI | قرى للذكاء الاصطناعي',
    description: 'فريق إماراتي متخصص في تدريب واستشارات وحلول الذكاء الاصطناعي',
    type: 'website',
    locale: 'ar_AE',
    alternateLocale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
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
