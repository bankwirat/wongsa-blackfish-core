# Build stage
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-workspace.yaml ./
COPY .npmrc ./

# Copy core packages (dependencies)
COPY core/packages ./core/packages

# Copy frontend app
COPY core/apps/frontend ./core/apps/frontend

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build frontend
WORKDIR /app/core/apps/frontend
RUN pnpm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built Next.js files
COPY --from=base /app/core/apps/frontend/.next/standalone ./
COPY --from=base /app/core/apps/frontend/.next/static ./core/apps/frontend/.next/static
COPY --from=base /app/core/apps/frontend/public ./core/apps/frontend/public

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

CMD ["node", "core/apps/frontend/server.js"]

