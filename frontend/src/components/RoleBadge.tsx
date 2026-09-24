import React from 'react';
import { Role } from '../types';
import { Shield, UserCheck, User } from 'lucide-react';

interface RoleBadgeProps {
  role: Role;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const getIcon = () => {
    switch (role) {
      case 'ADMIN':
        return <Shield size={12} />;
      case 'MANAGER':
        return <UserCheck size={12} />;
      case 'USER':
      default:
        return <User size={12} />;
    }
  };

  return (
    <span className={`badge badge-role-${role}`}>
      {getIcon()}
      {role}
    </span>
  );
};
