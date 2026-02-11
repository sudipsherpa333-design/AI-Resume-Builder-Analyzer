// frontend/src/admin/utils/constants.js
export const ADMIN_ROUTES = {
  LOGIN: '/admin/login',
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/users',
  RESUMES: '/admin/resumes',
  TEMPLATES: '/admin/templates',
  ANALYTICS: '/admin/analytics',
  SETTINGS: '/admin/settings'
};

export const SIDEBAR_MENU = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/admin/resumes', label: 'Resumes', icon: '📄' },
  { path: '/admin/templates', label: 'Templates', icon: '🎨' },
  { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' }
];

export const USER_STATUS_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

export const RESUME_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'needs_work', label: 'Needs Work' }
];