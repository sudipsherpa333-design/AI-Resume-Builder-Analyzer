// src/components/dashboard/LiveIndicator.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Wifi, WifiOff, Users, Edit, Clock } from 'lucide-react';

const LiveIndicator = ({
    onlineUsers = 0,
    activeResumes = 0,
    unsavedChanges = 0,
    isConnected = false,
    lastUpdate = null
}) => {
    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-2"
        >
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Connection Status */}
                        <div className="flex items-center gap-2">
                            {isConnected ? (
                                <>
                                    <div className="relative">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                        <div className="absolute top-0 left-0 w-2 h-2 bg-green-500 rounded-full"></div>
                                    </div>
                                    <Radio className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-700">Live Connected</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="w-4 h-4 text-yellow-600" />
                                    <span className="text-sm font-medium text-yellow-700">Offline Mode</span>
                                </>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{onlineUsers} online</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Edit className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-gray-700">{activeResumes} active</span>
                            </div>
                            {unsavedChanges > 0 && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm text-gray-700">{unsavedChanges} unsaved</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Last Update */}
                    {lastUpdate && (
                        <div className="text-xs text-gray-500">
                            Updated {new Date(lastUpdate).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default LiveIndicator;