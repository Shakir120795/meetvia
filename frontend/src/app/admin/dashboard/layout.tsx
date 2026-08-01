'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar from '@/components/layout/AdminSidebar';
import NotificationBell from '@/components/admin/NotificationBell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated (redirect is happening)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-secondary">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Mobile header with hamburger */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-secondary/80 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white/70 hover:text-white transition-colors lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>
            <span className="text-white font-semibold lg:hidden">Meetvia Admin</span>
          </div>
          <NotificationBell />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
