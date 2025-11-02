# Build stage
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy root files for workspace config
COPY package.json pnpm-workspace.yaml ./
COPY .npmrc ./

# Copy core packages (shared dependencies)
COPY core/packages ./core/packages

# Copy backend app
COPY core/apps/backend ./core/apps/backend

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build backend
WORKDIR /app/core/apps/backend
RUN pnpm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built files
COPY --from=base /app/core/apps/backend/dist ./dist
COPY --from=base /app/core/apps/backend/package.json ./
COPY --from=base /app/core/apps/backend/prisma ./prisma

# Copy only production node_modules (from workspace)
COPY --from=base /app/node_modules ./node_modules

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]

