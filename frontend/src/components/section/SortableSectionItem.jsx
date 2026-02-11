// src/components/section/SortableSectionItem.jsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Lock } from 'lucide-react';

const SortableSectionItem = ({ id, section, Icon, onToggleVisibility }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all ${isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <GripVertical size={18} className="text-gray-400" />
        </div>

        {/* Status */}
        <div className="w-20">
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center justify-center gap-1 ${section.required
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'
          }`}
          >
            {section.required ? (
              <>
                <Lock size={10} />
                                Required
              </>
            ) : (
              'Optional'
            )}
          </div>
        </div>

        {/* Section Info */}
        <div className="flex-1 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${section.color}`}>
            <Icon size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {section.label}
            </h3>
            <p className="text-sm text-gray-500">
              {section.required ? 'Required section' : 'Optional section'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleVisibility(id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle visibility"
          >
            <Eye size={18} className="text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortableSectionItem;