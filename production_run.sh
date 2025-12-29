#!/bin/bash

# Function to kill child processes on exit
cleanup() {
    trap - SIGINT SIGTERM EXIT
    echo ""
    echo "🛑 Shutting down production servers and tunnels..."
    # Kill all child processes in the current process group
    kill -- -$$ 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM EXIT

echo "🚀 Starting VoxMarket Production Simulation..."

# Clean up previous logs
rm -f backend_prod.log frontend_prod.log backend_tunnel.log frontend_tunnel.log

# 1. Build & Start Backend
echo "🏗️  [1/6] Building Backend..."
cd backend
npm run build
echo "📦 Starting Backend (Production Mode)..."
# Set NODE_ENV to production
NODE_ENV=production node dist/main.js > ../backend_prod.log 2>&1 &
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for Backend to start on port 3000..."
while ! lsof -i :3000 -sTCP:LISTEN -t >/dev/null; do
    sleep 1
done
echo "✅ Backend is running (Production)."

# 2. Start Backend Tunnel
echo "🚇 [2/6] Starting Backend Tunnel..."
cloudflared tunnel --url http://localhost:3000 --no-autoupdate > backend_tunnel.log 2>&1 &

# 3. Extract Backend URL
echo "🔍 [3/6] Fetching Backend Public URL..."
count=0
BACKEND_URL=""
while [ -z "$BACKEND_URL" ]; do
    sleep 1
    count=$((count+1))
    if [ $count -ge 30 ]; then
        echo "❌ Timeout waiting for Cloudflare Tunnel URL. Check backend_tunnel.log"
        exit 1
    fi
    BACKEND_URL=$(grep -o 'https://[-a-zA-Z0-9.]*\.trycloudflare\.com' backend_tunnel.log | head -n 1)
done

echo "✅ Public Backend URL: $BACKEND_URL"

# 4. Build & Start Frontend
echo "🏗️  [4/6] Building Frontend..."
cd frontend
# Inject Backend URL into build
VITE_API_URL=$BACKEND_URL npm run build
echo "📦 Serving Frontend (Production Build)..."
# Use npx serve to serve the 'dist' folder on port 5173
npx serve -s dist -l 5173 > ../frontend_prod.log 2>&1 &
cd ..

echo "⏳ Waiting for Frontend to serve on port 5173..."
while ! lsof -i :5173 -sTCP:LISTEN -t >/dev/null; do
    sleep 1
done
echo "✅ Frontend is serving (Production)."

# 5. Start Frontend Tunnel
echo "🚇 [5/6] Starting Frontend Tunnel..."
cloudflared tunnel --url http://localhost:5173 --no-autoupdate > frontend_tunnel.log 2>&1 &


# 6. Extract Frontend URL
echo "🔍 [6/6] Fetching Frontend Public URL..."
count=0
FRONTEND_URL=""
while [ -z "$FRONTEND_URL" ]; do
    sleep 1
    count=$((count+1))
    if [ $count -ge 30 ]; then
        echo "❌ Timeout waiting for Cloudflare Tunnel URL. Check frontend_tunnel.log"
        exit 1
    fi
     FRONTEND_URL=$(grep -o 'https://[-a-zA-Z0-9.]*\.trycloudflare\.com' frontend_tunnel.log | head -n 1)
done


echo ""
echo "==================================================="
echo "🎉 PRODUCTION SIMULATION READY"
echo "==================================================="
echo "📱 API URL: $BACKEND_URL"
echo "🌐 APP URL: $FRONTEND_URL"
echo "==================================================="
echo "👉 Open the APP URL to test the Production Build."
echo "Running... (Press Ctrl+C to stop)"

# Keep script running
wait
