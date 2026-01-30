// src/components/section/SectionItem.jsx
import React from 'react';

const SectionItem = ({ section, Icon }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${section.color}`}>
                    <Icon size={18} className="text-white" />
                </div>
                <div>
                    <h3 className="font-medium text-gray-900">
                        {section.label}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {section.required ? 'Required' : 'Optional'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SectionItem;