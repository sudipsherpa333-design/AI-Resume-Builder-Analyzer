// src/pages/TemplateSelect.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";

// --- Icons ---
import {
    FaArrowLeft, FaPalette, FaDownload, FaSearch, FaTimes,
    FaLaptopCode, FaBriefcase, FaGraduationCap, FaSpinner,
    FaEye, FaFileAlt
} from "react-icons/fa";

// --- Contexts and Hooks (Assumed to exist) ---
import { useAuth } from '../../context/AuthContext';

// =========================================================================
// MOCK TEMPLATE DATA & STRUCTURE (For demonstration)
// =========================================================================

// Base Resume Structure (matches the structure used in the Builder component)
const BASE_RESUME_STRUCTURE = {
    title: "Untitled Resume",
    templateId: "classic",
    data: {
        personalInfo: { firstName: "", lastName: "", email: "", phone: "", city: "", country: "", links: [] },
        summary: "",
        experience: [],
        education: [],
        skills: [],
        awards: [],
        languages: []
    }
};

// Function to generate data for a specific template
const generateTemplateData = (templateId) => {
    switch (templateId) {
        case "modern":
            return {
                ...BASE_RESUME_STRUCTURE,
                title: "Modern Professional Resume",
                templateId: "modern",
                data: {
                    ...BASE_RESUME_STRUCTURE.data,
                    personalInfo: {
                        firstName: "Alex", lastName: "Chen", email: "alex.chen@pro.com", phone: "+1 555-1234", city: "San Francisco", country: "USA",
                        links: [{ name: "LinkedIn", url: "linkedin.com/in/alexchen" }]
                    },
                    summary: "Highly motivated Software Engineer with 5+ years of experience in full-stack development. Proven ability to deliver scalable solutions and lead complex projects from concept to deployment. Seeking to leverage technical skills in a challenging environment.",
                    skills: [
                        { name: "React", rating: 5, description: "" },
                        { name: "Node.js", rating: 4, description: "" },
                        { name: "AWS/Cloud", rating: 4, description: "" },
                    ]
                }
            };
        case "minimalist":
            return {
                ...BASE_RESUME_STRUCTURE,
                title: "Minimalist Executive CV",
                templateId: "minimalist",
                data: {
                    ...BASE_RESUME_STRUCTURE.data,
                    personalInfo: {
                        firstName: "Sarah", lastName: "Jones", email: "sarah.jones@exec.com", phone: "+44 207 123 4567", city: "London", country: "UK",
                        links: [{ name: "Portfolio", url: "sarahjones.com/portfolio" }]
                    },
                    summary: "Senior Executive known for driving revenue growth and operational efficiency across global markets. Expertise in strategic leadership, financial planning, and large-scale team management.",
                    skills: [
                        { name: "Strategic Planning", rating: 5, description: "" },
                        { name: "Financial Analysis", rating: 5, description: "" },
                        { name: "Leadership", rating: 4, description: "" },
                    ]
                }
            };
        case "classic":
        default:
            return BASE_RESUME_STRUCTURE; // Returns the empty structure
    }
};

// Template display data
const TEMPLATES = [
    { id: "classic", name: "Classic Professional", icon: FaFileAlt, description: "Traditional, recruiter-friendly design." },
    { id: "modern", name: "Modern Tech", icon: FaLaptopCode, description: "Bold, two-column layout for tech roles." },
    { id: "minimalist", name: "Minimalist Executive", icon: FaBriefcase, description: "Clean, elegant design, maximizing readability." },
];

// =========================================================================
// COMPONENTS
// =========================================================================

/**
 * Renders a single template card for selection.
 */
