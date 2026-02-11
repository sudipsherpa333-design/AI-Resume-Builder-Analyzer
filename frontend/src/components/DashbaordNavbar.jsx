// src/components/DashboardNavbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome,
  FaTachometerAlt,
  FaTools,
  FaSearch,
  FaPalette,
  FaUserCircle,
  FaChevronDown,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const DashboardNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard', emoji: '📊' },
    { path: '/builder', icon: <FaTools />, label: 'Builder', emoji: '🛠️' },
    { path: '/analyzer', icon: <FaSearch />, label: 'Analyzer', emoji: '🔍' },
    { path: '/templates', icon: <FaPalette />, label: 'Templates', emoji: '🎨' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleHomeClick}
                className="flex items-center space-x-2 group"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center"
                >
                  <FaHome className="text-white text-lg" />
                </motion.div>
                <div className="hidden md:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        ResumeCraft
                  </h1>
                  <p className="text-xs text-slate-500">Dashboard</p>
                </div>
              </button>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1 ml-6">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors group"
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span className="font-medium text-slate-700 group-hover:text-indigo-600">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Side: User Menu */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="font-medium text-slate-700">
                                                Hi, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}*
                      </p>
                      <p className="text-xs text-slate-500">{user?.email || 'User Account'}</p>
                    </div>
                  </div>
                  <FaChevronDown className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-slate-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {user?.name || 'User'}
                            </p>
                            <p className="text-sm text-slate-500 truncate max-w-[180px]">
                              {user?.email || 'user@example.com'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <Link
                          to="/dashboard"
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FaTachometerAlt className="text-indigo-500" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/builder"
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FaTools className="text-emerald-500" />
                          <span>Resume Builder</span>
                        </Link>
                        <div className="h-px bg-slate-100 my-2" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 w-full text-left"
                        >
                          <FaSignOutAlt />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 overflow-hidden"
              >
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-50 text-slate-700"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    ))}
                    <div className="h-px bg-slate-200 my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 w-full"
                    >
                      <FaSignOutAlt />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Click outside to close dropdowns */}
      {(isUserMenuOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </>
  );
};

export default DashboardNavbar;