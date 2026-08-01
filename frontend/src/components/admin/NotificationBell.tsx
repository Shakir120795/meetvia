'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { adminGet } from '@/lib/api';

interface DashboardStats {
  newInquiries: number;
}

/**
 * Notification bell that polls for new inquiries every 30 seconds.
 * Shows a red badge with count when new inquiries exist.
 * Triggers browser notification when count increases.
 */
export default function NotificationBell() {
  const [newCount, setNewCount] = useState(0);
  const [lastCount, setLastCount] = useState(0);
  const [showDot, setShowDot] = useState(false);

  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const checkForNew = useCallback(async () => {
    try {
      const res = await adminGet<{ success: boolean; data: DashboardStats }>(
        '/api/v1/admin/dashboard/stats'
      );
      const count = res.data.newInquiries;
      setNewCount(count);

      // If count increased since last check, send browser notification
      if (count > lastCount && lastCount > 0) {
        setShowDot(true);
        sendBrowserNotification(count - lastCount);
      }
      setLastCount(count);
    } catch {
      // Silently fail
    }
  }, [lastCount]);

  // Poll every 30 seconds
  useEffect(() => {
    checkForNew();
    const interval = setInterval(checkForNew, 30000);
    return () => clearInterval(interval);
  }, [checkForNew]);

  const sendBrowserNotification = (newCount: number) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Meetvia - New Inquiry!', {
        body: `${newCount} new inquiry${newCount > 1 ? 's' : ''} received.`,
        icon: '/favicon.ico',
      });
    }
  };

  return (
    <div className="relative">
      <Bell className="w-5 h-5 text-white/70" />
      {(newCount > 0 || showDot) && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {newCount > 9 ? '9+' : newCount}
        </span>
      )}
    </div>
  );
}
