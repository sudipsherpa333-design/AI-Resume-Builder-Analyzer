export const extractJDPrompt = (jdText) => `
You are an expert recruiter and resume analyzer.

Extract all relevant ATS keywords from this job description.
Return ONLY JSON array of keywords.

Job Description:
"""
${jdText}
"""
`;
