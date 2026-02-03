# AI Resume Builder - Deployment & Setup Guide

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Database Connection](#database-connection)
- [Running Locally](#running-locally)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [API Endpoints](#api-endpoints)

---

## Prerequisites

### Required Software
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** v9+ (comes with Node.js)
- **MongoDB** v5+ ([Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas)
- **Git** for version control

### Required Accounts (Optional)
- MongoDB Atlas account (for cloud database)
- Google OAuth credentials (for authentication)
- OpenAI API key (for AI features)

---

## Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/sudipsherpa333-design/AI-Resume-Builder-Analyzer.git
cd AI-Resume-Builder-Analyzer
```

### 2. Backend Environment Variables

Create `backend/.env`:
```env
# Server Configuration
PORT=5001
HOST=0.0.0.0
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/resume-builder
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resume-builder

# API Keys
OPENAI_API_KEY=sk-your-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
JWT_EXPIRES_IN=7d

# CORS & Client URLs
CLIENT_URL=http://localhost:3000,http://localhost:5173
BACKEND_URL=http://localhost:5001

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis (Optional for caching)
REDIS_URL=redis://localhost:6379

# Environment
ENABLE_CLUSTER=false
LOG_LEVEL=debug
```

### 3. Frontend Environment Variables

Create `frontend/.env`:
```env
# API Configuration
VITE_API_URL=http://localhost:5001/api

# Features
VITE_USE_MOCK_AI=false
VITE_ENABLE_ANALYTICS=true

# OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# App Config
VITE_APP_NAME=AI Resume Builder
VITE_APP_URL=http://localhost:5173
```

---

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start MongoDB (if using local)
```bash
# macOS/Linux
brew services start mongodb-community

# Windows (if installed via MSI)
net start MongoDB

# Or run MongoDB in a Docker container
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Run Backend
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start

# For clustering support
ENABLE_CLUSTER=true npm start
```

Expected output:
```
✅ Server running on http://localhost:5001
✅ MongoDB connected: resume-builder
```

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run Frontend (Development)
```bash
# Vite dev server with hot reload
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in 245 ms

  ➜  Local:   http://localhost:5173/
```

### 3. Build for Production
```bash
npm run build
```

This generates optimized files in `dist/` directory.

---

## Database Connection

### Option 1: Local MongoDB
```bash
# Install MongoDB Community Edition
# Then start the service (see Backend Setup section)

# Connection string in .env:
MONGODB_URI=mongodb://localhost:27017/resume-builder
```

### Option 2: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Add to `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/resume-builder?retryWrites=true&w=majority
```

### Option 3: MongoDB Docker
```bash
# Run MongoDB in Docker
docker run -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  --name resume-db \
  mongo:latest

# Connection string:
MONGODB_URI=mongodb://admin:password@localhost:27017/resume-builder?authSource=admin
```

---

## Running Locally

### Option 1: Run Both Services Separately (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5001
- API: http://localhost:5001/api

### Option 2: Run Both with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Production Deployment

### Prerequisites
- Node.js v18+ on your server
- MongoDB Atlas or managed MongoDB instance
- Environment variables configured
- SSL certificates (for HTTPS)

### Backend Deployment

#### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Navigate to backend
cd backend

# Start with PM2
pm2 start server.js --name "resume-api" --env production

# Enable auto-restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

#### Using systemd (Linux)
Create `/etc/systemd/system/resume-api.service`:
```ini
[Unit]
Description=AI Resume Builder API
After=network.target

[Service]
Type=simple
User=app-user
WorkingDirectory=/home/app-user/AI-Resume-Builder-Analyzer/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable resume-api
sudo systemctl start resume-api
```

### Frontend Deployment

#### Using Vercel (Easiest)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel
```

#### Using Netlify
```bash
# Build first
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

#### Using Traditional Server (Nginx)
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        root /home/app-user/AI-Resume-Builder-Analyzer/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Troubleshooting

### Backend Issues

#### "Cannot find module 'express'"
```bash
cd backend
npm install
```

#### "MongoDB connection error"
- Check `MONGODB_URI` in `.env`
- Verify MongoDB is running: `mongo --version`
- Check network connectivity to MongoDB Atlas

#### "Port 5001 already in use"
```bash
# Kill process using port 5001
lsof -ti:5001 | xargs kill -9

# Or use different port
PORT=5002 npm start
```

### Frontend Issues

#### "VITE_API_URL is undefined"
- Ensure `.env` exists in `frontend/` directory
- Check environment variable syntax (must start with `VITE_`)
- Restart dev server after changing `.env`

#### "Blank white screen"
1. Open browser console (F12)
2. Check for errors
3. Verify backend is running
4. Clear browser cache: Ctrl+Shift+Delete

#### "Network requests fail"
- Check if backend is running on port 5001
- Verify `VITE_API_URL` matches backend URL
- Check CORS settings in `backend/server.js`

---

## API Endpoints

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
POST   /api/auth/logout         - Logout user
GET    /api/auth/me             - Get current user
POST   /api/auth/refresh-token  - Refresh JWT token
```

### Resumes
```
GET    /api/resumes             - Get all user's resumes
POST   /api/resumes             - Create new resume
GET    /api/resumes/:id         - Get single resume
PUT    /api/resumes/:id         - Update resume
DELETE /api/resumes/:id         - Delete resume
POST   /api/resumes/:id/export  - Export resume (PDF/DOCX)
```

### AI Features
```
POST   /api/ai/analyze-ats      - Analyze resume ATS compatibility
POST   /api/ai/enhance-section  - Enhance resume section with AI
POST   /api/ai/generate-summary - Generate professional summary
POST   /api/ai/suggest-keywords - Get keyword suggestions
```

### Dashboard
```
GET    /api/dashboard/stats     - Get dashboard statistics
GET    /api/dashboard/activity  - Get recent activity
```

### User
```
GET    /api/user/profile        - Get user profile
PUT    /api/user/profile        - Update user profile
POST   /api/user/avatar         - Upload profile picture
```

---

## Health Checks

### Backend Health
```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "uptime": 3600,
  "timestamp": "2026-02-03T15:45:00.000Z"
}
```

### Frontend Health
```bash
curl http://localhost:5173
```

Should return HTML.

---

## Performance Tips

1. **Enable Caching**
   - Set up Redis for session caching
   - Configure browser cache headers

2. **Database Optimization**
   - Create indexes on frequently queried fields
   - Use MongoDB aggregation pipeline for complex queries

3. **Frontend Optimization**
   - Run `npm run build` to generate optimized bundles
   - Use CDN for static assets
   - Enable gzip compression in Nginx

4. **Backend Optimization**
   - Enable clustering: `ENABLE_CLUSTER=true`
   - Implement rate limiting
   - Use connection pooling for database

---

## Security Checklist

- [ ] Change all default credentials
- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Use HTTPS in production
- [ ] Enable CORS only for trusted domains
- [ ] Validate all user inputs
- [ ] Sanitize database queries
- [ ] Use environment variables for sensitive data
- [ ] Regular security updates: `npm audit fix`
- [ ] Enable MongoDB authentication
- [ ] Implement rate limiting on API

---

## Support & Documentation

- **GitHub Issues**: [Report bugs](https://github.com/sudipsherpa333-design/AI-Resume-Builder-Analyzer/issues)
- **Documentation**: See individual `README.md` files in backend/ and frontend/
- **API Docs**: Available at `/api/docs` when backend is running

---

**Last Updated**: February 3, 2026  
**Version**: 1.0.0
