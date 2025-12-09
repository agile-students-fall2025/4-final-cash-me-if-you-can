#!/usr/bin/bash
set -euo pipefail   # Exit on errors, undefined variables, or failed pipes
IFS=$'\n\t'          # Better handling of spaces in filenames

# --- CONFIG ---
FRONTEND_DIR="/root/app/4-final-cash-me-if-you-can/front-end"
BACKEND_DIR="/root/app/4-final-cash-me-if-you-can/back-end"
PM2_APP_NAME="cashme-backend"

# --- LOAD ENVIRONMENT VARIABLES ---
if [ -f "$BACKEND_DIR/.env" ]; then
    export $(grep -v '^#' "$BACKEND_DIR/.env" | xargs)
fi

if [ -f "$FRONTEND_DIR/.env" ]; then
    export $(grep -v '^#' "$FRONTEND_DIR/.env" | xargs)
fi

git reset --hard
git clean -fd
git pull origin

# --- FRONTEND DEPLOY ---
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 Deploying frontend..."
cd "$FRONTEND_DIR"

echo "Pulling latest frontend code..."
git pull origin

echo "Installing frontend dependencies..."
npm install --legacy-peer-deps

echo "Cleaning old build..."
rm -rf build/

echo "Building frontend..."
npm run build
echo "✅ Frontend deployed."

# --- BACKEND DEPLOY ---
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 Deploying backend..."
cd "$BACKEND_DIR"

echo "Pulling latest backend code..."
git pull origin

echo "Installing backend dependencies..."
npm install --legacy-peer-deps

echo "Restarting backend via PM2..."
pm2 stop all
pm2 delete all
pm2 start ecosystem.config.js --only cashme-backend
pm2 save
pm2 status

echo "Testing api health..."
curl http://localhost:5001/api/health

# --- NGINX RELOAD ---
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Reloading Nginx..."
sudo systemctl reload nginx
echo "✅ Nginx reloaded."

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🎉 Deployment complete!"