import React, { useState } from "react";
import BuilderSidebar from "../ui/BuilderSidebar";
import StepForm from "../StepForm";
import RealTimePreview from "../preview/RealTimePreview";
import FloatingActionButtons from "../ui/FloatingActionButtons";
import AIPanel from "../ai/AIPanel";

const ResumeEditor = ({ initialResume, jobDescription }) => {
    const [resume, setResume] = useState(initialResume);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <BuilderSidebar currentStep={resume.currentStep || 0} resume={resume} />

            {/* Main Content */}
            <main className="flex-1 p-4 overflow-y-auto relative">
                <StepForm resume={resume} onResumeUpdate={setResume} />

                {/* Real-time preview */}
                <div className="mt-6">
                    <RealTimePreview resume={resume} />
                </div>

                {/* Floating actions */}
                <FloatingActionButtons resume={resume} />
            </main>

            {/* AI Panel */}
            <aside className="w-96 border-l bg-white">
                <AIPanel resume={resume} jobDescription={jobDescription} onResumeUpdate={setResume} />
            </aside>
        </div>
    );
};

export default ResumeEditor;
