#!/bin/bash

# Function to kill child processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers and tunnels..."
    # Kill all child processes in the current process group
    kill 0
    exit
}

trap cleanup SIGINT SIGTERM EXIT

echo "🚀 Starting VoxMarket Mobile Dev Environment..."

# Clean up previous logs
rm -f backend.log frontend.log backend_tunnel.log frontend_tunnel.log

# 1. Start Backend
echo "📦 [1/6] Starting Backend (npm run start:dev)..."
cd backend
npm run start:dev > ../backend.log 2>&1 &
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for Backend to start on port 3000..."
while ! lsof -i :3000 -sTCP:LISTEN -t >/dev/null; do
    sleep 1
done
echo "✅ Backend is running."

# 2. Start Backend Tunnel
echo "🚇 [2/6] Starting Backend Tunnel..."
# cloudflared tunnel --url http://localhost:3000 > backend_tunnel.log 2>&1 &
cloudflared tunnel --url http://localhost:3000 --no-autoupdate > backend_tunnel.log 2>&1 &

# 3. Extract Backend URL
echo "🔍 [3/6] Fetching Backend Public URL..."
count=0
while ! grep -q "https://.*trycloudflare.com" backend_tunnel.log; do
    sleep 1
    count=$((count+1))
    if [ $count -ge 30 ]; then
        echo "❌ Timeout waiting for Cloudflare Tunnel URL. Check backend_tunnel.log"
        exit 1
    fi
done
# BACKEND_URL=$(grep -o 'https://[^ ]*\.trycloudflare\.com' backend_tunnel.log | head -n 1)
BACKEND_URL=$(grep -m 1 -o 'https://[a-zA-Z0-9.-]*trycloudflare.com' backend_tunnel.log)

echo "✅ Public Backend URL: $BACKEND_URL"

# 4. Start Frontend with Backend URL
echo "🎨 [4/6] Starting Frontend (npm run dev)..."
cd frontend
# We override VITE_API_URL environment variable for this process
VITE_API_URL=$BACKEND_URL npm run dev > ../frontend.log 2>&1 &
cd ..

echo "⏳ Waiting for Frontend to start on port 5173..."
while ! lsof -i :5173 -sTCP:LISTEN -t >/dev/null; do
    sleep 1
done
echo "✅ Frontend is running."

# 5. Start Frontend Tunnel
echo "🚇 [5/6] Starting Frontend Tunnel..."
# cloudflared tunnel --url http://localhost:5173 > frontend_tunnel.log 2>&1 &
cloudflared tunnel --url http://localhost:5173 --no-autoupdate > frontend_tunnel.log 2>&1 &


# 6. Extract Frontend URL
echo "🔍 [6/6] Fetching Frontend Public URL..."
count=0
while ! grep -q "https://.*trycloudflare.com" frontend_tunnel.log; do
    sleep 1
    count=$((count+1))
    if [ $count -ge 30 ]; then
        echo "❌ Timeout waiting for Cloudflare Tunnel URL. Check frontend_tunnel.log"
        exit 1
    fi
done
# FRONTEND_URL=$(grep -o 'https://[^ ]*\.trycloudflare\.com' frontend_tunnel.log | head -n 1)
FRONTEND_URL=$(grep -m 1 -o 'https://[a-zA-Z0-9.-]*trycloudflare.com' frontend_tunnel.log)


echo ""
echo "==================================================="
echo "🎉 MOBILE DEV ENVIRONMENT READY"
echo "==================================================="
echo "📱 API URL: $BACKEND_URL"
echo "🌐 APP URL: $FRONTEND_URL"
echo "==================================================="
echo "👉 Open the APP URL on your mobile browser."
echo "Running... (Press Ctrl+C to stop)"

# Keep script running to maintain background processes
wait
