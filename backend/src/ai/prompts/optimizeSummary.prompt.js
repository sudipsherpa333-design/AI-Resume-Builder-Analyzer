export const optimizeSummary = (summary, jdText) => `
Rewrite this resume summary to be targeted for the following job description:
"""
${jdText}
"""
Original Summary:
"""
${summary}
"""

Focus on including ATS keywords, strong action words, and measurable achievements.
Return ONLY the optimized summary text.
`;
