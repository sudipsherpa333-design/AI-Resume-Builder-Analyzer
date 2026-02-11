// src/components/wizard/TargetRoleForm.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target,
    Search,
    Briefcase,
    Building,
    Award,
    Zap,
    Check,
    X,
    TrendingUp,
    Sparkles,
    Loader2,
    FileText,
    Copy,
    Download,
    Filter,
    MapPin,
    DollarSign,
    Clock,
    Users,
    Brain,
    ChevronRight,
    ChevronDown,
    Maximize2,
    Minimize2,
    RefreshCw,
    Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const TargetRoleForm = ({
    data = {},
    onUpdate = () => { },
    jobDescription = '',
    onJobDescriptionChange = () => { },
    onAIHelp = () => { },
    onNext = () => { },
    onBack = () => { }
}) => {
    const [formData, setFormData] = useState({
        title: data?.targetRole || '',
        industry: data?.industry || '',
        level: data?.level || '',
        location: data?.location || '',
        salaryExpectation: data?.salaryExpectation || '',
        keywords: data?.keywords || [],
        company: data?.company || '',
        jobType: data?.jobType || ''
    });

    const [jdInput, setJdInput] = useState(jobDescription || '');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [extractedInfo, setExtractedInfo] = useState(null);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [similarRoles, setSimilarRoles] = useState([]);
    const [marketInsights, setMarketInsights] = useState(null);
    const [savedKeywords, setSavedKeywords] = useState([]);

    // Career levels
    const careerLevels = [
        { value: 'intern', label: 'Intern', icon: '🎓', description: 'Student position' },
        { value: 'entry', label: 'Entry Level', icon: '🚀', description: '0-2 years experience' },
        { value: 'mid', label: 'Mid Level', icon: '⭐', description: '3-7 years experience' },
        { value: 'senior', label: 'Senior', icon: '🏆', description: '8+ years experience' },
        { value: 'lead', label: 'Lead', icon: '👨‍💼', description: 'Team leadership' },
        { value: 'manager', label: 'Manager', icon: '📊', description: 'People management' },
        { value: 'director', label: 'Director', icon: '🎯', description: 'Department head' },
        { value: 'executive', label: 'Executive', icon: '💼', description: 'C-level/VP' }
    ];

    // Job types
    const jobTypes = [
        { value: 'full-time', label: 'Full Time', icon: '📅' },
        { value: 'part-time', label: 'Part Time', icon: '⏰' },
        { value: 'contract', label: 'Contract', icon: '📝' },
        { value: 'remote', label: 'Remote', icon: '🏠' },
        { value: 'hybrid', label: 'Hybrid', icon: '🔄' },
        { value: 'freelance', label: 'Freelance', icon: '🎨' }
    ];

    // Popular industries
    const industries = [
        'Technology', 'Software', 'FinTech', 'Healthcare', 'E-commerce',
        'Marketing', 'Sales', 'Education', 'Consulting', 'Manufacturing',
        'Real Estate', 'Media', 'Entertainment', 'Non-Profit', 'Government'
    ];

    useEffect(() => {
        if (jobDescription !== jdInput) {
            setJdInput(jobDescription);
        }
    }, [jobDescription]);

    useEffect(() => {
        // Auto-analyze if JD is pasted and not empty
        if (jdInput.trim().length > 200 && !extractedInfo) {
            setTimeout(() => {
                handleAnalyzeJD();
            }, 1000);
        }
    }, [jdInput]);

    const handleAnalyzeJD = async () => {
        if (!jdInput.trim()) {
            toast.error('Please paste a job description first');
            return;
        }

        setIsAnalyzing(true);
        const toastId = toast.loading('🔍 AI analyzing job description...');

        try {
            // Simulate AI analysis with mock data
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock AI extraction results
            const mockExtracted = {
                title: extractJobTitle(jdInput),
                company: extractCompany(jdInput),
                location: 'San Francisco, CA',
                salary: '$120,000 - $150,000',
                requirements: extractKeywords(jdInput, 10),
                benefits: ['Health insurance', '401k matching', 'Remote work', 'Stock options'],
                responsibilities: extractResponsibilities(jdInput),
                skills: extractSkills(jdInput, 15),
                experience: '5+ years',
                education: "Bachelor's degree required"
            };

            // Generate AI suggestions
            const suggestions = generateAISuggestions(mockExtracted);
            const similar = generateSimilarRoles(mockExtracted.title);
            const insights = generateMarketInsights(mockExtracted.title);

            setExtractedInfo(mockExtracted);
            setAiSuggestions(suggestions);
            setSimilarRoles(similar);
            setMarketInsights(insights);
            setSavedKeywords(mockExtracted.skills);

            // Auto-fill form
            if (mockExtracted.title) {
                handleChange('title', mockExtracted.title);
            }
            if (mockExtracted.company) {
                handleChange('company', mockExtracted.company);
            }

            // Update keywords
            const allKeywords = [...mockExtracted.requirements, ...mockExtracted.skills];
            const uniqueKeywords = [...new Set(allKeywords)].slice(0, 20);
            setFormData(prev => ({ ...prev, keywords: uniqueKeywords }));
            onUpdate({ keywords: uniqueKeywords });

            toast.dismiss(toastId);
            toast.success('✨ AI analysis complete!', {
                icon: '🤖',
                duration: 3000
            });

        } catch (error) {
            console.error('Analysis error:', error);
            toast.dismiss(toastId);
            toast.error('Failed to analyze job description');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const extractJobTitle = (text) => {
        const lines = text.split('\n');
        const firstLine = lines[0].toLowerCase();

        if (firstLine.includes('software engineer')) return 'Senior Software Engineer';
        if (firstLine.includes('product manager')) return 'Product Manager';
        if (firstLine.includes('data scientist')) return 'Data Scientist';
        if (firstLine.includes('frontend')) return 'Frontend Developer';
        if (firstLine.includes('backend')) return 'Backend Engineer';
        if (firstLine.includes('full stack')) return 'Full Stack Developer';
        if (firstLine.includes('devops')) return 'DevOps Engineer';
        if (firstLine.includes('ux') || firstLine.includes('ui')) return 'UX/UI Designer';

        return 'Professional Role';
    };

    const extractCompany = (text) => {
        const companies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Tesla', 'Salesforce'];
        for (const company of companies) {
            if (text.toLowerCase().includes(company.toLowerCase())) {
                return company;
            }
        }
        return 'Technology Company';
    };

    const extractKeywords = (text, limit = 10) => {
        const commonKeywords = [
            'React', 'JavaScript', 'TypeScript', 'Python', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
            'Machine Learning', 'AI', 'Cloud', 'Agile', 'Scrum', 'CI/CD', 'Git', 'REST API',
            'Microservices', 'SQL', 'NoSQL', 'GraphQL', 'React Native', 'Next.js', 'Vue.js'
        ];
        return commonKeywords.slice(0, limit);
    };

    const extractSkills = (text, limit = 15) => {
        const allSkills = [
            ...extractKeywords(text, limit),
            'Leadership', 'Communication', 'Problem Solving', 'Team Collaboration',
            'Project Management', 'Analytical Thinking', 'Strategic Planning'
        ];
        return [...new Set(allSkills)].slice(0, limit);
    };

    const extractResponsibilities = (text) => {
        return [
            'Design and develop scalable software solutions',
            'Collaborate with cross-functional teams',
            'Mentor junior developers',
            'Implement best practices and coding standards',
            'Participate in code reviews',
            'Optimize application performance'
        ];
    };

    const generateAISuggestions = (extracted) => {
        return [
            {
                id: 1,
                type: 'role',
                title: 'Consider these variations',
                suggestions: [
                    `${extracted.title} II`,
                    `Principal ${extracted.title.split(' ').slice(1).join(' ')}`,
                    `${extracted.title} with focus on ${extracted.skills[0] || 'Technology'}`
                ],
                icon: '💡'
            },
            {
                id: 2,
                type: 'keywords',
                title: 'Top keywords to include',
                suggestions: extracted.skills.slice(0, 5),
                icon: '🔑'
            },
            {
                id: 3,
                type: 'optimization',
                title: 'ATS optimization tips',
                suggestions: [
                    'Include exact job title',
                    'Match 70%+ keywords',
                    'Use industry standard terms'
                ],
                icon: '📈'
            }
        ];
    };

    const generateSimilarRoles = (title) => {
        const base = title.toLowerCase();
        const variations = [
            title.replace('Senior', 'Lead'),
            title.replace('Engineer', 'Developer'),
            title.replace('Software', 'Product'),
            `${title} Manager`,
            `Technical ${title}`
        ];
        return [...new Set(variations)].slice(0, 4);
    };

    const generateMarketInsights = (title) => {
        return {
            avgSalary: '$125,000',
            demand: 'High',
            growth: '22% (2024)',
            topCompanies: ['Google', 'Microsoft', 'Amazon'],
            skillsTrend: ['AI/ML', 'Cloud', 'DevOps']
        };
    };

    const handleChange = (field, value) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);

        // Update parent data structure
        if (field === 'title') {
            onUpdate({ targetRole: value });
        } else {
            onUpdate({ [field]: value });
        }
    };

    const handleAddKeyword = (keyword) => {
        if (!formData.keywords.includes(keyword)) {
            const updatedKeywords = [...formData.keywords, keyword];
            setFormData(prev => ({ ...prev, keywords: updatedKeywords }));
            onUpdate({ keywords: updatedKeywords });
            toast.success(`✅ Added "${keyword}"`);
        }
    };

    const handleRemoveKeyword = (keyword) => {
        const updatedKeywords = formData.keywords.filter(k => k !== keyword);
        setFormData(prev => ({ ...prev, keywords: updatedKeywords }));
        onUpdate({ keywords: updatedKeywords });
    };

    const handleSaveKeyword = (keyword) => {
        if (!savedKeywords.includes(keyword)) {
            setSavedKeywords(prev => [...prev, keyword]);
            toast.success(`💾 Saved "${keyword}" for later`);
        }
    };

    const handleAutoFill = () => {
        if (extractedInfo) {
            handleChange('title', extractedInfo.title);
            handleChange('company', extractedInfo.company);
            handleChange('location', extractedInfo.location);
            toast.success('🎯 Auto-filled from AI analysis');
        }
    };

    const handleClearJD = () => {
        setJdInput('');
        onJobDescriptionChange('');
        setExtractedInfo(null);
        setAiSuggestions([]);
        toast.info('🗑️ Cleared job description');
    };

    const isFormValid = () => {
        return formData.title.trim().length >= 3 && formData.level;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Target className="w-6 h-6 text-blue-500" />
                        Target Role & Job Description Analysis
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Paste a job description for AI-powered analysis and role suggestions
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleClearJD}
                        className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    >
                        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - JD Input & AI Analysis */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Job Description Input */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-500" />
                                Paste Job Description
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigator.clipboard.writeText(jdInput)}
                                    disabled={!jdInput}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-50"
                                    title="Copy JD"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleAnalyzeJD}
                                    disabled={!jdInput.trim() || isAnalyzing}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 disabled:opacity-50 text-sm"
                                >
                                    {isAnalyzing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Brain className="w-4 h-4" />
                                    )}
                                    {isAnalyzing ? 'Analyzing...' : 'AI Analyze'}
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <textarea
                                value={jdInput}
                                onChange={(e) => {
                                    setJdInput(e.target.value);
                                    onJobDescriptionChange(e.target.value);
                                }}
                                placeholder={`Paste a job description here...
                
Example:
"Senior Software Engineer - Google
Location: Mountain View, CA
Requirements: 5+ years experience with React, Node.js, AWS
Responsibilities: Design and implement scalable solutions, mentor junior engineers"
                
The AI will analyze and extract key information automatically.`}
                                rows={isExpanded ? 12 : 6}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
                            />
                            <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                    {jdInput.length} chars
                                </span>
                                {jdInput.length > 100 && (
                                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 rounded">
                                        Ready for AI
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {jdInput.trim() ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span>Paste complete. Click "AI Analyze" above.</span>
                                    </div>
                                ) : (
                                    <span>Paste a job description to enable AI analysis</span>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    // Sample JD
                                    const sampleJD = `Senior Full Stack Developer - TechCorp

We are seeking a talented Senior Full Stack Developer to join our growing team. You will be responsible for designing, developing, and maintaining scalable web applications.

Responsibilities:
- Design and implement responsive web applications using React and Node.js
- Develop RESTful APIs and microservices
- Collaborate with product and design teams
- Optimize application performance and scalability
- Write clean, maintainable code with comprehensive tests

Requirements:
- 5+ years of experience in full-stack development
- Strong proficiency in JavaScript/TypeScript, React, Node.js
- Experience with AWS, Docker, and Kubernetes
- Knowledge of database design (SQL/NoSQL)
- Excellent problem-solving and communication skills

Benefits:
- Competitive salary ($120k-$150k)
- Health, dental, and vision insurance
- 401k matching
- Remote work flexibility
- Professional development budget`;
                                    setJdInput(sampleJD);
                                    onJobDescriptionChange(sampleJD);
                                }}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                                Try sample JD →
                            </button>
                        </div>
                    </div>

                    {/* AI Analysis Results */}
                    <AnimatePresence>
                        {extractedInfo && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Extracted Information */}
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-blue-600" />
                                            AI Analysis Results
                                        </h3>
                                        <button
                                            onClick={handleAutoFill}
                                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1"
                                        >
                                            <Copy className="w-3 h-3" />
                                            Auto-fill Form
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Job Title</div>
                                            <div className="font-bold text-gray-900 dark:text-white">{extractedInfo.title}</div>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                                            <div className="font-bold text-gray-900 dark:text-white">{extractedInfo.location}</div>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Salary Range</div>
                                            <div className="font-bold text-gray-900 dark:text-white">{extractedInfo.salary}</div>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Experience</div>
                                            <div className="font-bold text-gray-900 dark:text-white">{extractedInfo.experience}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Suggestions */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {aiSuggestions.map((suggestion) => (
                                        <div key={suggestion.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-xl">{suggestion.icon}</span>
                                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                                                    {suggestion.title}
                                                </h4>
                                            </div>
                                            <ul className="space-y-2">
                                                {suggestion.suggestions.map((item, idx) => (
                                                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                        <ChevronRight className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                                {/* Keywords Extracted */}
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            🔑 Keywords Extracted from JD
                                        </h3>
                                        <span className="text-sm text-gray-500">
                                            {extractedInfo.skills.length} keywords found
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {extractedInfo.skills.map((keyword, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleAddKeyword(keyword)}
                                                className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:shadow-sm transition-all flex items-center gap-2 group"
                                            >
                                                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                                    {keyword}
                                                </span>
                                                <Plus className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>

                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Click any keyword to add it to your resume skills. These are the most relevant terms found in the job description.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Market Insights */}
                    {marketInsights && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                                Market Insights for "{formData.title || extractedInfo?.title}"
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="w-4 h-4 text-green-500" />
                                        <div className="text-sm text-gray-500">Avg Salary</div>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                                        {marketInsights.avgSalary}
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="w-4 h-4 text-blue-500" />
                                        <div className="text-sm text-gray-500">Demand</div>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                                        {marketInsights.demand}
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4 text-amber-500" />
                                        <div className="text-sm text-gray-500">Growth</div>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                                        {marketInsights.growth}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Target Role Form */}
                <div className="space-y-6">
                    {/* Target Role Form */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            🎯 Your Target Role
                        </h3>

                        {/* Job Title */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Job Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="e.g., Senior Software Engineer"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                            />
                        </div>

                        {/* Similar Roles Suggestions */}
                        {similarRoles.length > 0 && (
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    🤔 Similar roles you might consider:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {similarRoles.map((role, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleChange('title', role)}
                                            className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Career Level */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Career Level *
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {careerLevels.slice(0, 4).map((level) => (
                                    <button
                                        key={level.value}
                                        onClick={() => handleChange('level', level.value)}
                                        className={`p-3 border rounded-lg text-center ${formData.level === level.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                                    >
                                        <div className="text-lg mb-1">{level.icon}</div>
                                        <div className="text-xs font-medium">{level.label}</div>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2">
                                <select
                                    value={formData.level}
                                    onChange={(e) => handleChange('level', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm"
                                >
                                    <option value="">Select level...</option>
                                    {careerLevels.map((level) => (
                                        <option key={level.value} value={level.value}>
                                            {level.label} - {level.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Job Type */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Job Type
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {jobTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => handleChange('jobType', type.value)}
                                        className={`px-3 py-1.5 border rounded-lg text-sm ${formData.jobType === type.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'}`}
                                    >
                                        {type.icon} {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Keywords */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Keywords ({formData.keywords.length})
                                </label>
                                <span className="text-xs text-gray-500">Click to remove</span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.keywords.map((keyword, index) => (
                                    <div
                                        key={index}
                                        className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2 group"
                                    >
                                        <span className="text-sm text-blue-700 dark:text-blue-400">{keyword}</span>
                                        <button
                                            onClick={() => handleRemoveKeyword(keyword)}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {formData.keywords.length === 0 && (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                    <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Add keywords from AI analysis or type below</p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add custom keyword..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                            handleAddKeyword(e.target.value.trim());
                                            e.target.value = '';
                                        }
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm"
                                />
                                <button
                                    onClick={() => {
                                        const input = document.querySelector('input[placeholder="Add custom keyword..."]');
                                        if (input.value.trim()) {
                                            handleAddKeyword(input.value.trim());
                                            input.value = '';
                                        }
                                    }}
                                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Saved Keywords */}
                        {savedKeywords.length > 0 && (
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        💾 Saved Keywords
                                    </label>
                                    <span className="text-xs text-gray-500">Click to add</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {savedKeywords.slice(0, 8).map((keyword, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleAddKeyword(keyword)}
                                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs"
                                        >
                                            {keyword}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Stats */}
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                                        {formData.keywords.length}
                                    </div>
                                    <div className="text-xs text-gray-500">Keywords</div>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                                        {formData.title ? '✓' : '—'}
                                    </div>
                                    <div className="text-xs text-gray-500">Title Set</div>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                                        {formData.level ? '✓' : '—'}
                                    </div>
                                    <div className="text-xs text-gray-500">Level Set</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                            🚀 Ready for Next Step
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                            Your target role information will be used to tailor your resume summary, skills, and experience sections.
                        </p>
                        <button
                            onClick={onNext}
                            disabled={!isFormValid()}
                            className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            Continue to Summary
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        {!isFormValid() && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                * Please set a job title and career level
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
                <button
                    onClick={onBack}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                >
                    Back
                </button>

                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    {extractedInfo && <Sparkles className="w-4 h-4 text-blue-500" />}
                    <span>
                        {extractedInfo ? 'AI analysis complete' : 'Paste a JD for AI analysis'}
                    </span>
                </div>

                <button
                    onClick={handleAnalyzeJD}
                    disabled={!jdInput.trim() || isAnalyzing}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Brain className="w-4 h-4" />
                            AI Analyze JD
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default TargetRoleForm;