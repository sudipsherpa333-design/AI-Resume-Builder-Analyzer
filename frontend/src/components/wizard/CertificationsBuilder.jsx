// src/components/wizard/CertificationsBuilder.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Award, Sparkles, Loader2 } from 'lucide-react';

const CertificationsBuilder = ({ data = [], onChange, onAIEnhance, isAnalyzing }) => {
  const [certifications, setCertifications] = useState(Array.isArray(data) ? data : []);

  const handleAddCertification = () => {
    const newCert = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      date: '',
      credentialId: ''
    };
    const updated = [...certifications, newCert];
    setCertifications(updated);
    onChange(updated);
  };

  const handleRemoveCertification = (id) => {
    const updated = certifications.filter(cert => cert.id !== id);
    setCertifications(updated);
    onChange(updated);
  };

  const handleUpdateCertification = (id, field, value) => {
    const updated = certifications.map(cert =>
      cert.id === id ? { ...cert, [field]: value } : cert
    );
    setCertifications(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Certifications</h3>
          <p className="text-gray-600">Add your professional certifications</p>
        </div>
        {onAIEnhance && (
          <button
            onClick={onAIEnhance}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
                        AI Enhance
          </button>
        )}
      </div>

      <div className="space-y-4">
        {certifications.map((cert, index) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 p-4 rounded-lg border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                                    Certification #{index + 1}
                </span>
              </div>
              <button
                onClick={() => handleRemoveCertification(cert.id)}
                className="p-1 hover:bg-red-50 rounded text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Certification Name
                </label>
                <input
                  type="text"
                  value={cert.name || ''}
                  onChange={(e) => handleUpdateCertification(cert.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., AWS Certified Solutions Architect"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Issuing Organization
                </label>
                <input
                  type="text"
                  value={cert.issuer || ''}
                  onChange={(e) => handleUpdateCertification(cert.id, 'issuer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Amazon Web Services"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date Issued
                </label>
                <input
                  type="month"
                  value={cert.date || ''}
                  onChange={(e) => handleUpdateCertification(cert.id, 'date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Credential ID
                </label>
                <input
                  type="text"
                  value={cert.credentialId || ''}
                  onChange={(e) => handleUpdateCertification(cert.id, 'credentialId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., AWS123456"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        onClick={handleAddCertification}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
                Add Certification
      </button>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-start gap-3">
          <Award className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Tips for Certifications</h4>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              <li>• Include relevant professional certifications only</li>
              <li>• Add credential IDs for verification</li>
              <li>• List certifications in reverse chronological order</li>
              <li>• Focus on certifications that match your target role</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationsBuilder;