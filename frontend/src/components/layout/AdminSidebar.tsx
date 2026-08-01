'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Palette,
  Image,
  Briefcase,
  FolderOpen,
  HelpCircle,
  MessageSquare,
  MapPin,
  Mail,
  Users,
  FileText,
  Globe,
  Settings,
  LogOut,
  X,
  ListOrdered,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Theme', href: '/admin/dashboard/theme', icon: <Palette size={20} /> },
  { label: 'Hero', href: '/admin/dashboard/hero', icon: <Image size={20} /> },
  { label: 'Services', href: '/admin/dashboard/services', icon: <Briefcase size={20} /> },
  { label: 'Media', href: '/admin/dashboard/media', icon: <FolderOpen size={20} /> },
  { label: 'FAQ', href: '/admin/dashboard/faq', icon: <HelpCircle size={20} /> },
  { label: 'Testimonials', href: '/admin/dashboard/testimonials', icon: <MessageSquare size={20} /> },
  { label: 'Cities', href: '/admin/dashboard/cities', icon: <MapPin size={20} /> },
  { label: 'How It Works', href: '/admin/dashboard/how-it-works', icon: <ListOrdered size={20} /> },
  { label: 'Inquiries', href: '/admin/dashboard/inquiries', icon: <Mail size={20} /> },
  { label: 'Applications', href: '/admin/dashboard/companions', icon: <Users size={20} /> },
  { label: 'Pages', href: '/admin/dashboard/pages', icon: <FileText size={20} /> },
  { label: 'Footer/Social', href: '/admin/dashboard/footer', icon: <Globe size={20} /> },
  { label: 'Settings', href: '/admin/dashboard/settings', icon: <Settings size={20} /> },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64
          bg-white/10 backdrop-blur-xl border-r border-white/20
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Branding */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white tracking-wide">Meetvia</span>
            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">Admin</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-white/70 hover:text-white transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium transition-all duration-200
                  ${
                    active
                      ? 'bg-accent/20 text-accent shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <span className={active ? 'text-accent' : 'text-white/50'}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
              text-sm font-medium text-red-400 hover:text-red-300
              hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
