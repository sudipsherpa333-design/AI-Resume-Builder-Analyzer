// src/components/builder/SummaryPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SmartInput } from '../ui/SmartInput';
import { Sparkles } from 'lucide-react';

const SummaryPage = ({ data, onUpdate, user }) => {
    const [formData, setFormData] = useState(data);

    useEffect(() => {
        setFormData(data);
    }, [data]);

    const handleChange = (value) => {
        const updated = { ...formData, content: value };
        setFormData(updated);
        onUpdate(updated);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Summary</h2>
                <p className="text-gray-600">Write a compelling summary of your professional background</p>
            </div>

            <SmartInput
                label="Summary"
                value={formData.content || ''}
                onChange={handleChange}
                type="textarea"
                placeholder="Experienced professional with expertise in..."
                rows={6}
                maxLength={500}
                aiEnhanceable
                onAIEnhance={async (current) => {
                    return `Results-driven professional with extensive experience in delivering innovative solutions. Proven track record of leading cross-functional teams and driving business growth through strategic planning and execution. Strong analytical skills combined with excellent communication abilities. ${current}`.substring(0, 500);
                }}
                helpText="Write 2-3 sentences that highlight your key strengths and career objectives"
            />
        </motion.div>
    );
};

export default SummaryPage;