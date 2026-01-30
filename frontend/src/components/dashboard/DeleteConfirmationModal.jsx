// If DeleteConfirmationModal doesn't exist, add this simple version:
// src/components/modals/DeleteConfirmationModal.jsx
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, resume, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-red-100 rounded-xl">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Delete Resume
                        </h3>
                        <p className="text-gray-600">
                            Are you sure you want to delete "{resume?.title}"? This action cannot be undone.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Deleting...
                            </>
                        ) : (
                            'Delete Resume'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;