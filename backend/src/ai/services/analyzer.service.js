import { extractJDKeywords } from "./jdExtractor.service.js";
import { extractResumeKeywords } from "./resumeExtractor.service.js";
import { keywordMatch } from "./keywordMatch.service.js";
import { calcATSScore } from "./atsScore.service.js";
import { analyzeBullets } from "./bulletQuality.service.js";
import { detectMetrics } from "./metrics.service.js";
import { checkSections } from "./sectionCheck.service.js";
import { buildSuggestions } from "./suggestion.service.js";

export const runAnalyzer = async ({ resume, jobDescription }) => {
    // 1️⃣ Extract JD keywords (AI-powered)
    const jdKeywords = await extractJDKeywords(jobDescription);

    // 2️⃣ Extract resume keywords (local)
    const resumeSet = extractResumeKeywords(resume);

    // 3️⃣ Keyword matching
    const match = keywordMatch(jdKeywords, resumeSet);

    // 4️⃣ Bullet analysis
    const bullets = analyzeBullets(resume.experience);

    // 5️⃣ Metrics detection
    const metrics = detectMetrics(resume.experience);

    // 6️⃣ Section completeness
    const sections = checkSections(resume);

    // 7️⃣ ATS scoring
    const ats = calcATSScore({ match, bullets, metrics, sections });

    // 8️⃣ AI suggestions
    const suggestions = await buildSuggestions({ resume, missing: match.missing });

    return {
        atsScore: ats.total,
        breakdown: ats.breakdown,
        keywordMatch: match.percent,
        missingKeywords: match.missing,
        weakBullets: bullets.weak,
        metricsMissing: metrics.missing,
        sectionIssues: sections.missing,
        suggestions
    };
};
