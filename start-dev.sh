#!/usr/bin/env bash
# start-dev.sh - Start backend and frontend in development mode
set -e
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "Starting backend and frontend in development mode..."

# Start backend
cd "$ROOT_DIR/backend"
if [ -f package.json ]; then
  echo "Starting backend (nodemon) in backend/"
  (npm run dev) &
else
  echo "No backend/package.json found; skipping backend start"
fi

# Start frontend
cd "$ROOT_DIR/frontend"
if [ -f package.json ]; then
  echo "Starting frontend (vite) in frontend/"
  npm run dev:hot
else
  echo "No frontend/package.json found; skipping frontend start"
fi
