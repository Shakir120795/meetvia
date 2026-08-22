'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import { adminDelete, adminGet, adminPost, adminPut } from '@/lib/api';
import { ApiResponse, IService } from '@/types';
import DataTable, { Column } from '@/components/admin/DataTable';
import MediaInput from '@/components/admin/MediaInput';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface ServiceFormData {
  title: string;
  description: string;
  duration: string;
  locationType: IService['locationType'];
  image: string;
  video: string;
  thumbnail: string;
  whatsIncluded: string;
  buttonText: string;
  buttonLink: string;
  isFeatured: boolean;
  isVisible: boolean;
  displayOrder: number;
}

const emptyForm: ServiceFormData = {
  title: '', description: '', duration: '', locationType: 'Public', image: '', video: '', thumbnail: '',
  whatsIncluded: '', buttonText: 'Book Now', buttonLink: '', isFeatured: false, isVisible: true, displayOrder: 0,
};

export default function ServicesPage() {
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<IService | null>(null);
  const [deleting, setDeleting] = useState<IService | null>(null);
  const [form, setForm] = useState<ServiceFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      setLoading(true);
      const response = await adminGet<ApiResponse<IService[]>>('/api/v1/admin/services');
      setServices(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load services.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (service: IService) => {
    setEditing(service);
    setForm({
      title: service.title,
      description: service.description,
      duration: service.duration || '',
      locationType: service.locationType,
      image: service.image || '',
      video: service.video || '',
      thumbnail: service.thumbnail || '',
      whatsIncluded: service.whatsIncluded.join('\n'),
      buttonText: service.buttonText,
      buttonLink: service.buttonLink || '',
      isFeatured: service.isFeatured,
      isVisible: service.isVisible,
      displayOrder: service.displayOrder,
    });
    setFormOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        whatsIncluded: form.whatsIncluded.split('\n').map((item) => item.trim()).filter(Boolean),
        displayOrder: Number(form.displayOrder) || 0,
      };
      if (editing) await adminPut<ApiResponse<IService>>(`/api/v1/admin/services/${editing.id}`, payload);
      else await adminPost<ApiResponse<IService>>('/api/v1/admin/services', payload);
      setFormOpen(false); setEditing(null); setForm(emptyForm); await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save service.');
    } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!deleting) return;
    setSaving(true); setError('');
    try {
      await adminDelete(`/api/v1/admin/services/${deleting.id}`);
      setDeleteOpen(false); setDeleting(null); await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete service.');
    } finally { setSaving(false); }
  };

  const columns: Column<IService>[] = [
    { key: 'title', header: 'Title' },
    { key: 'locationType', header: 'Location' },
    { key: 'duration', header: 'Duration', render: (item) => item.duration || '—' },
    { key: 'isFeatured', header: 'Featured', render: (item) => item.isFeatured ? <Star className="h-4 w-4 text-yellow-400" /> : <Star className="h-4 w-4 text-white/20" /> },
    { key: 'isVisible', header: 'Visible', render: (item) => item.isVisible ? <Eye className="h-4 w-4 text-green-400" /> : <EyeOff className="h-4 w-4 text-white/30" /> },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-accent/30 border-t-accent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-white">Services Manager</h1><p className="mt-1 text-sm text-white/60">Manage CMS services and public CTAs.</p></div><Button onClick={openAdd} size="sm"><Plus className="mr-1.5 h-4 w-4" />Add Service</Button></div>
      {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
      <DataTable data={services} columns={columns} searchKey="title" searchPlaceholder="Search services..." actions={(item) => <><button type="button" onClick={() => openEdit(item)} className="p-1.5 text-white/60 hover:text-accent" aria-label={`Edit ${item.title}`}><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => { setDeleting(item); setDeleteOpen(true); }} className="p-1.5 text-white/60 hover:text-red-400" aria-label={`Delete ${item.title}`}><Trash2 className="h-4 w-4" /></button></>} />

      <Modal isOpen={formOpen} onClose={() => !saving && setFormOpen(false)} title={editing ? 'Edit Service' : 'Add Service'}>
        <form onSubmit={save} className="space-y-4">
          <label className="block text-sm text-white/80">Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5 w-full rounded-theme border border-white/10 bg-white/5 px-4 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/80">Description<textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="mt-1.5 w-full rounded-theme border border-white/10 bg-white/5 px-4 py-2.5 text-white" /></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm text-white/80">Duration<input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="mt-1.5 w-full rounded-theme border border-white/10 bg-white/5 px-4 py-2.5 text-white" /></label><label className="block text-sm text-white/80">Location<select value={form.locationType} onChange={(e) => setForm({ ...form, locationType: e.target.value as IService['locationType'] })} className="mt-1.5 w-full rounded-theme border border-white/10 bg-white/5 px-4 py-2.5 text-white"><option value="Public">Public</option><option value="Virtual">Virtual</option><option value="Flexible">Flexible</option></select></label></div>
          <MediaInput label="Image" value={form.image} onChange={(image) => setForm({ ...form, image })} />
          <MediaInput label="Video" value={form.video} onChange={(video) => setForm({ ...form, video })} accept="video/mp4,video/webm" />
          <MediaInput label="Thumbnail" value={form.thumbnail} onChange={(thumbnail) => setForm({ ...form, thumbnail })} />
          <label className="block text-sm text-white/80">What's Included<textarea value={form.whatsIncluded} onChange={(e) => setForm({ ...form, whatsIncluded: e.target.value })} rows={4} placeholder="One item per line" className="mt-1.5 w-full rounded-theme border border-white/10 bg-white/5 px-4 py-2.5 text-white" /></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm text-white/80">Button Text<input value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} className="mt-1.5 w-full rounded-theme border border-white/10 bg-white/5 px-4 py-2.5 text-white" /></label><label className="block text-sm text-white/80">Button Link<input value={form.buttonLink} onChange={(e) => setForm({ ...form, buttonLink: e.target.value })} className="mt-1.5 w-full rounded-theme border border-white/10 bg-white/5 px-4 py-2.5 text-white" /></label></div>
          <div className="flex flex-wrap gap-5 text-sm text-white/80"><label className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />Featured</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} />Visible</label><label className="flex items-center gap-2">Order<input type="number" min={0} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className="w-20 rounded-theme border border-white/10 bg-white/5 px-2 py-1.5 text-white" /></label></div>
          <div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" loading={saving} disabled={saving}>{editing ? 'Save Changes' : 'Create Service'}</Button></div>
        </form>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => !saving && setDeleteOpen(false)} title="Delete Service"><div className="space-y-5"><p className="text-sm text-white/70">Delete <strong className="text-white">{deleting?.title}</strong>? This cannot be undone.</p><div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setDeleteOpen(false)} disabled={saving}>Cancel</Button><Button type="button" onClick={remove} loading={saving} disabled={saving}>Delete</Button></div></div></Modal>
    </div>
  );
}
