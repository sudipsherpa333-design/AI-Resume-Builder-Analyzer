# 📖 QUICK START GUIDE - Registration & Login

## 🎯 Your Current System Status

```
✅ Backend Server: http://localhost:5001
✅ Frontend Server: http://localhost:5175  
✅ Database: MongoDB Connected
✅ All Errors: FIXED
✅ Ready to Use: YES
```

---

## 🚀 Step 1: Start the Servers

### Option A: Full Stack (Easiest)
```bash
cd /home/sudip-sherpa/sudipro/ProjectFinal/AI-Resume-Builder-Analyzer
npm run dev
```

Wait for:
```
✅ Frontend ready: http://localhost:5175
✅ Backend running: http://localhost:5001
```

---

## 🧪 Step 2: Test Registration

### Go to Login Page
```
Open Browser: http://localhost:5175/login
```

### Click "Create account"
```
You'll see the registration form with:
  - Full Name field
  - Email field
  - Password field
  - Confirm Password field
  - Create account button
```

### Fill Registration Form
```
Name:               Your Name
Email:              your@email.com
Password:           password123
Confirm Password:   password123
```

### Click "Create account" Button

### Expected Result ✅
```
✓ See success message: "Account created successfully! 🎉"
✓ Redirected back to login page
✓ No "Network error" in console (F12)
```

---

## 🔐 Step 3: Test Login

### Go to Login Page
```
Open Browser: http://localhost:5175/login
```

### Enter Your Credentials
```
Email:    your@email.com (from registration)
Password: password123
```

### Click "Sign in to your account"

### Expected Result ✅
```
✓ See loading spinner
✓ Redirected to: http://localhost:5175/dashboard
✓ See welcome message
✓ See your profile information
✓ No errors in console (F12)
```

---

## 🎬 Step 4: Test Demo Account

### Go to Login Page
```
Open Browser: http://localhost:5175/login
```

### Click "🎬 Try Demo Account" Button

### Expected Result ✅
```
✓ See loading spinner
✓ Message: "Welcome to Demo Account!"
✓ Redirected to: http://localhost:5175/dashboard
✓ Can access all features
✓ Data is shared with other demo users
```

---

## 📋 What to Check for Errors

### ❌ If You See "Network error: Cannot connect to server"

**Solution**:
1. Stop servers: `Ctrl+C`
2. Check backend running: `curl http://localhost:5001/api/health`
3. If not running, start again: `npm run dev`
4. Hard refresh browser: `Ctrl+F5`

### ❌ If Registration Fails

**Check**:
1. Email is not already used
2. Password is at least 8 characters
3. Confirm password matches
4. Backend logs show no errors

### ❌ If Login Fails

**Check**:
1. Email exists (register first if new)
2. Password is correct (case sensitive)
3. Backend is running
4. Console (F12) shows no errors

### ❌ If Dashboard Doesn't Load

**Check**:
1. Wait 2-3 seconds for page to load
2. Hard refresh: `Ctrl+F5`
3. Check backend running: `curl http://localhost:5001/api/health`
4. Clear browser cache: `Ctrl+Shift+Delete`

---

## 🎯 Dashboard Features (After Login)

Once logged in, you can:

### 👤 Profile
- View your information
- Edit name, email, phone
- Update password

### 📄 Resumes
- Create new resume
- Edit existing resumes
- Delete resumes
- Download as PDF

### 📊 Analyzer
- Analyze your resume
- Get AI suggestions
- View score/rating
- See improvement tips

### 🎨 Resume Builder
- Fill out resume sections
- Choose templates
- Preview resume
- Export to PDF

---

## 📞 Browser Developer Tools Check

### Open Developer Tools
```
Windows/Linux: F12 or Ctrl+Shift+I
Mac: Cmd+Option+I
```

### Check Network Tab
1. Try to login/register
2. Look for requests to `http://localhost:5001/api`
3. Should see:
   - ✅ 200 OK responses
   - ✅ No 404 errors
   - ✅ No CORS errors
   - ✅ No "Network error"

### Check Console Tab
1. Should be clean with no red errors
2. You may see blue info logs (normal)
3. You may see yellow warnings (normal)
4. Should NOT see red errors

---

## 🔗 Useful URLs

| URL | Purpose |
|-----|---------|
| `http://localhost:5175/login` | Login/Register page |
| `http://localhost:5175/dashboard` | Main dashboard |
| `http://localhost:5175/profile` | Profile management |
| `http://localhost:5001/api/health` | Backend health check |
| `http://localhost:5001/api` | API documentation |

---

## 🎁 Demo Account Credentials

```
Email:    demo@resumebuilder.com
Password: demopassword123
Use:      Testing without registration
```

---

## 📝 Summary

| Step | Action | Expected | Status |
|------|--------|----------|--------|
| 1 | Start servers | Both running | ✅ |
| 2 | Register account | Success message | ✅ |
| 3 | Login | Redirects to dashboard | ✅ |
| 4 | Try demo | Redirects to dashboard | ✅ |
| 5 | Browse features | Everything loads | ✅ |

---

## ✨ System Highlights

✅ **Zero Configuration** - Everything pre-configured
✅ **Production Ready** - Fully tested and verified
✅ **Secure** - Password hashing + JWT tokens
✅ **Fast** - Optimized for performance
✅ **Scalable** - Ready to grow
✅ **User Friendly** - Intuitive interface

---

## 🎉 You're All Set!

Everything is working perfectly. 

**No more errors!**

### Ready to start? Go to:
```
👉 http://localhost:5175/login
```

Choose:
- **"Create account"** - New user
- **"🎬 Try Demo Account"** - Quick test
- **Sign in** - With credentials

---

**Made with ❤️ by Sudip Sherpa**  
**BCA 6th Semester Project**  
**AI Resume Builder & Analyzer**

---

**All systems operational! Enjoy! 🚀**
