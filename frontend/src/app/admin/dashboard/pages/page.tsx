'use client';

import React, { useState, useCallback } from 'react';
import { FileText, ArrowLeft, Save } from 'lucide-react';
import { adminGet, adminPut } from '@/lib/api';
import { ILegalPage, ApiResponse } from '@/types';
import Button from '@/components/ui/Button';

const LEGAL_PAGES = [
  { slug: 'safety-policy', title: 'Safety Policy' },
  { slug: 'terms-of-service', title: 'Terms of Service' },
  { slug: 'privacy-policy', title: 'Privacy Policy' },
  { slug: 'refund-policy', title: 'Refund Policy' },
] as const;

const MAX_CONTENT_LENGTH = 100000;

export default function PagesManagerPage() {
  const [selectedPage, setSelectedPage] = useState<ILegalPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPage = useCallback(async (slug: string) => {
    try {
      setLoading(true);
      setMessage(null);
      const res = await adminGet<ApiResponse<ILegalPage>>(`/api/v1/admin/pages/${slug}`);
      setSelectedPage(res.data);
      setTitle(res.data.title);
      setContent(res.data.content);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load page content.' });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = async () => {
    if (!selectedPage) return;

    if (content.length > MAX_CONTENT_LENGTH) {
      setMessage({ type: 'error', text: `Content exceeds maximum length of ${MAX_CONTENT_LENGTH.toLocaleString()} characters.` });
      return;
    }

    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Title is required.' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      const res = await adminPut<ApiResponse<ILegalPage>>(
        `/api/v1/admin/pages/${selectedPage.slug}`,
        { title, content }
      );
      setSelectedPage(res.data);
      setMessage({ type: 'success', text: 'Page saved successfully.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save page. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    setSelectedPage(null);
    setTitle('');
    setContent('');
    setMessage(null);
  };

  // Editing view
  if (selectedPage) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-theme text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Back to pages list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Edit Page</h1>
            <p className="text-white/60 text-sm mt-1">
              Editing: {selectedPage.slug}
            </p>
          </div>
          <Button onClick={handleSave} size="sm" loading={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            Save Changes
          </Button>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`px-4 py-3 rounded-theme text-sm ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Title field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="page-title" className="text-sm font-medium text-foreground/80">
            Page Title
          </label>
          <input
            id="page-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
            placeholder="Page title"
          />
        </div>

        {/* Content textarea (HTML editing) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="page-content" className="text-sm font-medium text-foreground/80">
              Content (HTML)
            </label>
            <span className="text-xs text-white/40">
              {content.length.toLocaleString()} / {MAX_CONTENT_LENGTH.toLocaleString()} chars
            </span>
          </div>
          <textarea
            id="page-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-theme px-4 py-3 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200 font-mono text-sm min-h-[400px] resize-y"
            placeholder="Enter HTML content..."
          />
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Legal Pages Manager</h1>
        <p className="text-white/60 text-sm mt-1">
          Manage legal and policy page content
        </p>
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      )}

      {/* Pages grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LEGAL_PAGES.map((page) => (
            <button
              key={page.slug}
              onClick={() => fetchPage(page.slug)}
              className="glass p-6 text-left hover:bg-white/10 transition-colors duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-theme bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{page.title}</h3>
                  <p className="text-white/40 text-sm mt-0.5">/{page.slug}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      {message && !loading && (
        <div
          className={`px-4 py-3 rounded-theme text-sm ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
