import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';
import { getClientIp } from '../../utils/audit';

export class UsersController {
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await usersService.listUsers(req.user, req.query as any);
      sendSuccess(res, result.items, 'Users retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await usersService.getUserById(id, req.user);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const ipAddress = getClientIp(req);
      const user = await usersService.createUser(req.body, req.user, ipAddress);
      sendSuccess(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const ipAddress = getClientIp(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await usersService.updateUser(id, req.body, req.user, ipAddress);
      sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const ipAddress = getClientIp(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await usersService.deleteUser(id, req.user, ipAddress);
      sendSuccess(res, result, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
