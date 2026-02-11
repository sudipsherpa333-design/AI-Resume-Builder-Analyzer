export const rewriteBullet = (bullet, keywords = []) => `
Rewrite this resume bullet to be strong, action-oriented, measurable, and ATS-friendly:
"${bullet}"

Include these keywords naturally if relevant: ${keywords.join(", ")}

Return ONLY the improved bullet text.
`;
