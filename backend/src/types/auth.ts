import { Role } from '@prisma/client';

export type UserRole = Role;

export interface JwtPayload {
  userId: string;
  tenantId: string;
  role: Role;
  email: string;
  name: string;
  tenantName: string;
  tenantSlug: string;
}

export interface AuthUser {
  userId: string;
  tenantId: string;
  role: Role;
  email: string;
  name: string;
  tenantName: string;
  tenantSlug: string;
}
