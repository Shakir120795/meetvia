import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { CustomerAuthProvider } from '@/context/CustomerAuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'GoWith — Find someone to go with.',
  description: 'Find trusted local companions for travel, city exploration and experiences.',
  openGraph: { title: 'GoWith — Find someone to go with.', description: 'Travel better with a trusted companion by your side.', type: 'website', siteName: 'GoWith' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeProvider>
          <AuthProvider>
            <CustomerAuthProvider>
              <Navbar />
              <main className="flex-1 pt-16">{children}</main>
              <Footer />
            </CustomerAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
