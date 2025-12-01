import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const Home = () => {
    const { isAuthenticated, user, isLoading } = useAuth();

    const features = [
        {
            icon: "⚡",
            title: "AI-Powered Builder",
            description: "Craft stunning professional resumes instantly with smart AI suggestions and real-time formatting.",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: "📊",
            title: "Deep Resume Analysis",
            description: "Get detailed improvement insights, keyword optimization, and ATS compatibility scoring.",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: "🎯",
            title: "ATS Optimized",
            description: "Maximize your resume's success rate with built-in Applicant Tracking System compatibility.",
            color: "from-green-500 to-emerald-500"
        },
        {
            icon: "🎨",
            title: "Premium Templates",
            description: "Choose from dozens of modern, professional templates designed by career experts.",
            color: "from-orange-500 to-red-500"
        },
    ];

    const stats = [
        { number: "10K+", label: "Resumes Created", icon: "📄" },
        { number: "95%", label: "Success Rate", icon: "🚀" },
        { number: "4.8/5", label: "User Rating", icon: "⭐" },
        { number: "50+", label: "Templates", icon: "🎭" },
    ];

    const benefits = [
        {
            icon: "🚀",
            title: "3x Faster",
            description: "Create professional resumes in minutes instead of hours"
        },
        {
            icon: "💼",
            title: "More Interviews",
            description: "Get 40% more interview calls with optimized resumes"
        },
        {
            icon: "💰",
            title: "Higher Salary",
            description: "Negotiate better offers with compelling resume presentation"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg font-medium">Preparing your experience...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 overflow-hidden relative">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-500"></div>
            </div>

            {/* HERO SECTION */}
            <section className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-24 text-center">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight"
                    >
                        Land Your
                        <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                            Dream Job Faster
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="mt-8 text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
                    >
                        AI-powered resume builder that helps you create professional,
                        <span className="font-semibold text-gray-800"> ATS-optimized resumes </span>
                        in minutes, not hours.
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center"
                    >
                        {isAuthenticated ? (
                            <div className="flex flex-col sm:flex-row gap-6">
                                <Link
                                    to="/builder"
                                    className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <span className="relative">🚀 Start Building Resume</span>
                                </Link>
                                <Link
                                    to="/analyzer"
                                    className="group px-10 py-5 border-2 border-blue-600 text-blue-600 bg-white/80 backdrop-blur-sm rounded-2xl font-bold text-lg hover:bg-blue-600 hover:text-white transform hover:-translate-y-1 transition-all duration-300"
                                >
                                    <span className="relative">📊 Analyze Your Resume</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-6">
                                <Link
                                    to="/builder"
                                    className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <span className="relative">🚀 Start Building Resume</span>
                                </Link>
                                <Link
                                    to="/analyzer"
                                    className="group px-10 py-5 border-2 border-blue-600 text-blue-600 bg-white/80 backdrop-blur-sm rounded-2xl font-bold text-lg hover:bg-blue-600 hover:text-white transform hover:-translate-y-1 transition-all duration-300"
                                >
                                    <span className="relative">📊 Analyze Your Resume</span>
                                </Link>
                            </div>
                        )}
                    </motion.div>

                    {/* Enhanced Highlight Text */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-16"
                    >
                        <div className="inline-flex items-center px-6 py-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-default">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                                    <span className="text-white font-bold text-sm">✓</span>
                                </div>
                                <p className="text-xl font-bold text-gray-900">
                                    Get started in seconds • <span className="text-green-600">No credit card required</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* BENEFITS SECTION */}
            <section className="relative max-w-6xl mx-auto px-6 lg:px-8 mb-24 lg:mb-32">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                        Why Choose
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> ResumeCraft?</span>
                    </h2>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="group text-center bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transform hover:-translate-y-3 transition-all duration-500"
                        >
                            <div className="text-5xl mb-6 p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 w-fit mx-auto text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                {benefit.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {benefit.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {benefit.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* STATS SECTION */}
            <section className="relative max-w-6xl mx-auto px-6 lg:px-8 mb-24 lg:mb-32">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="group bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-white/50 transform hover:-translate-y-2 transition-all duration-300"
                        >
                            <div className="text-4xl mb-4 opacity-80 group-hover:scale-110 transition-transform duration-300">
                                {stat.icon}
                            </div>
                            <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                {stat.number}
                            </div>
                            <p className="text-gray-600 font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* FEATURES SECTION */}
            <section className="relative max-w-7xl mx-auto px-6 lg:px-8 mb-24 lg:mb-32">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                        Powerful Features for
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Career Success</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Everything you need to create a resume that stands out and gets you hired.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="group relative bg-white/80 backdrop-blur-lg border border-white/50 p-8 rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 overflow-hidden"
                        >
                            {/* Gradient Border Effect */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>

                            <div className={`text-5xl mb-6 p-3 rounded-2xl bg-gradient-to-br ${feature.color} w-fit text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>
        </div>
    );
};

export default Home;