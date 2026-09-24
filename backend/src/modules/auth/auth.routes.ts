import { Router } from 'express';
import { authController } from './auth.controller';
import { loginSchema } from './auth.schema';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { authRateLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.post('/login', authRateLimiter, validate(loginSchema), (req, res, next) => {
  authController.login(req, res, next);
});

router.get('/me', authenticate, (req, res, next) => {
  authController.getCurrentUser(req, res, next);
});

export const authRoutes = router;
