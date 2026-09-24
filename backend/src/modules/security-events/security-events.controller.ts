import { Request, Response, NextFunction } from 'express';
import { securityEventsService } from './security-events.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';
import { getClientIp } from '../../utils/audit';

export class SecurityEventsController {
  async listEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await securityEventsService.listEvents(req.user, req.query as any);
      sendSuccess(res, result.items, 'Security events retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const event = await securityEventsService.getEventById(id, req.user);
      sendSuccess(res, event);
    } catch (error) {
      next(error);
    }
  }

  async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const ipAddress = getClientIp(req);
      const event = await securityEventsService.createEvent(req.body, req.user, ipAddress);
      sendSuccess(res, event, 'Security event created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const ipAddress = getClientIp(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const event = await securityEventsService.updateEvent(id, req.body, req.user, ipAddress);
      sendSuccess(res, event, 'Security event updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const securityEventsController = new SecurityEventsController();
