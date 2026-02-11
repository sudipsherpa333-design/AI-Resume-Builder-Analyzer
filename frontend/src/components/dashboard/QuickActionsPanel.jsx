// src/components/dashboard/QuickActionsPanelIcons.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Upload, Layout, BarChart3 } from 'lucide-react';

const QuickActionsPanelIcons = ({ darkMode = false }) => {
  const navigate = useNavigate();

  const actions = [
    { icon: Plus, label: 'Create', action: () => navigate('/builder/new') },
    {
      icon: Upload,
      label: 'Import',
      action: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.txt';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            toast.loading(`Importing ${file.name}...`);
            setTimeout(() => {
              toast.dismiss();
              toast.success(`Imported ${file.name}!`);
              navigate('/builder/import');
            }, 1500);
          }
        };
        input.click();
      }
    },
    { icon: Layout, label: 'Templates', action: () => navigate('/templates') },
    { icon: BarChart3, label: 'Analyze', action: () => navigate('/analyzer') }
  ];

  return (
    <div className={`flex items-center gap-1 p-1 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      {actions.map((action, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.action}
          title={action.label}
          className={`p-2.5 rounded-md transition-colors ${darkMode
            ? 'hover:bg-gray-700 text-gray-300'
            : 'hover:bg-white text-gray-600 hover:shadow-sm'
          }`}
        >
          <action.icon className="w-5 h-5" />
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActionsPanelIcons;