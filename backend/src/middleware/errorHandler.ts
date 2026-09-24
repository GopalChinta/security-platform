import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { logger } from '../config/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Extract context for logging
  const context = {
    path: req.path,
    method: req.method,
    ip: req.ip || req.socket.remoteAddress,
    userId: req.user?.userId,
    tenantId: req.user?.tenantId,
  };

  // Custom AppError
  if (err instanceof AppError) {
    logger.warn(`AppError: [${err.code}] ${err.message}`, { ...context, details: err.details });
    sendError(res, err.message, err.statusCode, err.code, err.details);
    return;
  }

  // Prisma unique constraint violation (P2002)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || [];
      const field = target.join(', ');
      logger.warn(`Prisma Unique Constraint Violation on [${field}]`, context);
      sendError(res, `A resource with this ${field || 'value'} already exists`, 409, 'CONFLICT', { target });
      return;
    }

    // Record not found in Prisma (P2025)
    if (err.code === 'P2025') {
      logger.warn('Prisma Record Not Found', context);
      sendError(res, 'Requested resource not found', 404, 'NOT_FOUND');
      return;
    }

    // Foreign key constraint failure (P2003)
    if (err.code === 'P2003') {
      logger.warn('Prisma Foreign Key Constraint Violation', context);
      sendError(res, 'Referenced related resource does not exist', 400, 'FOREIGN_KEY_VIOLATION');
      return;
    }

    logger.error('Prisma Database Error', context, err);
    sendError(res, 'Database operation failed', 500, 'DATABASE_ERROR');
    return;
  }

  // Syntax error / JSON parse error
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    sendError(res, 'Malformed JSON payload', 400, 'INVALID_JSON');
    return;
  }

  // Fallback: Internal Server Error (500)
  logger.error('Unhandled Internal Server Error', context, err);

  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected internal error occurred'
      : err.message || 'Internal server error';

  sendError(res, message, 500, 'INTERNAL_SERVER_ERROR');
}
