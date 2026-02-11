export async function exportResumeToPDF(resume) {
    // Return a placeholder buffer or path for development
    return { file: null, message: 'PDF export stub' };
}

export async function exportResumeToJSON(resume) {
    return JSON.stringify(resume, null, 2);
}
