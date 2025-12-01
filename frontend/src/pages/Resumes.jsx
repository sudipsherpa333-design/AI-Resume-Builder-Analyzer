import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Resumes = () => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    // Mock data
    useEffect(() => {
        const fetchResumes = async () => {
            try {
                setTimeout(() => {
                    setResumes([
                        {
                            id: 1,
                            title: 'Software Engineer Resume',
                            createdAt: '2024-01-15',
                            updatedAt: '2024-01-20',
                            status: 'published',
                        },
                        {
                            id: 2,
                            title: 'Frontend Developer Resume',
                            createdAt: '2024-01-10',
                            updatedAt: '2024-01-18',
                            status: 'draft',
                        },
                    ]);
                    setLoading(false);
                }, 1000);
            } catch (error) {
                toast.error('Failed to load resumes');
                setLoading(false);
            }
        };

        fetchResumes();
    }, []);

    const filteredResumes = resumes.filter(resume =>
        resume.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this resume?')) {
            try {
                setResumes(resumes.filter(resume => resume.id !== id));
                toast.success('Resume deleted successfully');
            } catch (error) {
                toast.error('Failed to delete resume');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="loading-spinner mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your resumes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
                            <p className="text-gray-600 mt-2">
                                Manage and edit your professional resumes
                            </p>
                        </div>
                        <Link
                            to="/builder"
                            className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            + Create New Resume
                        </Link>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <input
                            type="text"
                            placeholder="Search resumes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Resumes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResumes.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <div className="text-6xl mb-4">📄</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {searchTerm ? 'No resumes found' : 'No resumes yet'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {searchTerm
                                    ? 'Try adjusting your search terms'
                                    : 'Create your first professional resume to get started'}
                            </p>
                            {!searchTerm && (
                                <Link
                                    to="/builder"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    + Create Your First Resume
                                </Link>
                            )}
                        </div>
                    ) : (
                        filteredResumes.map((resume) => (
                            <div
                                key={resume.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <span className="text-blue-600">📄</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {resume.title}
                                            </h3>
                                            <span
                                                className={`inline-block px-2 py-1 text-xs rounded-full ${resume.status === 'published'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {resume.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    <div>Created: {new Date(resume.createdAt).toLocaleDateString()}</div>
                                    <div>Updated: {new Date(resume.updatedAt).toLocaleDateString()}</div>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        to={`/builder?edit=${resume.id}`}
                                        className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(resume.id)}
                                        className="flex-1 text-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Resumes; // ✅ Make sure this line exists