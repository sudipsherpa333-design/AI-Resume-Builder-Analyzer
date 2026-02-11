// src/components/builder/UploadResume.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Upload, FileText, Loader2, X } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';

const UploadResume = () => {
  const navigate = useNavigate();
  const { createNewResume } = useResume();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  }, []);

  const handleFile = async (selectedFile) => {
    // Check file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setFile(selectedFile);
    await processFile(selectedFile);
  };

  const processFile = async (selectedFile) => {
    setIsLoading(true);
    try {
      // Read file content
      const text = await readFileContent(selectedFile);

      // Parse resume content (simplified example)
      const parsedResume = parseResumeContent(text);

      // Create new resume from parsed content
      const newResume = await createNewResume(parsedResume);

      if (newResume) {
        toast.success('Resume uploaded and parsed successfully!');
        navigate(`/builder/${newResume._id}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to process resume file');
    } finally {
      setIsLoading(false);
      setFile(null);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);

      if (file.type === 'application/pdf') {
        // For PDF files, we'd need a PDF parser
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const parseResumeContent = (text) => {
    // Basic parsing logic - you can enhance this
    const lines = text.split('\n');
    const personalInfo = {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: ''
    };

    // Simple parsing logic
    lines.forEach(line => {
      if (line.toLowerCase().includes('@')) {
        personalInfo.email = line.trim();
      }
      if (line.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)) {
        personalInfo.phone = line.trim();
      }
      // Add more parsing logic as needed
    });

    return {
      title: 'Uploaded Resume',
      personalInfo,
      summary: lines.slice(0, 5).join(' '), // First 5 lines as summary
      experience: [],
      education: [],
      skills: [],
      // ... other sections
    };
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Upload Resume
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
                    Upload your existing resume to get started quickly
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isDragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <div className="py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
                            Processing your resume...
            </p>
          </div>
        ) : file ? (
          <div className="py-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {file.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={removeFile}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Drag & Drop your resume
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Supported formats: PDF, DOCX, TXT
              </p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 cursor-pointer inline-flex items-center gap-2 transition-all">
                  <Upload className="w-4 h-4" />
                                    Browse Files
                </div>
              </label>

              <p className="text-sm text-gray-500">
                                Maximum file size: 5MB
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    How it works:
        </h4>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Upload your existing resume (PDF, DOCX, or TXT)</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Our AI will extract and organize your information</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Edit and enhance your resume with our tools</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Export in multiple formats when you're done</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UploadResume;