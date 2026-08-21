'use client';

import { useEffect, useState } from 'react';
import { adminGet, adminPatch } from '@/lib/api';

type User = { id: string; email?: string | null; mobile?: string | null; status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'; emailVerifiedAt?: string | null; mobileVerifiedAt?: string | null; createdAt: string; profile?: { displayName?: string | null } | null; roles: { role: { name: string } }[] };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { const response = await adminGet<{ success: boolean; data: User[] }>('/api/v1/admin/users'); setUsers(response.data); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load users.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const updateStatus = async (id: string, status: User['status']) => {
    try { await adminPatch(`/api/v1/admin/users/${id}/status`, { status }); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to update user.'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold text-white">Customers</h1><p className="mt-1 text-sm text-white/50">Manage customer identity and account status.</p></div><span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">{users.length} users</span></div>
      {error && <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03]">
        <table className="w-full text-left text-sm"><thead className="border-b border-white/10 text-white/50"><tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody className="divide-y divide-white/10">{loading ? <tr><td colSpan={5} className="px-4 py-10 text-center text-white/40">Loading…</td></tr> : users.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-white/40">No customers yet.</td></tr> : users.map((user) => <tr key={user.id} className="text-white/80"><td className="px-4 py-4"><div className="font-medium text-white">{user.profile?.displayName || 'Unnamed customer'}</div><div className="text-xs text-white/40">{new Date(user.createdAt).toLocaleDateString()}</div></td><td className="px-4 py-4">{user.email || user.mobile || '—'}</td><td className="px-4 py-4">{user.roles.map((r) => r.role.name).join(', ') || 'CUSTOMER'}</td><td className="px-4 py-4"><span className="rounded-full bg-white/5 px-2.5 py-1 text-xs">{user.status}</span></td><td className="px-4 py-4"><select value={user.status} onChange={(e) => void updateStatus(user.id, e.target.value as User['status'])} className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1.5 text-xs text-white"><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option><option value="DEACTIVATED">Deactivated</option></select></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
