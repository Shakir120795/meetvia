'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Search } from 'lucide-react';
import { adminGet, adminPut } from '@/lib/api';
import { ICompanionApplication, ApiResponse } from '@/types';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

const STATUSES = ['pending', 'reviewing', 'approved', 'rejected'] as const;

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  reviewing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function CompanionsPage() {
  const [applications, setApplications] = useState<ICompanionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ICompanionApplication | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      let path = '/api/v1/admin/companions';
      const params = new URLSearchParams();
      if (activeStatus) params.set('status', activeStatus);
      const queryStr = params.toString();
      if (queryStr) path += `?${queryStr}`;

      const res = await adminGet<ApiResponse<ICompanionApplication[]>>(path);
      setApplications(res.data);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Client-side search filtering since the backend doesn't support search for companions
  const filteredApplications = React.useMemo(() => {
    if (!searchTerm.trim()) return applications;
    const term = searchTerm.toLowerCase();
    return applications.filter(
      (app) =>
        app.fullName.toLowerCase().includes(term) ||
        app.email.toLowerCase().includes(term)
    );
  }, [applications, searchTerm]);

  const openDetail = (app: ICompanionApplication) => {
    setSelectedApp(app);
    setAdminNotes(app.adminNotes || '');
    setDetailOpen(true);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedApp) return;
    try {
      setUpdatingStatus(true);
      const res = await adminPut<ApiResponse<ICompanionApplication>>(
        `/api/v1/admin/companions/${selectedApp._id}`,
        { status: newStatus, adminNotes }
      );
      setSelectedApp(res.data);
      setApplications((prev) =>
        prev.map((a) => (a._id === res.data._id ? res.data : a))
      );
    } catch {
      // Error handled silently
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleNotesUpdate = async () => {
    if (!selectedApp) return;
    try {
      setUpdatingStatus(true);
      const res = await adminPut<ApiResponse<ICompanionApplication>>(
        `/api/v1/admin/companions/${selectedApp._id}`,
        { adminNotes }
      );
      setSelectedApp(res.data);
      setApplications((prev) =>
        prev.map((a) => (a._id === res.data._id ? res.data : a))
      );
    } catch {
      // Error handled silently
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const columns: Column<ICompanionApplication>[] = [
    {
      key: 'fullName',
      header: 'Full Name',
      render: (item) => (
        <span className="font-medium text-white">{item.fullName}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (item) => (
        <span className="text-white/70 text-xs">{item.email}</span>
      ),
    },
    {
      key: 'city',
      header: 'City',
      render: (item) => (
        <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
          {item.city}
        </span>
      ),
    },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (item) => (
        <span className="text-white/70 text-xs">{item.mobile}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span
          className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[item.status] || ''}`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (item) => (
        <span className="text-white/60 text-xs">{formatDate(item.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Companion Applications</h1>
        <p className="text-white/60 text-sm mt-1">
          Review and manage companion applications
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveStatus('')}
          className={`px-3 py-1.5 text-sm rounded-theme border transition-colors duration-200 ${
            activeStatus === ''
              ? 'bg-accent/20 border-accent/50 text-accent'
              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
          }`}
        >
          All
        </button>
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-3 py-1.5 text-sm rounded-theme border capitalize transition-colors duration-200 ${
              activeStatus === status
                ? 'bg-accent/20 border-accent/50 text-accent'
                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-white/5 border border-white/10 rounded-theme pl-10 pr-4 py-2 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors duration-200 text-sm"
        />
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable
          data={filteredApplications}
          columns={columns}
          pageSize={10}
          actions={(item) => (
            <button
              onClick={() => openDetail(item)}
              className="p-1.5 rounded-theme text-white/60 hover:text-accent hover:bg-white/10 transition-colors"
              aria-label={`View application from ${item.fullName}`}
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        />
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Application Details"
      >
        {selectedApp && (
          <div className="space-y-4">
            {/* Contact info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-white/50 mb-0.5">Full Name</p>
                <p className="text-sm text-white">{selectedApp.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-white/50 mb-0.5">Email</p>
                <p className="text-sm text-white">{selectedApp.email}</p>
              </div>
              <div>
                <p className="text-xs text-white/50 mb-0.5">Mobile</p>
                <p className="text-sm text-white">{selectedApp.mobile}</p>
              </div>
              <div>
                <p className="text-xs text-white/50 mb-0.5">City</p>
                <p className="text-sm text-white">{selectedApp.city}</p>
              </div>
              <div>
                <p className="text-xs text-white/50 mb-0.5">Submitted</p>
                <p className="text-sm text-white">{formatDate(selectedApp.createdAt)}</p>
              </div>
            </div>

            {/* Experience */}
            <div>
              <p className="text-xs text-white/50 mb-0.5">Experience</p>
              <p className="text-sm text-white/80 bg-white/5 rounded-theme p-3 border border-white/10">
                {selectedApp.experience}
              </p>
            </div>

            {/* Why Join */}
            <div>
              <p className="text-xs text-white/50 mb-0.5">Why Join Meetvia</p>
              <p className="text-sm text-white/80 bg-white/5 rounded-theme p-3 border border-white/10">
                {selectedApp.whyJoin}
              </p>
            </div>

            {/* Status update */}
            <div>
              <label
                htmlFor="companion-status"
                className="text-xs text-white/50 mb-1.5 block"
              >
                Status
              </label>
              <select
                id="companion-status"
                value={selectedApp.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                disabled={updatingStatus}
                className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200 text-sm capitalize"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize bg-[#0A1628]">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Admin notes */}
            <div>
              <label
                htmlFor="companion-notes"
                className="text-xs text-white/50 mb-1.5 block"
              >
                Admin Notes
              </label>
              <textarea
                id="companion-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this application..."
                className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200 min-h-[80px] resize-y text-sm"
              />
              <div className="flex justify-end mt-2">
                <Button
                  size="sm"
                  onClick={handleNotesUpdate}
                  loading={updatingStatus}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
