import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
  Maximize2
} from 'lucide-react';

/* ---------------- UTILS ---------------- */

function calculateCompleteness(data) {
  if (!data || typeof data !== 'object') {
    return 0;
  }

  const required = [
    'personalInfo',
    'summary',
    'experience',
    'education',
    'skills'
  ];

  let filled = 0;

  for (const key of required) {
    const section = data[key];
    if (!section) {
      continue;
    }

    if (Array.isArray(section) && section.length > 0) {
      filled++;
    } else if (typeof section === 'object' && Object.keys(section).length > 0) {
      filled++;
    }
  }

  return Math.round((filled / required.length) * 100);
}

/* ---------------- COMPONENT ---------------- */

export default function StatsDashboard(props) {
  /* ✅ ABSOLUTE GUARD */
  const resume = props?.resume ?? {};
  const resumeData = resume?.data ?? {};

  /* ✅ NEVER DIRECT ACCESS */
  const completeness = useMemo(() => {
    if (typeof resume.completeness === 'number') {
      return resume.completeness;
    }
    return calculateCompleteness(resumeData);
  }, [resume.completeness, resumeData]);

  const missingSections = useMemo(() => {
    const required = [
      'personalInfo',
      'summary',
      'experience',
      'education',
      'skills'
    ];

    return required.filter(key => {
      const section = resumeData[key];
      if (!section) {
        return true;
      }
      if (Array.isArray(section)) {
        return section.length === 0;
      }
      return Object.keys(section).length === 0;
    });
  }, [resumeData]);

  /* ---------------- UI ---------------- */

  return (
    <aside className="w-72 border-l bg-white p-4 hidden xl:flex flex-col gap-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FileText size={18} /> Resume Stats
      </h3>

      {/* Completeness */}
      <div className="bg-gray-100 rounded-lg p-3">
        <div className="flex justify-between text-sm mb-1">
          <span>Completeness</span>
          <span className="font-semibold">{completeness}%</span>
        </div>

        <div className="h-2 bg-gray-300 rounded">
          <motion.div
            className={`h-2 rounded ${completeness >= 80
              ? 'bg-green-500'
              : completeness >= 50
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${completeness}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 text-sm">
        {completeness >= 80 ? (
          <>
            <CheckCircle className="text-green-500" size={16} />
            <span>ATS Ready</span>
          </>
        ) : (
          <>
            <AlertTriangle className="text-yellow-500" size={16} />
            <span>Needs Improvement</span>
          </>
        )}
      </div>

      {/* Missing */}
      {missingSections.length > 0 && (
        <div className="text-xs text-gray-600">
          <p className="font-medium mb-1">Missing sections:</p>
          <ul className="list-disc ml-4">
            {missingSections.map(sec => (
              <li key={sec}>{sec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex gap-2">
        <button
          onClick={props.onExport}
          className="flex-1 btn-success flex items-center justify-center gap-2"
        >
          <Download size={16} /> Export
        </button>

        <button
          onClick={props.onFullscreen}
          className="btn flex items-center justify-center"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </aside>
  );
}
