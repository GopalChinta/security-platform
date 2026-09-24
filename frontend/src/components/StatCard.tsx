import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  gradient?: string;
  iconColor?: string;
  iconBg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  gradient,
  iconColor,
  iconBg,
}) => {
  return (
    <div
      className="stat-card"
      style={
        {
          '--stat-gradient': gradient,
          '--icon-color': iconColor,
          '--icon-bg': iconBg,
        } as React.CSSProperties
      }
    >
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {subtext && <div className="stat-subtext">{subtext}</div>}
      </div>
      <div className="stat-icon">{icon}</div>
    </div>
  );
};
