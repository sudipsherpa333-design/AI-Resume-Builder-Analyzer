// src/services/aiAnalyzer.js
import axios from 'axios';

const API_BASE_URL = window.REACT_APP_API_URL || 'http://localhost:5000/api';

export const aiAnalyzer = {
    // Analyze resume with AI
    async analyzeResume(content, options = {}) {
        try {
            const {
                jobDescription = '',
                model = 'openai',
                fileType = 'text'
            } = options;

            // For demo purposes, we'll use mock data
            // In production, you would make actual API calls to:
            // 1. Your backend that calls OpenAI/Gemini/Claude
            // 2. Direct API calls to AI services

            // Check if we should use mock or real API
            const useMock = process.env.NODE_ENV === 'development' || !window.REACT_APP_USE_REAL_AI;

            if (useMock) {
                return this.mockAnalysis(content, jobDescription, model);
            }

            // Real API call to your backend
            const response = await axios.post(`${API_BASE_URL}/analyze/ai`, {
                content,
                jobDescription,
                model,
                fileType
            });

            return response.data;

        } catch (error) {
            console.error('AI analysis error:', error);

            // Fallback to mock analysis if API fails
            return this.mockAnalysis(content, options.jobDescription, options.model);
        }
    },

    // Mock AI analysis for development
    mockAnalysis(content, jobDescription = '', model = 'openai') {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generate realistic scores based on content
                const contentLength = content.length;
                const baseScore = Math.min(85 + Math.floor(contentLength / 1000), 95);
                const randomVariation = Math.floor(Math.random() * 10) - 5;
                const score = Math.max(60, Math.min(95, baseScore + randomVariation));

                const analysisResult = {
                    success: true,
                    data: {
                        overallScore: score,
                        atsScore: Math.min(100, score + 3),
                        wordCount: Math.floor(contentLength / 5),
                        readTime: `${Math.ceil(contentLength / 1500)} minutes`,
                        lastAnalyzed: new Date().toLocaleString(),
                        aiModel: model,
                        analysisId: `ai_${Date.now()}`,
                        contentLength: contentLength,

                        sections: {
                            personalInfo: {
                                score: 28,
                                maxScore: 30,
                                status: 'excellent',
                                suggestions: ['Add LinkedIn profile for better networking'],
                                completeness: 95
                            },
                            summary: {
                                score: 16,
                                maxScore: 20,
                                status: 'good',
                                suggestions: ['Add more quantifiable achievements', 'Include industry keywords'],
                                completeness: 80
                            },
                            experience: {
                                score: 22,
                                maxScore: 30,
                                status: 'good',
                                suggestions: ['Add more achievement metrics', 'Include specific technologies used'],
                                completeness: 73
                            },
                            education: {
                                score: 9,
                                maxScore: 10,
                                status: 'excellent',
                                suggestions: [],
                                completeness: 90
                            },
                            skills: {
                                score: 13,
                                maxScore: 15,
                                status: 'good',
                                suggestions: ['Categorize skills by proficiency level'],
                                completeness: 87
                            }
                        },

                        suggestions: [
                            {
                                type: 'critical',
                                title: 'Add Achievement Metrics',
                                description: 'Include quantifiable results in your experience section to demonstrate impact',
                                priority: 'high',
                                section: 'experience',
                                fix: 'Add numbers, percentages, and specific results to your achievements. For example: "Increased sales by 30%" or "Reduced processing time by 40%"'
                            },
                            {
                                type: 'improvement',
                                title: 'Enhance Professional Summary',
                                description: 'Make your summary more compelling with action verbs and industry keywords',
                                priority: 'medium',
                                section: 'summary',
                                fix: 'Start with a strong action verb and include 3-5 key industry terms relevant to your target role'
                            }
                        ],

                        strengths: [
                            'Clear and professional contact information',
                            'Well-structured education section',
                            'Good variety of technical skills',
                            'Appropriate resume length',
                            'Clean formatting and organization',
                            'Relevant work experience listed',
                            'Good use of industry terminology'
                        ],

                        weaknesses: [
                            'Lack of quantifiable achievements',
                            'Could use more action verbs',
                            'Missing some industry keywords',
                            'Skills not categorized by proficiency'
                        ],

                        industryComparison: {
                            experienceEntries: { current: 3, average: '3-5' },
                            skillsListed: { current: 8, average: '8-12' },
                            summaryLength: { current: 245, average: '150-400' },
                            achievementMetrics: { current: 2, average: '3-5' }
                        },

                        keywordAnalysis: {
                            missingKeywords: ['leadership', 'management', 'optimization', 'automation', 'strategy', 'innovation'],
                            foundKeywords: ['development', 'javascript', 'react', 'node.js', 'database', 'web', 'application', 'software'],
                            keywordDensity: 'Good',
                            jobMatchScore: jobDescription ? Math.floor(Math.random() * 30) + 60 : null,
                            keywordSuggestions: ['Consider adding more leadership-related keywords for management roles']
                        },

                        aiInsights: [
                            'Your resume shows strong technical expertise but could benefit from more leadership examples',
                            'Consider adding metrics to quantify your achievements - this increases impact by 40%',
                            'The structure is clean and easy to read for both humans and ATS systems',
                            'Skills section is comprehensive but could be better organized',
                            'Education section is well-formatted and complete'
                        ],

                        improvementPlan: {
                            priority1: 'Add 3-5 quantifiable achievements to experience section',
                            priority2: 'Optimize summary with action verbs and target role keywords',
                            priority3: 'Categorize skills and add proficiency levels',
                            estimatedTime: '30-45 minutes',
                            expectedImprovement: '15-25 points',
                            difficulty: 'Medium'
                        },

                        nextSteps: [
                            'Review the suggestions below and implement them in your resume',
                            'Use the "Apply Suggestions" button to automatically update your resume',
                            'Re-analyze after making changes to track improvement',
                            'Consider getting feedback from industry professionals'
                        ]
                    }
                };

                resolve(analysisResult);
            }, 2000);
        });
    },

    // Extract text from different file types
    async extractTextFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                let content = '';

                if (file.type === 'application/pdf') {
                    // Mock PDF extraction
                    content = `PDF Content: ${file.name}\n\n`;
                    content += "This is mock content. In production, use pdf-parse library.\n";
                    content += `File size: ${(file.size / 1024).toFixed(2)} KB`;
                } else if (file.type.includes('word')) {
                    // Mock DOCX extraction
                    content = `DOCX Content: ${file.name}\n\n`;
                    content += "This is mock content. In production, use mammoth.js library.\n";
                    content += `File size: ${(file.size / 1024).toFixed(2)} KB`;
                } else {
                    content = e.target.result;
                }

                resolve(content);
            };

            reader.onerror = reject;

            if (file.type === 'application/pdf' || file.type.includes('word')) {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        });
    },

    // Extract text from URL
    async extractTextFromUrl(url) {
        try {
            // In production, call your backend API
            const response = await axios.get(`${API_BASE_URL}/analyze/extract-url`, {
                params: { url }
            });

            return response.data.content;
        } catch (error) {
            console.error('URL extraction error:', error);
            // Return mock content
            return `Content from URL: ${url}\n\nMock content extraction. In production, this would fetch and parse the webpage.`;
        }
    }
};

export default aiAnalyzer;