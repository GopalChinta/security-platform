import { Request, Response, NextFunction } from 'express';
import { auditLogsService } from './audit-logs.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';

export class AuditLogsController {
  async listLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await auditLogsService.listLogs(req.user, req.query as any);
      sendSuccess(res, result.items, 'Audit logs retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getLogById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const log = await auditLogsService.getLogById(id, req.user);
      sendSuccess(res, log);
    } catch (error) {
      next(error);
    }
  }
}

export const auditLogsController = new AuditLogsController();
