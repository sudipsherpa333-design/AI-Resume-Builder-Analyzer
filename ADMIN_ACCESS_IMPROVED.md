# ADMIN ACCESS & LOGIN - IMPROVED SECURITY & FLOW

## Overview
The admin system has been completely refactored with improved security, better access control, and a cleaner authentication flow.

## Key Improvements

### 1. **Secure Authentication System**
- ✅ **Separate Admin Authentication Routes** (`adminAuthRoutes.js`)
  - Dedicated login, logout, refresh, and verify endpoints
  - JWT token generation with access & refresh tokens
  - Token expiry handling (24h access, 7d refresh)
  - Secure cookie support with HttpOnly flag

- ✅ **Rate Limiting**
  - Max 5 login attempts per 15 minutes
  - Prevents brute force attacks
  - Automatic cleanup after timeout

- ✅ **Input Validation**
  - Email format validation
  - Password requirement checks
  - Comprehensive error messages

### 2. **New Admin Authentication Context**
**File:** `frontend/src/admin/context/AdminAuthContext.jsx`

Features:
- Centralized authentication state management
- Axios interceptors for automatic token refresh
- Permission checking system
- Token verification on startup
- Automatic session recovery

```javascript
// Usage
import { useAdminAuth } from './admin/context/AdminAuthContext';

const MyComponent = () => {
  const { 
    admin,              // Current admin user
    isAuthenticated,    // Auth status
    loading,           // Loading state
    error,             // Error message
    login,             // Login function
    logout,            // Logout function
    hasPermission,     // Check permission
    adminAxios         // Axios instance with auth
  } = useAdminAuth();
};
```

### 3. **Enhanced Admin Context**
**File:** `frontend/src/admin/context/AdminContext.jsx`

Now integrates with `AdminAuthContext` for:
- Dashboard statistics fetching
- Recent activity tracking
- User management data
- Resume management
- Template management

### 4. **Improved Admin Routing**
**Backend:** `backend/src/routes/adminRoutes.js`

Structure:
```
/api/admin/
├── /auth/
│   ├── POST /login           - Authenticate admin
│   ├── POST /refresh         - Refresh access token
│   ├── POST /logout          - Logout admin
│   ├── GET /verify           - Verify current token
│   └── GET /me               - Get current admin info
└── /dashboard/
    ├── GET /stats            - Dashboard statistics
    ├── GET /charts           - Chart data
    └── GET /recent-activity  - Recent activities
```

### 5. **Permission-Based Access Control**
```javascript
// Check permissions
if (admin.hasPermission('manage_users')) {
  // User has permission to manage users
}

// Available permissions
const permissions = [
  'view_dashboard',
  'manage_users',
  'manage_resumes',
  'manage_templates',
  'view_analytics',
  'manage_settings',
  'view_logs',
  'manage_admins',
  'all'  // Super admin permission
];
```

## Admin Login Credentials

### Development
- **Email:** `admin@resume.ai`
- **Password:** `admin@123`

These credentials are stored in environment variables:
```bash
ADMIN_DEFAULT_EMAIL=admin@resume.ai
ADMIN_DEFAULT_PASSWORD=admin@123
JWT_ADMIN_SECRET=your-secret-key
```

## API Endpoints

### Authentication
```bash
# Login
POST /api/admin/auth/login
Content-Type: application/json
{
  "email": "admin@resume.ai",
  "password": "admin@123",
  "rememberMe": true
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": {
      "id": "admin-xxx",
      "email": "admin@resume.ai",
      "name": "System Administrator",
      "role": "super_admin",
      "permissions": ["all"]
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": "24h"
    },
    "sessionExpiry": "2024-02-05T10:00:00Z"
  },
  "timestamp": "2024-02-04T10:00:00Z"
}

# Verify Token
GET /api/admin/auth/verify
Headers:
  Authorization: Bearer <accessToken>

# Refresh Token
POST /api/admin/auth/refresh
Content-Type: application/json
{
  "refreshToken": "eyJhbGc..."
}

# Logout
POST /api/admin/auth/logout
Headers:
  Authorization: Bearer <accessToken>

# Get Current Admin
GET /api/admin/auth/me
Headers:
  Authorization: Bearer <accessToken>
```

### Dashboard Data
```bash
# Get Dashboard Stats
GET /api/admin/dashboard/stats?range=7d
Headers:
  Authorization: Bearer <accessToken>

# Get Recent Activity
GET /api/admin/dashboard/recent-activity?limit=10&page=1
Headers:
  Authorization: Bearer <accessToken>
```

## Frontend Flow

### 1. **AdminAuthProvider Setup**
Wrap your admin app with `AdminAuthProvider`:

```jsx
// App.jsx
<AdminAuthProvider>
  <AdminProvider>
    <AdminApp />
  </AdminProvider>
</AdminAuthProvider>
```

### 2. **Login Flow**
```jsx
const AdminLogin = () => {
  const { login, loading, error } = useAdminAuth();
  
  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    if (result.success) {
      // Navigate to dashboard
    }
  };
};
```

