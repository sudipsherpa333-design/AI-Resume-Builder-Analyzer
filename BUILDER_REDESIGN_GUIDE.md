# Professional Resume Builder Redesign - Implementation Guide

## Overview
This guide explains how to integrate the new professional 3-column layout builder with enhanced features including auto-save, live preview, and database integration.

## New Components Created

### 1. **BuilderHeaderBar.jsx**
Location: `src/components/ui/BuilderHeaderBar.jsx`

Displays the top navigation bar with:
- Go Back button
- Editable resume title
- Save status indicator (Saving... / Saved / Error)
- Unsaved changes warning

**Usage in Builder.jsx:**
```jsx
import BuilderHeaderBar from '../../components/ui/BuilderHeaderBar';

<BuilderHeaderBar
    resumeTitle={resumeData?.title}
    onTitleChange={(newTitle) => updateResumeData({ title: newTitle })}
    saveStatus={saveStatus}
    onGoBack={() => navigate('/dashboard')}
    unsavedChanges={hasUnsavedChanges}
/>
```

---

### 2. **BuilderStatsPanel.jsx**
Location: `src/components/ui/BuilderStatsPanel.jsx`

Displays real-time statistics in the sidebar footer:
- ATS Score (0-100) with visual indicator
- Resume Completion Percentage
- Word Count with recommendations
- Last Saved timestamp

**Usage in Builder.jsx:**
```jsx
import BuilderStatsPanel from '../../components/ui/BuilderStatsPanel';

<BuilderStatsPanel
    atsScore={aiAnalysis?.atsScore || 0}
    completion={completionPercentage}
    wordCount={calculateWordCount(resumeData)}
    lastSaved={resumeData?.updatedAt}
/>
```

---

### 3. **Updated BuilderSidebar.jsx**
Location: `src/components/ui/BuilderSidebar.jsx`

Enhanced sidebar with:
- Modern gradient background
- Icon-based step visualization
- Better visual feedback
- Integrated stats panel
- Completion percentage with color-coded progress

**Key Changes:**
- Added icons for each step (User, Briefcase, FileText, etc.)
- Improved active/completed state styling
- Better progress bar with gradient colors
- Step completion indicators

---

## Updated Hook: useAutoSave

Location: `src/hooks/useAutoSave.js`

**Enhanced functionality:**
- Auto-save every 2 seconds
- Real-time save status (idle, saving, saved, error)
- Optional API integration
- Force save capability
- Save count tracking

**Usage:**
```jsx
import useAutoSave from '../../hooks/useAutoSave';

const { saveStatus, lastSaved, forceSave, saveCount } = useAutoSave({
    data: resumeData,
    onSave: async (data) => {
        // Custom save logic
        updateResume(data);
    },
    delay: 2000, // Save every 2 seconds
    enabled: true,
    apiUrl: `/api/resumes/${resumeId}` // Optional API endpoint
});
```

---

## Layout Structure

### 3-Column Design
```
┌─────────────────────────────────────────────────────────┐
│             BuilderHeaderBar                             │
├──────────────┬──────────────────────────┬────────────────┤
│              │                          │                │
│  Sidebar     │   Main Form              │   Live Preview │
│              │   (Wizard Steps)         │   (RealTime    │
│ - Steps      │                          │    Sync)       │
│ - Progress   │   - Fields               │                │
│ - Stats      │   - Validation           │   - Template   │
│              │   - Navigation           │   - Stats      │
│              │                          │   - Zoom       │
├──────────────┼──────────────────────────┼────────────────┤
│ BuilderStats │   Form Content           │ Preview Panel  │
└──────────────┴──────────────────────────┴────────────────┘
```

### Responsive Behavior
- **Desktop (≥1200px)**: Full 3-column layout
- **Tablet (768px-1199px)**: Sidebar collapsible, 2-column main
- **Mobile (<768px)**: Stacked layout, sidebar drawer

---

## Implementation Steps

### Step 1: Update Builder.jsx

Replace the main layout structure with:

```jsx
import BuilderHeaderBar from '../../components/ui/BuilderHeaderBar';
import BuilderSidebar from '../../components/ui/BuilderSidebar';
import BuilderStatsPanel from '../../components/ui/BuilderStatsPanel';
import useAutoSave from '../../hooks/useAutoSave';

export const Builder = () => {
    const [resumeData, setResumeData] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [saveStatus, setSaveStatus] = useState('idle');
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    
    // Auto-save setup
    const { saveStatus: autoSaveStatus, lastSaved, forceSave } = useAutoSave({
        data: resumeData,
        onSave: async (data) => {
            setSaveStatus('saving');
            try {
                await updateResume(data);
                setSaveStatus('saved');
                setHasUnsavedChanges(false);
                setTimeout(() => setSaveStatus('idle'), 2000);
            } catch (error) {
                setSaveStatus('error');
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        },
        delay: 2000,
        enabled: !!resumeData
    });

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <BuilderHeaderBar
                resumeTitle={resumeData?.title}
                onTitleChange={(title) => updateResumeData({ title })}
                saveStatus={autoSaveStatus}
                unsavedChanges={hasUnsavedChanges}
            />

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="hidden lg:block w-64 border-r border-gray-200 overflow-y-auto">
                    <BuilderSidebar
                        currentStep={currentStep}
                        onStepClick={setCurrentStep}
                        completion={completionPercentage}
                        resumeData={resumeData}
                        steps={STEPS}
                    />
                    <BuilderStatsPanel
                        atsScore={aiAnalysis?.atsScore || 0}
                        completion={completionPercentage}
                        wordCount={calculateWordCount(resumeData)}
                        lastSaved={resumeData?.updatedAt}
                    />
                </div>

                {/* Form Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    {/* Render current step form */}
                    {resumeData && STEPS[currentStep] && (
                        <StepComponent
                            step={STEPS[currentStep]}
                            data={resumeData}
                            onChange={updateResumeData}
                        />
                    )}
                </div>

                {/* Preview Panel */}
                <div className="hidden xl:block w-80 border-l border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 overflow-y-auto">
                    <RealTimePreview
                        data={resumeData}
                        template={resumeData?.settings?.template}
                    />
                </div>
            </div>
        </div>
    );
};
```

