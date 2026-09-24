import { Router } from 'express';
import { Role } from '@prisma/client';
import { campaignsController } from './campaigns.controller';
import {
  createCampaignSchema,
  updateCampaignSchema,
  listCampaignsSchema,
  getCampaignByIdSchema,
  assignUserSchema,
  removeUserAssignmentSchema,
} from './campaigns.schema';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';

const router = Router();

// All campaign routes require authentication
router.use(authenticate);

// List campaigns (ADMIN, MANAGER, USER)
router.get('/', validate(listCampaignsSchema), (req, res, next) => {
  campaignsController.listCampaigns(req, res, next);
});

// Get campaign by ID (ADMIN, MANAGER, USER)
router.get('/:id', validate(getCampaignByIdSchema), (req, res, next) => {
  campaignsController.getCampaignById(req, res, next);
});

// Create campaign (ADMIN, MANAGER)
router.post(
  '/',
  requireRole(Role.ADMIN, Role.MANAGER),
  validate(createCampaignSchema),
  (req, res, next) => {
    campaignsController.createCampaign(req, res, next);
  }
);

// Update campaign PATCH (ADMIN, MANAGER)
router.patch(
  '/:id',
  requireRole(Role.ADMIN, Role.MANAGER),
  validate(updateCampaignSchema),
  (req, res, next) => {
    campaignsController.updateCampaign(req, res, next);
  }
);

// Update campaign PUT (ADMIN, MANAGER)
router.put(
  '/:id',
  requireRole(Role.ADMIN, Role.MANAGER),
  validate(updateCampaignSchema),
  (req, res, next) => {
    campaignsController.updateCampaign(req, res, next);
  }
);

// Delete campaign (ADMIN only)
router.delete(
  '/:id',
  requireRole(Role.ADMIN),
  validate(getCampaignByIdSchema),
  (req, res, next) => {
    campaignsController.deleteCampaign(req, res, next);
  }
);

// Assign user to campaign (ADMIN, MANAGER)
router.post(
  '/:id/users',
  requireRole(Role.ADMIN, Role.MANAGER),
  validate(assignUserSchema),
  (req, res, next) => {
    campaignsController.assignUser(req, res, next);
  }
);

// Remove user from campaign (ADMIN, MANAGER)
router.delete(
  '/:id/users/:userId',
  requireRole(Role.ADMIN, Role.MANAGER),
  validate(removeUserAssignmentSchema),
  (req, res, next) => {
    campaignsController.removeUser(req, res, next);
  }
);

export const campaignsRoutes = router;
