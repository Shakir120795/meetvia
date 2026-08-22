'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaInstagram, FaFacebook, FaYoutube, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { publicGet } from '@/lib/api';
import { ISocialLink } from '@/types';

interface FooterData { description: string; socialLinks: ISocialLink[]; }
interface FooterApiResponse { success: boolean; data: FooterData; }

const LEGAL_LINKS = [
  { label: 'Safety Policy', href: '/safety-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Refund Policy', href: '/refund-policy' },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = { instagram: FaInstagram, facebook: FaFacebook, youtube: FaYoutube, linkedin: FaLinkedin, whatsapp: FaWhatsapp };

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  useEffect(() => {
    publicGet<FooterApiResponse>('/api/v1/public/footer').then((response) => {
      if (response.success && response.data) setFooterData(response.data);
    }).catch(() => undefined);
  }, []);

  const visibleLinks = footerData?.socialLinks?.filter((link) => link.isVisible).sort((a, b) => a.displayOrder - b.displayOrder) ?? [];

  return (
    <footer className="glass mt-auto border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-bold text-accent tracking-tight">MeetVia</Link>
            <p className="text-foreground/70 text-sm max-w-xs">{footerData?.description || 'Find trusted companions for travel, city exploration and shared experiences.'}</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">{LEGAL_LINKS.map((link) => <li key={link.href}><Link href={link.href} className="text-sm text-foreground/70 hover:text-accent transition-colors">{link.label}</Link></li>)}</ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Follow Us</h3>
            <div className="flex items-center gap-4">{visibleLinks.map((social) => { const IconComponent = ICON_MAP[social.platform.toLowerCase()] || ICON_MAP[social.iconIdentifier?.toLowerCase()]; if (!IconComponent) return null; return <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={`Follow us on ${social.platform}`} className="text-foreground/70 hover:text-accent transition-colors"><IconComponent className="w-8 h-8" /></a>; })}</div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 text-center"><p className="text-xs text-foreground/50">&copy; {new Date().getFullYear()} MeetVia. All rights reserved.</p></div>
      </div>
    </footer>
  );
}
