import { Request, Response, NextFunction } from 'express';
import { campaignsService } from './campaigns.service';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';
import { getClientIp } from '../../utils/audit';

export class CampaignsController {
  async listCampaigns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await campaignsService.listCampaigns(req.user, req.query as any);
      sendSuccess(res, result.items, 'Campaigns retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getCampaignById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const campaign = await campaignsService.getCampaignById(id, req.user);
      sendSuccess(res, campaign);
    } catch (error) {
      next(error);
    }
  }

  async createCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const ipAddress = getClientIp(req);
      const campaign = await campaignsService.createCampaign(req.body, req.user, ipAddress);
      sendSuccess(res, campaign, 'Campaign created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const ipAddress = getClientIp(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const campaign = await campaignsService.updateCampaign(id, req.body, req.user, ipAddress);
      sendSuccess(res, campaign, 'Campaign updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteCampaign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const ipAddress = getClientIp(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await campaignsService.deleteCampaign(id, req.user, ipAddress);
      sendSuccess(res, result, 'Campaign deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async assignUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const ipAddress = getClientIp(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const assignment = await campaignsService.assignUserToCampaign(id, req.body, req.user, ipAddress);
      sendSuccess(res, assignment, 'User assigned to campaign successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async removeUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const ipAddress = getClientIp(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      const result = await campaignsService.removeUserFromCampaign(id, userId, req.user, ipAddress);
      sendSuccess(res, result, 'User removed from campaign successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const campaignsController = new CampaignsController();
