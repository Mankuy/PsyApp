FROM node:22
WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN pnpm install || (echo "=== pnpm install failed ===" && exit 1)

# Generar Prisma Client ANTES de buildar (NestJS lo necesita)
RUN cd packages/api && pnpm prisma generate || (echo "=== prisma generate failed ===" && exit 1)

RUN cd packages/web && npx vite build || (echo "=== web build failed ===" && exit 1)

RUN cd packages/api && pnpm build || (echo "=== api build failed ===" && exit 1)

RUN test -f packages/api/dist/main.js || (echo "=== dist/main.js not found ===" && ls -la packages/api/dist/ && exit 1)

EXPOSE 3000

CMD ["node", "packages/api/dist/main.js"]
