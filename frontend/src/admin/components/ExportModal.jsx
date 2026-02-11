// frontend/src/admin/components/ExportModal.jsx
import React, { useState } from 'react';
import { FiX, FiDownload, FiFile, FiCheck } from 'react-icons/fi';

const ExportModal = ({ isOpen, onClose, onExport }) => {
  const [format, setFormat] = useState('csv');
  const [includeFields, setIncludeFields] = useState([
    'name', 'email', 'role', 'status', 'createdAt'
  ]);

  const availableFields = [
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    { id: 'role', label: 'Role' },
    { id: 'status', label: 'Status' },
    { id: 'createdAt', label: 'Created Date' },
    { id: 'lastLogin', label: 'Last Login' },
    { id: 'phone', label: 'Phone' },
    { id: 'company', label: 'Company' },
    { id: 'location', label: 'Location' },
    { id: 'isVerified', label: 'Verified Status' },
    { id: 'resumeCount', label: 'Resume Count' },
    { id: 'loginCount', label: 'Login Count' }
  ];

  const toggleField = (fieldId) => {
    if (includeFields.includes(fieldId)) {
      setIncludeFields(includeFields.filter(f => f !== fieldId));
    } else {
      setIncludeFields([...includeFields, fieldId]);
    }
  };

  const selectAll = () => {
    setIncludeFields(availableFields.map(f => f.id));
  };

  const deselectAll = () => {
    setIncludeFields([]);
  };

  const handleExport = () => {
    if (includeFields.length === 0) {
      alert('Please select at least one field to export');
      return;
    }
    onExport(format, includeFields);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Export Users</h3>
            <p className="text-sm text-gray-500">Choose export format and fields</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Export Format</h4>
            <div className="grid grid-cols-3 gap-2">
              {['csv', 'excel', 'json'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`px-4 py-3 rounded-lg border flex items-center justify-center gap-2 ${format === fmt
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {format === fmt && <FiCheck className="w-4 h-4" />}
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Fields Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Include Fields</h4>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                                    Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={deselectAll}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                                    Deselect All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
              {availableFields.map((field) => (
                <button
                  key={field.id}
                  onClick={() => toggleField(field.id)}
                  className={`p-3 rounded-lg border flex items-center justify-between ${includeFields.includes(field.id)
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>{field.label}</span>
                  {includeFields.includes(field.id) && (
                    <FiCheck className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
                            Selected: {includeFields.length} of {availableFields.length} fields
            </p>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Include current filters</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Include column headers</span>
            </label>
            {format === 'csv' && (
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Use comma delimiter</span>
              </label>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
                        Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
                        Export Users
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;