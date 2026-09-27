import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in .env");
}

const ai = new GoogleGenAI({
    apiKey
});

export async function askGemini(prompt: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
    });

    if (!response.text) {
        throw new Error("Gemini returned an empty response");
    }

    return response.text;
}