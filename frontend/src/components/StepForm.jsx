import React, { useState } from "react";
import PersonalInfoPage from "./section/PersonalInfoPage";
import ExperiencePage from "./section/ExperiencePage";
import SkillsPage from "./section/SkillsPage";
import SummaryPage from "./section/SummaryPage";
import ProjectsPage from "./section/ProjectsPage";

const steps = [
  { title: "Personal Info", component: PersonalInfoPage },
  { title: "Experience", component: ExperiencePage },
  { title: "Skills", component: SkillsPage },
  { title: "Summary", component: SummaryPage },
  { title: "Projects & Education", component: ProjectsPage },
];

const StepForm = ({ resume, onResumeUpdate }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const StepComponent = steps[currentStep].component;

  const nextStep = () => setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
  const prevStep = () => setCurrentStep(Math.max(0, currentStep - 1));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{steps[currentStep].title}</h2>
      <StepComponent resume={resume} onResumeUpdate={onResumeUpdate} />

      <div className="flex justify-between mt-4">
        {currentStep > 0 && (
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={prevStep}
          >
            Previous
          </button>
        )}
        {currentStep < steps.length - 1 && (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={nextStep}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default StepForm;
