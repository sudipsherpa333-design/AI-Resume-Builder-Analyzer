#!/bin/bash

echo "🔧 COMPLETE FIX FOR RESUME ROUTES"
echo "=================================="

# Step 1: Add authMiddleware export to auth.js
echo "1️⃣ Adding authMiddleware export to auth.js..."
if ! grep -q "export const authMiddleware" src/middleware/auth.js; then
    cat >> src/middleware/auth.js << 'AUTH'

// ============ FIX FOR RESUMES.JS ============
/**
 * Alias for protect middleware - fixes import in resumes.js
 */
export const authMiddleware = protect;

// Update default export
export default {
    protect,
    authMiddleware,
    optionalAuth,
    adminMiddleware,
    superAdminMiddleware,
    hasRole,
    rateLimitAuth,
    csrfProtection,
    requestLogger
};
AUTH
    echo "   ✅ Added authMiddleware export"
else
    echo "   ⚠️ authMiddleware export already exists"
fi

# Step 2: Fix import path in resumes.js
echo "2️⃣ Fixing import path in resumes.js..."
if [ -f src/routes/resumes.js ]; then
    # Backup
    cp src/routes/resumes.js src/routes/resumes.js.backup
    
    # Fix the import
    sed -i 's|import.*authMiddleware.*from.*middleware/authMiddleware.js|import { authMiddleware } from "../middleware/auth.js"|g' src/routes/resumes.js
    
    echo "   ✅ Updated resumes.js import"
else
    echo "   ❌ resumes.js not found!"
fi

# Step 3: Fix any other route files
echo "3️⃣ Checking other route files..."
for file in src/routes/*.js; do
    if grep -q "authMiddleware.*from.*authMiddleware" "$file"; then
        echo "   🔧 Fixing: $(basename $file)"
        sed -i 's|import.*authMiddleware.*from.*middleware/authMiddleware.js|import { authMiddleware } from "../middleware/auth.js"|g' "$file"
    fi
done

# Step 4: Verify the fixes
echo ""
echo "4️⃣ VERIFICATION:"
echo "----------------"
echo "📄 resumes.js import:"
grep -n "import.*auth" src/routes/resumes.js | head -1

echo ""
echo "📄 auth.js exports:"
grep -n "export.*authMiddleware" src/middleware/auth.js | tail -1

# Step 5: Kill server and restart
echo ""
echo "5️⃣ Restarting server..."
pkill -f node
sudo kill -9 $(sudo lsof -t -i:5001) 2>/dev/null || true
rm -rf node_modules/.cache

echo ""
echo "✅ FIXES COMPLETE!"
echo "🚀 Starting server..."
echo "===================="
npm run dev
