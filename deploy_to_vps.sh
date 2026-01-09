#!/bin/bash

# Script to deploy link2website to saroarabuilder.com
# Run this on your VPS: bash deploy_to_vps.sh

set -e

DOMAIN="saroarabuilder.com"
GITHUB_REPO="https://github.com/abobakeralsaraf/link2website.git"
TEMP_DIR="/tmp/link2website_deploy"
WEBSITE_DIR="/home/$DOMAIN/public_html"

echo "🚀 Starting deployment to $DOMAIN..."

echo "📦 Cloning repository..."
rm -rf $TEMP_DIR
git clone --depth 1 $GITHUB_REPO $TEMP_DIR

echo "📋 Installing dependencies..."
cd $TEMP_DIR
npm install

echo "🔨 Building project..."
npm run build

if [ -d "$WEBSITE_DIR" ]; then
    echo "💾 Creating backup..."
    BACKUP_DIR="/home/$DOMAIN/backups/backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p /home/$DOMAIN/backups
    cp -r $WEBSITE_DIR $BACKUP_DIR
    
    echo "🗑️  Cleaning website directory..."
    find $WEBSITE_DIR -mindepth 1 ! -name '.htaccess' -delete
fi

echo "📤 Deploying files..."
cp -r $TEMP_DIR/dist/* $WEBSITE_DIR/

echo "🔐 Setting permissions..."
chown -R $DOMAIN:$DOMAIN $WEBSITE_DIR
chmod -R 755 $WEBSITE_DIR
find $WEBSITE_DIR -type f -exec chmod 644 {} \;

echo "🧹 Cleaning up..."
rm -rf $TEMP_DIR

echo "✅ Deployment completed successfully!"
echo "🌐 Visit: https://$DOMAIN"
```

### 5️⃣ اكتب Commit message:
```
Add deployment script
