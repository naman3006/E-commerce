#!/bin/bash

SERVICE_NAME="voxmarket"
SERVICE_FILE="$HOME/.config/systemd/user/$SERVICE_NAME.service"
RUN_SCRIPT="/home/inextrix/Documents/VoxMarket/production_run.sh"

# Ensure user systemd dir exists
mkdir -p "$HOME/.config/systemd/user/"

echo "🔧 Creating Systemd Service..."

# Write Service File
cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=VoxMarket 24/7 E-Commerce Service
After=network.target

[Service]
Type=simple
ExecStart=$RUN_SCRIPT
Restart=on-failure
RestartSec=10
StandardOutput=append:$HOME/Documents/VoxMarket/logs/systemd.log
StandardError=append:$HOME/Documents/VoxMarket/logs/systemd.log

[Install]
WantedBy=default.target
EOF

echo "✅ Service file created at $SERVICE_FILE"

# Reload and Enable
systemctl --user daemon-reload
systemctl --user enable $SERVICE_NAME
systemctl --user start $SERVICE_NAME

echo "=================================================="
echo "🎉 SUCCESS: VoxMarket is now running 24/7 in the background!"
echo "=================================================="
echo "Commands to manage it:"
echo "  Stop:    systemctl --user stop $SERVICE_NAME"
echo "  Restart: systemctl --user restart $SERVICE_NAME"
echo "  Logs:    tail -f ~/Documents/VoxMarket/logs/service.log"
echo "=================================================="
