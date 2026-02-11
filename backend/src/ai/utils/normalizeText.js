export const normalizeText = (text = "") => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim();
};
