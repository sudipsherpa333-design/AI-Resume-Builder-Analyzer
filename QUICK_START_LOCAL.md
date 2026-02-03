# 🚀 Quick Start & Local Development Guide

**Quick Start:** Run the application in 2 minutes!

---

## 📋 Prerequisites

Before starting, make sure you have:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **MongoDB 5+** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm 9+** - Comes with Node.js

### Verify Installation
```bash
node --version    # v18.x.x or higher
npm --version     # v9.x.x or higher
mongosh --version # Optional: for MongoDB shell access
```

---

## ⚡ Method 1: Automated Setup (Recommended)

### Step 1: Clone Repository
```bash
git clone https://github.com/sudipsherpa333-design/AI-Resume-Builder-Analyzer.git
cd AI-Resume-Builder-Analyzer
```

### Step 2: Run Quick Start Script
```bash
chmod +x quick-start.sh
./quick-start.sh
```

**What it does:**
- ✅ Checks prerequisites (Node, npm, MongoDB)
- ✅ Installs dependencies
- ✅ Creates .env files with templates
- ✅ Starts MongoDB (if not running)
- ✅ Launches backend and frontend servers
- ✅ Opens application in browser

**Expected Output:**
```
✓ Prerequisites check passed!
✓ Dependencies installed
✓ .env files configured
✓ Backend starting on http://localhost:5001
✓ Frontend starting on http://localhost:5173
✓ Opening application in browser...
```

---

## 🔧 Method 2: Manual Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/sudipsherpa333-design/AI-Resume-Builder-Analyzer.git
cd AI-Resume-Builder-Analyzer
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
# Server Configuration
PORT=5001
HOST=0.0.0.0
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/resume-builder

# API Keys
OPENAI_API_KEY=sk-your-key-here
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# JWT Configuration
JWT_SECRET=your-super-secret-key-min-32-characters-very-long
JWT_EXPIRES_IN=7d

# URLs
CLIENT_URL=http://localhost:5173
BACKEND_URL=http://localhost:5001

# Feature Flags
ENABLE_CLUSTER=false
DEBUG_MODE=true
EOF

# Start backend
npm run dev
```

**Expected Output:**
```
╔══════════════════════════════════════════════════════════════════════╗
║                 AI RESUME BUILDER + SOCKET.IO                        ║
║                 Real-time Collaboration Platform                     ║
╚══════════════════════════════════════════════════════════════════════╝

✓ Server running on http://localhost:5001
✓ MongoDB connected: resume-builder
✓ Socket.io ready for real-time features
✓ API documentation: http://localhost:5001/api/docs
```

### Step 3: Frontend Setup (New Terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5001/api
VITE_USE_MOCK_AI=false
VITE_APP_NAME=AI Resume Builder
EOF

# Start frontend
npm run dev
```

**Expected Output:**
```
VITE v5.4.0 frontend dev server running at:

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Step 4: Access Application

Open your browser and navigate to:
- **Application**: http://localhost:5173
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/api/health

---

## 📦 Database Setup

### Option 1: Local MongoDB

```bash
# On macOS (using Homebrew)
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# Or run MongoDB directly
mongod

# Verify connection
mongosh
# If connected, you'll see: test>
```

### Option 2: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster
4. Get connection string
5. Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resume-builder
```

### Option 3: Docker

```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 -v mongodb_data:/data/db --name mongodb mongo:latest

# To stop:
docker stop mongodb
```

### Verify Database

```bash
# Connect to MongoDB shell
mongosh

# Use the database
use resume-builder

# List collections
show collections

# Count documents
db.users.countDocuments()
db.resumes.countDocuments()
```

---

## 🧪 Testing the Application

### Test 1: Create Account
1. Open http://localhost:5173
2. Click "Sign Up"
3. Fill in:
   - Email: `test@example.com`
   - Password: `Test@12345`
4. Click "Create Account"

**Expected:** Account created, redirected to builder

### Test 2: Create Resume
1. Click "Build Resume"
2. Enter title: `My Resume`
3. Select template: `Modern Pro`
4. Click "Create Resume"

**Expected:** Resume created and appears in dashboard

### Test 3: Fill Resume Data
1. In builder, fill in:
   - Personal info (name, email, phone)
   - Professional summary
   - Add work experience
   - Add education
   - Add skills
2. Click "Save Resume"

**Expected:** Data saves to database

### Test 4: View Dashboard
1. Click "Dashboard"
2. See list of created resumes
3. View statistics

**Expected:** Resume appears with correct information

### Test 5: Export Resume
1. Open a resume
2. Click "Export"
3. Choose format (PDF, DOCX, or JSON)
4. Download file

**Expected:** File downloads successfully

---

## 🔍 Troubleshooting

### Issue: Port Already in Use

```bash
# Kill process on port 5001 (backend)
lsof -i :5001
kill -9 <PID>

# Kill process on port 5173 (frontend)
lsof -i :5173
kill -9 <PID>

# Or change port in .env
PORT=5002  # Use different port
```

### Issue: MongoDB Connection Failed

```bash
# Check if MongoDB is running
mongosh

# If not installed, install it:
brew install mongodb-community  # macOS
sudo apt install -y mongodb     # Ubuntu/Debian

# Start MongoDB service
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### Issue: Dependencies Installation Failed

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still failing, use npm ci
npm ci
```

### Issue: Frontend Shows Blank Page

```bash
# Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
# Or open in incognito/private mode

# Check browser console for errors (F12)
# Check backend is running: curl http://localhost:5001/api/health
```

### Issue: API Calls Fail

```bash
# Check backend logs
tail -f backend/logs/application.log

# Test API directly
curl http://localhost:5001/api/health

# Verify CORS
curl -i -X OPTIONS http://localhost:5001/api/resumes \
  -H "Origin: http://localhost:5173"
```

