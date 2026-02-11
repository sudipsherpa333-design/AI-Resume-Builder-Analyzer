export const keywordMatch = (jdKeywords = [], resumeSet = new Set()) => {
    const matched = [];
    const missing = [];

    jdKeywords.forEach(k => {
        if (resumeSet.has(k.toLowerCase())) matched.push(k);
        else missing.push(k);
    });

    const percent = Math.round((matched.length / jdKeywords.length) * 100);

    return { matched, missing, percent };
};
