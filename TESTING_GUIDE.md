# 🧪 Testing Guide - Resume Builder

Complete guide to test the AI Resume Builder application end-to-end.

---

## 📋 Pre-Test Checklist

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] MongoDB running locally or MongoDB Atlas connected
- [ ] Backend dependencies installed (`npm install` in backend/)
- [ ] Frontend dependencies installed (`npm install` in frontend/)
- [ ] `.env` files configured in both frontend and backend

### Verify Environment
```bash
# Check Node version
node --version  # Should be v18 or higher

# Check npm version
npm --version   # Should be v9 or higher

# Check MongoDB connection
mongosh --version  # Or mongo --version for older versions
```

---

## 🚀 Starting Services

### Option 1: Automated Startup
```bash
chmod +x quick-start.sh
./quick-start.sh
```

### Option 2: Manual Startup

#### Terminal 1: Start MongoDB
```bash
# Using local MongoDB
mongod

# Or using MongoDB Atlas (skip this if using Atlas)
```

#### Terminal 2: Start Backend
```bash
cd backend
npm run dev
# Should show: ✓ Server running on http://localhost:5001
```

#### Terminal 3: Start Frontend
```bash
cd frontend
npm run dev
# Should show: ✓ Frontend available at http://localhost:5173
```

---

## ✅ Test 1: Application Startup

### Expected Results
- [ ] Backend server starts without errors
- [ ] Frontend compiles without errors (warnings OK)
- [ ] No console errors in browser DevTools
- [ ] API health check passes: `curl http://localhost:5001/api/health`

### Health Check
```bash
# Check backend health
curl http://localhost:5001/api/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2025-01-11T...",
#   "uptime": "0.5s"
# }

# Check frontend is accessible
curl http://localhost:5173
```

---

## ✅ Test 2: User Authentication

### 2.1 Registration
1. Open http://localhost:5173
2. Click "Sign Up"
3. Fill in details:
   - Email: `test@example.com`
   - Password: `Test@12345`
   - Confirm Password: `Test@12345`
4. Click "Create Account"

**Expected Results:**
- [ ] No validation errors
- [ ] Account created successfully
- [ ] Redirected to builder or dashboard
- [ ] User data saved in MongoDB

### 2.2 Login
1. Log out if already logged in
2. Click "Log In"
3. Enter credentials:
   - Email: `test@example.com`
   - Password: `Test@12345`
4. Click "Sign In"

**Expected Results:**
- [ ] Login successful
- [ ] Redirected to dashboard
- [ ] User name displayed in header
- [ ] "Remember me" option works

### 2.3 Token Verification
```bash
# In browser DevTools (Application → LocalStorage)
# Check if 'token' exists and is valid JWT

# Or via API:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5001/api/user/me
```

---

## ✅ Test 3: Resume Creation

### 3.1 Create New Resume
1. Navigate to Builder (click "Build Resume")
2. Enter resume title: `My First Resume`
3. Select template: `Modern Pro`
4. Click "Create Resume"

**Expected Results:**
- [ ] Resume is created
- [ ] Redirected to builder wizard
- [ ] Resume appears in dashboard with "Draft" status
- [ ] Database has new Resume document

**Verify in Database:**
```bash
# Connect to MongoDB
mongosh
use resume-builder
db.resumes.findOne({ title: "My First Resume" })

# Should return resume object with:
# _id, userId, title, template, data, status, createdAt, updatedAt
```

### 3.2 Fill Resume Data
Complete each step of the wizard:

#### Step 1: Personal Information
- Full Name: `John Doe`
- Email: `john@example.com`
- Phone: `+1-555-1234`
- Location: `New York, NY`
- Professional Title: `Senior Software Engineer`

**Expected Results:**
- [ ] Data persists when navigating between steps
- [ ] Real-time preview updates
- [ ] No validation errors

#### Step 2: Professional Summary
- Click "Enhance with AI" button
- Or manually enter: `Experienced software engineer with 8 years of expertise...`

**Expected Results:**
- [ ] AI enhancement provides suggestions
- [ ] Preview updates in real-time
- [ ] Auto-save triggers (check network tab)

#### Step 3: Experience
1. Click "Add Experience"
2. Fill in:
   - Company: `Tech Corp`
   - Position: `Senior Developer`
   - Start Date: `01/2020`
   - End Date: `Present` (check "Currently working here")
   - Description: `Led development of microservices architecture...`

**Expected Results:**
- [ ] Experience entry saved
- [ ] Can add multiple entries
- [ ] "Enhance with AI" provides bullet points
- [ ] Auto-save works

#### Step 4: Education
1. Click "Add Education"
2. Fill in:
   - Institution: `State University`
   - Degree: `Bachelor of Science`
   - Field: `Computer Science`
   - Graduation: `05/2016`

**Expected Results:**
- [ ] Education saved
- [ ] Can add multiple degrees
- [ ] Data validates properly

#### Step 5: Skills
1. Click "Add Skill"
2. Fill in:
   - Skill Name: `JavaScript`
   - Level: `Expert`
   - Category: `Technical`

