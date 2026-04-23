const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './server/.env' });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY.split(',')[0].trim();
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // There is no direct listModels in the JS SDK usually, it's via the client.
        // But we can try a simple generation with a known model to see if it works.
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('hi');
        console.log('Gemini 1.5 Flash worked:', result.response.text());
    } catch (e) {
        console.error('Gemini 1.5 Flash failed:', e.message);
        
        try {
            const model2 = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const result2 = await model2.generateContent('hi');
            console.log('Gemini Pro worked:', result2.response.text());
        } catch (e2) {
            console.error('Gemini Pro failed:', e2.message);
        }
    }
}

listModels();
