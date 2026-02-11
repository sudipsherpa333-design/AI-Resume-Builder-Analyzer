import { aiClient } from "./aiClient.js";

export const buildSuggestions = async ({ resume, missing = [] }) => {
    const prompt = `
Suggest improvements for this resume.
Missing keywords: ${missing.join(", ")}
Resume JSON: ${JSON.stringify(resume)}
`;

    return await aiClient(prompt);
};
