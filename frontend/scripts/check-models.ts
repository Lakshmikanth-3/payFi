import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

async function checkModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API key found in .env.local");
        return;
    }

    // const genAI = new GoogleGenerativeAI(key); // Not used in this version of the script
    
    try {
        console.log("Fetching available models...");
        // Use the native fetch to see what the API returns directly
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        
        if (data.error) {
            console.error("API Error:", data.error.message);
            return;
        }

        console.log("\nAvailable Models for your Key:");
        data.models.forEach((m: { name: string; displayName?: string }) => {
            console.log(`- ${m.name} (${m.displayName || 'No display name'})`);
        });
    } catch (err) {
        console.error("Failed to fetch models:", err);
    }
}

checkModels();
