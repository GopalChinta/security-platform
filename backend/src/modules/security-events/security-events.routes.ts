import { Router } from 'express';
import { Role } from '@prisma/client';
import { securityEventsController } from './security-events.controller';
import {
  createSecurityEventSchema,
  updateSecurityEventSchema,
  listSecurityEventsSchema,
  getSecurityEventByIdSchema,
} from './security-events.schema';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// List security events (ADMIN, MANAGER, USER)
router.get('/', validate(listSecurityEventsSchema), (req, res, next) => {
  securityEventsController.listEvents(req, res, next);
});

// Get security event by ID (ADMIN, MANAGER, USER)
router.get('/:id', validate(getSecurityEventByIdSchema), (req, res, next) => {
  securityEventsController.getEventById(req, res, next);
});

// Create security event (ADMIN, MANAGER)
router.post(
  '/',
  requireRole(Role.ADMIN, Role.MANAGER),
  validate(createSecurityEventSchema),
  (req, res, next) => {
    securityEventsController.createEvent(req, res, next);
  }
);

// Update security event (ADMIN, MANAGER)
router.patch(
  '/:id',
  requireRole(Role.ADMIN, Role.MANAGER),
  validate(updateSecurityEventSchema),
  (req, res, next) => {
    securityEventsController.updateEvent(req, res, next);
  }
);

export const securityEventsRoutes = router;
