FROM node:22-alpine
WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN pnpm install
RUN cd packages/web && npx vite build
RUN cd packages/api && pnpm build
RUN cd packages/api && pnpm prisma generate 2>/dev/null || true

EXPOSE 3000

CMD ["node", "packages/api/dist/main.js"]