const TemplateCard = ({ template, onSelect, onPreview }) => {
    const { id, name, icon: Icon, description } = template;

    return (
        <motion.div
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <div className={`p-6 flex flex-col items-center justify-center bg-gray-50 border-b-4 ${id === 'classic' ? 'border-blue-500' : id === 'modern' ? 'border-indigo-500' : 'border-emerald-500'}`}>
                <Icon className={`text-5xl ${id === 'classic' ? 'text-blue-600' : id === 'modern' ? 'text-indigo-600' : 'text-emerald-600'}`} />
                <h3 className="text-xl font-bold mt-3 text-gray-800">{name}</h3>
                <p className="text-sm text-gray-500 mt-1 text-center">{description}</p>
            </div>

            <div className="p-4 flex flex-col flex-grow justify-between">
                <div className="flex items-center justify-center mb-4">
                    {/* Placeholder for a minimal template preview image/SVG */}
                    <div className={`w-3/4 h-32 bg-gray-200 rounded-md flex items-center justify-center text-sm text-gray-600 font-medium ${id === 'modern' ? 'shadow-inner' : 'shadow'}`}>
                        {name} Preview
                    </div>
                </div>

                <div className="flex justify-around gap-3">
                    <button
                        onClick={() => onPreview(id)}
                        className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 font-medium"
                    >
                        <FaEye /> Preview
                    </button>
                    <button
                        onClick={() => onSelect(id)}
                        className={`flex-1 px-4 py-2 text-sm rounded-lg transition font-medium flex items-center justify-center gap-2 shadow-md 
                            ${id === 'classic' ? 'bg-blue-600 hover:bg-blue-700 text-white' : id === 'modern' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                    >
                        <FaPalette /> Select
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// =========================================================================
// MAIN PAGE COMPONENT
// =========================================================================

const TemplateSelect = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Assuming useAuth exists

    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredTemplates, setFilteredTemplates] = useState(TEMPLATES);

    useEffect(() => {
        if (searchTerm) {
            setFilteredTemplates(
                TEMPLATES.filter(t =>
                    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.description.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        } else {
            setFilteredTemplates(TEMPLATES);
        }
    }, [searchTerm]);

    /**
     * Handles template selection and navigates to the builder page.
     * @param {string} templateId - The ID of the selected template.
     */
    const handleTemplateSelect = (templateId) => {
        setIsLoading(true);
        toast.loading(`Preparing ${templateId} template...`, { id: 'select-toast' });

        try {
            // 1. Generate the initial resume data structure based on the template
            const templateData = generateTemplateData(templateId);

            // 2. Structure the data for the Builder
            const newResume = {
                id: Date.now().toString(), // Use a new ID
                title: templateData.title,
                templateId: templateId,
                userId: user?.id || 'guest',
                data: templateData.data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // 3. Navigate to the Builder page, passing the initial data
            navigate('/builder', { state: newResume });

            toast.success(`Template selected! Starting the builder.`, { id: 'select-toast' });

        } catch (error) {
            console.error("Template selection error:", error);
            toast.error("Failed to load template. Please try again.", { id: 'select-toast' });
            setIsLoading(false);
        }
    };

    /**
     * Simple PDF preview without jspdf-autotable
     */
    const handleTemplatePreview = (templateId) => {
        toast.loading(`Generating static preview for ${templateId}...`, { id: 'preview-toast' });

        try {
            const doc = new jsPDF();
            const data = generateTemplateData(templateId);

            // Set font and title
            doc.setFontSize(22);
            doc.text(`Resume Preview: ${data.title}`, 10, 20);

            doc.setFontSize(12);
            doc.text(`Template ID: ${templateId}`, 10, 30);
            doc.text(`Name: ${data.data.personalInfo.firstName} ${data.data.personalInfo.lastName}`, 10, 40);
            doc.text(`Email: ${data.data.personalInfo.email}`, 10, 50);
            doc.text(`Phone: ${data.data.personalInfo.phone}`, 10, 60);

            // Add a simple line separator
            doc.line(10, 65, 200, 65);

            // Add skills section manually (simple alternative to autotable)
            doc.text("Skills:", 10, 75);
            let yPos = 85;
            data.data.skills.forEach((skill, index) => {
                doc.text(`${index + 1}. ${skill.name} (Rating: ${skill.rating}/5)`, 15, yPos);
                yPos += 10;
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
            });

            // Add summary
            doc.text("Summary:", 10, yPos + 10);
            const summaryLines = doc.splitTextToSize(data.data.summary, 180);
            doc.text(summaryLines, 15, yPos + 20);

            // Open PDF in new window
            doc.output('dataurlnewwindow');

            toast.success(`Static PDF Preview opened.`, { id: 'preview-toast' });
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error("Failed to generate preview. Please try again.", { id: 'preview-toast' });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition rounded-xl flex items-center gap-2"
                        >
                            <FaArrowLeft className="text-lg" />
                            <span className="font-medium">Back to Dashboard</span>
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Choose Your Template
                                </span>
                            </h1>
                            <p className="text-slate-600 mt-2">
                                Select a professionally designed template to start building
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Search Bar */}
                <div className="relative mb-10 max-w-2xl mx-auto">
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search templates by name, style, or industry..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-10 py-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 p-1"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>

                {/* Template Grid */}
                {isLoading ? (
                    <div className="text-center py-20">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-6"
                        />
                        <p className="text-slate-600 font-medium text-lg">Loading templates...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Popular Templates</h2>
                            <p className="text-slate-600">
                                {filteredTemplates.length} templates found
                            </p>
                        </div>

                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            <AnimatePresence>
                                {filteredTemplates.map(template => (
                                    <TemplateCard
                                        key={template.id}
                                        template={template}
                                        onSelect={handleTemplateSelect}
                                        onPreview={handleTemplatePreview}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )}

                {filteredTemplates.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16 bg-white rounded-2xl shadow-lg mt-8"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
                            <FaTimes className="text-3xl text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">No Templates Found</h3>
                        <p className="text-slate-600 mb-6 max-w-md mx-auto">
                            Try a different search term or browse all available options below.
                        </p>
                        <button
                            onClick={() => setSearchTerm("")}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                        >
                            Show All Templates
                        </button>
                    </motion.div>
                )}

                {/* Help Text */}
                <div className="mt-12 pt-8 border-t border-slate-200">
                    <div className="text-center">
                        <p className="text-slate-600">
                            <span className="font-semibold">Tip:</span> You can fully customize colors, fonts, and layout in the builder after selecting a template.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer / CTA */}
            <div className="mt-12 py-8 bg-white/50 backdrop-blur-sm border-t border-slate-200">
                <div className="max-w-7xl mx-auto text-center px-4">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Need Help Choosing?</h3>
                    <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                        All templates are fully customizable. If you're unsure, choose "Classic Professional"
                        - it works well for most industries and roles.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleTemplateSelect('classic')}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg"
                        >
                            Start with Classic Template
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateSelect;