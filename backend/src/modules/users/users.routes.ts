import { Router } from 'express';
import { Role } from '@prisma/client';
import { usersController } from './users.controller';
import { createUserSchema, updateUserSchema, listUsersSchema, getUserByIdSchema } from './users.schema';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// List users (ADMIN and MANAGER)
router.get(
  '/',
  requireRole(Role.ADMIN, Role.MANAGER),
  validate(listUsersSchema),
  (req, res, next) => {
    usersController.listUsers(req, res, next);
  }
);

// Get single user by ID (ADMIN and MANAGER)
router.get(
  '/:id',
  requireRole(Role.ADMIN, Role.MANAGER),
  validate(getUserByIdSchema),
  (req, res, next) => {
    usersController.getUserById(req, res, next);
  }
);

// Create new user (ADMIN only)
router.post(
  '/',
  requireRole(Role.ADMIN),
  validate(createUserSchema),
  (req, res, next) => {
    usersController.createUser(req, res, next);
  }
);

// Update user (ADMIN only)
router.patch(
  '/:id',
  requireRole(Role.ADMIN),
  validate(updateUserSchema),
  (req, res, next) => {
    usersController.updateUser(req, res, next);
  }
);

// Delete user (ADMIN only)
router.delete(
  '/:id',
  requireRole(Role.ADMIN),
  validate(getUserByIdSchema),
  (req, res, next) => {
    usersController.deleteUser(req, res, next);
  }
);

export const usersRoutes = router;
