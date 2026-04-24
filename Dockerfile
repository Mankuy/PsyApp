FROM node:22-alpine
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml package.json* pnpm-lock.yaml* ./
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/
COPY packages/core/package.json ./packages/core/
COPY packages/ai/package.json ./packages/ai/
COPY packages/scheduling/package.json ./packages/scheduling/
COPY packages/payments/package.json ./packages/payments/
COPY packages/notifications/package.json ./packages/notifications/

# Install deps
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build frontend and backend
RUN cd packages/web && npx vite build
RUN pnpm --filter api build

# Prisma generate (if needed)
RUN pnpm --filter api prisma generate 2>/dev/null || true

EXPOSE 3000

CMD ["node", "packages/api/dist/main.js"]
