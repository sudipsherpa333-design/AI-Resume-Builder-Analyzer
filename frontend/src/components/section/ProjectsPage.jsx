// src/components/builder/ProjectsPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban, Globe, Github, ExternalLink, Calendar,
  Users, Code, Palette, Database, Smartphone, Edit,
  Trash2, Plus, X, ChevronUp, ChevronDown, Star,
  Eye, EyeOff, MapPin, TrendingUp, Building,
  Target, Award, Link as LinkIcon, Layers, Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProjectsPage = ({ data = {}, onUpdate, onNext, onPrev, onAIEnhance, aiCredits }) => {
  const [projects, setProjects] = useState(data?.items || []);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (projects !== data?.items) {
      const timer = setTimeout(() => {
        if (onUpdate) {
          onUpdate({ items: projects });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [projects, onUpdate, data?.items]);

  const categories = [
    { id: 'web', name: 'Web Development', icon: Globe, color: 'bg-blue-100 text-blue-600' },
    { id: 'mobile', name: 'Mobile App', icon: Smartphone, color: 'bg-purple-100 text-purple-600' },
    { id: 'desktop', name: 'Desktop Software', icon: Code, color: 'bg-green-100 text-green-600' },
    { id: 'design', name: 'UI/UX Design', icon: Palette, color: 'bg-pink-100 text-pink-600' },
    { id: 'database', name: 'Database System', icon: Database, color: 'bg-amber-100 text-amber-600' },
    { id: 'ecommerce', name: 'E-commerce', icon: TrendingUp, color: 'bg-red-100 text-red-600' },
    { id: 'iot', name: 'IoT & Hardware', icon: Layers, color: 'bg-indigo-100 text-indigo-600' },
    { id: 'research', name: 'Research Project', icon: Target, color: 'bg-teal-100 text-teal-600' }
  ];

  const projectTypes = [
    'Academic Project',
    'Personal Project',
    'Freelance Work',
    'Client Project',
    'Open Source',
    'Hackathon',
    'Startup Project',
    'Research Paper'
  ];

  const nepaliIndustries = [
    'Finance/Banking',
    'Healthcare',
    'Education',
    'E-commerce',
    'Tourism',
    'Agriculture',
    'Government',
    'NGO/Non-profit',
    'Technology',
    'Real Estate',
    'Transportation',
    'Media/Entertainment'
  ];

  const emptyProject = {
    id: Date.now().toString(),
    title: '',
    category: 'web',
    type: 'Personal Project',
    description: '',
    technologies: [],
    startDate: '',
    endDate: '',
    isOngoing: false,
    client: '',
    industry: '',
    location: 'Nepal',
    teamSize: '',
    githubUrl: '',
    liveUrl: '',
    responsibilities: [],
    achievements: [],
    challenges: '',
    isVisible: true,
    isFeatured: false
  };

  const addProject = () => {
    const newProject = { ...emptyProject, id: Date.now().toString() };
    setProjects([newProject, ...projects]);
    setEditingId(newProject.id);
    setIsAdding(true);
  };

  const updateProject = (id, updates) => {
    setProjects(projects.map(project =>
      project.id === id ? { ...project, ...updates } : project
    ));
  };

  const deleteProject = (id) => {
    setProjects(projects.filter(project => project.id !== id));
    toast.success('Project deleted');
  };

  const moveProject = (id, direction) => {
    const index = projects.findIndex(project => project.id === id);
    if (
      (direction === 'up' && index > 0) ||
            (direction === 'down' && index < projects.length - 1)
    ) {
      const newProjects = [...projects];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newProjects[index], newProjects[newIndex]] =
                [newProjects[newIndex], newProjects[index]];
      setProjects(newProjects);
    }
  };

  const toggleVisibility = (id) => {
    updateProject(id, { isVisible: !projects.find(p => p.id === id).isVisible });
  };

  const toggleFeatured = (id) => {
    updateProject(id, { isFeatured: !projects.find(p => p.id === id).isFeatured });
  };

  const getProjectDuration = (startDate, endDate, isOngoing) => {
    if (!startDate) {
      return '';
    }

    if (isOngoing) {
      const startYear = startDate.split('-')[0];
      return `${startYear} - Present`;
    }

    if (endDate) {
      const startYear = startDate.split('-')[0];
      const endYear = endDate.split('-')[0];
      return `${startYear} - ${endYear}`;
    }

    return startDate.split('-')[0];
  };

  const renderProjectCard = (project, index) => {
    const isEditing = editingId === project.id;
    const category = categories.find(c => c.id === project.category);
    const duration = getProjectDuration(project.startDate, project.endDate, project.isOngoing);

    return (
      <motion.div
        key={project.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`bg-white rounded-xl border ${project.isFeatured ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'} overflow-hidden`}
      >
        {/* Header */}
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 ${category?.color.split(' ')[0]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  {category && React.createElement(category.icon, { className: 'w-5 h-5' })}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {project.title || 'Project Title'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${category?.color}`}>
                          {category?.name}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {project.type}
                        </span>
                        {project.isFeatured && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                                        Featured
                          </span>
                        )}
                      </div>
                    </div>
                    {duration && (
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        <Calendar className="inline w-3 h-3 mr-1" />
                        {duration}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {project.description && !isEditing && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && !isEditing && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.technologies.slice(0, 5).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                                                    +{project.technologies.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Links */}
                  {(project.githubUrl || project.liveUrl) && !isEditing && (
                    <div className="flex gap-3">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
                        >
                          <Github className="w-4 h-4" />
                                                    Code
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-green-600"
                        >
                          <ExternalLink className="w-4 h-4" />
                                                    Live Demo
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 ml-4">
              <button
                onClick={() => toggleVisibility(project.id)}
                className={`p-2 rounded-lg ${project.isVisible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                title={project.isVisible ? 'Visible on resume' : 'Hidden from resume'}
              >
                {project.isVisible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => toggleFeatured(project.id)}
                className={`p-2 rounded-lg ${project.isFeatured ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'}`}
                title={project.isFeatured ? 'Featured project' : 'Mark as featured'}
              >
                <Star className={`w-4 h-4 ${project.isFeatured ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => moveProject(project.id, 'up')}
                disabled={index === 0}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                title="Move up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveProject(project.id, 'down')}
                disabled={index === projects.length - 1}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                title="Move down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingId(isEditing ? null : project.id)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              </button>
              <button
                onClick={() => deleteProject(project.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6 border-t border-gray-200 bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Project Title *
                  </label>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => updateProject(project.id, { title: e.target.value })}
                    placeholder="e.g., E-commerce Platform, Mobile Banking App"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Project Type *
                  </label>
                  <select
                    value={project.type}
                    onChange={(e) => updateProject(project.id, { type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    {projectTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                  </label>
                  <select
                    value={project.category}
                    onChange={(e) => updateProject(project.id, { category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Client/Organization
                  </label>
                  <input
                    type="text"
                    value={project.client}
                    onChange={(e) => updateProject(project.id, { client: e.target.value })}
                    placeholder="e.g., ABC Company, University Project"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Industry
                  </label>
                  <select
                    value={project.industry}
                    onChange={(e) => updateProject(project.id, { industry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select industry</option>
                    {nepaliIndustries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location
                  </label>
                  <input
                    type="text"
                    value={project.location}
                    onChange={(e) => updateProject(project.id, { location: e.target.value })}
                    placeholder="e.g., Kathmandu, Nepal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description *
                  </label>
                  <textarea
                    value={project.description}
                    onChange={(e) => updateProject(project.id, { description: e.target.value })}
                    placeholder="Describe the project, its purpose, and key features..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Technologies Used *
                  </label>
                  <input
                    type="text"
                    value={project.technologies?.join(', ') || ''}
                    onChange={(e) => updateProject(project.id, {
                      technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    })}
                    placeholder="e.g., React, Node.js, MongoDB, AWS"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                                        Separate with commas
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Team Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={project.teamSize}
                    onChange={(e) => updateProject(project.id, { teamSize: e.target.value })}
                    placeholder="e.g., 5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date *
                  </label>
                  <input
                    type="month"
                    value={project.startDate}
                    onChange={(e) => updateProject(project.id, { startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date
                  </label>
                  <div className="space-y-2">
                    <input
                      type="month"
                      value={project.endDate}
                      onChange={(e) => updateProject(project.id, { endDate: e.target.value, isOngoing: false })}
                      disabled={project.isOngoing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={project.isOngoing}
                        onChange={(e) => updateProject(project.id, { isOngoing: e.target.checked, endDate: '' })}
                        className="rounded"
                      />
                                            Currently working on this project
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        GitHub URL
                  </label>
                  <input
                    type="url"
                    value={project.githubUrl}
                    onChange={(e) => updateProject(project.id, { githubUrl: e.target.value })}
                    placeholder="https://github.com/username/project"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={project.liveUrl}
                    onChange={(e) => updateProject(project.id, { liveUrl: e.target.value })}
                    placeholder="https://project-demo.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Key Responsibilities
                  </label>
                  <textarea
                    value={project.responsibilities?.join('\n') || ''}
                    onChange={(e) => updateProject(project.id, {
                      responsibilities: e.target.value.split('\n').filter(r => r.trim())
                    })}
                    placeholder="Describe your role and responsibilities in this project..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                                        One responsibility per line
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Achievements/Impact
                  </label>
                  <textarea
                    value={project.achievements?.join('\n') || ''}
                    onChange={(e) => updateProject(project.id, {
                      achievements: e.target.value.split('\n').filter(a => a.trim())
                    })}
                    placeholder="What was the impact of this project? Any measurable results?"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                                        One achievement per line
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                                    Nepal Project Context
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                                        Cancel
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                                        Save Project
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const filteredProjects = projects.filter(project => {
    if (filterStatus === 'all') {
      return true;
    }
    if (filterStatus === 'featured') {
      return project.isFeatured;
    }
    if (filterStatus === 'ongoing') {
      return project.isOngoing;
    }
    if (filterStatus === 'visible') {
      return project.isVisible;
    }
    return true;
  });

  const stats = {
    total: projects.length,
    visible: projects.filter(p => p.isVisible).length,
    featured: projects.filter(p => p.isFeatured).length,
    ongoing: projects.filter(p => p.isOngoing).length,
    web: projects.filter(p => p.category === 'web').length,
    mobile: projects.filter(p => p.category === 'mobile').length,
    academic: projects.filter(p => p.type === 'Academic Project').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Projects Portfolio</h2>
          <p className="text-gray-600">Showcase your technical projects and accomplishments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-gray-100 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              {stats.visible} projects
            </span>
          </div>
          <button
            onClick={addProject}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
                        Add Project
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {projects.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Projects Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Projects</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.visible}</div>
              <div className="text-sm text-gray-600">Visible</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.featured}</div>
              <div className="text-sm text-gray-600">Featured</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.ongoing}</div>
              <div className="text-sm text-gray-600">Ongoing</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {projects.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
                            All Projects ({projects.length})
            </button>
            <button
              onClick={() => setFilterStatus('featured')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${filterStatus === 'featured' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Star className="w-4 h-4" />
                            Featured ({stats.featured})
            </button>
            <button
              onClick={() => setFilterStatus('ongoing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${filterStatus === 'ongoing' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Zap className="w-4 h-4" />
                            Ongoing ({stats.ongoing})
            </button>
            <button
              onClick={() => setFilterStatus('visible')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${filterStatus === 'visible' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Eye className="w-4 h-4" />
                            Visible ({stats.visible})
            </button>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No projects added yet</h3>
            <p className="text-gray-500 mb-6">Add your projects to showcase your technical skills and experience</p>
            <button
              onClick={addProject}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
                            Add Your First Project
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No projects found</h3>
            <p className="text-gray-500">Try adjusting your filter criteria</p>
          </div>
        ) : (
          filteredProjects.map((project, index) => renderProjectCard(project, index))
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onPrev}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
                    ← Previous
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
                    Next: Certifications →
        </button>
      </div>
    </div>
  );
};

export default ProjectsPage;