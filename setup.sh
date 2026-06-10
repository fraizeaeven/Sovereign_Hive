#!/bin/bash

# Sovereign Hive: Automated Setup Script
# Configures the environment for a 500-account cluster.

echo "🐝 Initializing Sovereign Hive Setup..."

# 1. Update & Install System Dependencies
echo "📦 Installing system dependencies (PostgreSQL, Redis)..."
if [ -f /etc/debian_version ]; then
    sudo apt update
    sudo apt install -y postgresql redis-server nodejs npm
elif [ -d /data/data/com.termux ]; then
    pkg update
    pkg install -y postgresql redis nodejs-lts
fi

# 2. Create Project Folders
echo "📁 Creating folder structure..."
mkdir -p media
mkdir -p data
mkdir -p logs

# 3. Install Node Dependencies
echo "npm: Installing packages..."
npm install

# 4. Configure .env template
if [ ! -f .env ]; then
    echo "📄 Creating .env template..."
    cat <<EOT >> .env
DATABASE_URL=postgres://user:password@localhost:5432/sovereign_hive
REDIS_URL=redis://127.0.0.1:6379
PUBLIC_URL=http://your-vps-ip:3000
ASSET_SERVER_PORT=3000
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
EOT
    echo "⚠️  Action Required: Update .env with your real credentials."
fi

# 5. Database Initialization Instruction
echo "🏛️  To initialize the database, run:"
echo "   psql -d your_db_name -f schema.sql"

echo "✅ Setup Complete. Sovereign Hive is ready to swarm."
