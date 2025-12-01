import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
            <motion.div
                className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="text-6xl mb-4">😕</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                <p className="text-gray-600 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                    >
                        Go Back
                    </button>
                    <Link
                        to={isAuthenticated ? "/dashboard" : "/login"}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-center"
                    >
                        Go to {isAuthenticated ? "Dashboard" : "Login"}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;