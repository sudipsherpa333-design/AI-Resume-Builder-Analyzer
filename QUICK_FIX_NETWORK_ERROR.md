# 🆘 Login Network Error - Quick Fix Guide

## ❌ Problem
```
Error: Network error: Cannot connect to server. Please check your connection.
```

## ✅ Solution Applied

### What Was Wrong
Frontend trying to connect to **wrong port**:
- Was trying: `http://localhost:5000/api`
- Backend actually on: `http://localhost:5001/api`

### What We Fixed
1. ✅ Updated `frontend/.env` - Changed port from 5000 to 5001
2. ✅ Updated `frontend/src/api/axiosConfig.js` - Now uses environment variable

---

## 🚀 Try This Now

### Step 1: Open Browser
```
http://localhost:5175/login
```

### Step 2: Try Demo Login
```
Email: demo@resumebuilder.com
Password: demopassword123
Click: "Sign in"
```

### Step 3: Expected Results
- ✅ **Success:** Redirects to Home page (demo account works!)
- ❌ **Error:** "Invalid email or password" (means backend connected! ✅ No network error!)

---

## 🔧 If Still Not Working

### Quick Fixes (In Order)

**1. Hard Refresh Browser**
```
Windows/Linux: Ctrl+F5
Mac: Cmd+Shift+R
```

**2. Clear Cache**
```
F12 → Application → Storage → Clear Site Data
```

**3. Check Backend Running**
```
Look for logs: "✅ Server now running on port 5001"
```

**4. Restart Servers**
```
Ctrl+C (stop current)
npm run dev (restart)
```

---

## ✅ Files Fixed

| File | What Changed | Result |
|------|--------------|--------|
| `frontend/.env` | Port 5000 → 5001 | ✅ Frontend points to correct backend |
| `axiosConfig.js` | Uses .env variable | ✅ Flexible configuration |

---

## 🎯 Verification

**Backend logs should show:**
```
✅ Server now running on port 5001
🌐 URL: http://localhost:5001
```

**Frontend .env should have:**
```
VITE_API_BASE_URL=http://localhost:5001/api
```

---

## 📞 Still Having Issues?

1. **See "Invalid email or password"** → Good! Backend connected! Register account.
2. **See "Network error"** → Restart: `npm run dev`
3. **Backend not starting** → Check logs for errors
4. **Port conflicts** → Kill process: `lsof -ti:5001 | xargs kill -9`

---

**Status:** ✅ Fixed!  
**Next:** Try login now! 🎉
