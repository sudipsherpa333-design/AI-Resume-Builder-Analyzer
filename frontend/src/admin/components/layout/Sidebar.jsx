// frontend/src/admin/components/layout/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiLayers,
  FiBarChart2,
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiLogOut,
  FiSettings,
  FiHelpCircle,
  FiMessageSquare,
  FiTrendingUp,
  FiDatabase,
  FiEdit3,
  FiCheckCircle
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose, isMobile, admin }) => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('Overview');
  const [hoveredItem, setHoveredItem] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});

  // Update active section when location changes
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) {
      setActiveSection('Overview');
    } else if (path.includes('/admin/users')) {
      setActiveSection('Content');
    } else if (path.includes('/admin/resumes')) {
      setActiveSection('Content');
    } else if (path.includes('/admin/templates')) {
      setActiveSection('Content');
    } else if (path.includes('/admin/analytics')) {
      setActiveSection('Analytics');
    } else if (path.includes('/admin/logs')) {
      setActiveSection('Analytics');
    } else {
      setActiveSection('Overview');
    }
  }, [location.pathname]);

  const navSections = [
    {
      title: 'Overview',
      icon: <FiHome className="w-4 h-4" />,
      items: [
        {
          path: '/admin/dashboard',
          label: 'Dashboard',
          icon: <FiHome />,
          description: 'System overview and analytics'
        }
      ]
    },
    {
      title: 'Content Management',
      icon: <FiDatabase className="w-4 h-4" />,
      items: [
        {
          path: '/admin/users',
          label: 'User Management',
          icon: <FiUsers />,
          description: 'Manage users and permissions',
          badge: admin?.stats?.newUsers || 0
        },
        {
          path: '/admin/resumes',
          label: 'Resumes',
          icon: <FiFileText />,
          description: 'View and manage resumes',
          badge: admin?.stats?.newResumes || 0
        },
        {
          path: '/admin/templates',
          label: 'Templates',
          icon: <FiLayers />,
          description: 'Manage resume templates'
        }
      ]
    },
    {
      title: 'Analytics & Insights',
      icon: <FiTrendingUp className="w-4 h-4" />,
      items: [
        {
          path: '/admin/analytics',
          label: 'Analytics Dashboard',
          icon: <FiBarChart2 />,
          description: 'Detailed analytics and reports'
        },
        {
          path: '/admin/logs',
          label: 'Activity Logs',
          icon: <FiActivity />,
          description: 'System and user activity logs'
        }
      ]
    },
    {
      title: 'Administration',
      icon: <FiSettings className="w-4 h-4" />,
      items: [
        {
          path: '/admin/settings',
          label: 'Settings',
          icon: <FiSettings />,
          description: 'System configuration'
        },
        {
          path: '/admin/help',
          label: 'Help & Support',
          icon: <FiHelpCircle />,
          description: 'Documentation and support'
        },
        {
          path: '/admin/feedback',
          label: 'User Feedback',
          icon: <FiMessageSquare />,
          description: 'View user feedback',
          badge: admin?.stats?.newFeedback || 0
        }
      ]
    }
  ];

  const toggleSection = (sectionTitle) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isOpen && !event.target.closest('.sidebar')) {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobile, isOpen, onClose]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar fixed lg:relative top-0 left-0 h-screen bg-gradient-to-b from-white to-gray-50 border-r border-gray-200/50 shadow-xl z-50 transition-all duration-500 ease-in-out ${isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'
        } flex flex-col overflow-hidden`}
        style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        {/* Sidebar Header with Animated Logo */}
        <div className="p-6 border-b border-gray-200/30 bg-white/50">
          <div className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
            {isOpen ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse-subtle">
                      <FiEdit3 className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-ping opacity-75"></div>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg tracking-tight">ResumeCraft</h2>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">Admin Panel</p>
                  </div>
                </div>
                {isMobile && (
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-all hover:scale-110"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                )}
              </>
            ) : (
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse-subtle">
                  <FiEdit3 className="w-6 h-6 text-white" />
                </div>
              </div>
            )}
          </div>

          {isOpen && (
            <div className="mt-4 flex items-center gap-2">
              <div className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-2">
                  <FiUser className="w-3 h-3 text-indigo-600" />
                  <span className="text-xs font-semibold text-indigo-700">
                    {admin?.role?.replace('_', ' ') || 'Super Admin'}
                  </span>
                </div>
              </div>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Navigation with Smooth Animations */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navSections.map((section, sectionIndex) => (
            <div
              key={section.title}
              className="space-y-2"
            >
              {/* Section Header */}
              {isOpen && (
                <div
                  className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-100/50 transition-all cursor-pointer group"
                  onClick={() => toggleSection(section.title)}
                >
                  <div className="flex items-center gap-2">
                    <div className="text-gray-500 group-hover:text-indigo-600 transition-colors">
                      {section.icon}
                    </div>
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {section.title}
                    </span>
                  </div>
                  <FiChevronRight
                    className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${collapsedSections[section.title] ? 'rotate-90' : ''}`}
                  />
                </div>
              )}

              {/* Section Items */}
              <ul className="space-y-1">
                {(!collapsedSections[section.title] || !isOpen) && section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const isHovered = hoveredItem === item.path;

                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={(e) => {
                          if (isMobile) {
                            onClose();
                          }
                          if (collapsedSections[section.title]) {
                            e.preventDefault();
                            toggleSection(section.title);
                          }
                        }}
                        onMouseEnter={() => setHoveredItem(item.path)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={({ isActive }) => `
                                                    relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300
                                                    ${isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200/50 scale-[1.02]'
                      : 'text-gray-700 hover:bg-white hover:shadow-md hover:scale-[1.01]'
                    }
                                                    transform-gpu
                                                `}
                      >
                        {/* Active indicator */}
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full transition-all duration-300 ${isActive
                          ? 'bg-white opacity-100'
                          : isHovered
                            ? 'bg-indigo-200 opacity-50'
                            : 'opacity-0'
                        }`} />

                        {/* Icon with animation */}
                        <div className={`relative ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-indigo-600'}`}>
                          <div className={`transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
                            {item.icon}
                          </div>
                          {isActive && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
                          )}
                        </div>

                        {/* Content */}
                        {isOpen && (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className={`text-xs px-2 py-0.5 rounded-full min-w-6 text-center ${isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-red-100 text-red-600'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className={`text-xs mt-0.5 truncate ${isActive ? 'text-white/80' : 'text-gray-500'
                              }`}>
                                {item.description}
                              </p>
                            )}
                          </div>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer with User Info */}
        <div className="p-4 border-t border-gray-200/30 bg-white/50 backdrop-blur-sm">
          {isOpen ? (
            <div className="space-y-3">
              {/* User Profile */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-white to-gray-50 border border-gray-200/50 shadow-sm hover:shadow transition-all group">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <span className="text-white font-bold text-lg">
                      {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {admin?.name?.split(' ')[0] || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {admin?.email || 'admin@resumecraft.com'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <FiCheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">Online</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                  <FiSettings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button className="px-3 py-2 text-sm bg-gradient-to-r from-red-50 to-red-100 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2">
                  <FiLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-lg">
                    {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        {/* Collapse Toggle (Desktop only) */}
        {!isMobile && (
          <button
            onClick={onClose}
            className="absolute -right-3 top-24 w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-10"
          >
            {isOpen ? <FiChevronLeft size={14} /> : <FiChevronRight size={14} />}
          </button>
        )}
      </aside>
    </>
  );
};

export default Sidebar;