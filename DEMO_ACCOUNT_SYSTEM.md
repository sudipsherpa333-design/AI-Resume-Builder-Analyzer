# 👥 Demo Account System - Complete Guide

## 🎯 Overview

The AI Resume Builder now has a **separate demo account system** for public testing:

- **Demo Account**: Everyone uses the same demo account for trials (no registration needed)
- **Personal Accounts**: Users can register their own accounts for permanent use
- **Automatic Dashboard Redirect**: Both demo and registered users redirect to dashboard after login

---

## 📋 Demo Account Details

| Field | Value |
|-------|-------|
| **Email** | `demo@resumebuilder.com` |
| **Password** | `demopassword123` |
| **Status** | ✅ Verified & Active |
| **Use Case** | Public testing/trials |
| **Persistence** | Account data shared across all demo users |

---

## 🚀 How Demo Account Works

### For New Visitors (Demo)
```
1. Go to http://localhost:5175/login
2. Click "🎬 Try Demo Account" button
3. Automatically authenticated as demo user
4. Redirects to /dashboard
5. Can test all features
6. Data is shared with other demo users
```

### For Registered Users (Personal Account)
```
1. Click "Create account" → Register
2. Enter email/password and verify
3. Go to http://localhost:5175/login
4. Enter email/password → Sign in
5. Redirects to /dashboard
6. Can build/manage personal resumes
```

---

## 🔧 Files Modified

### 1. `backend/scripts/create-demo-account.js` ✨ NEW
- **Purpose**: Creates demo account in MongoDB
- **When to Run**: `node backend/scripts/create-demo-account.js`
- **What It Does**:
  - Connects to MongoDB
  - Creates user: `demo@resumebuilder.com` / `demopassword123`
  - Sets account as verified (no email confirmation needed)
  - Sets up demo profile data

### 2. `frontend/src/pages/Login.jsx` 🔄 UPDATED
- **handleDemoLogin()** function:
  - Authenticates demo credentials via backend
  - Shows loading spinner
  - Redirects to `/dashboard` (not home)
  - Shows success toast: "Welcome to Demo Account!"

- **handleSubmit()** function:
  - Regular login for personal accounts
  - Also redirects to `/dashboard` after successful login
  - Better toast messages

---

## 📝 Implementation Details

### Demo Account Creation Script

```javascript
// backend/scripts/create-demo-account.js
const demoUser = await User.create({
    name: 'Demo User',
    email: 'demo@resumebuilder.com',
    password: 'demopassword123',
    isVerified: true,           // Skip email verification
    role: 'user',
    profile: {
        title: 'Demo Account',
        headline: 'Testing Resume Builder',
        summary: 'Welcome! This is a shared demo account.'
    }
});
```

### Login Flow Changes

**Before:**
```
Demo Login → Authenticate → Redirect to /home
Regular Login → Authenticate → Redirect to /home
```

**After:**
```
Demo Login → Authenticate → Redirect to /dashboard
Regular Login → Authenticate → Redirect to /dashboard
```

---

## ✅ Features

| Feature | Demo Account | Registered Account |
|---------|-------------|-------------------|
| Login without registration | ✅ Yes | ❌ No |
| Test resume builder | ✅ Yes | ✅ Yes |
| Test resume analyzer | ✅ Yes | ✅ Yes |
| Save resumes | ✅ Yes (shared) | ✅ Yes (personal) |
| Edit profile | ✅ Yes (shared) | ✅ Yes (personal) |
| Download resumes | ✅ Yes | ✅ Yes |
| Permanent access | ❌ No | ✅ Yes |

---

## 🎯 User Journey

### Path 1: Demo Visitor
```
Login Page
    ↓
Click "🎬 Try Demo Account"
    ↓
Backend validates demo@resumebuilder.com
    ↓
Token generated and stored
    ↓
Redirect to /dashboard
    ↓
Access all features
    ↓
When done: Can register for personal account
```

### Path 2: Registered User
```
Login Page
    ↓
Enter email/password
    ↓
Click "Sign in to your account"
    ↓
Backend validates credentials
    ↓
Token generated and stored
    ↓
Redirect to /dashboard
    ↓
Access all features with personal data
```

### Path 3: New User
```
Login Page
    ↓
Click "Create account"
    ↓
Register page (email, password, name)
    ↓
Verify email
    ↓
Go back to Login
    ↓
Enter credentials
    ↓
Redirect to /dashboard
```

---

## 🚀 Setup Instructions

### Step 1: Create Demo Account
```bash
cd /home/sudip-sherpa/sudipro/ProjectFinal/AI-Resume-Builder-Analyzer
node backend/scripts/create-demo-account.js
```

**Expected Output:**
```
🔗 Connecting to MongoDB...
✅ MongoDB Connected
📝 Creating demo account...
✅ Demo account created successfully!
📧 Email: demo@resumebuilder.com
🔐 Password: demopassword123
```

