'use client';

import { useEffect } from 'react';

/**
 * Admin layout — hides the public Navbar and Footer for admin pages.
 * Task 12.2 will expand this with sidebar navigation and auth guard.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Hide public navbar and footer on admin pages
    const navbar = document.querySelector('nav');
    const footer = document.querySelector('footer');
    if (navbar) navbar.style.display = 'none';
    if (footer) footer.style.display = 'none';

    return () => {
      if (navbar) navbar.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  return <>{children}</>;
}
