FROM node:22-alpine
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace config and root package.json
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./

# Copy all package.json files first (for layer caching)
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/
COPY packages/core/package.json ./packages/core/
COPY packages/ai/package.json ./packages/ai/
COPY packages/scheduling/package.json ./packages/scheduling/
COPY packages/payments/package.json ./packages/payments/
COPY packages/notifications/package.json ./packages/notifications/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build frontend
RUN cd packages/web && npx vite build

# Build backend
RUN cd packages/api && pnpm build

# Generate Prisma client
RUN cd packages/api && pnpm prisma generate 2>/dev/null || true

EXPOSE 3000

CMD ["node", "packages/api/dist/main.js"]
