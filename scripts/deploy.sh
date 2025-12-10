#!/usr/bin/bash
source ~/.bashrc
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

API_URL=$(grep REACT_APP_API_URL $FRONTEND_DIR/.env | cut -d '=' -f2)
echo "Using API URL: $API_URL"

echo "Pulling latest code..."
git reset --hard
git clean -fd
git pull origin

# --- FRONTEND DEPLOY ---
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 Deploying frontend..."
cd "$FRONTEND_DIR"

echo "Installing frontend dependencies..."
# rm -rf node_modules/
npm install --legacy-peer-deps

echo "Cleaning old build..."
rm -rf build/

echo "Building frontend..."
npm run build

echo "Copying build to Nginx web directory..."
rm -rf /var/www/cashme/*          # <-- wipes old version
cp -r build/* /var/www/cashme/    # <-- installs new version

echo "✅ Frontend deployed."

# --- BACKEND DEPLOY ---
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 Deploying backend..."
cd "$BACKEND_DIR"

echo "Installing backend dependencies..."
# rm -rf node_modules/
npm install --legacy-peer-deps


echo "Restarting backend via PM2..."
pm2 reload $PM2_APP_NAME || pm2 start ecosystem.config.js --only $PM2_APP_NAME
pm2 save
pm2 status

echo "[🚦] Waiting for backend to boot..."
for i in {1..45}; do   # max ~30 tries = ~30 sec
  if curl -fs "$API_URL/health" > /dev/null; then
    echo "🟢 Backend is live!"
    break
  fi
  echo "⏳ Backend not ready yet... retrying ($i/45)"
  sleep 2
done

# --- NGINX RELOAD ---
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Reloading Nginx..."
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo systemctl nging -t
echo "✅ Nginx reloaded."

echo "Testing api health..."
curl "$API_URL/health"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🎉 Deployment complete!"