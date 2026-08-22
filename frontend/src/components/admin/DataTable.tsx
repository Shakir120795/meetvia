'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  pageSize?: number;
  actions?: (item: T) => React.ReactNode;
}

export default function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  searchKey,
  pageSize = 10,
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!search.trim() || !searchKey) return data;
    const term = search.toLowerCase();
    return data.filter((item) => {
      const value = item[searchKey];
      if (typeof value === 'string') return value.toLowerCase().includes(term);
      return false;
    });
  }, [data, search, searchKey]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)} placeholder={searchPlaceholder} className="w-full bg-white/5 border border-white/10 rounded-theme pl-10 pr-4 py-2 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors duration-200 text-sm" />
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 bg-white/5">{columns.map((col) => <th key={col.key} className="text-left px-4 py-3 text-white/70 font-medium">{col.header}</th>)}{actions && <th className="text-right px-4 py-3 text-white/70 font-medium">Actions</th>}</tr></thead>
          <tbody>
            {paginatedData.length === 0 ? <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-white/40">No items found.</td></tr> : paginatedData.map((item) => (
              <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-150">
                {columns.map((col) => <td key={col.key} className="px-4 py-3 text-white/80">{col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}</td>)}
                {actions && <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-2">{actions(item)}</div></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
    </div>
  );
}
