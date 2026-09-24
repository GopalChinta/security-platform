import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export class DashboardController {
  async getMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const metrics = await dashboardService.getMetrics(req.user);
      sendSuccess(res, metrics);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
