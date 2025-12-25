#!/bin/bash

# Configuration
PROJECT_DIR="/home/inextrix/Documents/VoxMarket"
LOG_DIR="$PROJECT_DIR/logs"
BACKEND_PORT=3000
FRONTEND_PORT=5173

# Ensure logs exist
mkdir -p "$LOG_DIR"

# Cleanup function
cleanup() {
    echo "$(date): 🛑 Stopping VoxMarket Production Service..." >> "$LOG_DIR/service.log"
    pkill -P $$
    exit
}
trap cleanup SIGINT SIGTERM EXIT

echo "$(date): 🚀 Starting VoxMarket 24/7 Service..." >> "$LOG_DIR/service.log"

# 1. Start Backend
cd "$PROJECT_DIR/backend" || exit
npm run start > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "$(date):    Backend started (PID: $BACKEND_PID)" >> "$LOG_DIR/service.log"

# 2. Wait for Backend
sleep 5

# 3. Start Frontend (Production Build Recommended, but using dev for consistency)
# Note: For strict production, we should 'npm run build' and serve dist. 
# Sticking to dev for now to ensure their current code runs.
cd "$PROJECT_DIR/frontend" || exit
VITE_API_URL="http://localhost:$BACKEND_PORT" npm run dev -- --host > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "$(date):    Frontend started (PID: $FRONTEND_PID)" >> "$LOG_DIR/service.log"

# 4. Cloudflare Tunnel (Custom Domain Mode)
# This assumes the user has configured the tunnel token or is running quick tunnel.
# If they have a token, they should replace the command below.
echo "$(date):    Starting Gateway..." >> "$LOG_DIR/service.log"
cloudflared tunnel --url http://localhost:$FRONTEND_PORT --no-autoupdate > "$LOG_DIR/tunnel.log" 2>&1 &
TUNNEL_PID=$!

echo "$(date): ✅ All services functionality. Monitoring..." >> "$LOG_DIR/service.log"

# Keep alive
wait
