// src/components/dashboard/ResumeFilters.jsx
import React from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  SortAsc,
  SortDesc
} from 'lucide-react';

const ResumeFilters = ({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  resumeCount,
  totalResumes
}) => {
  const filters = [
    { value: 'all', label: 'All Resumes', count: totalResumes },
    { value: 'draft', label: 'Drafts' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
    { value: 'primary', label: 'Primary' },
    { value: 'needsImprovement', label: 'Needs Improvement' }
  ];

  const sortOptions = [
    { value: 'updatedAt', label: 'Last Updated' },
    { value: 'createdAt', label: 'Date Created' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'atsScore', label: 'ATS Score' },
    { value: 'completeness', label: 'Completeness' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search resumes by title or name..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => onFilterChange(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFilter === filter.value
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {filter.label}
                {filter.count !== undefined && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${selectedFilter === filter.value
                    ? 'bg-indigo-200 text-indigo-800'
                    : 'bg-gray-300 text-gray-700'
                  }`}>
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none pl-4 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                                Sort by: {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <button
              onClick={() => onSortChange(sortBy)}
              className="text-gray-400 hover:text-gray-600"
            >
              {sortOrder === 'desc' ? (
                <SortDesc className="w-5 h-5" />
              ) : (
                <SortAsc className="w-5 h-5" />
              )}
            </button>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>
                    Showing <span className="font-bold">{resumeCount}</span> of{' '}
          <span className="font-bold">{totalResumes}</span> resumes
        </span>
        {selectedFilter !== 'all' && (
          <button
            onClick={() => onFilterChange('all')}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
                        Clear filter
          </button>
        )}
      </div>
    </div>
  );
};

export default ResumeFilters;