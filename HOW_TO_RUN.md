# How to Run AI Resume Builder & Analyzer

This guide explains how to run both the frontend and backend servers.

## Quick Start (Single Command)

Run both servers simultaneously from the root directory:

```bash
# Terminal 1: Start Backend
cd backend && npm install && node src/server.js

# Terminal 2: Start Frontend (in a new terminal)
cd frontend && npm install && npm run dev
```

## Detailed Setup Instructions

### Prerequisites
- Node.js v18+ installed
- npm or yarn package manager
- Port 5000 (backend) and 5173 (frontend) available

---

## Option 1: Run in Separate Terminals (Recommended for Development)

### Terminal 1 - Backend Server

```bash
cd /home/sudip-sherpa/sudipro/ProjectFinal/AI-Resume-Builder-Analyzer/backend

# Install dependencies (first time only)
npm install

# Start the server
node src/server.js
```

**Expected Output:**
```
✅ AI Resume Builder API is running
Server listening on port 5000
Database connected to MongoDB
```

### Terminal 2 - Frontend Server

```bash
cd /home/sudip-sherpa/sudipro/ProjectFinal/AI-Resume-Builder-Analyzer/frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

**Expected Output:**
```
VITE v7.2.2  ready in 141 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://10.83.40.126:5173/
  ➜  press h + enter to show help
```

---

## Option 2: Run Both with Background Processes

```bash
cd /home/sudip-sherpa/sudipro/ProjectFinal/AI-Resume-Builder-Analyzer

# Start backend
cd backend && nohup node src/server.js > /tmp/backend.log 2>&1 &

# Start frontend
cd ../frontend && nohup npm run dev > /tmp/frontend.log 2>&1 &

# Verify both are running
ps aux | grep -E 'node|vite' | grep -v grep
ss -ltnp | grep -E ':5000|:5173'
```

---

## Option 3: Using Docker Compose (Production Ready)

```bash
cd /home/sudip-sherpa/sudipro/ProjectFinal/AI-Resume-Builder-Analyzer

# Start both services
docker-compose up

# Or detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Accessing the Application

Once both servers are running:

1. **Frontend**: http://localhost:5173
2. **Backend API**: http://localhost:5000/api
3. **API Health Check**: http://localhost:5000/api/health

---

## Troubleshooting

### Port Already in Use

If you get "Port 5173/5000 already in use" error:

```bash
# Kill existing processes
pkill -9 node vite

# Or specify a different port
cd frontend && npm run dev -- --port 5174
```

### Vite React Plugin Error

If you see `@vitejs/plugin-react can't detect preamble` error:

```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### MongoDB Connection Error

If backend can't connect to MongoDB:

1. Make sure MongoDB is running
2. Check `backend/.env` for correct `MONGO_URI`
3. Ensure the database server is accessible

---

## Development Commands

### Frontend
```bash
cd frontend

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Backend
```bash
cd backend

# Start development server
node src/server.js

# Install dependencies
npm install

# Run tests (if configured)
npm test
```

---

## Project Structure

```
AI-Resume-Builder-Analyzer/
├── frontend/          # React + Vite (port 5173)
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/           # Node.js Express (port 5000)
│   ├── src/
│   ├── package.json
│   └── server.js
├── docker-compose.yml
└── README.md
```

---

## Verifying Both Servers are Running

```bash
# Check if ports are listening
ss -ltnp | grep -E ':5000|:5173'

# Test frontend
curl http://localhost:5173

# Test backend
curl http://localhost:5000/api/health
```

**Expected Output:**
```json
{
  "success": true,
  "message": "✅ AI Resume Builder API is running",
  "timestamp": "2025-11-15T14:34:05.161Z",
  "environment": "development",
  "version": "1.0.0"
}
```

---

## Tips

- Keep both terminals visible for debugging
- Check logs in separate terminals to see errors
- Frontend auto-reloads on file changes (hot reload)
- Backend needs manual restart after code changes
- Use `Ctrl+C` to stop servers gracefully

---

**Need Help?** Check the individual README files:
- `frontend/README.md` - Frontend setup
- `backend/README.md` - Backend setup
