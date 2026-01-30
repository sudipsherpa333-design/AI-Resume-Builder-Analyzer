// frontend/src/admin/components/BulkActionsModal.jsx
import React, { useState } from 'react';
import {
    FiX,
    FiCheckCircle,
    FiXCircle,
    FiTrash2,
    FiMail,
    FiKey,
    FiShield,
    FiUser,
    FiTag,
    FiAlertCircle
} from 'react-icons/fi';

const BulkActionsModal = ({ isOpen, onClose, selectedCount, onAction }) => {
    const [selectedAction, setSelectedAction] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const actions = [
        {
            id: 'activate',
            label: 'Activate Users',
            description: 'Set selected users to active status',
            icon: FiCheckCircle,
            color: 'text-green-600 bg-green-50',
            buttonColor: 'bg-green-600 hover:bg-green-700'
        },
        {
            id: 'deactivate',
            label: 'Deactivate Users',
            description: 'Set selected users to inactive status',
            icon: FiXCircle,
            color: 'text-yellow-600 bg-yellow-50',
            buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
        },
        {
            id: 'delete',
            label: 'Delete Users',
            description: 'Permanently delete selected users',
            icon: FiTrash2,
            color: 'text-red-600 bg-red-50',
            buttonColor: 'bg-red-600 hover:bg-red-700'
        },
        {
            id: 'send_email',
            label: 'Send Email',
            description: 'Send email to selected users',
            icon: FiMail,
            color: 'text-blue-600 bg-blue-50',
            buttonColor: 'bg-blue-600 hover:bg-blue-700'
        },
        {
            id: 'reset_password',
            label: 'Reset Passwords',
            description: 'Send password reset emails',
            icon: FiKey,
            color: 'text-purple-600 bg-purple-50',
            buttonColor: 'bg-purple-600 hover:bg-purple-700'
        },
        {
            id: 'change_role',
            label: 'Change Role',
            description: 'Update user roles',
            icon: FiUser,
            color: 'text-indigo-600 bg-indigo-50',
            buttonColor: 'bg-indigo-600 hover:bg-indigo-700'
        },
        {
            id: 'add_tag',
            label: 'Add Tags',
            description: 'Add tags to selected users',
            icon: FiTag,
            color: 'text-pink-600 bg-pink-50',
            buttonColor: 'bg-pink-600 hover:bg-pink-700'
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAction) return;

        setLoading(true);
        try {
            await onAction(selectedAction, customMessage);
            onClose();
        } catch (error) {
            console.error('Bulk action failed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Bulk Actions</h3>
                        <p className="text-sm text-gray-500">
                            {selectedCount} {selectedCount === 1 ? 'user' : 'users'} selected
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Action Selection */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3">Select Action</h4>
                        <div className="space-y-2">
                            {actions.map((action) => (
                                <label
                                    key={action.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedAction === action.id
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="action"
                                        value={action.id}
                                        checked={selectedAction === action.id}
                                        onChange={(e) => setSelectedAction(e.target.value)}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className={`p-2 rounded-lg ${action.color}`}>
                                            <action.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{action.label}</div>
                                            <div className="text-sm text-gray-500">{action.description}</div>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Custom Message (for email/send actions) */}
                    {['send_email', 'add_tag'].includes(selectedAction) && (
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">
                                {selectedAction === 'send_email' ? 'Email Message' : 'Tags'}
                            </h4>
                            {selectedAction === 'send_email' ? (
                                <textarea
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    placeholder="Enter your email message here..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                    rows={4}
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    placeholder="Enter tags separated by commas"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                            )}
                        </div>
                    )}

                    {/* Warning for delete action */}
                    {selectedAction === 'delete' && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h5 className="font-medium text-red-800">Warning: Irreversible Action</h5>
                                    <p className="text-sm text-red-700 mt-1">
                                        Deleting users will permanently remove all their data including resumes, activity logs, and preferences. This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="pt-4 border-t border-gray-200 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedAction || loading}
                            className={`flex-1 px-4 py-3 text-white rounded-lg flex items-center justify-center gap-2 ${selectedAction
                                ? actions.find(a => a.id === selectedAction)?.buttonColor || 'bg-indigo-600 hover:bg-indigo-700'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {selectedAction === 'delete' ? (
                                        <FiTrash2 className="w-4 h-4" />
                                    ) : selectedAction === 'activate' ? (
                                        <FiCheckCircle className="w-4 h-4" />
                                    ) : selectedAction === 'send_email' ? (
                                        <FiMail className="w-4 h-4" />
                                    ) : (
                                        <FiCheckCircle className="w-4 h-4" />
                                    )}
                                    {selectedAction
                                        ? `Apply ${actions.find(a => a.id === selectedAction)?.label.toLowerCase()}`
                                        : 'Select Action'
                                    }
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BulkActionsModal;