// src/hooks/useAIAnalyzer.js
import { useState, useCallback } from 'react';
import useAIAssistant from './useAIAssistant';

export default function useAIAnalyzer() {
  const ai = useAIAssistant();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // Comprehensive AI Analysis for resume vs job description
  const analyzeResumeVsJob = useCallback(async (resumeData, jobDescription) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      if (!resumeData || !jobDescription) {
        throw new Error('Resume data and job description are required');
      }

      // Combine all analysis functions for comprehensive report
      const [
        skillsMatch,
        experienceAnalysis,
        atsScore,
        improvements,
        jobFitScore
      ] = await Promise.all([
        analyzeSkillsMatch(resumeData, jobDescription),
        analyzeExperience(resumeData),
        getAdvancedATSScore(resumeData),
        generateImprovements(resumeData, jobDescription),
        calculateJobFitScore(resumeData, jobDescription)
      ]);

      const analysis = {
        skillsMatch,
        experienceAnalysis,
        atsScore,
        improvements,
        jobFitScore,
        timestamp: new Date().toISOString(),
        resumeTitle: resumeData.title || 'Untitled Resume',
        jobTitle: jobDescription.substring(0, 100) // First 100 chars as title
      };

      return analysis;
    } catch (err) {
      setError(err.message);
      console.error('Analysis error:', err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Analyze skills match with job
  const analyzeSkillsMatch = useCallback(async (resumeData, jobDescription) => {
    try {
      const resumeSkills = extractSkills(resumeData);
      const jobSkills = extractSkills({ description: jobDescription });

      const matchedSkills = resumeSkills.filter(skill =>
        jobSkills.some(jSkill =>
          jSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(jSkill.toLowerCase())
        )
      );

      const matchPercentage = jobSkills.length > 0
        ? Math.round((matchedSkills.length / jobSkills.length) * 100)
        : 0;

      return {
        resumeSkills: resumeSkills.slice(0, 10),
        jobSkills: jobSkills.slice(0, 10),
        matchedSkills: matchedSkills.slice(0, 10),
        matchPercentage,
        missingSkills: jobSkills.filter(jSkill =>
          !matchedSkills.some(mSkill =>
            mSkill.toLowerCase() === jSkill.toLowerCase()
          )
        ).slice(0, 5)
      };
    } catch (err) {
      console.error('Skills analysis error:', err);
      return { resumeSkills: [], jobSkills: [], matchedSkills: [], matchPercentage: 0, missingSkills: [] };
    }
  }, []);

  // Analyze experience
  const analyzeExperience = useCallback((resumeData) => {
    try {
      const experience = resumeData.experience || [];
      const totalYears = calculateTotalExperience(experience);
      const roles = experience.map(exp => ({
        title: exp.position || exp.title || 'Unknown',
        company: exp.company || 'Unknown',
        duration: exp.duration || 'Unknown',
        isRelevant: true
      }));

      return {
        totalYears,
        experienceCount: experience.length,
        roles: roles.slice(0, 5),
        summary: `${totalYears} years of experience across ${experience.length} positions`
      };
    } catch (err) {
      console.error('Experience analysis error:', err);
      return { totalYears: 0, experienceCount: 0, roles: [], summary: 'Unable to analyze experience' };
    }
  }, []);

  // Advanced ATS Score
  const getAdvancedATSScore = useCallback(async (resumeData) => {
    try {
      let score = 0;
      const factors = [];

      // Personal Info (25 points)
      if (resumeData.personalInfo?.name) {
        score += 5;
        factors.push('✓ Full name present');
      }
      if (resumeData.personalInfo?.email) {
        score += 5;
        factors.push('✓ Email present');
      }
      if (resumeData.personalInfo?.phone) {
        score += 5;
        factors.push('✓ Phone present');
      }
      if (resumeData.personalInfo?.location) {
        score += 5;
        factors.push('✓ Location present');
      }
      if (resumeData.personalInfo?.linkedIn || resumeData.personalInfo?.portfolio) {
        score += 5;
        factors.push('✓ Portfolio/LinkedIn present');
      }

      // Experience (25 points)
      if (resumeData.experience?.length > 0) {
        score += 10;
        factors.push(`✓ ${resumeData.experience.length} experience entries`);
        if (resumeData.experience.length >= 3) {
          score += 15;
          factors.push('✓ Comprehensive work history');
        }
      }

      // Education (20 points)
      if (resumeData.education?.length > 0) {
        score += 10;
        factors.push('✓ Education listed');
        if (resumeData.education.length >= 2) {
          score += 10;
          factors.push('✓ Multiple degrees/certifications');
        }
      }

      // Skills (20 points)
      const skills = resumeData.skills?.technical?.length || 0;
      const softSkills = resumeData.skills?.soft?.length || 0;
      if (skills > 0) {
        score += 10;
        factors.push(`✓ ${skills} technical skills`);
      }
      if (softSkills > 0) {
        score += 10;
        factors.push(`✓ ${softSkills} soft skills`);
      }

      // Summary/Objective (10 points)
      if (resumeData.summary?.length > 50) {
        score += 10;
        factors.push('✓ Professional summary present');
      }

      return {
        score: Math.min(100, score),
        maxScore: 100,
        factors,
        percentage: Math.min(100, score),
        level: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor'
      };
    } catch (err) {
      console.error('ATS score error:', err);
      return { score: 0, maxScore: 100, factors: [], percentage: 0, level: 'Unable to calculate' };
    }
  }, []);

  // Generate improvements
  const generateImprovements = useCallback(async (resumeData, jobDescription) => {
    try {
      const improvements = [];

      // Check missing sections
      if (!resumeData.summary || resumeData.summary.length < 50) {
        improvements.push({
          priority: 'high',
          category: 'Summary',
          suggestion: 'Add a professional summary (50-100 words) at the top',
          impact: 'Increases ATS score by 15%'
        });
      }

      if (!resumeData.experience || resumeData.experience.length === 0) {
        improvements.push({
          priority: 'critical',
          category: 'Experience',
          suggestion: 'Add work experience details with achievements',
          impact: 'Essential for ATS matching'
        });
      }

      if (!resumeData.skills || !resumeData.skills.technical || resumeData.skills.technical.length === 0) {
        improvements.push({
          priority: 'high',
          category: 'Skills',
          suggestion: 'List technical skills relevant to the job',
          impact: 'Increases job match score by 20%'
        });
      }

      // Check formatting
      if (resumeData.experience?.some(exp => !exp.description || exp.description.length < 20)) {
        improvements.push({
          priority: 'medium',
          category: 'Descriptions',
          suggestion: 'Add detailed bullet points for each position',
          impact: 'Improves keyword matching'
        });
      }

      return improvements;
    } catch (err) {
      console.error('Improvements generation error:', err);
      return [];
    }
  }, []);

  // Calculate job fit score
  const calculateJobFitScore = useCallback(async (resumeData, jobDescription) => {
    try {
      let score = 0;
      const criteria = [];

      // Experience match
      const experience = calculateTotalExperience(resumeData.experience || []);
      if (experience >= 5) {
        score += 25;
        criteria.push({ name: 'Years of Experience', value: `${experience}+ years`, met: true });
      } else if (experience >= 2) {
        score += 15;
        criteria.push({ name: 'Years of Experience', value: `${experience} years`, met: true });
      } else {
        criteria.push({ name: 'Years of Experience', value: 'Below expectation', met: false });
      }

      // Skills match
      const skillsMatch = (resumeData.skills?.technical?.length || 0) / 5;
      const skillScore = Math.min(25, skillsMatch * 25);
      score += skillScore;
      criteria.push({
        name: 'Technical Skills',
        value: `${resumeData.skills?.technical?.length || 0} skills listed`,
        met: (resumeData.skills?.technical?.length || 0) >= 5
      });

      // Education
      const hasRelevantEducation = resumeData.education && resumeData.education.length > 0;
      if (hasRelevantEducation) {
        score += 20;
        criteria.push({ name: 'Education', value: 'Degree/Certification present', met: true });
      } else {
        criteria.push({ name: 'Education', value: 'Not specified', met: false });
      }

      // ATS Score
      if (resumeData.atsScore >= 70) {
        score += 15;
        criteria.push({ name: 'ATS Compatibility', value: `${resumeData.atsScore}/100`, met: true });
      } else {
        criteria.push({ name: 'ATS Compatibility', value: `${resumeData.atsScore}/100`, met: false });
      }

      // Presentation
      if (resumeData.summary && resumeData.summary.length > 50) {
        score += 15;
        criteria.push({ name: 'Professional Summary', value: 'Present', met: true });
      } else {
        criteria.push({ name: 'Professional Summary', value: 'Missing', met: false });
      }

      return {
        overallScore: Math.min(100, score),
        criteria,
        recommendation: score >= 70 ? 'Strong match' : score >= 50 ? 'Moderate match' : 'Needs improvement'
      };
    } catch (err) {
      console.error('Job fit calculation error:', err);
      return { overallScore: 0, criteria: [], recommendation: 'Unable to calculate' };
    }
  }, []);

  // Helper: Extract skills
  const extractSkills = (data) => {
    const skills = [];
    
    if (data.skills?.technical) {
      skills.push(...data.skills.technical);
    }
    if (data.skills?.soft) {
      skills.push(...data.skills.soft);
    }
    if (data.description) {
      // Simple extraction from description
      const keywords = ['javascript', 'python', 'react', 'nodejs', 'sql', 'aws', 'docker', 'kubernetes'];
      keywords.forEach(kw => {
        if (data.description.toLowerCase().includes(kw)) {
          skills.push(kw);
        }
      });
    }
    
    return [...new Set(skills)];
  };

  // Helper: Calculate total experience
  const calculateTotalExperience = (experiences) => {
    if (!experiences || experiences.length === 0) return 0;
    
    let totalYears = 0;
    experiences.forEach(exp => {
      if (exp.yearsExperience) {
        totalYears += parseInt(exp.yearsExperience) || 0;
      }
    });
    
    return totalYears || experiences.length;
  };

  return {
    analyzeResumeVsJob,
    analyzeSkillsMatch,
    analyzeExperience,
    getAdvancedATSScore,
    generateImprovements,
    calculateJobFitScore,
    isAnalyzing,
    error
  };
}
