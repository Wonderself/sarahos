#!/bin/bash
set -euo pipefail

echo "🚀 Deploying SARAH OS to staging..."

# Pull latest code
git pull origin develop

# Build and restart
docker compose -f docker-compose.staging.yml build
docker compose -f docker-compose.staging.yml down
docker compose -f docker-compose.staging.yml up -d

# Run migrations
docker compose -f docker-compose.staging.yml exec backend npm run migrate --if-present

# Health check
echo "⏳ Waiting for services..."
sleep 10
curl -sf http://localhost:3000/health || echo "⚠️ Backend health check failed"
curl -sf http://localhost:3001 || echo "⚠️ Dashboard health check failed"

echo "✅ Staging deployment complete!"
