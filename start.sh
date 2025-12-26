#!/bin/bash

# HEX Game AI - Start Script
echo "🎮 Starting HEX Game AI Server..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Kill any process on port 5000
echo "🔍 Checking for existing server..."
if lsof -ti:5000 > /dev/null 2>&1; then
    echo "⚠️  Port 5000 is in use. Killing existing process..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Start the server
echo "🚀 Starting server..."
echo ""
npm run dev

