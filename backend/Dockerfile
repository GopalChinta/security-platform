# Backend Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json tsconfig.json ./
COPY prisma ./prisma/

# Install all dependencies
RUN npm ci

# Copy application source
COPY src ./src

# Generate Prisma Client and build TypeScript
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --omit=dev
RUN npx prisma generate

# Copy compiled files from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
