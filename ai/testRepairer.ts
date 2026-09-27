import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { z } from "zod";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in .env");
}

const ai = new GoogleGenAI({ apiKey });

const repairedTestSchema = z.object({
    repairedCode: z.string()
});

export type RepairedTest = z.infer<
    typeof repairedTestSchema
>;

async function generateWithRetry(
    prompt: string,
    maxAttempts = 2
) {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(
                `Gemini repair attempt ${attempt}/${maxAttempts}...`
            );

            return await ai.models.generateContent({
                model: "gemini-3.1-flash-lite",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "object",
                        properties: {
                            repairedCode: {
                                type: "string"
                            }
                        },
                        required: ["repairedCode"]
                    }
                }
            });

        } catch (error: any) {
            lastError = error;

            const status = error?.status;

            if (status === 429) {
                throw error;
            }

            if (status !== 503) {
                throw error;
            }

            if (attempt === maxAttempts) {
                break;
            }

            const delay = 1000 * 2 ** (attempt - 1);

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

export async function repairPlaywrightTest(
    testCode: string,
    failureLog: string,
    suggestedFix: string
): Promise<RepairedTest> {

    const prompt = `
You are an expert Playwright TypeScript engineer.

Repair the failing Playwright test using ONLY the
provided test code, failure log, and suggested fix.

TEST CODE:
${testCode}

FAILURE LOG:
${failureLog}

SUGGESTED FIX:
${suggestedFix}

RULES:
- Return only valid TypeScript code inside repairedCode.
- Preserve the existing test purpose.
- Make the smallest necessary change.
- ../../pages/LoginPage
- ../../test-data/users.json
- Do not invent new application functionality.
- Do not invent new Page Object methods.
- Keep existing imports unless a change is necessary.
- Keep the existing LoginPage and test-data architecture.
- Remove any AI_FAILURE_DEMO test.skip condition from the repaired code.
- Do not add explanations.
- Do not use markdown code fences.
`;

    const response =
        await generateWithRetry(prompt);

    if (!response.text) {
        throw new Error(
            "Gemini returned an empty repair response"
        );
    }

    const parsed =
        JSON.parse(response.text);

    return repairedTestSchema.parse(parsed);
}