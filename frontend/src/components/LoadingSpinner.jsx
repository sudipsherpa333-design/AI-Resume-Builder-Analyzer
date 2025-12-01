import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({
    size = 'medium',
    text = 'Loading...',
    className = '',
    showText = true
}) => {
    // Size configurations
    const sizeConfig = {
        small: {
            spinner: 'w-6 h-6 border-3',
            text: 'text-sm'
        },
        medium: {
            spinner: 'w-12 h-12 border-4',
            text: 'text-base'
        },
        large: {
            spinner: 'w-16 h-16 border-4',
            text: 'text-lg'
        },
        xl: {
            spinner: 'w-20 h-20 border-4',
            text: 'text-xl'
        }
    };

    const { spinner: spinnerClass, text: textClass } = sizeConfig[size];

    // Container variants for animation
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.3 }
        }
    };

    return (
        <motion.div
            className={`flex flex-col items-center justify-center ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Spinner */}
            <motion.div
                className={`
          ${spinnerClass}
          border-indigo-200 
          border-t-indigo-600 
          rounded-full 
          mb-3
        `}
                animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    rotate: {
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                    },
                    scale: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }
                }}
            />

            {/* Loading Text */}
            {showText && (
                <motion.p
                    className={`
            ${textClass}
            text-gray-600 
            font-medium
            text-center
          `}
                    animate={{
                        opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {text}
                </motion.p>
            )}
        </motion.div>
    );
};

// Additional specialized loading components
export const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner
            size="large"
            text="Preparing your experience..."
        />
    </div>
);

export const InlineLoader = ({ text = 'Loading...' }) => (
    <div className="flex items-center justify-center py-4">
        <LoadingSpinner
            size="small"
            text={text}
            className="flex-row gap-3"
        />
    </div>
);

export const ButtonLoader = () => (
    <div className="flex items-center justify-center">
        <motion.div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
    </div>
);

export const CardLoader = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-4">
            <LoadingSpinner size="small" showText={false} />
            <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
    </div>
);

export default LoadingSpinner;