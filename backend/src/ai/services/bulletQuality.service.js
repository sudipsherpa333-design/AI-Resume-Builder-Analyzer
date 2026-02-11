import { weakWords } from "../utils/weakWords.js";

export const analyzeBullets = (experience = []) => {
    const weak = [];

    experience.forEach(job =>
        job.bullets?.forEach(b => {
            const text = b.toLowerCase();
            if (weakWords.some(w => text.includes(w))) weak.push(b);
        })
    );

    return { weak };
};
