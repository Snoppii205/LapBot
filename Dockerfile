# syntax=docker/dockerfile:1

FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN npm ci

COPY packages/contracts ./packages/contracts
COPY apps/api ./apps/api
COPY apps/web ./apps/web

RUN npm run build && npm prune --omit=dev

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/contracts/package.json ./packages/contracts/
COPY --from=builder /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/migrations ./apps/api/migrations
COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY data/store-info.fallback.json ./data/store-info.fallback.json
COPY data/vz-catalog ./data/vz-catalog

RUN mkdir -p /app/data/uploads && chown -R node:node /app/data

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/v1/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "apps/api/dist/server.js"]
