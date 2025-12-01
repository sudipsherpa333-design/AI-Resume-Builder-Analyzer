# OAuth Setup Guide - Google & Facebook Authentication

## Overview
This guide will help you set up Google and Facebook OAuth authentication for the Resume Builder application.

## Features
✅ User registration with email/password  
✅ User login with email/password  
✅ Google OAuth 2.0 authentication  
✅ Facebook OAuth authentication  
✅ Automatic user creation/linking  
✅ JWT token-based session management  
✅ MongoDB user profile storage  

---

## Backend Setup

### 1. Database Schema Updates

The User model has been updated with the following fields:
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (optional for OAuth users),
  googleId: String (optional),
  facebookId: String (optional),
  profilePicture: String (optional),
  authProvider: Enum['local', 'google', 'facebook'],
  isAdmin: Boolean (default: false)
}
```

### 2. Backend Routes

#### Available Auth Endpoints:

```
POST /api/auth/register          - Register with email/password
POST /api/auth/login             - Login with email/password
POST /api/auth/google            - Authenticate with Google
POST /api/auth/facebook          - Authenticate with Facebook
GET  /api/auth/me                - Get current user (protected)
PUT  /api/auth/profile           - Update profile (protected)
POST /api/auth/logout            - Logout (protected)
```

#### Google OAuth Endpoint:
```javascript
POST /api/auth/google
Body: {
  googleId: "google_user_id",
  email: "user@example.com",
  name: "User Name",
  profilePicture: "url_to_picture"
}
```

#### Facebook OAuth Endpoint:
```javascript
POST /api/auth/facebook
Body: {
  facebookId: "facebook_user_id",
  email: "user@example.com",
  name: "User Name",
  profilePicture: "url_to_picture"
}
```

---

## Frontend Setup

### 1. Google OAuth Setup

#### Step 1: Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Choose "Web application"
6. Add Authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://localhost:5175`
   - Your production domain
7. Copy your **Client ID**

#### Step 2: Update Login/Register Components
Replace `1234567890.apps.googleusercontent.com` with your actual Google Client ID in:
- `/frontend/src/pages/Login.jsx`
- `/frontend/src/pages/Register.jsx`

```javascript
// Find and replace this:
client_id: '1234567890.apps.googleusercontent.com'

// With your actual Client ID:
client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
```

#### Step 3: Test Google OAuth
1. Start your frontend server
2. Click "Google" button on Login/Register page
3. Sign in with your Google account
4. You should be redirected to Dashboard

---

### 2. Facebook OAuth Setup

#### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Go to "My Apps" → "Create App"
3. Choose "Consumer" as app type
4. Fill in app details
5. Add "Facebook Login" product
6. Configure OAuth Redirect URIs:
   - `http://localhost:5173/`
   - `http://localhost:5175/`
   - Your production domain
7. Copy your **App ID**

#### Step 2: Update Login/Register Components
Replace `1234567890` with your actual Facebook App ID in:
- `/frontend/src/pages/Login.jsx`
- `/frontend/src/pages/Register.jsx`

```javascript
// Find and replace this:
appId: '1234567890'

// With your actual App ID:
appId: 'YOUR_FACEBOOK_APP_ID'
```

#### Step 3: Test Facebook OAuth
1. Start your frontend server
2. Click "Facebook" button on Login/Register page
3. Sign in with your Facebook account
4. You should be redirected to Dashboard

---

## Environment Variables (Optional)

Create a `.env` file in the backend directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/resumebuilder

# JWT
JWT_SECRET=your_jwt_secret_key

# Google OAuth (for server-side verification)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth (for server-side verification)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

---

## Authentication Flow

### Email/Password Flow
```
1. User enters email & password
2. Frontend sends POST /api/auth/login
3. Backend verifies password with bcrypt
4. Backend generates JWT token
5. Frontend stores token & user data in localStorage
6. Axios interceptor adds token to subsequent requests
7. User redirected to Dashboard
```

### Google OAuth Flow
```
1. User clicks "Google" button
2. Google SDK opens authentication dialog
3. User signs in with Google account
4. Frontend receives credential JWT
5. Frontend decodes JWT to extract user info
6. Frontend sends POST /api/auth/google with user data
7. Backend creates/links user to Google account
8. Backend generates JWT token
9. Frontend stores token & redirects to Dashboard
```

### Facebook OAuth Flow
```
1. User clicks "Facebook" button
2. Facebook SDK opens authentication dialog
3. User signs in with Facebook account
4. Frontend calls FB.api to get user info
5. Frontend sends POST /api/auth/facebook with user data
6. Backend creates/links user to Facebook account
7. Backend generates JWT token
8. Frontend stores token & redirects to Dashboard
```

---

## Security Considerations

✅ **Password Security**: Passwords hashed with bcrypt before storage  
✅ **OAuth Token Verification**: Frontend decodes Google JWT; verify on backend in production  
✅ **HTTP-only Cookies**: Consider using HTTP-only cookies instead of localStorage  
✅ **CORS**: Configure CORS to only allow your domain  
✅ **SSL/TLS**: Always use HTTPS in production  
✅ **Token Expiration**: Consider implementing token refresh mechanism  

---

## Testing Checklist

- [ ] User can register with email/password
- [ ] User can login with email/password
- [ ] User redirected to Dashboard after login
- [ ] Google OAuth button visible on Login page
- [ ] User can sign in with Google
- [ ] User created in MongoDB with Google ID
- [ ] Facebook OAuth button visible on Login page
- [ ] User can sign in with Facebook
- [ ] User created in MongoDB with Facebook ID
- [ ] Token stored in localStorage
- [ ] User data stored in localStorage
- [ ] Axios interceptor adds token to requests
- [ ] Token cleared on logout
- [ ] Redirect to login on 401 response

---

## Troubleshooting

### Google Button Not Appearing
- Check if Client ID is correctly set
- Ensure Google SDK script is loaded
- Check browser console for errors

### Facebook Button Not Working
- Verify Facebook App ID is correct
- Check if permissions are correct: `public_profile,email`
- Ensure domain is added to Facebook App settings

### User Not Created in Database
- Check backend logs for errors
- Verify MongoDB connection
- Ensure auth endpoints are accessible

### Token Not Persisting
- Check if localStorage is available
- Verify token is being stored correctly
- Check if secure localStorage settings are enabled

---

## File Changes Summary

### Backend
- ✅ Updated `User.js` model with OAuth fields
- ✅ Updated `authController.js` with Google & Facebook handlers
- ✅ Updated `authRoutes.js` with new OAuth endpoints

### Frontend
- ✅ Updated `Login.jsx` with OAuth buttons and flow
- ✅ Updated `Register.jsx` with OAuth buttons and flow
- ✅ Existing axios interceptor handles token management

---

## Next Steps

1. Set up Google OAuth credentials
2. Set up Facebook OAuth credentials
3. Update Client IDs/App IDs in Login/Register pages
4. Test all authentication flows
5. Deploy with secure environment variables
6. Configure production domains in OAuth providers

---

## Support

For issues or questions:
1. Check browser console for errors
2. Check backend logs (`/tmp/backend.log`)
3. Check frontend logs (`/tmp/frontend.log`)
4. Verify OAuth credentials are correct
5. Ensure all APIs are accessible

