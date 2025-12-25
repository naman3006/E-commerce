#!/bin/bash

# Configuration
BACKEND_PORT=3000
FRONTEND_PORT=5173
LOG_DIR="deploy_logs"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Cleanup function to kill processes on exit
cleanup() {
    # Disable the trap to prevent infinite recursion
    trap - SIGINT SIGTERM EXIT
    echo ""
    echo "🛑 Shutting down..."
    
    # Kill all child processes in the current process group
    # Using specific pkill pattern or just killing the group carefully
    kill -- -$$ 2>/dev/null
    exit
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM EXIT

echo "🚀 Starting VoxMarket Deployment..."

# 1. Start Backend
echo "📦 [1/6] Starting Backend..."
cd backend
# Use nohup to keep it running and redirect output
nohup npm run start:dev > "../$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
cd ..
echo "   ↳ Backend PID: $BACKEND_PID"

# Wait for backend port
echo "⏳ Waiting for Backend to be ready on port $BACKEND_PORT..."
TIMEOUT=60
COUNTER=0
while ! lsof -i :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null; do
    sleep 1
    COUNTER=$((COUNTER+1))
    if [ $COUNTER -ge $TIMEOUT ]; then
        echo "❌ Backend failed to start within $TIMEOUT seconds. Check $LOG_DIR/backend.log"
        exit 1
    fi
done
echo "✅ Backend is UP!"

# 2. Start Backend Tunnel
echo "🚇 [2/6] Exposing Backend via Cloudflare..."
nohup cloudflared tunnel --url http://localhost:$BACKEND_PORT --no-autoupdate > "$LOG_DIR/backend_tunnel.log" 2>&1 &
TUNNEL_BACKEND_PID=$!

# 3. Fetch Backend URL
echo "🔍 [3/6] Fetching Backend Public URL..."
BACKEND_URL=""
COUNTER=0
while [ -z "$BACKEND_URL" ]; do
    sleep 2
    if [ -f "$LOG_DIR/backend_tunnel.log" ]; then
        BACKEND_URL=$(grep -m 1 -o 'https://[a-zA-Z0-9.-]*trycloudflare.com' "$LOG_DIR/backend_tunnel.log")
    fi
    COUNTER=$((COUNTER+1))
    if [ $COUNTER -ge 30 ]; then
        echo "❌ Could not get Backend public URL. Check $LOG_DIR/backend_tunnel.log"
        exit 1
    fi
done
echo "✅ Backend Public URL: $BACKEND_URL"

# 4. Start Frontend
echo "🎨 [4/6] Starting Frontend..."
cd frontend
# Pass the backend URL as VITE_API_URL
VITE_API_URL=$BACKEND_URL nohup npm run dev > "../$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
cd ..
echo "   ↳ Frontend PID: $FRONTEND_PID"

# Wait for frontend port
echo "⏳ Waiting for Frontend to be ready on port $FRONTEND_PORT..."
COUNTER=0
while ! lsof -i :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null; do
    sleep 1
    COUNTER=$((COUNTER+1))
    if [ $COUNTER -ge $TIMEOUT ]; then
        echo "❌ Frontend failed to start within $TIMEOUT seconds. Check $LOG_DIR/frontend.log"
        exit 1
    fi
done
echo "✅ Frontend is UP!"

# 5. Start Frontend Tunnel
echo "🚇 [5/6] Exposing Frontend via Cloudflare..."
nohup cloudflared tunnel --url http://localhost:$FRONTEND_PORT --no-autoupdate > "$LOG_DIR/frontend_tunnel.log" 2>&1 &
TUNNEL_FRONTEND_PID=$!

# 6. Fetch Frontend URL
echo "🔍 [6/6] Fetching Frontend Public URL..."
FRONTEND_URL=""
COUNTER=0
while [ -z "$FRONTEND_URL" ]; do
    sleep 2
    if [ -f "$LOG_DIR/frontend_tunnel.log" ]; then
        FRONTEND_URL=$(grep -m 1 -o 'https://[a-zA-Z0-9.-]*trycloudflare.com' "$LOG_DIR/frontend_tunnel.log")
    fi
    COUNTER=$((COUNTER+1))
    if [ $COUNTER -ge 30 ]; then
        echo "❌ Could not get Frontend public URL. Check $LOG_DIR/frontend_tunnel.log"
        exit 1
    fi
done

echo ""
echo "==================================================="
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "==================================================="
echo "🌍 Public Access Link (Share this with anyone):"
echo "👉 $FRONTEND_URL"

# Generate QR Code
if command -v npx &> /dev/null; then
    echo ""
    echo "📱 Scan this QR code with your phone which is on the same network or different network:"
    npx -y qrcode-terminal "$FRONTEND_URL" small
    echo ""
fi

echo ""
echo "🔗 Backend API Link:"
echo "👉 $BACKEND_URL"
echo "==================================================="

# Save to file for easy access
echo "Frontend: $FRONTEND_URL" > access_links.txt
echo "Backend: $BACKEND_URL" >> access_links.txt
echo "Links saved to 'access_links.txt'"

# Auto-open in browser
if command -v xdg-open &> /dev/null; then
    echo "🚀 Opening website in your default browser..."
    xdg-open "$FRONTEND_URL"
fi

echo "Press Ctrl+C to stop the servers."

# Wait indefinitely
wait
