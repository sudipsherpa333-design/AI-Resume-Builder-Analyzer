export const fullReview = (resume) => `
You are a professional resume reviewer.

Analyze the following resume JSON:
${JSON.stringify(resume, null, 2)}

Return a structured review including:
- Weak bullets
- Missing keywords
- Missing metrics or numbers
- Section issues
- Suggestions for improvement

Return ONLY JSON with these keys.
`;
