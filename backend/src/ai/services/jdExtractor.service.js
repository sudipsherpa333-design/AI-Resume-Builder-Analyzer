import { aiClient } from "./aiClient.js";
import { extractJDPrompt } from "../prompts/extractJD.prompt.js";

export const extractJDKeywords = async (jdText) => {
    const prompt = extractJDPrompt(jdText);
    const out = await aiClient(prompt);

    try {
        return JSON.parse(out); // AI returns JSON array of keywords
    } catch {
        // fallback: split by comma if not proper JSON
        return out.split(",").map(k => k.trim());
    }
};
