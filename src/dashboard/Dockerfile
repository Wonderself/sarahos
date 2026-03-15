# ═══════════════════════════════════════════════════════
# Flashboard Dashboard — Production Dockerfile
# ═══════════════════════════════════════════════════════

FROM node:20-alpine AS builder
WORKDIR /app

# Accept API URL as build arg (Next.js bakes NEXT_PUBLIC_* at build time)
ARG NEXT_PUBLIC_API_URL=https://api.freenzy.io
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NODE_OPTIONS=--max-old-space-size=8192
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache curl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=30s \
  CMD curl -f http://localhost:3000/ || exit 1
CMD ["node", "server.js"]
