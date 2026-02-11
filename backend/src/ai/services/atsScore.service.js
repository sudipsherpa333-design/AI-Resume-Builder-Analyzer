import { WEIGHTS } from "../utils/weights.js";

export const calcATSScore = ({ match, bullets, metrics, sections }) => {
    const keywordScore = (match.percent || 0) * WEIGHTS.keyword;
    const bulletScore = Math.max(0, 20 - (bullets.weak?.length || 0) * 2);
    const metricScore = Math.min((metrics.count || 0) * 2, 10);
    const sectionScore = 10 - (sections.missing?.length || 0) * 2;

    const total = Math.min(100, Math.round(keywordScore + bulletScore + metricScore + sectionScore));

    return {
        total,
        breakdown: {
            keywordScore,
            bulletScore,
            metricScore,
            sectionScore
        }
    };
};
