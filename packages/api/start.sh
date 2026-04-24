#!/bin/sh
cd /app/packages/api
npx prisma migrate deploy
node dist/main.js