### 3. **Protected Routes**
```jsx
const AdminDashboard = () => {
  const { isAuthenticated, admin, hasPermission } = useAdminAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }
  
  if (!hasPermission('view_dashboard')) {
    return <div>Access Denied</div>;
  }
  
  return <Dashboard />;
};
```

### 4. **Making API Calls**
```jsx
const MyComponent = () => {
  const { adminAxios } = useAdminAuth();
  
  useEffect(() => {
    // adminAxios automatically includes token in headers
    adminAxios.get('/dashboard/stats')
      .then(res => console.log(res.data))
      .catch(err => console.error(err));
  }, [adminAxios]);
};
```

## Security Features

### 1. **Token Management**
- Access tokens expire after 24 hours
- Refresh tokens expire after 7 days
- Automatic refresh before expiry (via interceptor)
- Token stored in localStorage (secure: httpOnly flag in production)

### 2. **Rate Limiting**
- Maximum 5 login attempts per 15 minutes per email
- Prevents brute force attacks
- Returns `429 Too Many Requests` when exceeded

### 3. **CORS Protection**
- Admin API restricted to authenticated requests
- CORS configured for frontend URL only
- Credentials required for cross-origin requests

### 4. **Input Validation**
- Email format validation
- Password strength requirements
- SQL injection prevention via parameterized queries
- XSS protection via React escaping

### 5. **Session Management**
- Automatic logout on token expiry
- Remember me functionality with secure cookies
- Session recovery on app reload
- Graceful error handling for network failures

## Error Handling

### Common Errors

**401 Unauthorized**
```json
{
  "success": false,
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

**429 Too Many Requests**
```json
{
  "success": false,
  "error": "Too many login attempts. Please try again later.",
  "retryAfter": 300
}
```

**403 Forbidden**
```json
{
  "success": false,
  "error": "Permission denied",
  "required": "manage_users"
}
```

**Token Expired**
```json
{
  "success": false,
  "error": "Token expired",
  "code": "TOKEN_EXPIRED"
}
```

## Testing Admin Login

### Using curl
```bash
curl -X POST http://localhost:5001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@resume.ai",
    "password": "admin@123",
    "rememberMe": true
  }'
```

### Using JavaScript
```javascript
const response = await fetch('http://localhost:5001/api/admin/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'admin@resume.ai',
    password: 'admin@123',
    rememberMe: true
  })
});

const data = await response.json();
if (data.success) {
  // Store token
  localStorage.setItem('admin_access_token', data.data.tokens.accessToken);
  localStorage.setItem('admin_refresh_token', data.data.tokens.refreshToken);
}
```

## Environment Variables

```bash
# Backend
ADMIN_DEFAULT_EMAIL=admin@resume.ai
ADMIN_DEFAULT_PASSWORD=admin@123
JWT_ADMIN_SECRET=your-secure-secret-key-change-in-production
JWT_SECRET=your-jwt-secret-key
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:5001/api
VITE_ENABLE_ADMIN=true
```

## File Structure

```
backend/
├── src/
│   └── routes/
│       ├── adminRoutes.js          (Main admin routes)
│       └── adminAuthRoutes.js       (NEW: Auth routes)

frontend/
└── src/
    ├── admin/
    │   ├── context/
    │   │   ├── AdminAuthContext.jsx (NEW: Auth context)
    │   │   └── AdminContext.jsx     (UPDATED: Dashboard context)
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   └── Dashboard.jsx
    │   └── components/
    ├── AdminApp.jsx                 (UPDATED: Routes)
    └── App.jsx                      (UPDATED: Provider setup)
```

## Next Steps

1. **Production Setup**
   - Change `ADMIN_DEFAULT_PASSWORD` to a strong password
   - Set up proper `JWT_ADMIN_SECRET`
   - Enable HTTPS in production
   - Configure CORS for your domain

2. **Database Integration**
   - Migrate from in-memory to database storage
   - Implement bcrypt password hashing
   - Add admin user management

3. **Advanced Features**
   - Two-factor authentication (2FA)
   - Admin activity logging
   - Role-based access control (RBAC)
   - API key management

4. **Monitoring**
   - Login attempt tracking
   - Session monitoring
   - Audit logs
   - Security alerts

## Troubleshooting

**Issue:** Login page shows "Cannot find module"
- **Solution:** Ensure `AdminAuthContext.jsx` is created in the correct location

**Issue:** Token not persisting after refresh
- **Solution:** Check browser localStorage and cookie settings

**Issue:** "Too many login attempts"
- **Solution:** Wait 15 minutes or clear login attempts (dev only)

**Issue:** 401 errors on protected routes
- **Solution:** Verify token is being sent in Authorization header

## Support

For issues or questions, check:
1. Backend logs: `backend/logs/admin.log`
2. Frontend console: Browser Developer Tools > Console
3. Network tab: Check request/response headers
4. Environment variables: Verify all required vars are set
