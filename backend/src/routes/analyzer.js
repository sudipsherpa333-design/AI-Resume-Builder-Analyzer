const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const admin = require('firebase-admin');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/analyze', async (req, res) => {
    const { uid, resumeText, jobDescription, options = {} } = req.body;

    if (!uid || !resumeText || !jobDescription) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = `You are a world-class resume analyst. Analyze this resume against the job description.

Return ONLY valid JSON with:
{
  "overallScore": number (0-100),
  "atsScore": number (0-100),
  "keywordScore": number (0-100),
  "missingKeywords": string[],
  "strengths": string[],
  "improvements": [{ "original": string, "suggested": string, "reason": string }],
  "recommendations": string[],
  "summary": string
}

Job Description:
${jobDescription}

Resume:
${resumeText}`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const result = JSON.parse(completion.choices[0].message.content);

        // Save to Firestore
        const reportRef = await admin.firestore().collection('analysisReports').add({
            uid,
            jobDescription: jobDescription.substring(0, 100),
            resumeText: resumeText.substring(0, 500),
            result,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            options,
        });

        res.json({ id: reportRef.id, ...result });
    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ error: 'Analysis failed' });
    }
});

module.exports = router;