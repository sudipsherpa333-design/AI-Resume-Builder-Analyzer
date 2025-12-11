import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const CompletionPage = ({ resumeData }) => {
    const personalInfo = resumeData?.personalInfo || {};

    return (
        <div className="p-6 text-center">
            <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaCheckCircle className="text-4xl text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Resume Complete!</h3>
                <p className="text-gray-600 mb-8">
                    Your resume has been created successfully. You can now preview, export, or continue editing.
                </p>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {Object.values(personalInfo).filter(Boolean).length}
                        </div>
                        <div className="text-sm text-gray-600">Info Fields</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{resumeData?.experience?.length || 0}</div>
                        <div className="text-sm text-gray-600">Experiences</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{resumeData?.skills?.length || 0}</div>
                        <div className="text-sm text-gray-600">Skills</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompletionPage;