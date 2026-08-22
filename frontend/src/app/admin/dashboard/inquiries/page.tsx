'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Search } from 'lucide-react';
import { adminGet, adminPut } from '@/lib/api';
import { IContactInquiry, ApiResponse } from '@/types';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

const STATUSES = ['new', 'reviewed', 'contacted', 'closed', 'rejected'] as const;
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  reviewed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  contacted: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  closed: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<IContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<IContactInquiry | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      let path = '/api/v1/admin/inquiries';
      const params = new URLSearchParams();
      if (activeStatus) params.set('status', activeStatus);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      const queryStr = params.toString();
      if (queryStr) path += `?${queryStr}`;
      const res = await adminGet<ApiResponse<IContactInquiry[]>>(path);
      setInquiries(res.data);
    } catch {
      // Error state is represented by the empty table while the shared admin API handles auth errors.
    } finally { setLoading(false); }
  }, [activeStatus, searchTerm]);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const openDetail = (inquiry: IContactInquiry) => {
    setSelectedInquiry(inquiry);
    setAdminNotes(inquiry.adminNotes || '');
    setDetailOpen(true);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedInquiry) return;
    try {
      setUpdatingStatus(true);
      const res = await adminPut<ApiResponse<IContactInquiry>>(
        `/api/v1/admin/inquiries/${selectedInquiry.id}`,
        { status: newStatus, adminNotes }
      );
      setSelectedInquiry(res.data);
      setInquiries((prev) => prev.map((i) => (i.id === res.data.id ? res.data : i)));
    } finally { setUpdatingStatus(false); }
  };

  const handleNotesUpdate = async () => {
    if (!selectedInquiry) return;
    try {
      setUpdatingStatus(true);
      const res = await adminPut<ApiResponse<IContactInquiry>>(
        `/api/v1/admin/inquiries/${selectedInquiry.id}`,
        { adminNotes }
      );
      setSelectedInquiry(res.data);
      setInquiries((prev) => prev.map((i) => (i.id === res.data.id ? res.data : i)));
    } finally { setUpdatingStatus(false); }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const columns: Column<IContactInquiry>[] = [
    { key: 'fullName', header: 'Full Name', render: (item) => <span className="font-medium text-white">{item.fullName}</span> },
    { key: 'email', header: 'Email', render: (item) => <span className="text-white/70 text-xs">{item.email}</span> },
    { key: 'serviceType', header: 'Service Type', render: (item) => <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{item.serviceType}</span> },
    { key: 'status', header: 'Status', render: (item) => <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[item.status] || ''}`}>{item.status}</span> },
    { key: 'createdAt', header: 'Date', render: (item) => <span className="text-white/60 text-xs">{formatDate(item.createdAt)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Contact Inquiries</h1>
        <p className="text-white/60 text-sm mt-1">View and manage contact form submissions</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setActiveStatus('')} className={`px-3 py-1.5 text-sm rounded-theme border transition-colors duration-200 ${activeStatus === '' ? 'bg-accent/20 border-accent/50 text-accent' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'}`}>All</button>
        {STATUSES.map((status) => <button key={status} onClick={() => setActiveStatus(status)} className={`px-3 py-1.5 text-sm rounded-theme border capitalize transition-colors duration-200 ${activeStatus === status ? 'bg-accent/20 border-accent/50 text-accent' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'}`}>{status}</button>)}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or email..." className="w-full bg-white/5 border border-white/10 rounded-theme pl-10 pr-4 py-2 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors duration-200 text-sm" />
      </div>

      {loading ? <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" /></div> : <DataTable data={inquiries} columns={columns} pageSize={10} actions={(item) => <button onClick={() => openDetail(item)} className="p-1.5 rounded-theme text-white/60 hover:text-accent hover:bg-white/10 transition-colors" aria-label={`View inquiry from ${item.fullName}`}><Eye className="w-4 h-4" /></button>} />}

      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Inquiry Details">
        {selectedInquiry && <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs text-white/50 mb-0.5">Full Name</p><p className="text-sm text-white">{selectedInquiry.fullName}</p></div>
            <div><p className="text-xs text-white/50 mb-0.5">Email</p><p className="text-sm text-white">{selectedInquiry.email}</p></div>
            <div><p className="text-xs text-white/50 mb-0.5">Mobile</p><p className="text-sm text-white">{selectedInquiry.mobile || '—'}</p></div>
            <div><p className="text-xs text-white/50 mb-0.5">Service Type</p><p className="text-sm text-white">{selectedInquiry.serviceType}</p></div>
            <div><p className="text-xs text-white/50 mb-0.5">Preferred Date</p><p className="text-sm text-white">{selectedInquiry.preferredDate ? formatDate(selectedInquiry.preferredDate) : '—'}</p></div>
            <div><p className="text-xs text-white/50 mb-0.5">Submitted</p><p className="text-sm text-white">{formatDate(selectedInquiry.createdAt)}</p></div>
          </div>
          <div><p className="text-xs text-white/50 mb-0.5">Message</p><p className="text-sm text-white/80 bg-white/5 rounded-theme p-3 border border-white/10">{selectedInquiry.message}</p></div>
          <div><p className="text-xs text-white/50 mb-0.5">Safety Confirmed</p><span className={`text-xs px-2 py-0.5 rounded-full border ${selectedInquiry.safetyConfirmed ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{selectedInquiry.safetyConfirmed ? 'Yes' : 'No'}</span></div>

          <div className="flex gap-2 pt-2 border-t border-white/10">
            {selectedInquiry.mobile && <a href={`https://wa.me/${selectedInquiry.mobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${selectedInquiry.fullName}, this is MeetVia team regarding your ${selectedInquiry.serviceType} inquiry.`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-theme transition-colors">💬 WhatsApp</a>}
            <a href={`mailto:${selectedInquiry.email}?subject=Regarding your MeetVia inquiry&body=Hi ${selectedInquiry.fullName},%0A%0AThank you for your interest in our ${selectedInquiry.serviceType} service.`} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-theme transition-colors">✉️ Email</a>
          </div>

          <div>
            <label htmlFor="inquiry-status" className="text-xs text-white/50 mb-1.5 block">Status</label>
            <select id="inquiry-status" value={selectedInquiry.status} onChange={(e) => handleStatusUpdate(e.target.value)} disabled={updatingStatus} className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200 text-sm capitalize">
              {STATUSES.map((s) => <option key={s} value={s} className="capitalize bg-[#0A1628]">{s}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="inquiry-notes" className="text-xs text-white/50 mb-1.5 block">Admin Notes</label>
            <textarea id="inquiry-notes" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Add notes about this inquiry..." className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200 min-h-[80px] resize-y text-sm" />
            <div className="flex justify-end mt-2"><Button size="sm" onClick={handleNotesUpdate} loading={updatingStatus}>Save Notes</Button></div>
          </div>
        </div>}
      </Modal>
    </div>
  );
}
