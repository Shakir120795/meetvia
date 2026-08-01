'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  count: number;
  badge?: string;
}

export default function StatsCard({ icon: Icon, label, count, badge }: StatsCardProps) {
  return (
    <div className="relative bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-3 hover:bg-white/10 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <Icon size={20} className="text-accent" />
        </div>
        {badge && (
          <span className="text-xs font-medium bg-accent/20 text-accent px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{count}</p>
        <p className="text-sm text-white/60 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
