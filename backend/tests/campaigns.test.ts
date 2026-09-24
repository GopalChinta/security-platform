import request from 'supertest';
import app from '../src/app';

describe('Campaign Management & State Machine Tests', () => {
  let adminToken: string;
  let createdCampaignId: string;
  let testUserId: string;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@acme.com', password: 'Admin@123' });
    adminToken = loginRes.body.data.token;

    // Get a test user from Acme
    const usersRes = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    testUserId = usersRes.body.data[0].id;
  });

  it('1. Create Campaign in DRAFT status', async () => {
    const res = await request(app)
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'State Machine Test Campaign',
        description: 'Testing valid and invalid state transitions',
        status: 'DRAFT',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('DRAFT');
    createdCampaignId = res.body.data.id;
  });

  it('2. Transition DRAFT -> COMPLETED directly MUST fail with 400 Bad Request', async () => {
    const res = await request(app)
      .patch(`/api/campaigns/${createdCampaignId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');
  });

  it('3. Transition DRAFT -> ACTIVE succeeds with 200 OK', async () => {
    const res = await request(app)
      .patch(`/api/campaigns/${createdCampaignId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ACTIVE' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('4. Transition ACTIVE -> DRAFT MUST fail with 400 Bad Request', async () => {
    const res = await request(app)
      .patch(`/api/campaigns/${createdCampaignId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'DRAFT' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');
  });

  it('5. Transition ACTIVE -> COMPLETED succeeds with 200 OK', async () => {
    const res = await request(app)
      .patch(`/api/campaigns/${createdCampaignId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });

  it('6. Transition COMPLETED -> ACTIVE MUST fail with 400 Bad Request', async () => {
    const res = await request(app)
      .patch(`/api/campaigns/${createdCampaignId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ACTIVE' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');
  });

  it('7. User assignment to campaign succeeds', async () => {
    const res = await request(app)
      .post(`/api/campaigns/${createdCampaignId}/users`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: testUserId });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('8. Duplicate user assignment returns 409 Conflict', async () => {
    const res = await request(app)
      .post(`/api/campaigns/${createdCampaignId}/users`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: testUserId });

    expect(res.status).toBe(409);
  });

  it('9. Delete campaign succeeds for ADMIN', async () => {
    const res = await request(app)
      .delete(`/api/campaigns/${createdCampaignId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
