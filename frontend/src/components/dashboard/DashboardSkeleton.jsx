// src/components/dashboard/DashboardSkeleton.jsx
import React from 'react';

const DashboardSkeleton = () => {
  // Skeleton items for Recent Resumes Grid
  const resumeItems = Array.from({ length: 5 }, (_, i) => (
    <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2.5 bg-gray-200 rounded-lg animate-pulse">
            <div className="w-4 h-4"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <div className="h-5 bg-gray-200 rounded-full w-16 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded-full w-20 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded-full w-12 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50/30">
      {/* Sidebar Skeleton */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 hidden lg:block">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-2">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-6">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-10 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="pl-0 lg:pl-64 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-40 animate-pulse"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
                  </div>
                  <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse hidden md:block"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Indicator Skeleton */}
          <div className="mb-6 flex justify-end">
            <div className="w-40 h-6 bg-gray-200 rounded-full animate-pulse"></div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Create Button Skeleton */}
          <div className="mb-6 md:hidden">
            <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Resume Section Header Skeleton */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>

            {/* Search and Filters Skeleton */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="w-64 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Resumes Grid Skeleton */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="space-y-3">
                  {resumeItems}
                </div>

                {/* Empty State Skeleton */}
                <div className="text-center py-12 hidden">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-64 mx-auto mb-5 animate-pulse"></div>
                  <div className="w-48 h-10 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="space-y-6">
              {/* ATS Insights Panel Skeleton */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                  <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Score Display Skeleton */}
                <div className="mb-6">
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                        <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                    <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  {/* Score Bar Skeleton */}
                  <div className="h-2 bg-gray-100 rounded-full animate-pulse">
                    <div className="h-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-3/4"></div>
                  </div>

                  {/* Score Markers Skeleton */}
                  <div className="flex justify-between mt-2">
                    <div className="h-2 bg-gray-200 rounded w-6 animate-pulse"></div>
                    <div className="h-2 bg-gray-200 rounded w-6 animate-pulse"></div>
                    <div className="h-2 bg-gray-200 rounded w-6 animate-pulse"></div>
                    <div className="h-2 bg-gray-200 rounded w-6 animate-pulse"></div>
                  </div>
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3.5 h-3.5 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                    <div className="h-7 bg-gray-200 rounded w-8 mb-1 animate-pulse"></div>
                    <div className="h-2 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3.5 h-3.5 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                    <div className="h-7 bg-gray-200 rounded w-8 mb-1 animate-pulse"></div>
                    <div className="h-2 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                </div>

                {/* Analysis Coverage Skeleton */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-10 animate-pulse"></div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full animate-pulse">
                    <div className="h-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-3/4"></div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded w-36 mt-2 animate-pulse"></div>
                </div>

                {/* CTA Button Skeleton */}
                <div className="w-full h-12 bg-gray-200 rounded-lg mt-6 animate-pulse"></div>
              </div>

              {/* Export Options Skeleton */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-white rounded-lg border border-gray-200 animate-pulse"></div>
                  <div className="h-10 bg-white rounded-lg border border-gray-200 animate-pulse"></div>
                  <div className="h-10 bg-white rounded-lg border border-gray-200 animate-pulse"></div>
                  <div className="h-10 bg-white rounded-lg border border-gray-200 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Navbar Skeleton */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 lg:hidden">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Loading Overlay Animation */}
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div
                className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"
                style={{ animationDuration: '1.2s' }}
              ></div>
              <div className="absolute inset-4 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">RB</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Pulse Animation Styles */}
      <style>
        {`
                    @keyframes shimmer {
                        0% {
                            background-position: -1000px 0;
                        }
                        100% {
                            background-position: 1000px 0;
                        }
                    }
                    
                    .animate-pulse {
                        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    }
                    
                    @keyframes pulse {
                        0%, 100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.5;
                        }
                    }
                    
                    /* Gradient shimmer effect for main cards */
                    .shimmer {
                        background: linear-gradient(
                            90deg,
                            rgba(255, 255, 255, 0) 0%,
                            rgba(255, 255, 255, 0.3) 50%,
                            rgba(255, 255, 255, 0) 100%
                        );
                        background-size: 1000px 100%;
                        animation: shimmer 2s infinite;
                    }
                `}
      </style>
    </div>
  );
};

// Alternative minimal skeleton for faster initial load
export const DashboardSkeletonMinimal = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50/30">
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute inset-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">RB</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

// Skeleton for specific sections
export const StatsCardsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }, (_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);

export const RecentResumesSkeleton = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2.5 bg-gray-200 rounded-lg animate-pulse">
              <div className="w-4 h-4"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <div className="h-5 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded-full w-12 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ATSInsightsSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>
      <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="space-y-4">
      <div className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default DashboardSkeleton;