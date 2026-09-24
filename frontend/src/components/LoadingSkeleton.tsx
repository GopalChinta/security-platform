import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  type?: 'table' | 'cards' | 'chart';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 5, type = 'table' }) => {
  if (type === 'cards') {
    return (
      <div className="stat-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="stat-card"
            style={{ minHeight: '110px', background: 'var(--bg-card)', opacity: 0.6 }}
          >
            <div style={{ width: '100%' }}>
              <div style={{ width: '40%', height: '12px', background: 'var(--bg-subtle)', borderRadius: '4px', marginBottom: '12px' }} />
              <div style={{ width: '60%', height: '24px', background: 'var(--bg-subtle)', borderRadius: '6px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="table-container" style={{ opacity: 0.7 }}>
      <table className="data-table">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td style={{ padding: '1.2rem' }}>
                <div style={{ width: '80%', height: '14px', background: 'var(--bg-subtle)', borderRadius: '4px' }} />
              </td>
              <td style={{ padding: '1.2rem' }}>
                <div style={{ width: '50%', height: '14px', background: 'var(--bg-subtle)', borderRadius: '4px' }} />
              </td>
              <td style={{ padding: '1.2rem' }}>
                <div style={{ width: '40%', height: '14px', background: 'var(--bg-subtle)', borderRadius: '4px' }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
