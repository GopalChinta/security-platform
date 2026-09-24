import React from 'react';
import { Severity } from '../types';
import { ShieldAlert, AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';

interface SeverityBadgeProps {
  severity: Severity;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const getIcon = () => {
    switch (severity) {
      case 'CRITICAL':
        return <ShieldAlert size={12} />;
      case 'HIGH':
        return <AlertTriangle size={12} />;
      case 'MEDIUM':
        return <AlertCircle size={12} />;
      case 'LOW':
      default:
        return <ShieldCheck size={12} />;
    }
  };

  return (
    <span className={`badge badge-${severity}`}>
      {getIcon()}
      {severity}
    </span>
  );
};
