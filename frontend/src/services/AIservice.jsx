// services/AIService.js

const API_BASE_URL = 'http://localhost:5000/api';
const OPENROUTER_API_KEY = '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';

class AIService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Get auth headers
    getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'OpenRouter-Api-Key': OPENROUTER_API_KEY
        };
    }

    // Analyze resume with AI
    async analyzeResume(resumeData) {
        try {
            // First try backend API
            const response = await fetch(`${this.baseURL}/ai/analyze`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ resumeData })
            });

            if (response.ok) {
                const data = await response.json();
                return data.suggestions || [];
            }

            // Fallback to direct OpenRouter API
            return await this.analyzeWithOpenRouter(resumeData);
        } catch (error) {
            console.error('Resume analysis error:', error);
            return this.getFallbackSuggestions(resumeData);
        }
    }

    // Analyze job description from URL
    async analyzeJobDescription(url) {
        try {
            const response = await fetch(`${this.baseURL}/ai/analyze-job`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ url })
            });

            if (response.ok) {
                const data = await response.json();
                return data.analysis;
            }

            // Fallback to direct analysis
            return await this.analyzeJobWithOpenRouter(url);
        } catch (error) {
            console.error('Job analysis error:', error);
            return this.getFallbackJobAnalysis();
        }
    }

    // Extract resume data from uploaded file text
    async extractResumeData(text) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'openai/gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a professional resume parser. Extract structured data from resume text.'
                        },
                        {
                            role: 'user',
                            content: `Extract the following from this resume text:
                            1. Personal information (name, email, phone, location)
                            2. Professional summary
                            3. Work experience (job title, company, dates, description)
                            4. Education (degree, institution, dates)
                            5. Skills (technical and soft skills)
                            6. Projects
                            7. Certifications
                            
                            Return as JSON format.
                            
                            Resume text: ${text.substring(0, 4000)}`
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 2000
                })
            });

            const data = await response.json();
            if (data.choices && data.choices[0]) {
                return JSON.parse(data.choices[0].message.content);
            }
        } catch (error) {
            console.error('Resume extraction error:', error);
        }

        return this.extractBasicInfo(text);
    }

    // Generate job-specific suggestions
    async generateJobSpecificSuggestions(resumeData, jobAnalysis) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'openai/gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a career coach specializing in resume optimization for specific jobs.'
                        },
                        {
                            role: 'user',
                            content: `Given this resume data: ${JSON.stringify(resumeData)}
                            And this job analysis: ${JSON.stringify(jobAnalysis)}
                            
                            Provide 5-8 specific, actionable suggestions to optimize the resume for this job.
                            Format each suggestion as: {
                                "type": "keyword|rewrite|add|format",
                                "category": "Skills|Experience|Summary|Keywords",
                                "text": "suggestion text",
                                "section": "summary|experience|skills|certifications",
                                "index": optional_index,
                                "value": "specific_value_to_use"
                            }`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1500
                })
            });

            const data = await response.json();
            if (data.choices && data.choices[0]) {
                return JSON.parse(data.choices[0].message.content);
            }
        } catch (error) {
            console.error('Job suggestion generation error:', error);
        }

        return this.getFallbackJobSuggestions(jobAnalysis);
    }

    // Enhance resume with AI
    async enhanceResume(resumeData) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'openai/gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a professional resume writer. Enhance resumes with better wording, stronger action verbs, and improved impact.'
                        },
                        {
                            role: 'user',
                            content: `Enhance this resume data with better wording and stronger impact:
                            ${JSON.stringify(resumeData)}
                            
                            Return enhanced version in same JSON structure.`
                        }
                    ],
                    temperature: 0.5,
                    max_tokens: 3000
                })
            });

            const data = await response.json();
            if (data.choices && data.choices[0]) {
                return JSON.parse(data.choices[0].message.content);
            }
        } catch (error) {
            console.error('Resume enhancement error:', error);
        }

        return resumeData;
    }

    // Direct OpenRouter analysis
    async analyzeWithOpenRouter(resumeData) {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional resume coach. Analyze resumes and provide specific improvement suggestions.'
                    },
                    {
                        role: 'user',
                        content: `Analyze this resume and provide 5-8 specific improvement suggestions:
                        ${JSON.stringify(resumeData)}
                        
                        Focus on:
                        1. ATS optimization
                        2. Keyword usage
                        3. Achievement quantification
                        4. Formatting improvements
                        5. Missing sections
                        
                        Return as array of suggestion objects with category and text.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0]) {
            return JSON.parse(data.choices[0].message.content);
        }

        return this.getFallbackSuggestions(resumeData);
    }

    // Fallback suggestions
    getFallbackSuggestions(resumeData) {
        const suggestions = [
            {
                type: 'keyword',
                category: 'Skills',
                text: 'Add more technical skills relevant to your target industry',
                section: 'skills',
                value: 'Add 3-5 relevant technical skills'
            },
            {
                type: 'rewrite',
                category: 'Experience',
                text: 'Use stronger action verbs in your job descriptions',
                section: 'experience',
                value: 'Start bullet points with verbs like: Managed, Developed, Implemented, Optimized'
            },
            {
                type: 'add',
                category: 'Achievements',
                text: 'Add quantifiable achievements to your experience',
                section: 'experience',
                value: 'Include numbers: increased by X%, reduced costs by $Y, improved efficiency by Z%'
            },
            {
                type: 'keyword',
                category: 'Summary',
                text: 'Tailor your professional summary to your target role',
                section: 'summary',
                value: 'Mention your key skills and career objectives'
            }
        ];

        return suggestions;
    }

    // Fallback job analysis
    getFallbackJobAnalysis() {
        return {
            keywords: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
            keySkills: ['Frontend Development', 'Backend Development', 'API Design', 'Database Management'],
            requiredQualifications: ['Bachelor\'s degree in Computer Science', '3+ years experience'],
            jobLevel: 'Mid-level',
            salaryRange: '$80,000 - $120,000',
            companyCulture: ['Agile environment', 'Remote-friendly', 'Continuous learning']
        };
    }

    // Fallback job suggestions
    getFallbackJobSuggestions(jobAnalysis) {
        const suggestions = [
            {
                type: 'keyword',
                category: 'Keywords',
                text: `Include these job-specific keywords: ${jobAnalysis.keywords?.slice(0, 3).join(', ')}`,
                section: 'skills',
                value: jobAnalysis.keywords?.[0] || 'Relevant skill'
            },
            {
                type: 'rewrite',
                category: 'Experience',
                text: 'Align your experience with job requirements',
                section: 'experience',
                value: 'Emphasize relevant projects and technologies'
            },
            {
                type: 'keyword',
                category: 'Summary',
                text: 'Update summary to match job description',
                section: 'summary',
                value: 'Highlight relevant skills and experience'
            }
        ];

        return suggestions;
    }

    // Extract basic info from text
    extractBasicInfo(text) {
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const phoneMatch = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);

        return {
            personalInfo: {
                email: emailMatch ? emailMatch[0] : '',
                phone: phoneMatch ? phoneMatch[0] : ''
            },
            skills: ['JavaScript', 'React', 'Node.js'].filter(skill =>
                text.toLowerCase().includes(skill.toLowerCase())
            )
        };
    }

    // Save resume to backend
    async saveResume(resumeData, resumeId = null, isEditing = false) {
        const url = isEditing && resumeId
            ? `${this.baseURL}/resumes/${resumeId}`
            : `${this.baseURL}/resumes`;

        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: this.getHeaders(),
            body: JSON.stringify(resumeData)
        });

        if (!response.ok) {
            throw new Error('Failed to save resume');
        }

        return response.json();
    }

    // Fetch resume
    async fetchResume(resumeId) {
        const response = await fetch(`${this.baseURL}/resumes/${resumeId}`, {
            headers: this.getHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch resume');
        }

        return response.json();
    }

    // Duplicate resume
    async duplicateResume(resumeId) {
        const response = await fetch(`${this.baseURL}/resumes/${resumeId}/duplicate`, {
            method: 'POST',
            headers: this.getHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to duplicate resume');
        }

        return response.json();
    }

    // Delete resume
    async deleteResume(resumeId) {
        const response = await fetch(`${this.baseURL}/resumes/${resumeId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to delete resume');
        }

        return response.json();
    }
}

export default AIService;