import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

// Components
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Icons
import {
  FaBolt,
  FaChartBar,
  FaCheckCircle,
  FaPalette,
  FaRocket,
  FaBriefcase,
  FaArrowRight,
  FaChevronDown,
  FaPlayCircle,
  FaShieldAlt,
  FaMobileAlt,
  FaDesktop,
  FaFileDownload,
  FaStar,
  FaGoogle
} from 'react-icons/fa';


const Home = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const controls = useAnimation();
  const [activeFeature, setActiveFeature] = useState(0);
  const [stats, setStats] = useState({
    resumes: 0,
    successRate: 0,
    rating: 0,
    templates: 0
  });
  const [backendHealth, setBackendHealth] = useState(null);

  // Animated counter effect
  useEffect(() => {
    const animateCounters = () => {
      const duration = 2000;
      const steps = 60;
      const increment = (target, key) => {
        let current = 0;
        const step = target / steps;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setStats(prev => ({
            ...prev,
            [key]: key === 'rating' ? parseFloat(current.toFixed(1)) : Math.floor(current)
          }));
        }, duration / steps);
      };

      increment(10250, 'resumes');
      increment(95, 'successRate');
      increment(4.8, 'rating');
      increment(58, 'templates');
    };

    if (!isLoading) {
      animateCounters();
    }
  }, [isLoading]);

  // Backend health check
  useEffect(() => {
    let mounted = true;
    const apiUrlRaw = import.meta.env.VITE_API_URL || '';
    const apiBase = apiUrlRaw.replace(/\/+$/, '').replace(/\/api$/i, '') || 'http://localhost:5001';

    const checkHealth = async () => {
      try {
        const res = await fetch(`${apiBase}/api/ai/health`, { method: 'GET', cache: 'no-store' });
        if (!mounted) {
          return;
        }
        if (!res.ok) {
          setBackendHealth({ ok: false, status: res.status });
          return;
        }
        const data = await res.json();
        setBackendHealth({ ok: true, details: data });
      } catch (err) {
        if (!mounted) {
          return;
        }
        setBackendHealth({ ok: false, error: err.message });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15_000);
    return () => {
      mounted = false; clearInterval(interval);
    };
  }, []);

  // Feature carousel auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Scroll animation trigger
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      controls.start({
        y: -scrollY * 0.1,
        transition: { type: 'spring', stiffness: 100 }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [controls]);

  const features = [
    {
      icon: <FaBolt className="text-3xl" />,
      title: 'AI-Powered Builder',
      description: 'Instantly craft professional resumes with AI advice and real-time formatting.',
      color: 'from-blue-500 to-cyan-500',
      highlights: ['Smart Suggestions', 'Real-time Formatting', 'Auto-correction']
    },
    {
      icon: <FaChartBar className="text-3xl" />,
      title: 'Deep Resume Analysis',
      description: 'Gain insights, keyword optimization and ATS compatibility scoring.',
      color: 'from-purple-500 to-pink-500',
      highlights: ['ATS Scoring', 'Keyword Analysis', 'Improvement Tips']
    },
    {
      icon: <FaCheckCircle className="text-3xl" />,
      title: 'ATS Optimized',
      description: 'Maximize your success rate with Applicant Tracking System optimization.',
      color: 'from-green-500 to-emerald-500',
      highlights: ['100% ATS Friendly', 'Formatting Guide', 'Industry Standards']
    },
    {
      icon: <FaPalette className="text-3xl" />,
      title: 'Modern Templates',
      description: 'Dozens of stylish templates designed by career experts for all roles.',
      color: 'from-orange-500 to-red-500',
      highlights: ['50+ Templates', 'Customizable', 'Mobile Friendly']
    }
  ];

  const benefits = [
    {
      icon: <FaRocket className="text-4xl" />,
      title: 'Create Faster',
      description: 'Build eye-catching professional resumes in just minutes.',
      metric: 'Save 5+ hours/week'
    },
    {
      icon: <FaBriefcase className="text-4xl" />,
      title: 'Get More Interviews',
      description: 'Boost your interview calls with optimized resumes.',
      metric: '+40% Response Rate'
    }
  ];

  const platformFeatures = [
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: 'Secure & Private',
      description: 'Your data is encrypted and stays with you.'
    },
    {
      icon: <FaFileDownload className="text-2xl" />,
      title: 'Instant Downloads',
      description: 'Download PDF, Word, or plain text instantly.'
    },
    {
      icon: <FaMobileAlt className="text-2xl" />,
      title: 'Mobile Friendly',
      description: 'Create and edit on any device, anywhere.'
    },
    {
      icon: <FaDesktop className="text-2xl" />,
      title: 'Auto-sync',
      description: 'Your progress stays in sync across devices.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="relative">
            <div className="h-20 w-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium mt-4">Loading ResumeCraft...</p>
        </motion.div>
      </div>
    );
  }

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Simple icon components for missing ones
  const FcIdea = () => (
    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
    </svg>
  );

  const FcStatistics = () => (
    <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
    </svg>
  );

  const FcCollaboration = () => (
    <svg className="w-12 h-12 text-green-500" fill="currentColor" viewBox="0 0 20 20">
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
    </svg>
  );

  const FcLike = () => (
    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden relative">
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        animate={controls}
      >
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1500"></div>
      </motion.div>

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-sm font-semibold mb-8"
            >
              <FcIdea />
              <span className="ml-2">Trusted by 10,000+ professionals</span>
              {backendHealth && (
                <span className={`ml-4 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${backendHealth.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {backendHealth.ok ? 'Backend: Healthy' : 'Backend: Unavailable'}
                </span>
              )}
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6"
            >
              Build a Resume That
              <span className="block mt-2">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Gets You Hired
                </span>
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 px-4"
            >
              AI-powered resume builder that helps you create professional,
              <span className="font-semibold text-gray-800"> ATS-optimized resumes </span>
              in minutes. Land interviews faster.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <button
                onClick={handleGetStarted}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  🚀 {isAuthenticated ? 'Go to Dashboard' : 'Start Building Free'}
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                onClick={scrollToFeatures}
                className="group px-8 py-4 border-2 border-blue-600 text-blue-600 bg-white/80 backdrop-blur-sm rounded-2xl font-bold text-lg hover:bg-blue-50 transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
              >
                <span className="relative flex items-center justify-center gap-2">
                  <FaPlayCircle />
                  See How It Works
                </span>
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center items-center gap-6 text-gray-600"
            >
              <div className="flex items-center gap-2">
                <FaStar className="text-yellow-500" />
                <span className="font-semibold">4.8/5 Rated</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <FaGoogle className="text-blue-500" />
                <span className="font-semibold">Google Sign-in</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <FaShieldAlt className="text-green-500" />
                <span className="font-semibold">Secure & Private</span>
              </div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              variants={itemVariants}
              className="mt-16"
            >
              <button
                onClick={scrollToFeatures}
                className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors"
              >
                <span className="text-sm mb-2">Explore Features</span>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <FaChevronDown />
                </motion.div>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {[
              { value: `${stats.resumes.toLocaleString()}+`, label: 'Resumes Created', icon: '📄' },
              { value: `${stats.successRate}%`, label: 'Success Rate', icon: '🚀' },
              { value: stats.rating.toFixed(1), label: 'User Rating', icon: '⭐' },
              { value: `${stats.templates}+`, label: 'Templates', icon: '🎨' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="group bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="text-3xl md:text-4xl mb-3 opacity-80 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <p className="text-gray-600 font-medium text-sm md:text-base">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need for
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Career Success
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              From AI-powered writing to ATS optimization, we've got you covered.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ delay: index * 0.1 }}
                  className={`group relative bg-white border border-gray-200 p-6 rounded-2xl shadow-lg hover:shadow-2xl transform transition-all duration-500 cursor-pointer ${activeFeature === index ? 'ring-2 ring-blue-500 scale-105' : 'hover:-translate-y-2'
                    }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm md:text-base">
                    {feature.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {feature.highlights.map((highlight, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature Preview */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 shadow-xl">
                <div className="text-center mb-6">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white mb-4">
                    {features[activeFeature].icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {features[activeFeature].title}
                  </h3>
                  <p className="text-gray-600">
                    {features[activeFeature].description}
                  </p>
                </div>
                <div className="relative h-64 bg-gradient-to-br from-white to-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <FcStatistics />
                      <p className="text-gray-500 font-medium mt-4">Live Preview</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-2 mt-6">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveFeature(index)}
                      className={`w-2 h-2 rounded-full transition-all ${activeFeature === index
                        ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500'
                        : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why ResumeCraft?
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Effortless. Effective. Elegant.
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group text-center bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transform hover:-translate-y-3 transition-all duration-500"
              >
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {benefit.description}
                </p>
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-semibold">
                  {benefit.metric}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {platformFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="flex flex-col items-center text-center p-6"
              >
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
              <FcCollaboration />
              <h2 className="text-3xl md:text-4xl font-bold mb-4 mt-6">
                Ready to Transform Your Career?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands who achieved their career goals with our AI-powered builder.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-2xl hover:bg-gray-100 hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  🎯 {isAuthenticated ? 'Continue Building' : 'Start Building Free'}
                </button>
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold text-lg rounded-2xl hover:bg-white/10 hover:scale-105 transform transition-all duration-300"
                  >
                    🔑 Already have an account?
                  </Link>
                )}
              </div>
              <p className="mt-8 text-blue-200 text-sm flex items-center justify-center">
                <FcLike />
                <span className="ml-2">
                  No credit card required • Free to start • Cancel any time
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;