/* ================================================================
   services/gemini.service.js
   Uses Google Generative AI (Gemini 1.5 Flash) to analyze 
   resumes against specific job roles.
================================================================ */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper to get keys from environment accurately
function getApiKeys() {
    const raw = process.env.GEMINI_API_KEY;
    if (!raw) return [];
    const keys = raw.split(',').map(k => k.trim()).filter(Boolean);
    console.log(`🔑 [Gemini Service] Loaded ${keys.length} API keys.`);
    return keys;
}

let keyIndex = 0;

/**
 * Calls Google Gemini API to analyze a resume.
 * Tries multiple model names and multiple API keys in case of quota issues.
 */
async function analyzeResume(resumeText, role = 'General Software Engineer', company = 'Nextern Profile') {
    const keys = getApiKeys();
    if (keys.length === 0) {
        throw new Error('GEMINI_API_KEY is not set in server/.env');
    }

    // List of models to try (some might have separate quotas or higher availability)
    const modelsToTry = [
        'gemini-2.0-flash',
        'gemini-pro',
        'gemini-1.5-flash',
        'gemini-2.5-flash'
    ];

    // Truncate resume text if it's abnormally long to save tokens
    const safeResumeText = resumeText.slice(0, 8000); 

    let lastError = null;

    // Outer loop: Try each API key
    for (let k = 0; k < keys.length; k++) {
        const currentKey = keys[keyIndex % keys.length];
        const genAI = new GoogleGenerativeAI(currentKey);

        // Inner loop: Try each model name for the current key
        for (const modelName of modelsToTry) {
            try {
                console.log(`🤖 [Gemini] Trying Key #${(keyIndex % keys.length) + 1} with model '${modelName}'...`);
                
                const model = genAI.getGenerativeModel({ model: modelName });

                const prompt = `
You are an expert placement consultant for Indian 
engineering students. Analyze this resume against 
the job requirements and return ONLY valid JSON.

Resume Text:
${safeResumeText}

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

                const result = await model.generateContent(prompt);
                const text = result.response.text();

                // Extract JSON
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error('Invalid JSON structure in AI response');

                const analysis = JSON.parse(jsonMatch[0]);

                // Fill missing fields
                const fields = ['matchScore', 'summary', 'presentSkills', 'missingSkills', 'resumeTips', 'studyTopics', 'strengths', 'improvements'];
                fields.forEach(f => {
                    if (analysis[f] === undefined) analysis[f] = f.includes('Score') ? 0 : (f === 'summary' ? 'Done.' : []);
                });

                console.log(`✅ [Gemini] SUCCESS with model '${modelName}'!`);
                return analysis;

            } catch (err) {
                const msg = err.message || '';
                console.error(`⚠️ [Gemini Fail] Key #${(keyIndex % keys.length) + 1} | Model '${modelName}': ${msg.slice(0, 100)}...`);
                lastError = err;

                // If it's a 404 (model not found), it won't work for this key/model, try next model
                if (msg.includes('404')) continue;
                
                // If it's a 429 (quota), try next model or next key
                if (msg.includes('429')) continue;

                // Other errors: try next model
                continue;
            }
        }

        // After trying all models for this key, move to next key
        keyIndex++;
    }

    throw new Error(`AI Analysis failed after trying all keys and models. Final error: ${lastError.message}`);
}

module.exports = {
    analyzeResume
};
