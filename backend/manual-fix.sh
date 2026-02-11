#!/bin/bash

echo "🔧 Manually fixing Resume imports..."

# File 1: resumeController.js
echo "Fixing src/controllers/resumeController.js..."
cat > src/controllers/resumeController.js.tmp << 'CONTENT'
import Resume from '../models/Resume.js';
CONTENT
# Get the rest of the file after the import
tail -n +2 src/controllers/resumeController.js >> src/controllers/resumeController.js.tmp
mv src/controllers/resumeController.js.tmp src/controllers/resumeController.js

# File 2: aiController.js
echo "Fixing src/controllers/aiController.js..."
cat > src/controllers/aiController.js.tmp << 'CONTENT'
import Resume from '../models/Resume.js';
CONTENT
tail -n +2 src/controllers/aiController.js >> src/controllers/aiController.js.tmp
mv src/controllers/aiController.js.tmp src/controllers/aiController.js

# File 3: DashboardService.js
echo "Fixing src/admin/services/DashboardService.js..."
# First, get the first line
first_line=$(head -1 src/admin/services/DashboardService.js)
if [[ "$first_line" == *"Resumes.js"* ]]; then
    echo "import Resume from '../../models/Resume.js';" > src/admin/services/DashboardService.js.tmp
    tail -n +2 src/admin/services/DashboardService.js >> src/admin/services/DashboardService.js.tmp
    mv src/admin/services/DashboardService.js.tmp src/admin/services/DashboardService.js
fi

# File 4: adminRoutes.js
echo "Fixing src/routes/adminRoutes.js..."
sed -i "1s|.*Resumes.*|import Resume from '../models/Resume.js';|" src/routes/adminRoutes.js

# File 5: ResumeService.js
echo "Fixing src/services/ResumeService.js..."
sed -i "1s|.*Resumes.*|import Resume from '../models/Resume.js';|" src/services/ResumeService.js

# File 6: dashboardRoutes.js
echo "Fixing src/routes/dashboardRoutes.js..."
sed -i "s|import Resume from '../src/models/Resume.js'|import Resume from '../models/Resume.js'|g" src/routes/dashboardRoutes.js

echo "✅ Manual fixes applied!"
