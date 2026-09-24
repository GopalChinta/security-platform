import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { logger } from './config/logger';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Security Management Backend API is running on port ${env.PORT}`);
  logger.info(`📚 Swagger Documentation available at http://localhost:${env.PORT}/api/docs`);
  logger.info(`🩺 Health Check endpoint available at http://localhost:${env.PORT}/health`);
});

// Graceful shutdown handling
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      await prisma.$disconnect();
      logger.info('Database connection closed.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during database disconnection', {}, err as Error);
      process.exit(1);
    }
  });

  // Force close after 10s if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Shutdown timed out. Forcefully terminating.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
