import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '../types';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { page, totalPages, total, limit } = pagination;

  if (total <= 0) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="pagination-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem' }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Showing <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{startItem}</span> to{' '}
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{endItem}</span> of{' '}
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{total}</span> entries
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn btn-secondary btn-sm"
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0 0.5rem' }}>
          Page <strong style={{ color: 'var(--text-primary)' }}>{page}</strong> of <strong>{totalPages}</strong>
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn btn-secondary btn-sm"
          aria-label="Next Page"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
