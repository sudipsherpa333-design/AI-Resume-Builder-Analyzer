// src/components/dashboard/RecentResumesGrid.jsx
import React, { useState } from 'react';
import {
  Edit,
  Eye,
  Copy,
  Download,
  Trash2,
  Star,
  Sparkles,
  MoreVertical,
  FileText,
  Briefcase,
  GraduationCap,
  Code,
  Globe,
  Award,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  User  // Added missing import
} from 'lucide-react';
import { motion } from 'framer-motion';

const RecentResumesGrid = ({
  resumes,
  onEdit,
  onPreview,
  onDuplicate,
  onExport,
  onDelete,
  onSetPrimary,
  onAIOptimize,
  isExporting,
  isDuplicating
}) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const getStatusIcon = (resume) => {
    if (resume.status === 'completed' || (resume.analysis?.completeness || 0) >= 90) {
      return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Completed' };
    } else if (resume.status === 'draft' || (resume.analysis?.completeness || 0) < 50) {
      return { icon: Edit, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Draft' };
    } else if (resume.status === 'archived') {
      return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Archived' };
    } else {
      return { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50', label: 'In Progress' };
    }
  };

  const getATSScoreColor = (score) => {
    if (score >= 90) {
      return 'bg-emerald-100 text-emerald-800';
    }
    if (score >= 70) {
      return 'bg-blue-100 text-blue-800';
    }
    if (score >= 50) {
      return 'bg-amber-100 text-amber-800';
    }
    return 'bg-rose-100 text-rose-800';
  };

  const getSectionIcon = (sectionId) => {
    switch (sectionId) {
    case 'personalInfo': return User;
    case 'experience': return Briefcase;
    case 'education': return GraduationCap;
    case 'skills': return Code;
    case 'projects': return FileText;
    case 'certifications': return Award;
    case 'languages': return Globe;
    case 'references': return Users;
    default: return FileText;
    }
  };

  const calculateMissingSections = (resume) => {
    const sections = ['personalInfo', 'experience', 'education', 'skills'];
    return sections.filter(section => {
      const data = resume[section];
      if (!data) {
        return true;
      }
      if (Array.isArray(data)) {
        return data.length === 0;
      }
      if (typeof data === 'object') {
        return Object.keys(data).length === 0;
      }
      return !data;
    }).length;
  };

  return (
    <div className="space-y-4">
      {resumes.map((resume, index) => {
        const status = getStatusIcon(resume);
        const atsScore = resume.analysis?.atsScore || resume.analysis?.score || 0;
        const missingSections = calculateMissingSections(resume);
        const lastUpdated = new Date(resume.updatedAt || resume.metadata?.updatedAt || resume.createdAt);
        const now = new Date();
        const hoursDiff = Math.floor((now - lastUpdated) / (1000 * 60 * 60));

        let timeAgo = '';
        if (hoursDiff < 1) {
          timeAgo = 'Just now';
        } else if (hoursDiff < 24) {
          timeAgo = `${hoursDiff}h ago`;
        } else {
          const daysDiff = Math.floor(hoursDiff / 24);
          timeAgo = `${daysDiff}d ago`;
        }

        return (
          <motion.div
            key={resume._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all duration-200">
              <div className="flex items-start justify-between">
                {/* Left Side - Resume Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => onSetPrimary(resume._id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Star className={`w-5 h-5 ${resume.isPrimary ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                    </button>
                    <h3 className="text-lg font-bold text-gray-900">
                      {resume.title}
                    </h3>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.bg} ${status.color}`}>
                      <status.icon className="w-3 h-3" />
                      {status.label}
                    </div>
                    {atsScore > 0 && (
                      <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${getATSScoreColor(atsScore)}`}>
                                                ATS: {atsScore}%
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Updated {timeAgo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Template: {resume.templateSettings?.templateName || 'Modern'}</span>
                    </div>
                    {missingSections > 0 && (
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>{missingSections} sections missing</span>
                      </div>
                    )}
                  </div>

                  {/* Sections Summary */}
                  <div className="flex flex-wrap gap-2">
                    {['personalInfo', 'experience', 'education', 'skills'].map(sectionId => {
                      const Icon = getSectionIcon(sectionId);
                      const hasData = resume[sectionId] &&
                                                (Array.isArray(resume[sectionId]) ? resume[sectionId].length > 0 :
                                                  typeof resume[sectionId] === 'object' ? Object.keys(resume[sectionId]).length > 0 :
                                                    !!resume[sectionId]);

                      return (
                        <div
                          key={sectionId}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${hasData
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="capitalize">
                            {sectionId.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          {!hasData && (
                            <span className="text-xs">(Empty)</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side - Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {/* AI Optimize Button */}
                  <button
                    onClick={() => onAIOptimize(resume)}
                    disabled={atsScore >= 90}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${atsScore >= 90
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:opacity-90'
                    } transition-opacity`}
                  >
                    <Sparkles className="w-4 h-4" />
                    {atsScore >= 90 ? 'Optimized' : 'AI Optimize'}
                  </button>

                  {/* Action Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === resume._id ? null : resume._id)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>

                    {activeMenu === resume._id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setActiveMenu(null)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-2">
                          <button
                            onClick={() => {
                              onEdit(resume);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                          >
                            <Edit className="w-4 h-4" />
                                                        Edit Resume
                          </button>
                          <button
                            onClick={() => {
                              onPreview(resume);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                          >
                            <Eye className="w-4 h-4" />
                                                        Preview
                          </button>
                          <button
                            onClick={() => {
                              onDuplicate(resume);
                              setActiveMenu(null);
                            }}
                            disabled={isDuplicating}
                            className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 disabled:opacity-50"
                          >
                            <Copy className="w-4 h-4" />
                            {isDuplicating ? 'Duplicating...' : 'Duplicate'}
                          </button>
                          <button
                            onClick={() => {
                              onExport(resume, 'pdf');
                              setActiveMenu(null);
                            }}
                            disabled={isExporting}
                            className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 disabled:opacity-50"
                          >
                            <Download className="w-4 h-4" />
                            {isExporting ? 'Exporting...' : 'Export PDF'}
                          </button>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            onClick={() => {
                              onDelete(resume);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-3 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-3"
                          >
                            <Trash2 className="w-4 h-4" />
                                                        Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default RecentResumesGrid;