// frontend/src/admin/components/ui/StatsCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({
    title,
    value,
    change,
    icon,
    color = 'blue',
    loading = false
}) => {
    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400',
        green: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-700 dark:text-green-400',
        purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-400',
        orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800 text-orange-700 dark:text-orange-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-5 transition-all duration-300 hover:shadow-lg ${colorClasses[color]}`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-lg ${colorClasses[color]} bg-opacity-50`}>
                    {icon}
                </div>
                <div className={`text-sm font-medium px-2.5 py-1 rounded-full ${colorClasses[color]} bg-opacity-50`}>
                    {change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`}
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-sm font-medium opacity-80">{title}</h3>
                {loading ? (
                    <div className="h-8 w-24 bg-current bg-opacity-20 rounded animate-pulse"></div>
                ) : (
                    <p className="text-2xl font-bold">{value}</p>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                <div className="text-xs opacity-70">
                    Updated just now
                </div>
            </div>
        </motion.div>
    );
};

export default StatsCard;