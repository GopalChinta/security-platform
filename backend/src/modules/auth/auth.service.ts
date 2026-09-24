import { prisma } from '../../config/database';
import { comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import { UnauthorizedError, NotFoundError } from '../../utils/errors';
import { createAuditLog } from '../../utils/audit';
import { LoginInput } from './auth.schema';

export class AuthService {
  async login(input: LoginInput, ipAddress?: string) {
    const { email, password } = input;

    // Look up user by email across tenants (email contains organization domain / context)
    const user = await prisma.user.findFirst({
      where: { email },
      include: { tenant: true },
    });

    if (!user) {
      // Create failure audit log if tenant can be identified, or generic
      await createAuditLog({
        tenantId: 'system',
        action: 'LOGIN_FAILED',
        entityType: 'AUTH',
        description: `Failed login attempt for non-existent email: ${email}`,
        metadata: { attemptedEmail: email, reason: 'USER_NOT_FOUND' },
        ipAddress,
      });
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      await createAuditLog({
        tenantId: user.tenantId,
        userId: user.id,
        action: 'LOGIN_FAILED',
        entityType: 'AUTH',
        entityId: user.id,
        description: `Failed login attempt (invalid password) for user: ${user.email}`,
        metadata: { email: user.email, reason: 'INVALID_PASSWORD' },
        ipAddress,
      });
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Generate JWT token with full tenant-scoped payload
    const token = signToken({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
      name: user.name,
      tenantName: user.tenant.name,
      tenantSlug: user.tenant.slug,
    });

    // Record successful login audit log
    await createAuditLog({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'LOGIN',
      entityType: 'AUTH',
      entityId: user.id,
      description: `User ${user.name} (${user.email}) logged in successfully.`,
      metadata: {
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
      },
      ipAddress,
    });

    // Return sanitized user info and token
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
        tenantSlug: user.tenant.slug,
        createdAt: user.createdAt,
      },
    };
  }

  async getCurrentUser(userId: string, tenantId: string) {
    // Tenant-isolated query
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenantName: user.tenant.name,
      tenantSlug: user.tenant.slug,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const authService = new AuthService();
