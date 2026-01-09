import axios from 'axios';
import { PythonShell } from 'python-shell';

export const analyzeResumeWithAI = async (resumeData) => {
    try {
        // Prepare data for Python AI processing
        const analysisData = {
            resume_text: generateResumeText(resumeData),
            job_title: resumeData.personalInfo.jobTitle,
            skills: resumeData.skills.map(skill => skill.name),
            experience: resumeData.experience,
            education: resumeData.education
        };

        // Call Python AI service
        const options = {
            mode: 'text',
            pythonPath: 'python3',
            scriptPath: './ai', // Path to your AI folder
            args: [JSON.stringify(analysisData)]
        };

        return new Promise((resolve, reject) => {
            PythonShell.run('main.py', options, (err, results) => {
                if (err) {
                    console.error('AI Analysis Error:', err);
                    reject(err);
                } else {
                    const analysisResult = JSON.parse(results[0]);
                    resolve(analysisResult);
                }
            });
        });

    } catch (error) {
        console.error('AI Analysis Failed:', error);
        throw error;
    }
};

const generateResumeText = (resumeData) => {
    let text = '';

    // Personal Info
    text += `Name: ${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}\n`;
    text += `Job Title: ${resumeData.personalInfo.jobTitle}\n`;
    text += `Summary: ${resumeData.professionalSummary}\n\n`;

    // Experience
    text += "EXPERIENCE:\n";
    resumeData.experience.forEach(exp => {
        text += `${exp.position} at ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})\n`;
        text += `${exp.description}\n\n`;
    });

    // Education
    text += "EDUCATION:\n";
    resumeData.education.forEach(edu => {
        text += `${edu.degree} at ${edu.institution} (${edu.field})\n`;
    });

    // Skills
    text += "\nSKILLS:\n";
    resumeData.skills.forEach(skill => {
        text += `${skill.name} (${skill.level}), `;
    });

    return text;
};

export const getAISuggestions = async (resumeData, targetJob = '') => {
    try {
        const analysis = await analyzeResumeWithAI(resumeData);

        // Generate suggestions based on AI analysis
        const suggestions = generateSuggestions(analysis, targetJob);

        return {
            score: analysis.overall_score,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            suggestions: suggestions,
            keywordMatches: analysis.keyword_matches,
            atsScore: analysis.ats_score
        };

    } catch (error) {
        console.error('AI Suggestion Error:', error);
        throw error;
    }
};

const generateSuggestions = (analysis, targetJob) => {
    const suggestions = [];

    if (analysis.overall_score < 70) {
        suggestions.push({
            type: 'critical',
            title: 'Improve Overall Score',
            message: 'Your resume needs significant improvements to be competitive.',
            action: 'Add more quantifiable achievements and relevant skills'
        });
    }

    if (analysis.keyword_matches && analysis.keyword_matches.length < 5) {
        suggestions.push({
            type: 'warning',
            title: 'Low Keyword Match',
            message: 'Your resume is missing important industry keywords.',
            action: 'Add more relevant keywords from job descriptions'
        });
    }

    if (analysis.ats_score < 80) {
        suggestions.push({
            type: 'warning',
            title: 'ATS Optimization',
            message: 'Your resume may not perform well with Applicant Tracking Systems.',
            action: 'Use standard sections and avoid complex formatting'
        });
    }

    return suggestions;
};