#!/usr/bin/bash

cd /root/app/4-final-cash-me-if-you-can/front-end
git pull
npm install
rm -rf build/
npm run build

cd ../back-end
git pull
npm install
pm2 restart cashme-backend

sudo systemctl reload nginx

echo "🚀 Deployment complete!"