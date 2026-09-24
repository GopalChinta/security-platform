import { Router } from 'express';
import { Role } from '@prisma/client';
import { auditLogsController } from './audit-logs.controller';
import { listAuditLogsSchema, getAuditLogByIdSchema } from './audit-logs.schema';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';

const router = Router();

// All audit log routes require authentication and ADMIN or MANAGER role
router.use(authenticate);
router.use(requireRole(Role.ADMIN, Role.MANAGER));

// List audit logs
router.get('/', validate(listAuditLogsSchema), (req, res, next) => {
  auditLogsController.listLogs(req, res, next);
});

// Get single audit log
router.get('/:id', validate(getAuditLogByIdSchema), (req, res, next) => {
  auditLogsController.getLogById(req, res, next);
});

export const auditLogsRoutes = router;
