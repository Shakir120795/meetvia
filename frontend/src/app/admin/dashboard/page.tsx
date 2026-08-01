'use client';

import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Mail,
  Users,
  HelpCircle,
  MessageSquare,
  MapPin,
  FolderOpen,
} from 'lucide-react';
import { adminGet } from '@/lib/api';
import StatsCard from '@/components/admin/StatsCard';

interface DashboardStats {
  services: number;
  inquiries: number;
  newInquiries: number;
  applications: number;
  faqs: number;
  testimonials: number;
  activeCities: number;
  media: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await adminGet<{ success: boolean; data: DashboardStats }>(
          '/api/v1/admin/dashboard/stats'
        );
        setStats(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load dashboard statistics'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-xl p-5 h-[120px] animate-pulse"
            />
          ))}
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard icon={Briefcase} label="Services" count={stats.services} />
            <StatsCard
              icon={Mail}
              label="Inquiries"
              count={stats.inquiries}
              badge={stats.newInquiries > 0 ? `${stats.newInquiries} new` : undefined}
            />
            <StatsCard icon={Users} label="Applications" count={stats.applications} />
            <StatsCard icon={HelpCircle} label="FAQs" count={stats.faqs} />
            <StatsCard
              icon={MessageSquare}
              label="Testimonials"
              count={stats.testimonials}
            />
            <StatsCard icon={MapPin} label="Active Cities" count={stats.activeCities} />
            <StatsCard icon={FolderOpen} label="Media" count={stats.media} />
          </div>
        )
      )}
    </div>
  );
}
