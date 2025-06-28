#!/bin/bash

echo "🔄 Restarting Backend on cPanel..."

# Kill any existing node processes
echo "Stopping existing Node.js processes..."
pkill -f "node index.js" 2>/dev/null
pkill -f "node" 2>/dev/null
sleep 2

# Change to backend directory
cd /home/nawatara/nawatara

# Check if index.js exists
if [ ! -f "index.js" ]; then
    echo "❌ Error: index.js not found in $(pwd)"
    exit 1
fi

# Start the backend
echo "🚀 Starting backend..."
NODE_ENV=production nohup node index.js > server.log 2>&1 &

# Wait a moment and check if it started
sleep 3
if pgrep -f "node index.js" > /dev/null; then
    echo "✅ Backend started successfully!"
    echo "📋 Process ID: $(pgrep -f 'node index.js')"
    echo "📁 Logs: tail -f ~/nawatara/server.log"
else
    echo "❌ Backend failed to start. Check logs:"
    echo "📄 Error log:"
    tail -20 server.log
fi