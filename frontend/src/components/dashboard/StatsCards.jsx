// src/components/dashboard/StatsCards.jsx
import React from 'react';
import { FileText, CheckCircle, TrendingUp, Users, Activity, Clock, Zap } from 'lucide-react';

const StatsCards = ({ stats, loading, socketConnected }) => {
    const cards = [
        {
            title: 'Total Resumes',
            value: stats.totalResumes,
            icon: FileText,
            color: 'bg-gradient-to-br from-blue-100 to-blue-50',
            textColor: 'text-blue-700',
            iconColor: 'text-blue-600',
            trend: '+2 this week'
        },
        {
            title: 'Completed',
            value: stats.completedResumes,
            icon: CheckCircle,
            color: 'bg-gradient-to-br from-green-100 to-green-50',
            textColor: 'text-green-700',
            iconColor: 'text-green-600',
            trend: `${Math.round((stats.completedResumes / Math.max(stats.totalResumes, 1)) * 100) || 0}% completion`
        },
        {
            title: 'In Progress',
            value: stats.inProgressResumes,
            icon: TrendingUp,
            color: 'bg-gradient-to-br from-amber-100 to-amber-50',
            textColor: 'text-amber-700',
            iconColor: 'text-amber-600',
            trend: 'Active now'
        },
        {
            title: 'ATS Score',
            value: `${stats.atsScore}%`,
            icon: Activity,
            color: 'bg-gradient-to-br from-purple-100 to-purple-50',
            textColor: 'text-purple-700',
            iconColor: 'text-purple-600',
            trend: 'Average score'
        },
        {
            title: 'Online Users',
            value: stats.onlineUsers,
            icon: Users,
            color: 'bg-gradient-to-br from-indigo-100 to-indigo-50',
            textColor: 'text-indigo-700',
            iconColor: 'text-indigo-600',
            trend: socketConnected ? 'Live' : 'Offline'
        },
        {
            title: 'Active',
            value: stats.activeSessions,
            icon: Zap,
            color: 'bg-gradient-to-br from-pink-100 to-pink-50',
            textColor: 'text-pink-700',
            iconColor: 'text-pink-600',
            trend: 'Sessions active'
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                const isOnlineCard = card.title === 'Online Users';

                return (
                    <div
                        key={index}
                        className="group bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-300"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className={`text-sm font-medium ${card.textColor}`}>
                                {card.title}
                            </span>
                            <div className={`p-2 rounded-lg ${card.color}`}>
                                <Icon className={`w-4 h-4 ${card.iconColor}`} />
                            </div>
                        </div>

                        <div className="flex items-end justify-between">
                            <div className={`text-2xl md:text-3xl font-bold ${card.textColor}`}>
                                {card.value}
                            </div>

                            {isOnlineCard && socketConnected && (
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-green-600">Live</span>
                                </div>
                            )}
                        </div>

                        <div className="text-xs text-gray-500 mt-2">
                            {card.trend}
                        </div>

                        {/* Subtle hover effect */}
                        <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-200 transition-colors duration-300 pointer-events-none"></div>
                    </div>
                );
            })}
        </div>
    );
};

export default StatsCards;