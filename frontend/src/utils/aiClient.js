// frontend/src/utils/aiClient.js

// Enhanced resume for ATS
export const enhanceResume = async (resumeData, jobDescription) => {
  try {
    const response = await fetch('/api/ai/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData, jobDescription })
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('AI client error:', err);
    return resumeData;
  }
};

// Suggest skills based on target role
export const suggestSkills = async (targetRole, existingSkills, keywords = []) => {
  try {
    const response = await fetch('/api/ai/suggest-skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetRole, existingSkills, keywords })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch skill suggestions');
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch (err) {
    console.error('AI suggestSkills error:', err);
    return [];
  }
};

// Analyze ATS compatibility
export const analyzeATS = async (resumeData, jobDescription) => {
  try {
    const response = await fetch('/api/ai/analyze-ats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeData, jobDescription })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze ATS');
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('AI analyzeATS error:', err);
    return { keywords: [], score: 0, matches: [] };
  }
};

// Export as named exports or create an object
export const aiClient = {
  enhanceResume,
  suggestSkills,
  analyzeATS
};

// Also export default if you prefer
export default aiClient;