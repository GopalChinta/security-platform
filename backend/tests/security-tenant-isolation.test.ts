import request from 'supertest';
import app from '../src/app';

describe('Mandatory Multi-Tenant Security & Cross-Tenant Isolation Tests', () => {
  let acmeAdminToken: string;
  let acmeManagerToken: string;
  let acmeUserToken: string;
  let globexAdminToken: string;
  let globexUserToken: string;

  beforeAll(async () => {
    // Authenticate Acme accounts (Tenant A)
    const acmeAdminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@acme.com', password: 'Admin@123' });
    acmeAdminToken = acmeAdminRes.body.data.token;

    const acmeManagerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@acme.com', password: 'Manager@123' });
    acmeManagerToken = acmeManagerRes.body.data.token;

    const acmeUserRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@acme.com', password: 'User@123' });
    acmeUserToken = acmeUserRes.body.data.token;

    // Authenticate Globex accounts (Tenant B)
    const globexAdminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@globex.com', password: 'Admin@123' });
    globexAdminToken = globexAdminRes.body.data.token;

    const globexUserRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@globex.com', password: 'User@123' });
    globexUserToken = globexUserRes.body.data.token;
  });

  describe('1. Cross-Tenant Campaign Isolation (Scenario ID: 201)', () => {
    it('Tenant B Admin can view Tenant B Campaign (ID: 201)', async () => {
      const res = await request(app)
        .get('/api/campaigns/201')
        .set('Authorization', `Bearer ${globexAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('201');
      expect(res.body.data.name).toBe('Globex Red Team Assessment 2026');
    });

    it('Tenant A User attempting GET /api/campaigns/201 MUST receive 404 Not Found', async () => {
      const res = await request(app)
        .get('/api/campaigns/201')
        .set('Authorization', `Bearer ${acmeUserToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CAMPAIGN_NOT_FOUND');
      // Must not leak any information about Tenant B
      expect(res.body.data).toBeUndefined();
    });

    it('Tenant A Manager attempting GET /api/campaigns/201 MUST receive 404 Not Found', async () => {
      const res = await request(app)
        .get('/api/campaigns/201')
        .set('Authorization', `Bearer ${acmeManagerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CAMPAIGN_NOT_FOUND');
    });

    it('Tenant A Admin attempting GET /api/campaigns/201 MUST receive 404 Not Found', async () => {
      const res = await request(app)
        .get('/api/campaigns/201')
        .set('Authorization', `Bearer ${acmeAdminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CAMPAIGN_NOT_FOUND');
    });

    it('Tenant A Admin attempting PATCH /api/campaigns/201 MUST receive 404 Not Found', async () => {
      const res = await request(app)
        .patch('/api/campaigns/201')
        .set('Authorization', `Bearer ${acmeAdminToken}`)
        .send({ name: 'Hacked Campaign Title' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('Tenant A Admin attempting DELETE /api/campaigns/201 MUST receive 404 Not Found', async () => {
      const res = await request(app)
        .delete('/api/campaigns/201')
        .set('Authorization', `Bearer ${acmeAdminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Cross-Tenant User Management Isolation', () => {
    it('Tenant A Admin attempting GET /api/users/user-globex-user MUST receive 404 Not Found', async () => {
      const res = await request(app)
        .get('/api/users/user-globex-user')
        .set('Authorization', `Bearer ${acmeAdminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('Tenant A Admin attempting PATCH /api/users/user-globex-user MUST receive 404 Not Found', async () => {
      const res = await request(app)
        .patch('/api/users/user-globex-user')
        .set('Authorization', `Bearer ${acmeAdminToken}`)
        .send({ name: 'Cross Tenant Attacker' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('Tenant A Admin attempting DELETE /api/users/user-globex-user MUST receive 404 Not Found', async () => {
      const res = await request(app)
        .delete('/api/users/user-globex-user')
        .set('Authorization', `Bearer ${acmeAdminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Cross-Tenant User Assignment Prevention', () => {
    it('Tenant A Admin attempting to assign Tenant B user to Tenant A campaign MUST be rejected', async () => {
      const res = await request(app)
        .post('/api/campaigns/cmp-acme-101/users')
        .set('Authorization', `Bearer ${acmeAdminToken}`)
        .send({ userId: 'user-globex-user' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('USER_NOT_FOUND');
    });

    it('Tenant A Admin attempting to assign Tenant A user to Tenant B campaign 201 MUST be rejected', async () => {
      const res = await request(app)
        .post('/api/campaigns/201/users')
        .set('Authorization', `Bearer ${acmeAdminToken}`)
        .send({ userId: 'user-acme-user' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CAMPAIGN_NOT_FOUND');
    });
  });

  describe('4. Cross-Tenant Security Events & Audit Logs Isolation', () => {
    it('Tenant A Admin attempting GET /api/security-events/evt-globex-01 MUST receive 404', async () => {
      const res = await request(app)
        .get('/api/security-events/evt-globex-01')
        .set('Authorization', `Bearer ${acmeAdminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('Tenant A Admin attempting GET /api/audit-logs/aud-globex-01 MUST receive 404', async () => {
      const res = await request(app)
        .get('/api/audit-logs/aud-globex-01')
        .set('Authorization', `Bearer ${acmeAdminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('5. Request Body Tenant Spoofing Protection', () => {
    it('Injecting tenantId in POST /api/campaigns body MUST be ignored/overridden by auth context', async () => {
      const res = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${acmeAdminToken}`)
        .send({
          name: 'Spoof Attempt Campaign',
          tenantId: 'tenant-globex-sec', // Attacker attempts to create campaign inside Globex
        });

      expect(res.status).toBe(201);
      // Resource must belong to Acme, NOT Globex!
      expect(res.body.data.tenantId).toBe('tenant-acme-corp');
      expect(res.body.data.tenantId).not.toBe('tenant-globex-sec');
    });
  });
});
