#!/usr/bin/bash
set -euo pipefail   # Exit on errors, undefined variables, or failed pipes

# --- CONFIG ---
FRONTEND_DIR="/root/app/4-final-cash-me-if-you-can/front-end"
BACKEND_DIR="/root/app/4-final-cash-me-if-you-can/back-end"
PM2_APP_NAME="cashme-backend"

# --- FRONTEND DEPLOY ---
echo "Deploying frontend..."
cd "$FRONTEND_DIR"

echo "Pulling latest frontend code..."
git pull

echo "Installing frontend dependencies..."
npm install

echo "Cleaning old build..."
rm -rf build/

echo "Building frontend..."
npm run build
echo "Frontend deployed."

# --- BACKEND DEPLOY ---
echo "Deploying backend..."
cd "$BACKEND_DIR"

echo "Pulling latest backend code..."
git pull

echo "Installing backend dependencies..."
npm install

echo "Restarting backend via PM2..."
pm2 restart "$PM2_APP_NAME" || pm2 start app.js --name "$PM2_APP_NAME"
echo "Backend deployed."

# --- NGINX RELOAD ---
echo "Reloading Nginx..."
sudo systemctl reload nginx
echo "Nginx reloaded."

echo "Deployment complete!"