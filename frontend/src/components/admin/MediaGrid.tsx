'use client';

import { useState, useMemo } from 'react';
import { Image as ImageIcon, Film, Trash2, Search } from 'lucide-react';
import { IMedia } from '@/types';
import Pagination from '@/components/ui/Pagination';

interface MediaGridProps {
  items: IMedia[];
  onDelete: (media: IMedia) => void;
}

type FilterType = 'all' | 'image' | 'video';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaGrid({ items, onDelete }: MediaGridProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter and search
  const filteredItems = useMemo(() => {
    let result = items;

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter((item) => item.fileType === filterType);
    }

    // Search by filename
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      result = result.filter((item) =>
        item.originalFilename.toLowerCase().includes(query)
      );
    }

    return result;
  }, [items, filterType, search]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  // Reset page when filter/search changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: FilterType) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by filename..."
            className="w-full bg-white/5 border border-white/10 rounded-theme pl-10 pr-4 py-2.5 text-foreground placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
          />
        </div>

        {/* Filter dropdown */}
        <select
          value={filterType}
          onChange={(e) => handleFilterChange(e.target.value as FilterType)}
          className="bg-white/5 border border-white/10 rounded-theme px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors duration-200"
          aria-label="Filter by type"
        >
          <option value="all">All</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-white/50 text-sm">
        {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
        {search || filterType !== 'all' ? ' found' : ''}
      </p>

      {/* Grid */}
      {paginatedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedItems.map((media) => (
            <div
              key={media._id}
              className="glass rounded-theme overflow-hidden group"
            >
              {/* Thumbnail / Preview */}
              <div className="relative aspect-video bg-white/5 flex items-center justify-center overflow-hidden">
                {media.fileType === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={media.url}
                    alt={media.originalFilename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-white/40">
                    <Film className="w-10 h-10" />
                    <span className="text-xs">Video</span>
                  </div>
                )}

                {/* Delete overlay button */}
                <button
                  onClick={() => onDelete(media)}
                  className="absolute top-2 right-2 p-2 rounded-theme bg-black/60 text-white/70 hover:text-red-400 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  aria-label={`Delete ${media.originalFilename}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Info */}
              <div className="p-3 space-y-1.5">
                <p
                  className="text-sm text-white font-medium truncate"
                  title={media.originalFilename}
                >
                  {media.originalFilename}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                      media.fileType === 'image'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}
                  >
                    {media.fileType === 'image' ? (
                      <ImageIcon className="w-3 h-3" />
                    ) : (
                      <Film className="w-3 h-3" />
                    )}
                    {media.fileType}
                  </span>
                  <span className="text-xs text-white/50">
                    {formatFileSize(media.fileSize)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-white/40">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No media found</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
