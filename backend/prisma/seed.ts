import { PrismaClient, Role, CampaignStatus, Severity, EventStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeding ---');

  // Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.campaignUser.deleteMany();
  await prisma.securityEvent.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  console.log('Cleared existing records.');

  // Create Tenants
  const acmeTenant = await prisma.tenant.create({
    data: {
      id: 'tenant-acme-corp',
      name: 'Acme Security Corp',
      slug: 'acme',
    },
  });

  const globexTenant = await prisma.tenant.create({
    data: {
      id: 'tenant-globex-sec',
      name: 'Globex Security Solutions',
      slug: 'globex',
    },
  });

  console.log('Created Tenants: Acme Security & Globex Security');

  // Password hashes
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const managerPasswordHash = await bcrypt.hash('Manager@123', 10);
  const userPasswordHash = await bcrypt.hash('User@123', 10);
  const analystPasswordHash = await bcrypt.hash('Analyst@123', 10);

  // Users - Acme (Tenant A)
  const acmeAdmin = await prisma.user.create({
    data: {
      id: 'user-acme-admin',
      tenantId: acmeTenant.id,
      name: 'Alice Walker (Admin)',
      email: 'admin@acme.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const acmeManager = await prisma.user.create({
    data: {
      id: 'user-acme-manager',
      tenantId: acmeTenant.id,
      name: 'Bob Martinez (Manager)',
      email: 'manager@acme.com',
      passwordHash: managerPasswordHash,
      role: Role.MANAGER,
    },
  });

  const acmeUser = await prisma.user.create({
    data: {
      id: 'user-acme-user',
      tenantId: acmeTenant.id,
      name: 'Charlie Hayes (User)',
      email: 'user@acme.com',
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
  });

  const acmeAnalyst = await prisma.user.create({
    data: {
      id: 'user-acme-analyst',
      tenantId: acmeTenant.id,
      name: 'Diana Prince (Sec Analyst)',
      email: 'analyst@acme.com',
      passwordHash: analystPasswordHash,
      role: Role.USER,
    },
  });

  // Users - Globex (Tenant B)
  const globexAdmin = await prisma.user.create({
    data: {
      id: 'user-globex-admin',
      tenantId: globexTenant.id,
      name: 'Ethan Hunt (Admin)',
      email: 'admin@globex.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const globexManager = await prisma.user.create({
    data: {
      id: 'user-globex-manager',
      tenantId: globexTenant.id,
      name: 'George Smiley (Manager)',
      email: 'manager@globex.com',
      passwordHash: managerPasswordHash,
      role: Role.MANAGER,
    },
  });

  const globexUser = await prisma.user.create({
    data: {
      id: 'user-globex-user',
      tenantId: globexTenant.id,
      name: 'Fiona Gallagher (User)',
      email: 'user@globex.com',
      passwordHash: userPasswordHash,
      role: Role.USER,
    },
  });

  console.log('Created Users for Acme and Globex.');

  // Campaigns - Tenant A (Acme)
  const acmeCampaign1 = await prisma.campaign.create({
    data: {
      id: 'cmp-acme-101',
      tenantId: acmeTenant.id,
      name: 'Q1 Enterprise Phishing Simulation',
      description: 'Simulated spear-phishing campaign evaluating employee susceptibility across finance and operations departments.',
      status: CampaignStatus.ACTIVE,
      createdById: acmeAdmin.id,
      startDate: new Date('2026-01-15T09:00:00Z'),
      endDate: new Date('2026-03-31T18:00:00Z'),
    },
  });

  const acmeCampaign2 = await prisma.campaign.create({
    data: {
      id: 'cmp-acme-102',
      tenantId: acmeTenant.id,
      name: 'Cloud Infrastructure & IAM Hardening',
      description: 'Review of all AWS IAM roles, least privilege enforcement, and MFA enforcement for AWS root accounts.',
      status: CampaignStatus.DRAFT,
      createdById: acmeManager.id,
      startDate: new Date('2026-04-01T09:00:00Z'),
      endDate: new Date('2026-06-30T18:00:00Z'),
    },
  });

  const acmeCampaign3 = await prisma.campaign.create({
    data: {
      id: 'cmp-acme-103',
      tenantId: acmeTenant.id,
      name: 'Zero-Trust Endpoint Compliance Audit',
      description: 'Mandatory EDR agent upgrade and CrowdStrike sensor verification across all macOS and Windows workstations.',
      status: CampaignStatus.COMPLETED,
      createdById: acmeAdmin.id,
      startDate: new Date('2025-11-01T09:00:00Z'),
      endDate: new Date('2025-12-31T18:00:00Z'),
    },
  });

  await prisma.campaign.create({
    data: {
      id: 'cmp-acme-104',
      tenantId: acmeTenant.id,
      name: 'Legacy VPN Sunsetting & WireGuard Rollout',
      description: 'Decommissioning of legacy PPTP gateway in favor of WireGuard with Okta SAML MFA.',
      status: CampaignStatus.CANCELLED,
      createdById: acmeManager.id,
      startDate: new Date('2025-10-01T09:00:00Z'),
      endDate: new Date('2025-10-15T18:00:00Z'),
    },
  });

  // Campaigns - Tenant B (Globex)
  // Required ID: "201" for cross-tenant isolation testing!
  const globexCampaign1 = await prisma.campaign.create({
    data: {
      id: '201',
      tenantId: globexTenant.id,
      name: 'Globex Red Team Assessment 2026',
      description: 'External penetration test simulating advanced persistent threat (APT) lateral movement across Globex internal network.',
      status: CampaignStatus.ACTIVE,
      createdById: globexAdmin.id,
      startDate: new Date('2026-02-01T09:00:00Z'),
      endDate: new Date('2026-05-01T18:00:00Z'),
    },
  });

  await prisma.campaign.create({
    data: {
      id: 'cmp-globex-202',
      tenantId: globexTenant.id,
      name: 'Globex Supply Chain Vendor Security Audit',
      description: 'SOC2 Type II attestation verification and third-party risk analysis for critical software vendors.',
      status: CampaignStatus.DRAFT,
      createdById: globexAdmin.id,
      startDate: new Date('2026-03-01T09:00:00Z'),
      endDate: new Date('2026-07-01T18:00:00Z'),
    },
  });

  console.log('Created Campaigns (including Tenant B Campaign ID "201").');

  // Campaign Assignments
  await prisma.campaignUser.createMany({
    data: [
      {
        id: 'cu-acme-01',
        campaignId: acmeCampaign1.id,
        userId: acmeUser.id,
      },
      {
        id: 'cu-acme-02',
        campaignId: acmeCampaign1.id,
        userId: acmeAnalyst.id,
      },
      {
        id: 'cu-acme-03',
        campaignId: acmeCampaign2.id,
        userId: acmeUser.id,
      },
      {
        id: 'cu-globex-01',
        campaignId: globexCampaign1.id,
        userId: globexUser.id,
      },
    ],
  });

  console.log('Created Campaign User Assignments.');

  // Security Events - Tenant A (Acme)
  await prisma.securityEvent.createMany({
    data: [
      {
        id: 'evt-acme-01',
        tenantId: acmeTenant.id,
        eventType: 'UNAUTHORIZED_SSH_BRUTE_FORCE',
        severity: Severity.HIGH,
        status: EventStatus.OPEN,
        description: 'Repeated brute force SSH login attempts (over 450 attempts/min) detected from 198.51.100.45 targeting Bastion host.',
        createdAt: new Date('2026-02-20T14:30:00Z'),
      },
      {
        id: 'evt-acme-02',
        tenantId: acmeTenant.id,
        eventType: 'MALICIOUS_MACRO_PAYLOAD',
        severity: Severity.CRITICAL,
        status: EventStatus.OPEN,
        description: 'Macro-enabled phishing spreadsheet opened on finance workstation (WS-088). Threat actor beaconed to known C2 server.',
        createdAt: new Date('2026-02-22T08:15:00Z'),
      },
      {
        id: 'evt-acme-03',
        tenantId: acmeTenant.id,
        eventType: 'API_KEY_LEAK_IN_LOGS',
        severity: Severity.MEDIUM,
        status: EventStatus.RESOLVED,
        description: 'Staging AWS access key was logged to CloudWatch in plaintext. Key revoked and IAM rotated immediately.',
        createdAt: new Date('2026-02-10T11:45:00Z'),
      },
      {
        id: 'evt-acme-04',
        tenantId: acmeTenant.id,
        eventType: 'PASSWORD_SPRAY_DETECTED',
        severity: Severity.LOW,
        status: EventStatus.OPEN,
        description: 'Low-and-slow single attempt password spray detected across 40 accounts over 2 hours. Blocked by rate limiter.',
        createdAt: new Date('2026-02-23T19:00:00Z'),
      },
      {
        id: 'evt-acme-05',
        tenantId: acmeTenant.id,
        eventType: 'SUSPICIOUS_PRIVILEGE_ESCALATION',
        severity: Severity.HIGH,
        status: EventStatus.RESOLVED,
        description: 'Unscheduled IAM policy update attached AdministratorAccess to staging service account. Policy rolled back.',
        createdAt: new Date('2026-02-18T16:20:00Z'),
      },
    ],
  });

  // Security Events - Tenant B (Globex)
  await prisma.securityEvent.createMany({
    data: [
      {
        id: 'evt-globex-01',
        tenantId: globexTenant.id,
        eventType: 'RANSOMWARE_HEURISTIC_TRIGGER',
        severity: Severity.CRITICAL,
        status: EventStatus.OPEN,
        description: 'Rapid mass file encryption activity flagged on Globex primary SAN storage volume. Volume quarantined.',
        createdAt: new Date('2026-02-21T03:10:00Z'),
      },
      {
        id: 'evt-globex-02',
        tenantId: globexTenant.id,
        eventType: 'UNAUTHORIZED_DATABASE_DUMP',
        severity: Severity.HIGH,
        status: EventStatus.RESOLVED,
        description: 'Large pg_dump process initiated outside business hours on production RDS replica. IP blocked.',
        createdAt: new Date('2026-02-14T22:05:00Z'),
      },
    ],
  });

  console.log('Created Security Events for Acme and Globex.');

  // Audit Logs - Tenant A (Acme)
  await prisma.auditLog.createMany({
    data: [
      {
        id: 'aud-acme-01',
        tenantId: acmeTenant.id,
        userId: acmeAdmin.id,
        action: 'LOGIN',
        entityType: 'AUTH',
        entityId: acmeAdmin.id,
        description: 'User Alice Walker (admin@acme.com) logged in successfully.',
        metadata: { role: 'ADMIN', method: 'JWT_PASSWORD', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        ipAddress: '127.0.0.1',
        createdAt: new Date('2026-02-24T08:00:00Z'),
      },
      {
        id: 'aud-acme-02',
        tenantId: acmeTenant.id,
        userId: acmeAdmin.id,
        action: 'CAMPAIGN_CREATED',
        entityType: 'CAMPAIGN',
        entityId: acmeCampaign1.id,
        description: 'Campaign "Q1 Enterprise Phishing Simulation" created.',
        metadata: { campaignName: 'Q1 Enterprise Phishing Simulation', status: 'ACTIVE' },
        ipAddress: '127.0.0.1',
        createdAt: new Date('2026-02-24T08:05:00Z'),
      },
      {
        id: 'aud-acme-03',
        tenantId: acmeTenant.id,
        userId: acmeAdmin.id,
        action: 'CAMPAIGN_USER_ASSIGNED',
        entityType: 'CAMPAIGN_USER',
        entityId: acmeCampaign1.id,
        description: 'Assigned user Charlie Hayes to campaign "Q1 Enterprise Phishing Simulation".',
        metadata: { campaignId: acmeCampaign1.id, assignedUserId: acmeUser.id },
        ipAddress: '127.0.0.1',
        createdAt: new Date('2026-02-24T08:10:00Z'),
      },
      {
        id: 'aud-acme-04',
        tenantId: acmeTenant.id,
        userId: acmeManager.id,
        action: 'SECURITY_EVENT_UPDATED',
        entityType: 'SECURITY_EVENT',
        entityId: 'evt-acme-03',
        description: 'Security event evt-acme-03 status updated to RESOLVED.',
        metadata: { previousStatus: 'OPEN', newStatus: 'RESOLVED' },
        ipAddress: '127.0.0.1',
        createdAt: new Date('2026-02-24T08:30:00Z'),
      },
      {
        id: 'aud-acme-05',
        tenantId: acmeTenant.id,
        userId: null,
        action: 'LOGIN_FAILED',
        entityType: 'AUTH',
        entityId: null,
        description: 'Failed login attempt for email attacker@unknown.com from IP 198.51.100.99.',
        metadata: { reason: 'USER_NOT_FOUND', attemptedEmail: 'attacker@unknown.com' },
        ipAddress: '198.51.100.99',
        createdAt: new Date('2026-02-24T09:12:00Z'),
      },
    ],
  });

  // Audit Logs - Tenant B (Globex)
  await prisma.auditLog.createMany({
    data: [
      {
        id: 'aud-globex-01',
        tenantId: globexTenant.id,
        userId: globexAdmin.id,
        action: 'LOGIN',
        entityType: 'AUTH',
        entityId: globexAdmin.id,
        description: 'User Ethan Hunt (admin@globex.com) logged in successfully.',
        metadata: { role: 'ADMIN', method: 'JWT_PASSWORD' },
        ipAddress: '127.0.0.1',
        createdAt: new Date('2026-02-24T07:45:00Z'),
      },
      {
        id: 'aud-globex-02',
        tenantId: globexTenant.id,
        userId: globexAdmin.id,
        action: 'CAMPAIGN_CREATED',
        entityType: 'CAMPAIGN',
        entityId: '201',
        description: 'Campaign "Globex Red Team Assessment 2026" created.',
        metadata: { campaignName: 'Globex Red Team Assessment 2026', status: 'ACTIVE' },
        ipAddress: '127.0.0.1',
        createdAt: new Date('2026-02-24T07:50:00Z'),
      },
    ],
  });

  console.log('Created Audit Logs.');
  console.log('--- Database Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
