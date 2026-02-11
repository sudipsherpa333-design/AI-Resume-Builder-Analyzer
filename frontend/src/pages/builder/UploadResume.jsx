// src/pages/builder/UploadResume.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { useResume } from '../../context/ResumeContext';

// Icons
import {
  Upload, FileText, X, Check, AlertCircle,
  FileType, FileSearch, Clock, Shield
} from 'lucide-react';

const UploadResume = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createResume, loading: resumeLoading } = useResume();

  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOC, DOCX, or TXT file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadedFile(file);
    setExtractedData(null);
    setShowPreview(false);
  };

  const handleUpload = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    setIsProcessing(true);

    try {
      // Simulate file processing (in real app, this would be API call)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract sample data from file (simulated)
      const extractedInfo = simulateResumeExtraction(uploadedFile, user);
      setExtractedData(extractedInfo);

      toast.success('Resume processed successfully!');
      setShowPreview(true);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to process resume');
    } finally {
      setIsUploading(false);
    }
  };

  const simulateResumeExtraction = (file, user) => {
    // This simulates extracting data from a resume
    // In a real app, you would use an OCR/parsing service
    return {
      personalInfo: {
        name: user?.name || 'John Doe',
        email: user?.email || 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/johndoe',
        github: 'github.com/johndoe',
        website: 'johndoe.com'
      },
      summary: 'Experienced software engineer with 5+ years in full-stack development. Specialized in React, Node.js, and cloud technologies. Passionate about building scalable applications.',
      experience: [
        {
          id: '1',
          jobTitle: 'Senior Software Engineer',
          company: 'Tech Solutions Inc.',
          location: 'San Francisco, CA',
          startDate: '2020-01',
          endDate: '2023-12',
          current: false,
          description: 'Led development of cloud-native applications using React and Node.js. Improved application performance by 40%. Mentored 3 junior developers.'
        },
        {
          id: '2',
          jobTitle: 'Software Developer',
          company: 'Innovate Labs',
          location: 'New York, NY',
          startDate: '2018-06',
          endDate: '2019-12',
          current: false,
          description: 'Developed responsive web applications. Collaborated with design team to implement UI/UX improvements.'
        }
      ],
      education: [
        {
          id: '1',
          degree: 'Bachelor of Science in Computer Science',
          school: 'Stanford University',
          location: 'Stanford, CA',
          startDate: '2014-09',
          endDate: '2018-05',
          current: false,
          description: 'Graduated with honors. Coursework in Algorithms, Data Structures, and Machine Learning.'
        }
      ],
      skills: [
        'JavaScript', 'React', 'Node.js', 'TypeScript', 'Python',
        'AWS', 'Docker', 'Git', 'MongoDB', 'GraphQL', 'REST APIs'
      ],
      extractedSections: ['Experience', 'Education', 'Skills', 'Contact Info'],
      confidenceScore: 85
    };
  };

  const handleContinueToBuilder = async () => {
    if (!extractedData) return;

    setIsProcessing(true);

    try {
      // Create resume with extracted data
      const resumeData = {
        title: `Imported: ${uploadedFile?.name?.replace(/\.[^/.]+$/, "") || 'Resume'}`,
        template: 'modern',
        status: 'draft',
        imported: true,
        importSource: uploadedFile?.type,
        importDate: new Date().toISOString(),
        ...extractedData,
        settings: {
          template: 'modern',
          color: '#3b82f6',
          font: 'inter',
          fontSize: 'medium'
        }
      };

      const newResume = await createResume(resumeData);

      if (newResume?._id) {
        toast.success('Resume imported successfully!');
        navigate(`/builder/edit/${newResume._id}`);
      } else {
        throw new Error('Failed to create resume');
      }
    } catch (error) {
      console.error('Builder creation error:', error);
      toast.error('Failed to create resume from upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect({ target: { files: [files[0]] } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Upload Your Resume
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Upload your existing resume and we'll extract the information for you to edit and improve.
            </p>
          </motion.div>

          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 ${uploadedFile ? 'border-blue-500 bg-blue-50/30' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/10'}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
              />

              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-white" />
              </div>

              {uploadedFile ? (
                <div>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.type.split('/')[1].toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                      setExtractedData(null);
                    }}
                    className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 mx-auto"
                  >
                    <X className="w-4 h-4" />
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Drag & drop your resume here
                  </h3>
                  <p className="text-gray-600 mb-4">
                    or click to browse files
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, DOC, DOCX, TXT (Max 5MB)
                  </p>
                </div>
              )}
            </div>

            {/* Upload Button */}
            {uploadedFile && !isUploading && !extractedData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold text-lg transition-all"
                >
                  <Upload className="w-5 h-5" />
                  Process Resume
                </button>
              </motion.div>
            )}

            {/* Processing Indicator */}
            {isUploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-6 bg-blue-50 rounded-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <FileSearch className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Processing your resume...</h4>
                    <p className="text-gray-600 text-sm">Extracting information from your file</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full animate-pulse w-3/4"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Extracted Data Preview */}
          {extractedData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Resume Extracted Successfully!</h3>
                      <p className="text-gray-600">We found {extractedData.extractedSections.length} sections</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {extractedData.confidenceScore}% Confidence
                  </div>
                </div>

                {/* Preview Toggle */}
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-between mb-4 transition-colors"
                >
                  <span className="font-medium text-gray-900">
                    {showPreview ? 'Hide Preview' : 'Show Extracted Information'}
                  </span>
                  <ChevronRight className={`w-5 h-5 text-gray-600 transition-transform ${showPreview ? 'rotate-90' : ''}`} />
                </button>

                {/* Preview Content */}
                {showPreview && (
                  <div className="space-y-6 animate-slideDown">
                    {/* Personal Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileType className="w-5 h-5 text-blue-600" />
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(extractedData.personalInfo).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700 capitalize">{key}:</span>
                            <span className="text-sm text-gray-600">{value || 'Not provided'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-600" />
                        Skills ({extractedData.skills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {extractedData.skills.slice(0, 10).map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Experience */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-green-600" />
                        Experience ({extractedData.experience.length})
                      </h4>
                      <div className="space-y-3">
                        {extractedData.experience.slice(0, 2).map((exp, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-gray-900">{exp.jobTitle}</div>
                            <div className="text-sm text-gray-600">{exp.company} • {exp.location}</div>
                            <div className="text-sm text-gray-500 mt-1">{exp.startDate} - {exp.endDate}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Continue Button */}
                <button
                  onClick={handleContinueToBuilder}
                  disabled={isProcessing}
                  className="w-full mt-6 py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold text-lg transition-all"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Resume...
                    </>
                  ) : (
                    <>
                      Continue to Editor
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Supported Formats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white"
          >
            <h3 className="text-xl font-bold mb-4">Supported Formats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                <FileText className="w-6 h-6 text-red-400" />
                <div>
                  <div className="font-medium">PDF</div>
                  <div className="text-sm text-gray-300">Best for text</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                <FileText className="w-6 h-6 text-blue-400" />
                <div>
                  <div className="font-medium">DOC</div>
                  <div className="text-sm text-gray-300">Microsoft Word</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                <FileText className="w-6 h-6 text-green-400" />
                <div>
                  <div className="font-medium">DOCX</div>
                  <div className="text-sm text-gray-300">Word Document</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                <FileText className="w-6 h-6 text-gray-400" />
                <div>
                  <div className="font-medium">TXT</div>
                  <div className="text-sm text-gray-300">Plain Text</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UploadResume;