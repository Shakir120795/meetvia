'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sun, Moon, UserRound } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Become a Companion', href: '/become-companion' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useCustomerAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('meetvia-theme');
    if (saved === 'light') { setIsDark(false); document.documentElement.classList.add('light-mode'); }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.classList.toggle('light-mode', !nextDark);
    localStorage.setItem('meetvia-theme', nextDark ? 'dark' : 'light');
  };

  useEffect(() => setMobileMenuOpen(false), [pathname]);
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg' : 'glass'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-accent tracking-tight">GoWith</Link>
          <ul className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => <li key={link.href}><Link href={link.href} className={`relative py-2 text-sm font-medium transition-colors duration-200 ${isActive(link.href) ? 'text-accent' : 'text-foreground/80 hover:text-accent'}`}>{link.label}{isActive(link.href) && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}</Link></li>)}
          </ul>
          <div className="flex items-center gap-2">
            <Link href={isAuthenticated ? '/profile' : '/login'} className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-foreground/10 px-3 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent" aria-label={isAuthenticated ? 'Open profile' : 'Sign in'}>
              <UserRound className="h-4 w-4" />{isAuthenticated ? 'Profile' : 'Sign in'}
            </Link>
            <button onClick={toggleTheme} className="p-2 rounded-theme text-foreground hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>{isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
            <button className="md:hidden p-2 rounded-theme text-foreground hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/50" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-expanded={mobileMenuOpen} aria-controls="mobile-menu" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}>{mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
          </div>
        </div>
        {mobileMenuOpen && <div id="mobile-menu" className="md:hidden glass mt-2 rounded-theme p-4"><ul className="flex flex-col space-y-3">{NAV_LINKS.map((link) => <li key={link.href}><Link href={link.href} className={`block px-3 py-2 rounded-theme text-sm font-medium ${isActive(link.href) ? 'text-accent bg-accent/10' : 'text-foreground/80 hover:text-accent hover:bg-white/5'}`}>{link.label}</Link></li>)}<li><Link href={isAuthenticated ? '/profile' : '/login'} className="block px-3 py-2 rounded-theme text-sm font-medium text-accent">{isAuthenticated ? 'Profile' : 'Sign in'}</Link></li></ul></div>}
      </nav>
    </header>
  );
}
