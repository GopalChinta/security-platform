import React from 'react';
import { CampaignStatus, EventStatus } from '../types';

interface StatusBadgeProps {
  status: CampaignStatus | EventStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`badge badge-${status}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
};
