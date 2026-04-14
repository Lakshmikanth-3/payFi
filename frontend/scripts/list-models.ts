import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No GEMINI_API_KEY found in .env.local");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    try {
        console.log("Fetching available models...");
        // Use the native fetch to list models as the SDK's listModels might be version-locked
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        
        if (data.error) {
            console.error("API Error:", data.error);
            return;
        }

        console.log("Available Gemini Models:");
        data.models.forEach((m: any) => {
            console.log(`- ${m.name} (${m.displayName})`);
        });
    } catch (err) {
        console.error("Error listing models:", err);
    }
}

listModels();
