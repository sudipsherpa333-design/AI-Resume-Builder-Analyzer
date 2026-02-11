export const skillsSuggest = (skills = [], jdText) => `
You are an AI resume coach.

Given these resume skills: ${skills.join(", ")}

And this job description:
"""
${jdText}
"""

Suggest additional skills or keywords to improve the resume match for ATS.
Return a comma-separated list of skills.
`;
