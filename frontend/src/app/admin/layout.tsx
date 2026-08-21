'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Admin layout — hides the public Navbar/Footer and protects admin routes.
 * The login page remains public; all other admin pages require authentication.
 * Server-side role authorization remains authoritative for API access.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const navbar = document.querySelector('nav');
    const footer = document.querySelector('footer');
    if (navbar) navbar.style.display = 'none';
    if (footer) footer.style.display = 'none';

    return () => {
      if (navbar) navbar.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  useEffect(() => {
    if (!isLoading && pathname !== '/admin/login' && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (pathname !== '/admin/login' && (isLoading || !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary text-foreground">
        <span>Checking authentication...</span>
      </div>
    );
  }

  return <>{children}</>;
}
