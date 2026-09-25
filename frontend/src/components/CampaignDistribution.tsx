import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  Zap,
  FileText,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import './CampaignDistribution.css';

interface CampaignDistributionProps {
  activeCount: number;
  draftCount: number;
  completedCount: number;
  cancelledCount: number;
  totalCampaigns: number;
}

interface SegmentMeta {
  key: string;
  name: string;
  count: number;
  pct: number;
  color: string;
  gradientId: string;
  fill: string;
  labelColor: string;
  badgeBg: string;
  badgeColor: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
  barClass: string;
  // Connector elbow directions
  calloutX: number;
  calloutY: number;
  elbowX: number;
  elbowY: number;
  textAnchor: 'start' | 'end' | 'middle';
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeDonutSlice(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number
) {
  // Gap between slices
  const gap = 3.5;
  const actualStart = startAngle + gap / 2;
  const actualEnd = endAngle - gap / 2;

  if (actualEnd <= actualStart) return '';

  const startOuter = polarToCartesian(cx, cy, rOuter, actualStart);
  const endOuter = polarToCartesian(cx, cy, rOuter, actualEnd);
  const startInner = polarToCartesian(cx, cy, rInner, actualStart);
  const endInner = polarToCartesian(cx, cy, rInner, actualEnd);

  const largeArcFlag = actualEnd - actualStart <= 180 ? '0' : '1';

  return [
    'M', startOuter.x, startOuter.y,
    'A', rOuter, rOuter, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
    'L', endInner.x, endInner.y,
    'A', rInner, rInner, 0, largeArcFlag, 0, startInner.x, startInner.y,
    'Z',
  ].join(' ');
}

export const CampaignDistribution: React.FC<CampaignDistributionProps> = ({
  activeCount,
  draftCount,
  completedCount,
  cancelledCount,
  totalCampaigns,
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [animatedCount, setAnimatedCount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const total = totalCampaigns > 0 ? totalCampaigns : 1;

  const activePct = Math.round((activeCount / total) * 100);
  const draftPct = Math.round((draftCount / total) * 100);
  const completedPct = Math.round((completedCount / total) * 100);
  const cancelledPct = Math.round((cancelledCount / total) * 100);

  // Smooth Count-Up Animation for Center Metric
  useEffect(() => {
    setIsLoaded(true);
    let current = 0;
    const target = totalCampaigns;
    if (target === 0) {
      setAnimatedCount(0);
      return;
    }
    const stepTime = Math.max(15, Math.floor(600 / target));
    const timer = setInterval(() => {
      current += 1;
      setAnimatedCount(current);
      if (current >= target) {
        clearInterval(timer);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [totalCampaigns]);

  // Donut geometry specifications
  const cx = 160;
  const cy = 160;
  const rOuter = 95;
  const rInner = 55;
  const rMid = (rOuter + rInner) / 2;

  // Segment angles calculation
  // Active: ~0 deg to ~51 deg (top-right quadrant)
  const activeAngle = (activeCount / total) * 360;
  // Draft: ~51 deg to ~257 deg (right & bottom)
  const draftAngle = (draftCount / total) * 360;
  // Completed: ~257 deg to ~308 deg (bottom-left)
  const completedAngle = (completedCount / total) * 360;
  // Cancelled: ~308 deg to 360 deg (top-left)
  const cancelledAngle = (cancelledCount / total) * 360;

  const a0 = 0;
  const a1 = a0 + activeAngle;
  const a2 = a1 + draftAngle;
  const a3 = a2 + completedAngle;
  const a4 = Math.min(360, a3 + cancelledAngle);

  const segments: (SegmentMeta & {
    startAngle: number;
    endAngle: number;
    midAngle: number;
    path: string;
    dotPos: { x: number; y: number };
    outerDotPos: { x: number; y: number };
  })[] = [
    {
      key: 'ACTIVE',
      name: 'Active',
      count: activeCount,
      pct: activePct,
      color: '#10b981',
      gradientId: 'gradActive',
      fill: 'url(#gradActive)',
      labelColor: '#059669',
      badgeBg: '#dcfce7',
      badgeColor: '#15803d',
      iconBg: '#ecfdf5',
      iconColor: '#10b981',
      icon: <Zap size={18} />,
      barClass: 'bar-active',
      startAngle: a0,
      endAngle: a1,
      midAngle: (a0 + a1) / 2,
      path: describeDonutSlice(cx, cy, rInner, rOuter, a0, a1),
      dotPos: polarToCartesian(cx, cy, rMid, (a0 + a1) / 2),
      outerDotPos: polarToCartesian(cx, cy, rOuter + 6, (a0 + a1) / 2),
      calloutX: 285,
      calloutY: 55,
      elbowX: 250,
      elbowY: 55,
      textAnchor: 'start',
    },
    {
      key: 'DRAFT',
      name: 'Draft',
      count: draftCount,
      pct: draftPct,
      color: '#64748b',
      gradientId: 'gradDraft',
      fill: 'url(#gradDraft)',
      labelColor: '#334155',
      badgeBg: '#f1f5f9',
      badgeColor: '#475569',
      iconBg: '#f1f5f9',
      iconColor: '#64748b',
      icon: <FileText size={18} />,
      barClass: 'bar-draft',
      startAngle: a1,
      endAngle: a2,
      midAngle: (a1 + a2) / 2,
      path: describeDonutSlice(cx, cy, rInner, rOuter, a1, a2),
      dotPos: polarToCartesian(cx, cy, rMid, (a1 + a2) / 2),
      outerDotPos: polarToCartesian(cx, cy, rOuter + 6, (a1 + a2) / 2),
      calloutX: 285,
      calloutY: 260,
      elbowX: 250,
      elbowY: 260,
      textAnchor: 'start',
    },
    {
      key: 'COMPLETED',
      name: 'Completed',
      count: completedCount,
      pct: completedPct,
      color: '#2563eb',
      gradientId: 'gradCompleted',
      fill: 'url(#gradCompleted)',
      labelColor: '#2563eb',
      badgeBg: '#dbeafe',
      badgeColor: '#1e40af',
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      icon: <CheckCircle2 size={18} />,
      barClass: 'bar-completed',
      startAngle: a2,
      endAngle: a3,
      midAngle: (a2 + a3) / 2,
      path: describeDonutSlice(cx, cy, rInner, rOuter, a2, a3),
      dotPos: polarToCartesian(cx, cy, rMid, (a2 + a3) / 2),
      outerDotPos: polarToCartesian(cx, cy, rOuter + 6, (a2 + a3) / 2),
      calloutX: 35,
      calloutY: 200,
      elbowX: 68,
      elbowY: 200,
      textAnchor: 'end',
    },
    {
      key: 'CANCELLED',
      name: 'Cancelled',
      count: cancelledCount,
      pct: cancelledPct,
      color: '#f43f5e',
      gradientId: 'gradCancelled',
      fill: 'url(#gradCancelled)',
      labelColor: '#e11d48',
      badgeBg: '#ffe4e6',
      badgeColor: '#be123c',
      iconBg: '#fff1f2',
      iconColor: '#e11d48',
      icon: <XCircle size={18} />,
      barClass: 'bar-cancelled',
      startAngle: a3,
      endAngle: a4,
      midAngle: (a3 + a4) / 2,
      path: describeDonutSlice(cx, cy, rInner, rOuter, a3, a4),
      dotPos: polarToCartesian(cx, cy, rMid, (a3 + a4) / 2),
      outerDotPos: polarToCartesian(cx, cy, rOuter + 6, (a3 + a4) / 2),
      calloutX: 45,
      calloutY: 60,
      elbowX: 80,
      elbowY: 60,
      textAnchor: 'end',
    },
  ];

  return (
    <div className="campaign-dist-card">
      {/* Header matching Reference Image */}
      <div className="campaign-dist-header">
        <div className="campaign-dist-header-left">
          <div className="campaign-dist-header-icon">
            <Activity size={24} />
          </div>
          <div className="campaign-dist-title-wrap">
            <h2 className="campaign-dist-title">Campaign Distribution</h2>
            <p className="campaign-dist-subtitle">Overview of all registered campaigns</p>
          </div>
        </div>

        <div className="campaign-dist-header-right">
          <Link to="/campaigns" className="campaign-view-all-btn">
            <span>View All</span>
            <ArrowUpRight size={15} />
          </Link>
          <div className="header-total-summary">
            <span className="header-total-number">{totalCampaigns}</span>
            <span className="header-total-label">Total Registered</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Donut Chart on Left, Status List on Right */}
      <div className="campaign-dist-content">
        {/* Left Donut Chart Section */}
        <div className="donut-chart-wrapper">
          <svg viewBox="0 0 320 320" className="donut-svg">
            <defs>
              {/* Radial & Linear Gradients for Donut Segments */}
              <linearGradient id="gradActive" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>

              <linearGradient id="gradDraft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>

              <linearGradient id="gradCompleted" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>

              <linearGradient id="gradCancelled" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>

            {/* Donut Slices */}
            {segments.map((seg) => {
              const isHovered = hoveredSegment === seg.key;
              const isDimmed = hoveredSegment !== null && !isHovered;

              return (
                <g
                  key={seg.key}
                  onMouseEnter={() => setHoveredSegment(seg.key)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  {/* Slice Path */}
                  <path
                    d={seg.path}
                    fill={seg.fill}
                    className="donut-slice"
                    style={{
                      opacity: isDimmed ? 0.35 : 1,
                      transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    }}
                  />

                  {/* Inner White Dot inside segment center */}
                  <circle
                    cx={seg.dotPos.x}
                    cy={seg.dotPos.y}
                    r={3.5}
                    fill="#ffffff"
                    style={{
                      opacity: isDimmed ? 0.35 : 0.9,
                      pointerEvents: 'none',
                      transition: 'opacity 0.3s ease',
                    }}
                  />

                  {/* Outer Connector Line & Percent Badge Label */}
                  {seg.count > 0 && (
                    <g
                      style={{
                        opacity: isDimmed ? 0.3 : 1,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: 'none',
                      }}
                    >
                      {/* Dot on outer edge */}
                      <circle
                        cx={seg.outerDotPos.x}
                        cy={seg.outerDotPos.y}
                        r={2.5}
                        fill={seg.labelColor}
                      />

                      {/* Elbow connector polyline */}
                      <polyline
                        points={`${seg.outerDotPos.x},${seg.outerDotPos.y} ${seg.elbowX},${seg.elbowY} ${seg.calloutX},${seg.elbowY}`}
                        fill="none"
                        stroke={seg.labelColor}
                        strokeWidth="1.2"
                        className="connector-line"
                        opacity="0.85"
                      />

                      {/* Connector text */}
                      <text
                        x={seg.calloutX + (seg.textAnchor === 'start' ? 6 : -6)}
                        y={seg.elbowY + 4}
                        fill={seg.labelColor}
                        textAnchor={seg.textAnchor}
                        className="connector-badge-text"
                      >
                        {seg.pct}%
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Center Card Inside Donut */}
          <div className="donut-center-card">
            <span className="donut-center-val">{animatedCount}</span>
            <span className="donut-center-lbl">Total<br />Registered</span>
          </div>

          {/* Hover Tooltip */}
          {hoveredSegment && (
            <div className="donut-custom-tooltip">
              {(() => {
                const s = segments.find((x) => x.key === hoveredSegment);
                return s ? `${s.name}: ${s.count} (${s.pct}%)` : '';
              })()}
            </div>
          )}
        </div>

        {/* Right Status List Section */}
        <div className="status-list-wrapper">
          {segments.map((seg) => {
            const isHovered = hoveredSegment === seg.key;

            return (
              <div
                key={seg.key}
                className={`status-row-item ${isHovered ? 'status-row-highlighted' : ''}`}
                onMouseEnter={() => setHoveredSegment(seg.key)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                {/* Status Circular Icon */}
                <div
                  className="status-row-icon"
                  style={{
                    background: seg.iconBg,
                    color: seg.iconColor,
                  }}
                >
                  {seg.icon}
                </div>

                {/* Status Name + Horizontal Progress Bar */}
                <div className="status-row-content">
                  <span className="status-row-label">{seg.name}</span>
                  <div className="status-progress-track">
                    <div
                      className={`status-progress-bar ${seg.barClass}`}
                      style={{
                        width: isLoaded ? `${seg.pct}%` : '0%',
                      }}
                    />
                  </div>
                </div>

                {/* Count and Percentage Badge */}
                <div className="status-row-stats">
                  <span className="status-count-val">{seg.count}</span>
                  <span
                    className="status-pct-badge"
                    style={{
                      background: seg.badgeBg,
                      color: seg.badgeColor,
                    }}
                  >
                    {seg.pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