### Issue: AI Features Not Working

```bash
# Check if OpenAI API key is set
echo $OPENAI_API_KEY

# If not set, use mock AI:
# In .env, set: VITE_USE_MOCK_AI=true

# Restart frontend server after .env changes
```

---

## 📝 Environment Variables Reference

### Backend (.env)

```env
# ============ Server Configuration ============
PORT=5001                           # Server port
HOST=0.0.0.0                       # Server host
NODE_ENV=development               # Environment (development/production)

# ============ Database ============
MONGODB_URI=mongodb://localhost:27017/resume-builder

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/resume-builder

# ============ API Keys ============
OPENAI_API_KEY=sk-your-openai-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ============ JWT Configuration ============
JWT_SECRET=super-secret-key-min-32-chars-required-for-security
JWT_EXPIRES_IN=7d

# ============ URLs ============
CLIENT_URL=http://localhost:5173
BACKEND_URL=http://localhost:5001

# ============ Feature Flags ============
ENABLE_CLUSTER=false
DEBUG_MODE=true
LOG_LEVEL=debug

# ============ Mail Configuration (Optional) ============
MAIL_SERVICE=gmail
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password

# ============ Storage (Optional) ============
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### Frontend (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:5001/api

# AI Service
VITE_USE_MOCK_AI=false    # Set to true for mock AI

# App Configuration
VITE_APP_NAME=AI Resume Builder
VITE_APP_VERSION=1.0.0

# Debug
VITE_DEBUG=false
```

---

## 🚀 Common Commands

### Backend Commands
```bash
cd backend

# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Build for production
npm run build

# View logs
npm run logs
```

### Frontend Commands
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Analyze bundle size
npm run build -- --analyze
```

### Database Commands
```bash
# Connect to MongoDB shell
mongosh

# Switch database
use resume-builder

# List collections
show collections

# Count documents
db.resumes.countDocuments()
db.users.countDocuments()

# Find one document
db.resumes.findOne()

# Delete all documents (careful!)
db.resumes.deleteMany({})
```

### Git Commands
```bash
# Check status
git status

# View changes
git diff

# Stage changes
git add .

# Commit changes
git commit -m "message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main
```

---

## 🎯 Typical Development Workflow

### Day 1: Setup
1. Clone repository
2. Run quick-start.sh or manual setup
3. Create test account
4. Verify all systems working

### Day 2: Development
1. Start terminals with backend & frontend
2. Open http://localhost:5173 in browser
3. Open DevTools (F12)
4. Make code changes
5. Hot-reload automatically applies changes
6. Check console for errors
7. Test features in browser

### Testing Before Commit
1. `npm run build` in frontend (check for errors)
2. Test all features
3. Check console for warnings
4. Run `npm test` if available
5. Check git diff: `git diff`
6. Commit & push: `git add -A && git commit -m "feature: ..." && git push`

---

## 📊 Performance Tips

### Frontend Optimization
```bash
# Check bundle size
npm run build

# Analyze what's in the bundle
npm run build -- --analyze

# Monitor performance
# Open DevTools → Performance tab → Start recording
```

### Backend Optimization
```bash
# Enable clustering (use all CPU cores)
ENABLE_CLUSTER=true npm run dev

# Monitor memory usage
node --trace-gc backend/server.js

# Profile CPU usage
node --prof backend/server.js
```

### Database Optimization
```bash
# Check indexes
mongosh
use resume-builder
db.resumes.getIndexes()

# Analyze query performance
db.resumes.find({userId: "..."}).explain("executionStats")
```

---

## 🔐 Security Best Practices

### Local Development
- [x] Keep .env files out of git (already in .gitignore)
- [x] Use localhost only for development
- [x] Don't commit API keys or secrets
- [x] Use strong JWT secret (min 32 characters)
- [x] Regenerate passwords in test accounts

### Before Production
- [x] Change all default credentials
- [x] Use HTTPS (configure with reverse proxy)
- [x] Set NODE_ENV=production
- [x] Use environment variables for all secrets
- [x] Enable rate limiting
- [x] Add CORS restrictions to specific domains
- [x] Rotate API keys
- [x] Set up monitoring and alerting

---

## 📚 Additional Resources

- [README.md](../README.md) - Project overview
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Production deployment
- [TESTING_GUIDE.md](../TESTING_GUIDE.md) - Comprehensive testing
- [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md) - Project status
- [GitHub Repository](https://github.com/sudipsherpa333-design/AI-Resume-Builder-Analyzer)

---

## ✅ Quick Checklist After Setup

- [ ] Backend running on http://localhost:5001
- [ ] Frontend running on http://localhost:5173
- [ ] MongoDB connected successfully
- [ ] No console errors in browser
- [ ] Can create user account
- [ ] Can create resume
- [ ] Resume data saves to database
- [ ] Dashboard displays resumes
- [ ] Export functionality works

---

## 🎉 Next Steps

1. **Explore the Code**
   - Check `/frontend/src/pages` for React components
   - Check `/backend/src/routes` for API endpoints
   - Check `/backend/src/models` for database schemas

2. **Make Changes**
   - Frontend changes auto-reload (hot module replacement)
   - Backend changes require server restart
   - Database changes might require migrations

3. **Test Features**
   - Follow TESTING_GUIDE.md for comprehensive testing
   - Check browser console for errors
   - Monitor network requests in DevTools

4. **Deploy**
   - When ready, follow DEPLOYMENT.md
   - Choose deployment strategy (PM2, Docker, Vercel, etc.)
   - Set up monitoring and backups

---

**Ready to start?** Run `./quick-start.sh` and you'll have a working resume builder in 2 minutes! 🚀

**Last Updated:** January 11, 2025  
**Version:** 1.0.0

