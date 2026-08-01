import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Meetvia',
  description:
    'Professional public companionship and visitor assistance services in India. Structured, safe, public-only city assistance for domestic and international visitors.',
  openGraph: {
    title: 'Meetvia',
    description:
      'Professional public companionship and visitor assistance services in India.',
    type: 'website',
    siteName: 'Meetvia',
    images: [
      {
        url: 'https://meetvia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Meetvia - Professional Public Companionship Services',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
