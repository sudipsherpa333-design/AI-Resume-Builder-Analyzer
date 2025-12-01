#!/bin/bash

# AI Resume Builder - Quick Start Script
# This script starts both frontend and backend servers

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "🚀 AI Resume Builder & Analyzer - Quick Start"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Function to clean up on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo "📦 Starting Backend Server..."
echo "   Directory: $BACKEND_DIR"
echo "   Port: 5000"

cd "$BACKEND_DIR"
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install > /dev/null 2>&1
fi

node src/server.js &
BACKEND_PID=$!
echo "   PID: $BACKEND_PID"
sleep 2

# Start Frontend
echo ""
echo "⚛️  Starting Frontend Server..."
echo "   Directory: $FRONTEND_DIR"
echo "   Port: 5173"

cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install > /dev/null 2>&1
fi

npm run dev &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"
sleep 3

echo ""
echo "=============================================="
echo "✅ Both servers are running!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔌 Backend:  http://localhost:5000"
echo "📊 API:      http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=============================================="
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