**Expected Results:**
- [ ] Skills saved
- [ ] Dropdown filters work
- [ ] Can rank skills by dragging

#### Step 6: Projects (Optional)
1. Click "Add Project"
2. Fill in project details
3. Click "Enhance with AI"

**Expected Results:**
- [ ] Project data saves
- [ ] AI provides project enhancements
- [ ] Real-time preview updates

---

## ✅ Test 4: Auto-Save & Persistence

### 4.1 Auto-Save Test
1. While in builder, fill in some data
2. Open Network tab in DevTools
3. Wait 2-3 seconds
4. Should see POST/PUT request to `/api/resumes`

**Expected Results:**
- [ ] Request succeeds with 200/201 status
- [ ] Response includes updated resume data
- [ ] No errors in console

### 4.2 Page Refresh Test
1. Fill in some resume data
2. Press F5 to refresh page
3. Resume should reload with all previous data

**Expected Results:**
- [ ] All data is persisted
- [ ] No data loss after refresh
- [ ] Resume status is correct

### 4.3 Offline Support Test
1. Fill in resume data
2. Open DevTools → Network
3. Set throttling to "Offline"
4. Continue editing resume
5. Turn throttling back to "Online"

**Expected Results:**
- [ ] Can still edit offline
- [ ] Data syncs when back online
- [ ] No data corruption
- [ ] Notification shows sync status

---

## ✅ Test 5: Dashboard

### 5.1 View All Resumes
1. Log in and navigate to Dashboard
2. Should see list of all created resumes

**Expected Results:**
- [ ] All resumes display correctly
- [ ] Shows resume title, status, created date
- [ ] Shows last modified time
- [ ] ATS scores display (if calculated)

### 5.2 Resume Statistics
Should display:
- [ ] Total resumes created
- [ ] Average ATS score
- [ ] Completion percentage
- [ ] Total downloads/views

**Verify Stats Calculation:**
```bash
# API endpoint
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5001/api/resumes/stats

# Should return statistics object
```

### 5.3 Filter & Search
1. Enter search term in search box: `Engineer`
2. Filter by status: `Draft`
3. Sort by date: `Newest First`

**Expected Results:**
- [ ] Search filters resumes by title
- [ ] Status filter works
- [ ] Sorting works correctly
- [ ] Results update instantly

### 5.4 Bulk Actions
1. Select multiple resumes (checkbox)
2. Click "Delete Selected"
3. Confirm deletion

**Expected Results:**
- [ ] Multiple resumes deleted
- [ ] Dashboard updates
- [ ] Database records removed

---

## ✅ Test 6: AI Features

### 6.1 ATS Score Analysis
1. Open a resume in builder
2. Go to "AI Analysis" tab
3. Click "Analyze ATS Compatibility"

**Expected Results:**
- [ ] ATS score calculated (0-100)
- [ ] Shows breakdown by section
- [ ] Provides improvement suggestions
- [ ] Shows missing keywords

**Mock Response (if API unavailable):**
```json
{
  "score": 85,
  "breakdown": {
    "personalInfo": 90,
    "summary": 75,
    "experience": 88,
    "education": 90,
    "skills": 85
  },
  "suggestions": [
    "Add more action verbs",
    "Include quantifiable results"
  ]
}
```

### 6.2 Section Enhancement
1. In builder, click "Enhance with AI" on any section
2. Wait for AI suggestions

**Expected Results:**
- [ ] Suggestions appear within 2-3 seconds
- [ ] Suggestions are relevant
- [ ] Can accept or reject suggestions
- [ ] Preview updates when accepted

### 6.3 Job Matching
1. Copy a job description
2. Go to "Job Match" section
3. Paste job description
4. Click "Analyze Match"

**Expected Results:**
- [ ] Match percentage calculated
- [ ] Missing keywords highlighted
- [ ] Suggestions for improvement provided
- [ ] Keywords auto-added to resume

---

## ✅ Test 7: Export & Download

### 7.1 Export to PDF
1. Open a resume
2. Click "Export" → "PDF"
3. Save file

**Expected Results:**
- [ ] PDF downloads successfully
- [ ] PDF contains all resume data
- [ ] Formatting is preserved
- [ ] File size < 2 MB

### 7.2 Export to DOCX
1. Open a resume
2. Click "Export" → "Word (.docx)"
3. Save file

**Expected Results:**
- [ ] DOCX downloads successfully
- [ ] Can open in Microsoft Word
- [ ] Formatting is editable
- [ ] All sections are present

### 7.3 Export to JSON
1. Open a resume
2. Click "Export" → "JSON"
3. Save file

**Expected Results:**
- [ ] JSON file downloads
- [ ] Contains complete resume data
- [ ] Valid JSON format
- [ ] Can be imported later

---

## ✅ Test 8: Error Handling

### 8.1 Network Errors
1. Open DevTools → Network
2. Set throttling to "Slow 3G"
3. Try to perform operations (create, save, delete)

**Expected Results:**
- [ ] Timeouts handled gracefully
- [ ] User sees error message
- [ ] Can retry operation
- [ ] No data loss