### Step 2: Connect to Backend API

Update the `updateResume` function to use the new auto-save:

```jsx
const updateResume = async (data) => {
    const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            ...data,
            userId: user._id,
            status: 'draft',
            lastModified: new Date().toISOString()
        })
    });
    
    if (!response.ok) throw new Error('Failed to save');
    return response.json();
};
```

### Step 3: Calculate Word Count

Add helper function:

```jsx
const calculateWordCount = (resume) => {
    if (!resume) return 0;
    
    const text = JSON.stringify(resume)
        .toLowerCase()
        .replace(/[^a-z\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 0);
    
    return text.length;
};
```

### Step 4: Mobile Responsive Adjustments

Add media queries for responsive behavior:

```jsx
// Show/hide sidebar based on viewport
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

return (
    <div className="flex flex-col h-screen">
        {/* Mobile Menu Button */}
        <div className="lg:hidden p-4 border-b">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <Menu className="w-6 h-6" />
            </button>
        </div>

        {/* Mobile Sidebar Drawer */}
        {isMobileMenuOpen && (
            <div className="lg:hidden overflow-y-auto">
                <BuilderSidebar {...props} />
                <BuilderStatsPanel {...props} />
            </div>
        )}
    </div>
);
```

---

## Database Integration

### Resume Schema (MongoDB)
```javascript
{
    _id: ObjectId,
    userId: String,
    title: String,
    template: String,
    status: 'draft' | 'published',
    personalInfo: {
        name: String,
        surname: String,
        email: String,
        phone: String,
        city: String,
        country: String,
        postcode: String
    },
    targetRole: { title, industry, level },
    summary: String,
    experience: Array,
    education: Array,
    skills: { technical: [], soft: [], tools: [], languages: [] },
    aiData: { atsScore, suggestions, improvements },
    createdAt: Date,
    updatedAt: Date,
    lastModified: Date
}
```

### API Endpoints Required
```
PUT /api/resumes/:id - Update resume
GET /api/resumes/:id - Get single resume
GET /api/resumes - List user resumes
POST /api/resumes - Create new resume
DELETE /api/resumes/:id - Delete resume
```

---

## Features

### ✅ Auto-Save
- Saves every 2 seconds on data changes
- Visual save status indicator
- Success/error handling
- Network failure recovery

### ✅ Live Preview
- Real-time sync with form changes
- Template preview
- ATS score display
- Zoom controls (in RealTimePreview)

### ✅ Progress Tracking
- Completion percentage
- Per-step status
- Visual progress bar
- Section completion indicators

### ✅ User Experience
- Editable resume title
- Unsaved changes warning
- Keyboard shortcuts (use native browser)
- Mobile responsive design

### ✅ Data Persistence
- Save to MongoDB
- Load from DB on edit
- Draft/Published status
- Last modified tracking

---

## Styling Notes

### Colors
- **Sidebar**: Gradient blue (`from-[#0b2b4c] to-[#0f3a5c]`)
- **Accents**: Blue (`#3b82f6`), Purple (`#a855f7`)
- **Success**: Green (`#10b981`)
- **Warning**: Amber (`#f59e0b`)

### Typography
- **Headers**: Bold, 18-20px
- **Labels**: Medium, 14px
- **Body**: Regular, 14-16px
- **Captions**: Small, 12px

---

## Testing Checklist

- [ ] Sidebar displays all 6 steps
- [ ] Completion percentage updates
- [ ] Forms validate correctly
- [ ] Auto-save works every 2 seconds
- [ ] Save status shows Saving/Saved/Error
- [ ] Live preview updates in real-time
- [ ] Resume title is editable
- [ ] Mobile layout is responsive
- [ ] Can navigate between steps
- [ ] Resume loads from database
- [ ] Dashboard shows updated list
- [ ] No console errors

---

## Troubleshooting

### Auto-save not working
- Check token in localStorage
- Verify API endpoint is correct
- Check Network tab in DevTools

### Preview not syncing
- Ensure resumeData state updates
- Check RealTimePreview is connected
- Verify data structure matches

### Stats not updating
- Call `calculateCompletion()` on data change
- Verify resume schema matches
- Check word count calculation

---

## Next Steps

1. ✅ Create new components (Done)
2. ⏳ Integrate into Builder.jsx
3. ⏳ Connect API endpoints
4. ⏳ Test all features
5. ⏳ Deploy and monitor

For questions or issues, refer to the component files directly!
