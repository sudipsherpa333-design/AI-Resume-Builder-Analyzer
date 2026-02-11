# QUICK START - ADMIN ACCESS GUIDE

## 🚀 Getting Started

### 1. Start the Backend
```bash
cd backend
npm install
npm run dev
```

Backend will run on: `http://localhost:5001`

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: `http://localhost:3000`

### 3. Access Admin Panel
- **URL:** `http://localhost:3000/admin/login`
- **Email:** `admin@resume.ai`
- **Password:** `admin@123`

## 🔐 Login Process

1. Navigate to `/admin/login`
2. Enter credentials:
   - Email: `admin@resume.ai`
   - Password: `admin@123`
3. Optionally check "Remember Me"
4. Click Login
5. You'll be redirected to `/admin/dashboard`

## 📊 Admin Dashboard

The admin panel includes:
- **Dashboard** - Overview statistics
- **Users** - User management
- **Resumes** - Resume management
- **Templates** - Template management
- **Analytics** - System analytics
- **Logs** - System logs
- **Settings** - Configuration
- **System** - System information

## 🔑 API Usage

### Get Auth Token
```bash
curl -X POST http://localhost:5001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@resume.ai",
    "password": "admin@123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "admin": { ... },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": "24h"
    }
  }
}
```

### Use Token in Requests
```bash
curl -X GET http://localhost:5001/api/admin/dashboard/stats \
  -H "Authorization: Bearer <accessToken>"
```

## 🛠️ Troubleshooting

### Login Page Not Loading
- Check frontend is running on port 3000
- Check browser console for errors
- Verify VITE_API_URL in .env

### Login Fails
- Verify backend is running on port 5001
- Check credentials are correct
- Wait if you've exceeded 5 login attempts
- Check backend logs

### "Too Many Attempts" Error
- Wait 15 minutes, OR
- Clear browser localStorage:
  ```javascript
  localStorage.removeItem('admin_access_token');
  localStorage.removeItem('admin_refresh_token');
  ```

### Token Expired Error
- The app automatically refreshes tokens
- If manual refresh needed, logout and login again

## 💾 File Locations

### Backend Admin Files
```
backend/src/routes/
├── adminRoutes.js           (Main admin routes)
└── adminAuthRoutes.js       (Authentication routes)
```

### Frontend Admin Files
```
frontend/src/admin/
├── context/
│   ├── AdminAuthContext.jsx (Authentication)
│   └── AdminContext.jsx     (Dashboard)
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Users.jsx
│   └── ...
├── components/
│   └── layout/AdminLayout.jsx
└── ...
```

## 🔄 Logout Process

1. Click logout button in admin panel
2. Backend clears session
3. Frontend clears tokens from localStorage
4. Redirect to login page
5. All future requests require new login

## 🔐 Token Expiry

- **Access Token:** 24 hours
- **Refresh Token:** 7 days
- **Auto-refresh:** 5-10 minutes before expiry
- **Remember Me:** Extends refresh token in cookie

## 📱 Permissions System

Available permissions:
```javascript
[
  'view_dashboard',
  'manage_users',
  'manage_resumes',
  'manage_templates',
  'view_analytics',
  'manage_settings',
  'view_logs',
  'manage_admins',
  'all'  // Super admin
]
```

Check permission:
```javascript
const { hasPermission } = useAdminAuth();
if (hasPermission('manage_users')) {
  // Show user management
}
```

## 🌐 API Endpoints Summary

```
Auth:
  POST   /api/admin/auth/login
  POST   /api/admin/auth/refresh
  POST   /api/admin/auth/logout
  GET    /api/admin/auth/verify
  GET    /api/admin/auth/me

Dashboard:
  GET    /api/admin/dashboard/stats
  GET    /api/admin/dashboard/charts
  GET    /api/admin/dashboard/recent-activity

Users:
  GET    /api/admin/users
  GET    /api/admin/users/:id
  POST   /api/admin/users
  PUT    /api/admin/users/:id
  DELETE /api/admin/users/:id

Resumes:
  GET    /api/admin/resumes
  GET    /api/admin/resumes/:id
  
Templates:
  GET    /api/admin/templates
  
Analytics:
  GET    /api/admin/analytics
  
Logs:
  GET    /api/admin/logs
  
Settings:
  GET    /api/admin/settings
  PUT    /api/admin/settings
```

## 📝 Environment Setup

### Backend (.env)
```
ADMIN_DEFAULT_EMAIL=admin@resume.ai
ADMIN_DEFAULT_PASSWORD=admin@123
JWT_ADMIN_SECRET=your-secret-key-here
JWT_SECRET=your-jwt-secret
NODE_ENV=development
MONGODB_URI=your-mongodb-uri
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5001/api
VITE_ENABLE_ADMIN=true
```

## 🧪 Quick Test Commands

### Test Login
```bash
curl -X POST http://localhost:5001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@resume.ai","password":"admin@123"}'
```

### Get Dashboard Stats
```bash
# Replace TOKEN with actual token from login response
curl -X GET http://localhost:5001/api/admin/dashboard/stats \
  -H "Authorization: Bearer TOKEN"
```

### Get Current Admin Info
```bash
curl -X GET http://localhost:5001/api/admin/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## 📊 Development Mode

In development:
- Admin login credentials are preset
- Errors show detailed messages
- Console logging is enabled
- Mock data available for testing
- CORS is permissive

## 🚀 Production Checklist

- [ ] Change ADMIN_DEFAULT_PASSWORD
- [ ] Set secure JWT_ADMIN_SECRET
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure CORS properly
- [ ] Set up database authentication
- [ ] Enable rate limiting
- [ ] Set up logging
- [ ] Configure backups
- [ ] Set up monitoring

## 💡 Common Tasks

### Change Admin Password
```bash
# In backend/.env
ADMIN_DEFAULT_PASSWORD=new-secure-password
```

### Add Permission to Admin
```javascript
// In adminAuthRoutes.js login endpoint
permissions: [
  'view_dashboard',
  'manage_users',
  'manage_resumes',
  // Add new permissions here
]
```

### Check Token Status
```javascript
const { admin, isAuthenticated, loading } = useAdminAuth();
console.log('Authenticated:', isAuthenticated);
console.log('Admin:', admin);
console.log('Loading:', loading);
```

## 📚 Full Documentation

See these files for complete documentation:
- `ADMIN_ACCESS_IMPROVED.md` - Detailed API reference
- `ADMIN_IMPROVEMENTS_SUMMARY.md` - Complete feature list
- Backend: `backend/src/routes/adminAuthRoutes.js`
- Frontend: `frontend/src/admin/context/AdminAuthContext.jsx`

## 🆘 Need Help?

1. Check the full documentation files
2. Review error messages in console
3. Check backend logs in `backend/logs/`
4. Verify all env variables are set
5. Ensure both frontend and backend are running
6. Clear browser cache and localStorage
7. Try in a private/incognito window

---

**Quick Links:**
- Admin Login: `http://localhost:3000/admin/login`
- API Docs: `http://localhost:5001/api/docs`
- API Health: `http://localhost:5001/health`
