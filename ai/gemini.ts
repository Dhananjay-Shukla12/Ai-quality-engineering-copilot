import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in .env");
}

const ai = new GoogleGenAI({
    apiKey
});

const DEFAULT_MODEL = "gemini-3.1-flash-lite";

type ResponseSchema = any;
type GeminiContents = any;

async function generateWithRetry(
    contents: GeminiContents,
    responseSchema: ResponseSchema,
    maxAttempts = 2,
    model = DEFAULT_MODEL
) {
    let lastError: unknown;

    for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt++
    ) {

        try {

            console.log(
                `Gemini attempt ${attempt}/${maxAttempts}...`
            );

            return await ai.models.generateContent({
                model,
                contents,
                config: {
                    responseMimeType: "application/json",
                    responseSchema
                }
            });

        } catch (error: any) {

            lastError = error;

            const status = error?.status;

            // Rate limit: do not immediately retry
            if (status === 429) {
                throw error;
            }

            // Only retry temporary service errors
            if (status !== 503) {
                throw error;
            }

            if (attempt === maxAttempts) {
                break;
            }

            const delay =
                1000 * 2 ** (attempt - 1);

            console.log(
                `Temporary Gemini error (${status}). ` +
                `Retrying in ${delay / 1000}s...`
            );

            await new Promise(resolve =>
                setTimeout(resolve, delay)
            );
        }
    }

    throw lastError;
}


export async function generateStructuredJson(
    prompt: string,
    responseSchema: ResponseSchema
) {
    const response =
        await generateWithRetry(
            prompt,
            responseSchema
        );

    if (!response.text) {
        throw new Error(
            "Gemini returned an empty response"
        );
    }

    return JSON.parse(response.text);
}


export async function generateStructuredFromContents(
    contents: GeminiContents,
    responseSchema: ResponseSchema
) {
    const response =
        await generateWithRetry(
            contents,
            responseSchema
        );

    if (!response.text) {
        throw new Error(
            "Gemini returned an empty response"
        );
    }

    return JSON.parse(response.text);
}