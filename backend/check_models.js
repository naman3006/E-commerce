const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '/home/inextrix/Documents/E-commerce-new-feature/backend/.env' });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No GEMINI_API_KEY found in environment");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    /* 
       Note: The Node SDK doesn't have a direct 'listModels' method exposed on the convenient client yet 
       in some versions, or is on the model manager. 
       If this fails, we will try a fetch.
    */
    try {
        // Trying to fetch model info (workaround or standard way depending on version)
        // Actually, standard way is usually not exposed easily in simple client usage.
        // Let's test a few common names directly.
        const modelsToTest = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-002",
            "gemini-1.5-pro",
            "gemini-1.5-pro-001",
            "gemini-1.5-pro-002",
            "gemini-1.0-pro",
            "gemini-pro"
        ];

        console.log("Testing Model Availability...");

        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                // Try a super simple generation with 1 token output
                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
                    generationConfig: { maxOutputTokens: 1 }
                });
                await result.response;
                console.log(`✅ ${modelName} is AVAILABLE`);
            } catch (error) {
                if (error.message.includes('404')) {
                    console.log(`❌ ${modelName} NOT FOUND`);
                } else if (error.message.includes('429') || error.message.includes('Quota')) {
                    console.log(`⚠️ ${modelName} EXISTS but QUOTA EXCEEDED (Good for fallback)`);
                } else {
                    console.log(`❓ ${modelName} Error: ${error.message.split('\n')[0]}`);
                }
            }
        }

    } catch (error) {
        console.error("Error during check:", error);
    }
}

listModels();
