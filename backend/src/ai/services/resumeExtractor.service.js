import { normalizeText } from "../utils/normalizeText.js";

export const extractResumeKeywords = (resume) => {
    const text = normalizeText(JSON.stringify(resume));
    return new Set(text.split(/\s+/));
};
