import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Dashboard is accessible to all authenticated tenant users (ADMIN, MANAGER, USER)
router.use(authenticate);

router.get('/', (req, res, next) => {
  dashboardController.getMetrics(req, res, next);
});

export const dashboardRoutes = router;
