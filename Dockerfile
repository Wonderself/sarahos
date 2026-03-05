# ═══════════════════════════════════════════════════════
# Freenzy.io Backend — Production Dockerfile
# ═══════════════════════════════════════════════════════

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc --skipLibCheck

FROM node:20-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY scripts/ ./scripts/
COPY state/ ./state/
COPY roadmap/ ./roadmap/
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=30s \
  CMD curl -f http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
