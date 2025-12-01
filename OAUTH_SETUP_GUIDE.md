# OAuth Setup Guide - Google & Facebook Login

This guide will help you set up Google and Facebook OAuth for the AI Resume Builder app.

## Table of Contents
- [Google OAuth Setup](#google-oauth-setup)
- [Facebook OAuth Setup](#facebook-oauth-setup)
- [Environment Variables](#environment-variables)
- [Testing](#testing)

---

## Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a Project" → "New Project"
3. Enter project name: "AI Resume Builder"
4. Click "Create"

### Step 2: Enable Google Sign-In API
1. In the console, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press **"Enable"**

### Step 3: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Choose **"Web application"**
4. Add Authorized JavaScript origins:
   - `http://localhost:5173` (Vite dev server)
   - `http://localhost:3000` (if using different port)
   - `https://yourdomain.com` (production domain)
5. Add Authorized redirect URIs:
   - `http://localhost:5173/login`
   - `http://localhost:5173/builder`
   - `https://yourdomain.com/login`
6. Click "Create"
7. Copy your **Client ID**

### Step 4: Add Client ID to Environment
1. Open `frontend/.env`
2. Add: `VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE`
3. Replace `YOUR_CLIENT_ID_HERE` with your actual Client ID

---

## Facebook OAuth Setup

### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" as app type
4. Fill in app name: "AI Resume Builder"
5. Click "Create App"

### Step 2: Set Up Facebook Login
1. In your app dashboard, click **"+ Add Product"**
2. Find **"Facebook Login"** and click **"Set Up"**
3. Choose **"Web"** as platform

### Step 3: Configure Facebook Login Settings
1. Go to **Facebook Login** → **Settings**
2. Add Valid OAuth Redirect URIs:
   - `http://localhost:5173/login`
   - `http://localhost:5173/builder`
   - `https://yourdomain.com/login`
3. Click "Save Changes"

### Step 4: Get App ID
1. Go to **Settings** → **Basic**
2. Copy your **App ID**

### Step 5: Add App ID to Environment
1. Open `frontend/.env`
2. Add: `VITE_FACEBOOK_APP_ID=YOUR_APP_ID_HERE`
3. Replace `YOUR_APP_ID_HERE` with your actual App ID

---

## Environment Variables

Your `frontend/.env` file should look like:

```properties
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME="AI Resume Builder"
VITE_APP_VERSION=1.0.0

# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_AI_SERVICE_URL=http://localhost:3000/ai

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PDF_EXPORT=true
VITE_ENABLE_FILE_UPLOAD=true

# OAuth Configuration (IMPORTANT!)
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
VITE_FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID_HERE

# Development
VITE_DEV_MODE=true
```

---

## Testing

### Test Login Flow
1. Start the development server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Open `http://localhost:5173` in your browser

3. Click "Sign In" and test all options:
   - **Email/Password**: Use demo@resumebuilder.com / demopassword123
   - **Google**: Click "Continue with Google"
   - **Facebook**: Click "Continue with Facebook"
   - **Demo Button**: Click "Try Demo Account"

### Expected Behavior
- ✅ Home page loads first when unauthenticated
- ✅ Clicking login redirects to login page
- ✅ After login, redirects to dashboard
- ✅ Page refresh maintains auth state
- ✅ Google/Facebook login works smoothly
- ✅ Demo account login for testing

---

## Troubleshooting

### Google Login Not Working
- Check that Client ID is correct in `.env`
- Ensure localhost origin is added to Google Cloud Console
- Check browser console for errors (F12 → Console)
- Verify VITE_GOOGLE_CLIENT_ID is not "YOUR_GOOGLE_CLIENT_ID_HERE"

### Facebook Login Not Working
- Check that App ID is correct in `.env`
- Ensure localhost redirect URI is added to Facebook app settings
- Check browser console for errors
- Verify VITE_FACEBOOK_APP_ID is not "YOUR_FACEBOOK_APP_ID_HERE"
- Ensure Facebook SDK is loaded (check Network tab in F12)

### Auth Not Persisting on Refresh
- Check localStorage in browser (F12 → Application → Local Storage)
- Should have keys: `token`, `user`, `selectedTemplate`, `resumeDraft`
- Check AuthContext in F12 → Console for errors

### Redirect Issues After Login
- Verify redirect URL is set correctly
- Check URL query param: `?redirect=/dashboard`
- Check localStorage for `token` and `user`

---

## Backend Integration (Optional)

To fully integrate with backend:

1. Your backend should have these OAuth endpoints:
   - `POST /api/auth/google` - Accept Google token
   - `POST /api/auth/facebook` - Accept Facebook token
   - `POST /api/auth/login` - Email/password login
   - `POST /api/auth/register` - Register new user

2. Expected response format:
   ```json
   {
     "success": true,
     "token": "jwt-token-here",
     "user": {
       "id": "user-id",
       "email": "user@example.com",
       "name": "User Name",
       "picture": "url-to-picture"
     }
   }
   ```

---

## Production Deployment

Before deploying to production:

1. Generate actual Google OAuth credentials
2. Generate actual Facebook App ID
3. Add your production domain to both OAuth providers
4. Update `.env` with production values
5. Set secure flag on cookies in backend
6. Use HTTPS for all OAuth redirects
7. Never commit real credentials to git

---

## Support

For issues or questions:
- Check browser console (F12)
- Review backend logs
- Verify .env file has correct values
- Test with demo account first
- Clear browser cache and localStorage if needed

