const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '/home/inextrix/Documents/E-commerce-new-feature/backend/.env' });

async function verify() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    const models = [
        'gemma-3-1b-it',
        'gemma-3-4b-it',
        'gemma-3-12b-it',
        'gemma-3-27b-it',
        'gecko-1.0', // Sometimes available?
        'gemini-2.0-flash-exp'
    ];

    console.log("Starting Multi-Model Verification...");

    for (const modelName of models) {
        try {
            console.log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'Hello' if you work.");
            const response = await result.response;
            console.log(`✅ SUCCESS with ${modelName}:`, response.text());
            return; // Stop on first success
        } catch (error) {
            if (error.message.includes('429') || error.message.includes('Quota')) {
                console.log(`⚠️ ${modelName} Quota Exceeded.`);
            } else if (error.message.includes('404')) {
                console.log(`❌ ${modelName} Not Found.`);
            } else {
                console.log(`❓ ${modelName} Error:`, error.message.split('\n')[0]);
            }
        }
    }
    console.log("❌ ALL MODELS FAILED.");
}

verify();
