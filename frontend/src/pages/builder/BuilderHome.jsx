// src/pages/builder/BuilderHome.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

// Icons
import {
  Plus,
  Upload,
  Layout,
  ChevronRight,
  FileText,
  Sparkles
} from 'lucide-react';

const BuilderHome = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeLoading, setActiveLoading] = useState(null);

  const creationOptions = [
    {
      id: 'scratch',
      title: 'Start from Scratch',
      description: 'Build a resume from the ground up',
      icon: <Plus className="w-8 h-8" />,
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500'
    },
    {
      id: 'upload',
      title: 'Upload & Edit',
      description: 'Upload existing resume to edit',
      icon: <Upload className="w-8 h-8" />,
      gradient: 'bg-gradient-to-br from-purple-500 to-pink-500'
    },
    {
      id: 'templates',
      title: 'Browse Templates',
      description: 'Choose from 12+ professional templates',
      icon: <Layout className="w-8 h-8" />,
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-600'
    }
  ];

  const handleOptionClick = async (optionId) => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to create a resume');
      navigate('/login');
      return;
    }

    setActiveLoading(optionId);
    setIsLoading(true);

    try {
      switch (optionId) {
        case 'scratch':
          // Direct to builder with default template
          navigate('/builder/new');
          break;
        case 'upload':
          // Navigate to upload page
          navigate('/builder/upload');
          break;
        case 'templates':
          // Navigate to templates page
          navigate('/builder/templates');
          break;
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Something went wrong');
    } finally {
      setActiveLoading(null);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Create Your
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {' '}Perfect Resume
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Build, upload, or choose from templates. Our AI-powered builder helps you create resumes that get noticed.
            </p>
          </motion.div>

          {/* Main Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {creationOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="relative group"
              >
                <div className="relative bg-white rounded-3xl border border-gray-100 p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                  {/* Icon */}
                  <div className={`w-20 h-20 rounded-2xl ${option.gradient} flex items-center justify-center mb-6`}>
                    <div className="text-white">
                      {option.icon}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {option.description}
                  </p>

                  {/* Get Started Button */}
                  <button
                    onClick={() => handleOptionClick(option.id)}
                    disabled={isLoading}
                    className="w-full py-3 px-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold transition-all duration-300"
                  >
                    {activeLoading === option.id ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Get Started
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderHome;