import request from 'supertest';
import app from '../src/app';

describe('Authentication & Role-Based Access Control (RBAC) Tests', () => {
  let acmeAdminToken: string;
  let acmeManagerToken: string;
  let acmeUserToken: string;

  beforeAll(async () => {
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@acme.com', password: 'Admin@123' });
    acmeAdminToken = adminRes.body.data.token;

    const managerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@acme.com', password: 'Manager@123' });
    acmeManagerToken = managerRes.body.data.token;

    const userRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@acme.com', password: 'User@123' });
    acmeUserToken = userRes.body.data.token;
  });

  describe('1. Authentication Mechanics', () => {
    it('Successful login returns token and sanitized user details', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@acme.com', password: 'Admin@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('admin@acme.com');
      expect(res.body.data.user.role).toBe('ADMIN');
      expect(res.body.data.user.passwordHash).toBeUndefined(); // Never leak passwordHash
    });

    it('Invalid password returns 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@acme.com', password: 'WrongPassword@999' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('Non-existent email returns 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@nowhere.com', password: 'Password@123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('Accessing /api/auth/me with valid Bearer token returns current user', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${acmeAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('admin@acme.com');
      expect(res.body.data.tenantSlug).toBe('acme');
    });

    it('Accessing /api/auth/me without token returns 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('Accessing protected route with invalid token returns 401', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-xyz');

      expect(res.status).toBe(401);
    });
  });

  describe('2. RBAC Permission Checks', () => {
    it('USER role CANNOT delete a campaign (403 Forbidden)', async () => {
      const res = await request(app)
        .delete('/api/campaigns/cmp-acme-101')
        .set('Authorization', `Bearer ${acmeUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('USER role CANNOT manage or view users (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${acmeUserToken}`);

      expect(res.status).toBe(403);
    });

    it('USER role CANNOT create new users (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${acmeUserToken}`)
        .send({
          name: 'Illegal User',
          email: 'illegal@acme.com',
          password: 'Password@123',
          role: 'USER',
        });

      expect(res.status).toBe(403);
    });

    it('USER role CANNOT view audit logs (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${acmeUserToken}`);

      expect(res.status).toBe(403);
    });

    it('MANAGER role CANNOT delete a campaign (403 Forbidden)', async () => {
      const res = await request(app)
        .delete('/api/campaigns/cmp-acme-101')
        .set('Authorization', `Bearer ${acmeManagerToken}`);

      expect(res.status).toBe(403);
    });

    it('MANAGER role CANNOT create users (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${acmeManagerToken}`)
        .send({
          name: 'Manager Attempt',
          email: 'managerattempt@acme.com',
          password: 'Password@123',
          role: 'USER',
        });

      expect(res.status).toBe(403);
    });

    it('MANAGER role CAN view audit logs (200 OK)', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${acmeManagerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('MANAGER role CAN create a campaign (201 Created)', async () => {
      const res = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${acmeManagerToken}`)
        .send({
          name: 'Manager Created Drill',
          description: 'Drill testing response times',
          status: 'DRAFT',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Manager Created Drill');
    });

    it('ADMIN role CAN create user, list audit logs, and view dashboard', async () => {
      const auditRes = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${acmeAdminToken}`);
      expect(auditRes.status).toBe(200);

      const dashboardRes = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${acmeAdminToken}`);
      expect(dashboardRes.status).toBe(200);
      expect(dashboardRes.body.data.metrics.totalUsers).toBeGreaterThanOrEqual(3);
    });
  });
});
