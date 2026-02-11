import React from 'react';
import { Check, User, GraduationCap, Briefcase, Code, FileText, CheckCircle } from 'lucide-react';

const BuilderSidebar = ({
  steps = [],
  currentStep = 0,
  onStepClick = () => { },
  completion = 25,
  resumeData
}) => {
  const defaultSteps = [
    { id: 'personalInfo', label: 'Heading', icon: User },
    { id: 'targetRole', label: 'Target', icon: Briefcase },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'workExperience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code }
  ];

  const displaySteps = steps.length ? steps : defaultSteps;

  const isCompleted = (id) => {
    if (!resumeData) return false;

    switch (id) {
      case 'personalInfo':
        return resumeData.personalInfo?.name?.trim() &&
          resumeData.personalInfo?.email?.trim();
      case 'targetRole':
        return resumeData.targetRole?.title?.trim();
      case 'summary':
        return resumeData.summary?.trim();
      case 'workExperience':
        return resumeData.experience?.length > 0;
      case 'education':
        return resumeData.education?.length > 0;
      case 'skills':
        return (resumeData.skills?.technical?.length > 0) ||
          (resumeData.skills?.soft?.length > 0);
      default:
        return false;
    }
  };

  const getCompletionColor = () => {
    if (completion === 100) return 'from-green-400 to-emerald-600';
    if (completion >= 75) return 'from-blue-400 to-blue-600';
    if (completion >= 50) return 'from-amber-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className="w-64 h-full bg-gradient-to-b from-[#0b2b4c] to-[#0f3a5c] text-white flex flex-col shadow-xl">
      {/* Header */}
      <div className="px-6 py-8 border-b border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold">Resume Builder</h2>
        </div>
        <p className="text-xs text-white/60">Complete your professional resume</p>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {displaySteps.map((step, index) => {
          const active = index === currentStep;
          const done = isCompleted(step.id);
          const StepIcon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => onStepClick(index)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left group
                ${active
                  ? 'bg-blue-500/20 border border-blue-400/50'
                  : done
                    ? 'hover:bg-white/5'
                    : 'hover:bg-white/5'
                }`}
            >
              {/* Number/Icon Circle */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${done
                    ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg'
                    : active
                      ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg'
                      : 'bg-white/10 border border-white/20 group-hover:bg-white/20'
                  }`}
              >
                {done ? (
                  <Check size={16} className="text-white" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate
                  ${active ? 'text-white' : 'text-white/80 group-hover:text-white'}`}
                >
                  {step.label}
                </p>
                {done && (
                  <p className="text-xs text-green-300 flex items-center gap-1">
                    <CheckCircle size={12} /> Completed
                  </p>
                )}
              </div>

              {/* Completion Indicator */}
              {!done && !active && (
                <div className="text-white/40 group-hover:text-white/60 transition-colors">
                  <ChevronRight size={16} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer - Progress */}
      <div className="border-t border-white/10 px-6 py-6 space-y-3">
        {/* Completion Percentage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wide">Progress</p>
            <p className="text-sm font-bold text-white">{completion}%</p>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getCompletionColor()} transition-all duration-500 rounded-full shadow-lg`}
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {/* Status Message */}
        <p className="text-xs text-white/60 text-center">
          {completion === 100
            ? '✓ Resume Complete!'
            : completion >= 75
              ? 'Almost there!'
              : completion >= 50
                ? 'Halfway done!'
                : 'Get started'}
        </p>
      </div>
    </div>
  );
};

// Import ChevronRight if not already imported
import { ChevronRight } from 'lucide-react';

export default BuilderSidebar;
