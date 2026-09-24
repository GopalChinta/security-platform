export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Deep Trace Cybernetics - Multi-Tenant Security Management API',
    version: '1.0.0',
    description: `Enterprise-grade, multi-tenant Security Management Platform API with strict tenant isolation and Role-Based Access Control (RBAC).
    
### Key Security Architecture
- **Strict Tenant Isolation**: Every resource belongs to a tenant. Cross-tenant access is rejected with 404 (Not Found) to avoid information disclosure.
- **Role-Based Access Control**: Supported roles are \`ADMIN\`, \`MANAGER\`, and \`USER\`.
- **Audit Logging**: All sensitive mutations and auth events are immutably logged with client IP and metadata.
    `,
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide JWT token obtained from POST /api/auth/login',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'NOT_FOUND' },
              message: { type: 'string', example: 'Resource not found' },
              details: { type: 'object' },
            },
          },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 42 },
          totalPages: { type: 'integer', example: 5 },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr-123' },
          name: { type: 'string', example: 'Alice Walker' },
          email: { type: 'string', example: 'admin@acme.com' },
          role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'USER'], example: 'ADMIN' },
          tenantId: { type: 'string', example: 'tenant-acme-corp' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Campaign: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cmp-acme-101' },
          tenantId: { type: 'string', example: 'tenant-acme-corp' },
          name: { type: 'string', example: 'Q1 Enterprise Phishing Simulation' },
          description: { type: 'string', example: 'Simulated spear-phishing campaign' },
          status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'], example: 'ACTIVE' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      SecurityEvent: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'evt-acme-01' },
          tenantId: { type: 'string', example: 'tenant-acme-corp' },
          eventType: { type: 'string', example: 'UNAUTHORIZED_SSH_BRUTE_FORCE' },
          severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], example: 'HIGH' },
          status: { type: 'string', enum: ['OPEN', 'RESOLVED'], example: 'OPEN' },
          description: { type: 'string', example: 'Repeated brute force SSH login attempts' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AuditLog: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'aud-acme-01' },
          tenantId: { type: 'string', example: 'tenant-acme-corp' },
          userId: { type: 'string', example: 'user-acme-admin' },
          action: { type: 'string', example: 'CAMPAIGN_CREATED' },
          entityType: { type: 'string', example: 'CAMPAIGN' },
          entityId: { type: 'string', example: 'cmp-acme-101' },
          description: { type: 'string', example: 'Campaign "Q1 Enterprise Phishing Simulation" created.' },
          ipAddress: { type: 'string', example: '127.0.0.1' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Authenticate user and obtain JWT token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@acme.com' },
                  password: { type: 'string', example: 'Admin@123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authentication successful with JWT token and user info' },
          401: { description: 'Invalid email or password' },
          429: { description: 'Too many login attempts, rate limited' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current authenticated user session',
        security: [{ BearerAuth: [] }],
        tags: ['Authentication'],
        responses: {
          200: { description: 'Current authenticated user profile' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/dashboard': {
      get: {
        summary: 'Get tenant dashboard metrics and recent activity',
        security: [{ BearerAuth: [] }],
        tags: ['Dashboard'],
        responses: {
          200: { description: 'Tenant metrics and charts data' },
        },
      },
    },
    '/api/campaigns': {
      get: {
        summary: 'List tenant campaigns with pagination and filtering',
        security: [{ BearerAuth: [] }],
        tags: ['Campaigns'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Paginated list of campaigns' },
        },
      },
      post: {
        summary: 'Create a new campaign (ADMIN, MANAGER)',
        security: [{ BearerAuth: [] }],
        tags: ['Campaigns'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Q2 Awareness Drill' },
                  description: { type: 'string', example: 'Corporate awareness training' },
                  status: { type: 'string', enum: ['DRAFT', 'ACTIVE'] },
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Campaign created successfully' },
        },
      },
    },
    '/api/campaigns/{id}': {
      get: {
        summary: 'Get campaign details by ID',
        security: [{ BearerAuth: [] }],
        tags: ['Campaigns'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Campaign details' },
          404: { description: 'Campaign not found (or belongs to another tenant)' },
        },
      },
      patch: {
        summary: 'Update campaign (ADMIN, MANAGER)',
        security: [{ BearerAuth: [] }],
        tags: ['Campaigns'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Campaign updated successfully' },
          400: { description: 'Invalid status transition' },
          404: { description: 'Campaign not found' },
        },
      },
      delete: {
        summary: 'Delete campaign (ADMIN only)',
        security: [{ BearerAuth: [] }],
        tags: ['Campaigns'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Campaign deleted' },
          403: { description: 'Forbidden (Requires ADMIN)' },
          404: { description: 'Campaign not found' },
        },
      },
    },
    '/api/campaigns/{id}/users': {
      post: {
        summary: 'Assign tenant user to campaign (ADMIN, MANAGER)',
        security: [{ BearerAuth: [] }],
        tags: ['Campaigns'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: { userId: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          201: { description: 'User assigned to campaign' },
          404: { description: 'Campaign or User not found in organization' },
        },
      },
    },
    '/api/security-events': {
      get: {
        summary: 'List security events with severity/status filters',
        security: [{ BearerAuth: [] }],
        tags: ['Security Events'],
        responses: {
          200: { description: 'Paginated list of security events' },
        },
      },
      post: {
        summary: 'Create security event (ADMIN, MANAGER)',
        security: [{ BearerAuth: [] }],
        tags: ['Security Events'],
        responses: {
          201: { description: 'Security event created' },
        },
      },
    },
    '/api/users': {
      get: {
        summary: 'List users in organization (ADMIN, MANAGER)',
        security: [{ BearerAuth: [] }],
        tags: ['Users'],
        responses: {
          200: { description: 'Paginated list of users' },
          403: { description: 'Forbidden for regular USER' },
        },
      },
      post: {
        summary: 'Create new user in organization (ADMIN only)',
        security: [{ BearerAuth: [] }],
        tags: ['Users'],
        responses: {
          201: { description: 'User created' },
          403: { description: 'Forbidden' },
          409: { description: 'Email conflict' },
        },
      },
    },
    '/api/audit-logs': {
      get: {
        summary: 'List tenant audit logs (ADMIN, MANAGER)',
        security: [{ BearerAuth: [] }],
        tags: ['Audit Logs'],
        responses: {
          200: { description: 'Paginated audit logs' },
          403: { description: 'Forbidden for regular USER' },
        },
      },
    },
  },
};
