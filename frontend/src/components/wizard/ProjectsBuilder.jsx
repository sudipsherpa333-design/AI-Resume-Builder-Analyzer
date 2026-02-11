// src/components/wizard/ProjectsBuilder.jsx - AI INTEGRATED
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Loader2,
  ExternalLink,
  GitBranch,
  Code,
  Calendar,
  Users,
  Target,
  BarChart,
  TrendingUp,
  Globe,
  Star,
  X,
  ListTodo
} from 'lucide-react';

// CORRECTED IMPORT - Import the specific functions you need
import {
  aiEnhance,
  generateBulletPoints as aiGenerateBulletPoints,
  analyzeATS,
  generateSummary,
  optimizeSkills
} from '../../services/aiService';

// Or import the default export if you prefer that style
// import aiService from '../../services/aiService';

const ProjectsBuilder = ({
  data = [],
  onChange,
  onAIEnhance,
  isAnalyzing,
  keywords = [],
  targetRole = '',
  jobDescription = '',
  skills = []
}) => {
  const [projects, setProjects] = useState(Array.isArray(data) ? data : []);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [projectMetrics, setProjectMetrics] = useState({
    totalProjects: 0,
    avgImpactScore: 0,
    keywordMatches: 0,
    techStackMatches: 0
  });

  // Calculate metrics
  useEffect(() => {
    if (projects.length > 0) {
      const total = projects.length;
      const avgScore = projects.reduce((sum, p) => sum + (p.impactScore || 0), 0) / total;
      const keywordMatches = projects.filter(p =>
        keywords.some(kw => p.description?.toLowerCase().includes(kw.toLowerCase()))
      ).length;
      const techMatches = projects.filter(p =>
        p.technologies?.some(tech =>
          skills.some(s => s.name?.toLowerCase() === tech.toLowerCase())
        )
      ).length;

      setProjectMetrics({
        totalProjects: total,
        avgImpactScore: Math.round(avgScore),
        keywordMatches,
        techStackMatches: techMatches
      });
    }
  }, [projects, keywords, skills]);

  const handleAddProject = () => {
    const newProject = {
      id: Date.now().toString(),
      name: '',
      description: '',
      role: '',
      technologies: [],
      duration: '',
      impact: '',
      link: '',
      github: '',
      isOpenSource: false,
      impactScore: 0,
      isRelevant: true,
      keywordsFound: []
    };

    const updated = [...projects, newProject];
    setProjects(updated);
    onChange(updated);
  };

  const handleRemoveProject = (id) => {
    const updated = projects.filter(project => project.id !== id);
    setProjects(updated);
    onChange(updated);
  };

  const handleUpdateProject = (id, field, value) => {
    const updated = projects.map(project =>
      project.id === id ? {
        ...project,
        [field]: value,
        ...(field === 'description' ? {
          impactScore: calculateImpactScore(value),
          keywordsFound: extractKeywords(value)
        } : {})
      } : project
    );
    setProjects(updated);
    onChange(updated);
  };

  const handleAddTechnology = (projectId, tech) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const technologies = [...(project.technologies || []), tech];
      handleUpdateProject(projectId, 'technologies', technologies);
    }
  };

  const handleRemoveTechnology = (projectId, techIndex) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const technologies = (project.technologies || []).filter((_, index) => index !== techIndex);
      handleUpdateProject(projectId, 'technologies', technologies);
    }
  };

  const calculateImpactScore = (description) => {
    if (!description) {
      return 0;
    }

    let score = 0;
    const desc = description.toLowerCase();

    // Check for metrics
    if (/\d+%/.test(desc)) {
      score += 20;
    }
    if (/\$\d+/.test(desc)) {
      score += 20;
    }
    if (/\d+\s*(users|clients|customers)/i.test(desc)) {
      score += 20;
    }
    if (/increased|decreased|improved|reduced/i.test(desc)) {
      score += 20;
    }
    if (/scalable|efficient|optimized/i.test(desc)) {
      score += 20;
    }

    return Math.min(score, 100);
  };

  const extractKeywords = (description) => {
    if (!description) {
      return [];
    }
    return keywords.filter(kw => description.toLowerCase().includes(kw.toLowerCase()));
  };

  // AI Enhancement Functions
  const handleAIOptimize = async () => {
    if (!targetRole) {
      toast.error('Please set a target role first');
      return;
    }

    setIsLoadingAI(true);
    try {
      toast.loading('AI is optimizing your projects...');

      // Create a mock resume data object for AI enhancement
      const mockResumeData = {
        projects: projects,
        targetRole: targetRole,
        skills: skills.map(s => s.name),
        experience: [],
        summary: ''
      };

      // Use the aiEnhance function from aiService
      const enhancedData = await aiEnhance(mockResumeData, 'projects', jobDescription);

      if (enhancedData?.projects) {
        const optimizedProjects = enhancedData.projects.map((project, index) => ({
          ...projects[index] || {},
          ...project,
          id: projects[index]?.id || Date.now().toString(),
          impactScore: calculateImpactScore(project.description || '')
        }));

        setProjects(optimizedProjects);
        onChange(optimizedProjects);

        toast.dismiss();
        toast.success('Projects optimized with AI!');

        // If there's an onAIEnhance callback, call it
        if (onAIEnhance) {
          onAIEnhance();
        }
      } else {
        toast.dismiss();
        toast.error('No AI enhancements were made');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('AI optimization failed');
      console.error('AI optimization error:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleAIEnhanceProject = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return;
    }

    setIsLoadingAI(true);
    try {
      toast.loading('AI is enhancing project description...');

      // Use the aiEnhance function for individual project
      const mockResumeData = {
        projects: [project],
        targetRole: targetRole,
        skills: skills.map(s => s.name)
      };

      const enhancedData = await aiEnhance(mockResumeData, 'projects', jobDescription);

      if (enhancedData?.projects?.[0]) {
        const enhancedProject = enhancedData.projects[0];
        const updated = projects.map(p =>
          p.id === projectId ? {
            ...p,
            description: enhancedProject.description || p.description,
            name: enhancedProject.name || p.name,
            impact: enhancedProject.impact || p.impact,
            impactScore: calculateImpactScore(enhancedProject.description || p.description),
            keywordsFound: extractKeywords(enhancedProject.description || p.description)
          } : p
        );

        setProjects(updated);
        onChange(updated);

        toast.dismiss();
        toast.success('Project enhanced with AI!');
      } else {
        toast.dismiss();
        toast.info('No AI enhancements available for this project');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('AI enhancement failed');
      console.error('AI enhancement error:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleAIGenerateBulletPoints = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project?.description) {
      toast.error('Please add a project description first');
      return;
    }

    setIsLoadingAI(true);
    try {
      toast.loading('AI is generating bullet points...');

      // Create an experience-like object for bullet point generation
      const experienceItem = {
        jobTitle: project.role || 'Project Contributor',
        company: project.name || 'Project',
        description: project.description
      };

      const bulletPoints = await aiGenerateBulletPoints(experienceItem, targetRole, keywords);

      if (bulletPoints.length > 0) {
        const updatedDesc = bulletPoints.map(bp => `• ${bp}`).join('\n');
        handleUpdateProject(projectId, 'description', updatedDesc);
        toast.dismiss();
        toast.success('Bullet points generated!');
      } else {
        toast.dismiss();
        toast.info('No bullet points generated');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate bullet points');
      console.error('Bullet points generation error:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleTechStackAnalysis = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return;
    }

    setIsLoadingAI(true);
    try {
      toast.loading('Analyzing tech stack relevance...');

      // Check which technologies match the target role
      const roleTechs = skills
        .filter(s => s.category === 'technical' || s.category === 'tools')
        .map(s => s.name);

      const matchingTechs = (project.technologies || []).filter(tech =>
        roleTechs.some(roleTech =>
          roleTech.toLowerCase().includes(tech.toLowerCase()) ||
                    tech.toLowerCase().includes(roleTech.toLowerCase())
        )
      );

      const relevanceScore = Math.round((matchingTechs.length / (project.technologies?.length || 1)) * 100);
      const isRelevant = relevanceScore > 30; // More than 30% match is considered relevant

      const updated = projects.map(p =>
        p.id === projectId ? {
          ...p,
          isRelevant: isRelevant,
          relevanceScore: relevanceScore,
          matchingTechnologies: matchingTechs
        } : p
      );

      setProjects(updated);
      onChange(updated);

      toast.dismiss();

      if (matchingTechs.length > 0) {
        toast.success(`Found ${matchingTechs.length} relevant technologies`);
      } else {
        toast.warning('No relevant technologies found for target role');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Analysis failed');
      console.error('Tech stack analysis error:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Generate sample project from AI
  const handleAIGenerateSampleProject = async () => {
    if (!targetRole) {
      toast.error('Please set a target role first');
      return;
    }

    setIsLoadingAI(true);
    try {
      toast.loading('AI is generating a sample project...');

      // Create a mock project using AI functions
      const mockExperience = {
        jobTitle: `${targetRole} Project`,
        company: 'Sample Project',
        description: `A ${targetRole.toLowerCase()} project demonstrating key skills and technologies.`
      };

      const bulletPoints = await aiGenerateBulletPoints(mockExperience, targetRole, keywords);

      // Generate relevant technologies based on target role
      const roleKeywords = [...keywords];
      if (targetRole.toLowerCase().includes('frontend')) {
        roleKeywords.push('React', 'JavaScript', 'HTML', 'CSS', 'TypeScript');
      } else if (targetRole.toLowerCase().includes('backend')) {
        roleKeywords.push('Node.js', 'Python', 'Java', 'API', 'Database');
      } else if (targetRole.toLowerCase().includes('fullstack')) {
        roleKeywords.push('React', 'Node.js', 'MongoDB', 'Express', 'REST API');
      }

      const sampleProject = {
        id: `ai_${Date.now()}`,
        name: `${targetRole} Demonstration Project`,
        description: bulletPoints.map(bp => `• ${bp}`).join('\n'),
        role: targetRole,
        technologies: roleKeywords.slice(0, 8), // Take first 8 as technologies
        duration: '3-6 months',
        impact: `Demonstrated proficiency in ${targetRole} resulting in improved project outcomes`,
        link: '',
        github: '',
        isOpenSource: true,
        impactScore: 85,
        isRelevant: true,
        keywordsFound: keywords.slice(0, 5),
        isAIGenerated: true
      };

      const updated = [...projects, sampleProject];
      setProjects(updated);
      onChange(updated);

      toast.dismiss();
      toast.success('AI generated a sample project!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate sample project');
      console.error('Sample project generation error:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Projects Portfolio</h3>
          <p className="text-gray-600">Showcase your hands-on experience with AI optimization</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAIGenerateSampleProject}
            disabled={isLoadingAI || !targetRole}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            {isLoadingAI ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
                        AI Generate Sample
          </button>
          <button
            onClick={handleAIOptimize}
            disabled={isLoadingAI || isAnalyzing || projects.length === 0}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            {(isLoadingAI || isAnalyzing) ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
                        AI Optimize All
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total Projects</p>
                <p className="text-2xl font-bold text-blue-900">{projectMetrics.totalProjects}</p>
              </div>
              <Layers className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Avg Impact Score</p>
                <p className="text-2xl font-bold text-green-900">{projectMetrics.avgImpactScore}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Keyword Matches</p>
                <p className="text-2xl font-bold text-purple-900">{projectMetrics.keywordMatches}</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700">Tech Matches</p>
                <p className="text-2xl font-bold text-amber-900">{projectMetrics.techStackMatches}</p>
              </div>
              <Code className="w-8 h-8 text-amber-600" />
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100">
                  <Layers className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Project #{index + 1} {project.isAIGenerated && <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">AI Generated</span>}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {project.isRelevant !== false && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                                Relevant
                      </span>
                    )}
                    {project.impactScore > 70 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                                High Impact
                      </span>
                    )}
                    {project.isOpenSource && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded flex items-center gap-1">
                        <Star className="w-3 h-3" />
                                                Open Source
                      </span>
                    )}
                    {project.relevanceScore > 70 && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                        {project.relevanceScore}% Match
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAIGenerateBulletPoints(project.id)}
                  disabled={isLoadingAI}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Generate bullet points"
                >
                  <ListTodo className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAIEnhanceProject(project.id)}
                  disabled={isLoadingAI}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="AI Enhance"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleTechStackAnalysis(project.id)}
                  disabled={isLoadingAI}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Analyze Tech Stack"
                >
                  <BarChart className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveProject(project.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Project Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Project Name *
                </label>
                <input
                  type="text"
                  value={project.name || ''}
                  onChange={(e) => handleUpdateProject(project.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., E-commerce Platform Redesign"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Your Role *
                </label>
                <input
                  type="text"
                  value={project.role || ''}
                  onChange={(e) => handleUpdateProject(project.id, 'role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., Full Stack Developer, Lead Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duration
                </label>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={project.duration || ''}
                    onChange={(e) => handleUpdateProject(project.id, 'duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="e.g., Jan 2023 - Present, 6 months"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Impact Score
                </label>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${project.impactScore || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {project.impactScore || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Project Description */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                                    Project Description *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {project.description?.length || 0}/1000 characters
                  </span>
                </div>
              </div>
              <textarea
                value={project.description || ''}
                onChange={(e) => handleUpdateProject(project.id, 'description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Describe the project, your contributions, and key achievements. Include metrics and outcomes for better impact scoring."
              />
              {project.keywordsFound && project.keywordsFound.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500">Keywords found:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.keywordsFound.map((kw, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Technologies */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Technologies Used
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {project.technologies?.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                    <Code className="w-3 h-3" />
                    {tech}
                    <button
                      onClick={() => handleRemoveTechnology(project.id, index)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(!project.technologies || project.technologies.length === 0) && (
                  <span className="text-sm text-gray-400 italic">No technologies added yet</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  id={`tech-input-${project.id}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a technology (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const tech = e.target.value.trim();
                      if (tech) {
                        handleAddTechnology(project.id, tech);
                        e.target.value = '';
                      }
                      e.preventDefault();
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById(`tech-input-${project.id}`);
                    const tech = input.value.trim();
                    if (tech) {
                      handleAddTechnology(project.id, tech);
                      input.value = '';
                      input.focus();
                    }
                  }}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                >
                                    Add
                </button>
              </div>
            </div>

            {/* Impact & Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Measurable Impact
                </label>
                <textarea
                  value={project.impact || ''}
                  onChange={(e) => handleUpdateProject(project.id, 'impact', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., Increased performance by 40%, reduced costs by $50k annually"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Project Link
                  </label>
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="url"
                      value={project.link || ''}
                      onChange={(e) => handleUpdateProject(project.id, 'link', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="https://project-demo.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        GitHub Repository
                  </label>
                  <div className="flex items-center">
                    <GitBranch className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="url"
                      value={project.github || ''}
                      onChange={(e) => handleUpdateProject(project.id, 'github', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="https://github.com/username/project"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={project.isOpenSource || false}
                      onChange={(e) => handleUpdateProject(project.id, 'isOpenSource', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Open Source Project</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={project.isRelevant !== false}
                      onChange={(e) => handleUpdateProject(project.id, 'isRelevant', e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Relevant to Target Role</span>
                  </label>
                </div>
                <button
                  onClick={() => {
                    const url = project.link || project.github;
                    if (url) {
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  disabled={!project.link && !project.github}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <ExternalLink className="w-4 h-4" />
                                    View Project
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-b from-gray-50 to-white"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
            <Layers className="w-10 h-10 text-blue-600" />
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">No projects added yet</h4>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Showcase your hands-on experience. Add projects that demonstrate your skills and achievements.
                        AI can help generate relevant project examples based on your target role.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleAddProject}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" />
                            Add Manual Project
            </button>
            <button
              onClick={handleAIGenerateSampleProject}
              disabled={isLoadingAI || !targetRole}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
                            AI Generate Sample
            </button>
          </div>
        </motion.div>
      )}

      {/* Add Project Button */}
      {projects.length > 0 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleAddProject}
            className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-lg hover:shadow-lg border-2 border-gray-300 hover:border-blue-400 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
                        Add Another Project
          </button>
        </div>
      )}

      {/* AI Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-blue-900 mb-2 text-lg">AI Optimization Tips</h5>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></div>
                <span>Use specific metrics (e.g., "increased performance by 40%") for higher impact scores</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></div>
                <span>Include technologies from your target job description</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></div>
                <span>Quantify your achievements with numbers and percentages</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></div>
                <span>Use action verbs like "Led", "Developed", "Optimized" at the beginning of bullet points</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></div>
                <span>Add live links and GitHub repositories for credibility (increases relevance by 30%)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsBuilder;