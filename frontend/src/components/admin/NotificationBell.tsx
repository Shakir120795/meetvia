'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { adminGet } from '@/lib/api';

interface DashboardStats { newInquiries: number; }

export default function NotificationBell() {
  const [newCount, setNewCount] = useState(0);
  const [lastCount, setLastCount] = useState(0);
  const [showDot, setShowDot] = useState(false);

  const sendBrowserNotification = useCallback((count: number) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('MeetVia - New Inquiry!', {
        body: `${count} new inquiry${count > 1 ? 's' : ''} received.`,
        icon: '/favicon.ico',
      });
    }
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') void Notification.requestPermission();
  }, []);

  const checkForNew = useCallback(async () => {
    try {
      const res = await adminGet<{ success: boolean; data: DashboardStats }>('/api/v1/admin/dashboard/stats');
      const count = res.data.newInquiries;
      setNewCount(count);
      if (count > lastCount && lastCount > 0) {
        setShowDot(true);
        sendBrowserNotification(count - lastCount);
      }
      setLastCount(count);
    } catch {
      // Polling failure is intentionally non-blocking for the admin UI.
    }
  }, [lastCount, sendBrowserNotification]);

  useEffect(() => {
    void checkForNew();
    const interval = setInterval(() => void checkForNew(), 30000);
    return () => clearInterval(interval);
  }, [checkForNew]);

  return (
    <div className="relative">
      <Bell className="h-5 w-5 text-white/70" />
      {(newCount > 0 || showDot) && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{newCount > 9 ? '9+' : newCount}</span>}
    </div>
  );
}