### Step 2: Ensure Servers Running
```bash
npm run dev
# Frontend: http://localhost:5175
# Backend: http://localhost:5001
```

### Step 3: Test Demo Login
```
1. Open http://localhost:5175/login
2. Click "🎬 Try Demo Account"
3. Should redirect to http://localhost:5175/dashboard
4. ✅ Demo mode active!
```

---

## 🔐 Security Considerations

### Demo Account is Public
- **Email/Password visible** in frontend (for demo purposes)
- **Shared by all users** - data may be modified by anyone
- **Not for sensitive data** - for testing only
- **Reset daily** (optional): Run creation script to reset data

### Personal Accounts are Secure
- **Password hashed** with bcrypt
- **JWT tokens** for session management
- **Email verification** required
- **Individual data storage** - private and secure

### Recommendations
1. ✅ Don't store important resumes in demo account
2. ✅ Register personal account for production use
3. ✅ Reset demo account daily/weekly if needed
4. ✅ Use demo for UI testing only

---

## 📊 Database Structure

### Demo User Document
```json
{
  "_id": "ObjectId(...)",
  "name": "Demo User",
  "email": "demo@resumebuilder.com",
  "password": "$2b$10$hashedPassword...",
  "phone": "+1234567890",
  "isVerified": true,
  "role": "user",
  "profile": {
    "title": "Demo Account",
    "headline": "This is a demo account...",
    "summary": "Welcome to AI Resume Builder...",
    "location": "Demo City",
    "website": "https://resumebuilder.demo",
    "phone": "+1234567890"
  },
  "createdAt": "2025-11-21T...",
  "updatedAt": "2025-11-21T..."
}
```

---

## 🧪 Testing Scenarios

### ✅ Scenario 1: First Time Visitor
```
1. User visits http://localhost:5175/login
2. Clicks "🎬 Try Demo Account"
3. Sees loading spinner
4. Redirects to dashboard
5. Can view/test all features
✅ SUCCESS: Demo account works for trials
```

### ✅ Scenario 2: Register Personal Account
```
1. At login page, click "Create account"
2. Fill registration form
3. Verify email
4. Return to login with new account
5. Enter personal credentials
6. Redirects to dashboard
7. See personal resumes
✅ SUCCESS: Personal account separate from demo
```

### ✅ Scenario 3: Demo User Creates Resume
```
1. Login with demo account
2. Go to Builder page
3. Create new resume
4. Save resume
5. View in resume list
6. Another user logs in to demo
7. Sees same resumes (shared data)
✅ SUCCESS: Demo data is shared
```

### ✅ Scenario 4: Registered User Privacy
```
1. User A registers and creates resume
2. User B registers with different email
3. User B logs in
4. Cannot see User A's resumes
5. Only sees own resumes
✅ SUCCESS: Personal data is private
```

---

## 🔄 API Endpoints Used

### For Demo Login
```
POST /api/auth/login
Body: {
  email: "demo@resumebuilder.com",
  password: "demopassword123"
}
Response: {
  success: true,
  token: "eyJhbGciOiJIUzI1NiIs...",
  user: { id, name, email, role }
}
```

### For Regular Login
```
POST /api/auth/login
Body: {
  email: "user@email.com",
  password: "userPassword123"
}
Response: Same as above
```

---

## ❓ FAQ

**Q: Can I delete the demo account?**  
A: Yes, but then demo login won't work. Re-run the creation script to recreate it.

**Q: Do demo users need email verification?**  
A: No, demo account is pre-verified. Regular users need email verification.

**Q: Can demo account register a personal one?**  
A: Yes! Click "Create account" at login page to register separately.

**Q: What if multiple users modify demo data?**  
A: All changes are visible to all demo users - it's shared. For production, register a personal account.

**Q: Can I customize demo account credentials?**  
A: Yes, edit `backend/scripts/create-demo-account.js` before running.

---

## 📝 Notes

- ✅ Demo account is perfect for website visitors/trials
- ✅ Personal accounts for long-term use
- ✅ No registration friction for demos
- ✅ Clear separation between trial and personal data
- ✅ Backend validates both demo and personal logins the same way

---

## 🎉 Summary

**What's New:**
- ✅ Dedicated demo account for public testing
- ✅ No registration needed for trials
- ✅ Both demo and registered users redirect to dashboard
- ✅ Separate data: demo is shared, personal accounts are private
- ✅ Easy to set up and reset

**Benefits:**
- 🚀 Better user onboarding (no registration friction)
- 👥 Multiple users can test with same account
- 🔒 Personal accounts remain private
- 📊 Clear distinction between trial and production use
- ✨ Professional, production-ready feature

---

**Version:** 1.0  
**Last Updated:** November 21, 2025  
**Status:** ✅ Production Ready
