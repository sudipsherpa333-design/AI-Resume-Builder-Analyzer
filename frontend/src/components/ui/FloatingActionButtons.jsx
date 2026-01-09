// src/components/layout/FloatingActionButton.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

const FloatingActionButton = ({
    actions = [],
    position = 'bottom-right',
    showLabels = true,
    mainIcon = <Plus className="w-6 h-6" />,
    mainColor = 'bg-gradient-to-r from-purple-600 to-indigo-600'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const fabRef = useRef(null);

    // Close FAB when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && fabRef.current && !fabRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Get position classes
    const getPositionClasses = () => {
        switch (position) {
            case 'bottom-right':
                return 'bottom-8 right-8';
            case 'bottom-left':
                return 'bottom-8 left-8';
            case 'top-right':
                return 'top-8 right-8';
            case 'top-left':
                return 'top-8 left-8';
            default:
                return 'bottom-8 right-8';
        }
    };

    const handleMainButtonClick = () => {
        setIsOpen(!isOpen);
    };

    const handleActionClick = (action) => {
        action.onClick();
        setIsOpen(false);
    };

    const positionClasses = getPositionClasses();

    return (
        <div ref={fabRef} className={`fixed ${positionClasses} z-40`}>
            {/* Action Buttons */}
            <AnimatePresence>
                {isOpen && (
                    <div className="absolute bottom-full right-0 mb-4 flex flex-col items-end space-y-3">
                        {actions.map((action, index) => (
                            <motion.div
                                key={action.testId || index}
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center"
                            >
                                {/* Label */}
                                {showLabels && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="mr-3 bg-gray-800 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap"
                                    >
                                        {action.label}
                                        {action.shortcut && (
                                            <span className="ml-2 text-gray-400">
                                                {action.shortcut}
                                            </span>
                                        )}
                                    </motion.div>
                                )}

                                {/* Action Button */}
                                <button
                                    onClick={() => handleActionClick(action)}
                                    className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110`}
                                    aria-label={action.label}
                                    data-testid={action.testId}
                                >
                                    {action.icon}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Main FAB Button */}
            <motion.button
                onClick={handleMainButtonClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`${mainColor} w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300`}
                aria-label={isOpen ? "Close actions" : "Open actions"}
                data-testid="main-fab"
            >
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {isOpen ? (
                        <X className="w-6 h-6 text-white" />
                    ) : (
                        mainIcon
                    )}
                </motion.div>
            </motion.button>
        </div>
    );
};

export default FloatingActionButton;