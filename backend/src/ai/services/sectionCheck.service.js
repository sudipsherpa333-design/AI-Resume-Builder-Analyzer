export const checkSections = (resume) => {
    const requiredSections = ["summary", "skills", "experience", "education"];
    const missing = requiredSections.filter(s => !resume[s] || resume[s].length === 0);
    return { missing };
};
