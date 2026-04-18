/* ================================================================
   services/gemini.service.js
   Uses Google Generative AI (Gemini 1.5 Flash) to analyze 
   resumes against specific job roles.
================================================================ */

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Calls Google Gemini API to analyze a resume.
 * @param {string} resumeText - Plain text extracted from the PDF.
 * @param {string} role - The job role (e.g., "Software Engineer").
 * @param {string} company - The company name.
 * @returns {Promise<Object>} - Structured analysis result.
 */
async function analyzeResume(resumeText, role = 'General Software Engineer', company = 'Nextern Profile') {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set in server/.env');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are an expert placement consultant for Indian 
engineering students. Analyze this resume against 
the job requirements and return ONLY valid JSON.

Resume Text:
${resumeText}

Job: ${company} - ${role}

Return this exact JSON structure, no other text:
{
  "matchScore": 75,
  "summary": "One sentence summary of fit",
  "presentSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "resumeTips": ["tip1", "tip2", "tip3"],
  "studyTopics": ["DSA", "System Design"],
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}
`;

    try {
        console.log(`🤖 [Gemini] Generating analysis for ${company}...`);
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extract JSON from response (Gemini sometimes adds markdown blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI response did not contain valid JSON structure.');
        }

        const analysis = JSON.parse(jsonMatch[0]);

        // Basic validation of required fields
        const requiredFields = ['matchScore', 'summary', 'presentSkills', 'missingSkills', 'resumeTips', 'studyTopics', 'strengths', 'improvements'];
        for (const field of requiredFields) {
            if (analysis[field] === undefined) {
                analysis[field] = field.includes('Score') ? 0 : (field === 'summary' ? 'Analysis complete.' : []);
            }
        }

        return analysis;
    } catch (err) {
        console.error('❌ [Gemini Error]:', err.message);
        throw new Error(`AI Analysis failed: ${err.message}`);
    }
}

module.exports = {
    analyzeResume
};