### 8.2 Validation Errors
1. Try to create resume without title
2. Try to save resume without email

**Expected Results:**
- [ ] Clear error messages appear
- [ ] Fields are highlighted
- [ ] Cannot submit invalid data

### 8.3 Permission Errors
1. Try to access another user's resume via URL:
   ```
   http://localhost:5173/builder/OTHER_USER_RESUME_ID
   ```

**Expected Results:**
- [ ] Access denied
- [ ] Redirected to dashboard
- [ ] Error message displayed
- [ ] No data leakage

### 8.4 Storage Quota
1. For premium users, try to exceed storage limit
2. Attempt to create resume when quota full

**Expected Results:**
- [ ] Clear error about quota
- [ ] Suggestion to upgrade plan
- [ ] Graceful handling

---

## ✅ Test 9: Real-Time Features

### 9.1 Socket.io Connection
```bash
# Check in DevTools → Network → WS
# Should see active WebSocket connection to backend
```

**Expected Results:**
- [ ] WebSocket connects on page load
- [ ] Disconnects on page unload
- [ ] Reconnects if connection lost
- [ ] No console errors

### 9.2 Real-Time Preview
1. Open resume in builder
2. Edit personal info
3. Watch right panel preview update in real-time

**Expected Results:**
- [ ] Preview updates instantly (< 100ms)
- [ ] All sections update correctly
- [ ] No lag or delays

---

## ✅ Test 10: Performance

### 10.1 Load Time
1. Open http://localhost:5173
2. Open DevTools → Performance
3. Reload page and measure

**Expected Results:**
- [ ] First Contentful Paint < 2 seconds
- [ ] Time to Interactive < 4 seconds
- [ ] Largest Contentful Paint < 3 seconds

### 10.2 Bundle Size
```bash
cd frontend
npm run build

# Check dist/ folder size
du -sh dist/

# Expected: < 500 KB total (gzipped)
```

### 10.3 API Response Times
```bash
# Measure API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5001/api/resumes

# Expected: < 200ms for list, < 100ms for single
```

---

## 📊 Test Results Template

```markdown
## Test Session: [DATE/TIME]
- Tester: [NAME]
- Environment: [LOCAL/STAGING/PROD]
- Branch: [GIT BRANCH]

### Results Summary
- Tests Passed: [X/Y]
- Tests Failed: [X/Y]
- Blockers: [NONE/CRITICAL/MAJOR/MINOR]

### Test Details

#### Test 1: Startup ✅
- Details...

#### Test 2: Auth ✅
- Details...

[Continue for all tests...]

### Issues Found
1. [Issue Description]
2. [Issue Description]

### Performance Metrics
- Load Time: XXX ms
- API Response: XXX ms
- Bundle Size: XXX KB

### Sign-off
- [✅ PASSED / ❌ FAILED]
- Date: [DATE]
- Tester: [NAME]
```

---

## 🔍 Debugging Tips

### Common Issues & Solutions

#### Backend Won't Start
```bash
# Check if port 5001 is in use
lsof -i :5001

# Kill process on port 5001
kill -9 <PID>

# Check MongoDB connection
mongosh --eval "db.adminCommand('ping')"
```

#### Frontend Build Fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check for circular dependencies
npm run build -- --analyze
```

#### API Calls Fail
```bash
# Check backend logs
tail -f backend/logs/application.log

# Test API directly
curl -v http://localhost:5001/api/health

# Check CORS headers
curl -i -X OPTIONS http://localhost:5001/api/resumes
```

#### Database Issues
```bash
# Check MongoDB status
mongosh

# List databases
show dbs

# Check collections
use resume-builder
show collections

# Count resumes
db.resumes.countDocuments()
```

### Enable Debug Mode
```bash
# Backend
DEBUG=app:* npm run dev

# Frontend
VITE_DEBUG=true npm run dev
```

### Check Logs
```bash
# Backend logs
tail -f backend/logs/application.log

# Browser console
Press F12 → Console tab

# Network tab
Press F12 → Network tab
```

---

## 📈 Success Criteria

All tests should pass before considering the application production-ready:

- [ ] All authentication flows work
- [ ] Resume CRUD operations complete without errors
- [ ] Data persists to MongoDB correctly
- [ ] AI features provide useful suggestions
- [ ] Dashboard shows accurate statistics
- [ ] Export functions generate valid files
- [ ] Error handling is user-friendly
- [ ] Performance meets requirements
- [ ] No sensitive data in logs/console
- [ ] Mobile responsiveness verified

---

## 🚀 Next Steps After Testing

If all tests pass:
1. ✅ Deploy backend to production server
2. ✅ Deploy frontend to CDN
3. ✅ Set up monitoring and alerts
4. ✅ Configure email notifications
5. ✅ Set up backup procedures
6. ✅ Launch beta user program
7. ✅ Gather user feedback
8. ✅ Iterate based on feedback

---

**Last Updated:** January 11, 2025
**Version:** 1.0.0
**Maintained By:** Sudip Sherpa

