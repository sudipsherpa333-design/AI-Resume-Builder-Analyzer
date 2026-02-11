// frontend/src/admin/utils/formatters.js

// 1. formatBytes - Already exists ✓
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// 2. formatUptime - Already exists ✓
export const formatUptime = (seconds) => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}s`);
  }

  return parts.join(' ');
};

// 3. formatDate - Already exists ✓
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 4. formatDateTime - MISSING! Adding now
export const formatDateTime = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

// 5. getStatusColor - MISSING! Adding now
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
  case 'active':
  case 'success':
  case 'completed':
  case 'published':
    return 'bg-green-100 text-green-800 border-green-200';

  case 'inactive':
  case 'pending':
  case 'draft':
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';

  case 'suspended':
  case 'failed':
  case 'error':
  case 'archived':
    return 'bg-red-100 text-red-800 border-red-200';

  case 'processing':
  case 'analyzing':
    return 'bg-blue-100 text-blue-800 border-blue-200';

  default:
    return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// 6. formatNumber - Already exists ✓
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// 7. formatPercentage - Already exists ✓
export const formatPercentage = (value, decimals = 1) => {
  return value.toFixed(decimals) + '%';
};

// 8. truncateText - Already exists ✓
export const truncateText = (text, maxLength = 50) => {
  if (!text) {
    return '';
  }
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

// 9. formatCurrency - Already exists ✓
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// 10. formatTimeAgo - Already exists ✓
export const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + ' years ago';
  }

  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months ago';
  }

  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days ago';
  }

  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours ago';
  }

  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes ago';
  }

  return Math.floor(seconds) + ' seconds ago';
};

// 11. Additional useful formatters
export const formatPhoneNumber = (phone) => {
  if (!phone) {
    return '';
  }
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phone;
};

export const formatSocialLink = (url) => {
  if (!url) {
    return '';
  }
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '') + urlObj.pathname;
  } catch {
    return url;
  }
};

export const formatAtsScore = (score) => {
  if (score >= 90) {
    return { color: 'text-green-600', label: 'Excellent' };
  }
  if (score >= 80) {
    return { color: 'text-blue-600', label: 'Good' };
  }
  if (score >= 70) {
    return { color: 'text-yellow-600', label: 'Fair' };
  }
  if (score >= 60) {
    return { color: 'text-orange-600', label: 'Needs Work' };
  }
  return { color: 'text-red-600', label: 'Poor' };
};

export const formatDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();

  let totalMonths = years * 12 + months;
  if (totalMonths < 0) {
    totalMonths = 0;
  }

  const yearsPart = Math.floor(totalMonths / 12);
  const monthsPart = totalMonths % 12;

  const parts = [];
  if (yearsPart > 0) {
    parts.push(`${yearsPart} yr${yearsPart > 1 ? 's' : ''}`);
  }
  if (monthsPart > 0) {
    parts.push(`${monthsPart} mo${monthsPart > 1 ? 's' : ''}`);
  }

  return parts.join(' ') || 'Less than 1 month';
};

// Export everything
export default {
  formatBytes,
  formatUptime,
  formatDate,
  formatDateTime,
  getStatusColor,
  formatNumber,
  formatPercentage,
  truncateText,
  formatCurrency,
  formatTimeAgo,
  formatPhoneNumber,
  formatSocialLink,
  formatAtsScore,
  formatDuration
};