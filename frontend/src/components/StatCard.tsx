import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  cardBorder?: string;
  hoverBorder?: string;
  glow?: string;
  iconColor?: string;
  iconBg?: string;
  smartBadge?: {
    text: string;
    bg: string;
    color: string;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  cardBorder = '#e2e8f0',
  hoverBorder = '#2563eb',
  glow = 'rgba(37, 99, 235, 0.12)',
  iconColor = '#2563eb',
  iconBg = '#eff6ff',
  smartBadge,
}) => {
  return (
    <div
      className="stat-card-enhanced"
      style={
        {
          '--card-border': cardBorder,
          '--card-hover-border': hoverBorder,
          '--card-glow': glow,
          '--icon-color': iconColor,
          '--icon-bg': iconBg,
        } as React.CSSProperties
      }
    >
      <div className="stat-card-content">
        <div className="stat-header-row">
          <span className="stat-label-modern">{label}</span>
          {smartBadge && (
            <span
              className="stat-smart-badge"
              style={{
                background: smartBadge.bg,
                color: smartBadge.color,
              }}
            >
              {smartBadge.text}
            </span>
          )}
        </div>
        <span className="stat-value-modern">{value}</span>
        {subtext && <span className="stat-subtext-modern">{subtext}</span>}
      </div>
      <div className="stat-icon-wrap">{icon}</div>
    </div>
  );
};
