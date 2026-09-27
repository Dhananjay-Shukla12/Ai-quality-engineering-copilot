import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { z } from "zod";
import * as fs from "node:fs";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in .env");
}

const ai = new GoogleGenAI({ apiKey });

const failureAnalysisSchema = z.object({
    category: z.enum([
        "Locator Issue",
        "Assertion Failure",
        "Test Data Issue",
        "Application/API Issue",
        "Timeout",
        "Unknown"
    ]),
    rootCause: z.string(),
    evidence: z.array(z.string()),
    suggestedFix: z.string(),
    confidence: z.number().min(0).max(1)
});

export type FailureAnalysis = z.infer<
    typeof failureAnalysisSchema
>;


// async function analyzeWithRetry(
//     prompt: string,
//     maxAttempts = 2
// ) {
//     let lastError: unknown;

//     for (let attempt = 1; attempt <= maxAttempts; attempt++) {

//         try {

//             console.log(
//                 `Gemini failure analysis attempt ${attempt}/${maxAttempts}...`
//             );

//             return await ai.models.generateContent({
//                 model: "gemini-3.1-flash-lite",
//                 contents: prompt,
//                 config: {
//                     responseMimeType: "application/json",
//                     responseSchema: {
//                         type: "object",
//                         properties: {
//                             category: {
//                                 type: "string",
//                                 enum: [
//                                     "Locator Issue",
//                                     "Assertion Failure",
//                                     "Test Data Issue",
//                                     "Application/API Issue",
//                                     "Timeout",
//                                     "Unknown"
//                                 ]
//                             },
//                             rootCause: {
//                                 type: "string"
//                             },
//                             evidence: {
//                                 type: "array",
//                                 items: {
//                                     type: "string"
//                                 }
//                             },
//                             suggestedFix: {
//                                 type: "string"
//                             },
//                             confidence: {
//                                 type: "number"
//                             }
//                         },
//                         required: [
//                             "category",
//                             "rootCause",
//                             "evidence",
//                             "suggestedFix",
//                             "confidence"
//                         ]
//                     }
//                 }
//             });

//         } catch (error: any) {

//             lastError = error;

//             const status = error?.status;

//             if (status === 429) {
//                 throw error;
//             }

//             if (status !== 503) {
//                 throw error;
//             }

//             if (attempt === maxAttempts) {
//                 break;
//             }

//             const delay = 1000 * 2 ** (attempt - 1);

//             console.log(
//                 `Temporary Gemini error (${status}). ` +
//                 `Retrying in ${delay / 1000}s...`
//             );

//             await new Promise(resolve =>
//                 setTimeout(resolve, delay)
//             );
//         }
//     }

//     throw lastError;
// }
async function analyzeWithRetry(
    prompt: string,
    screenshotBase64: string,
    maxAttempts = 2
) {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(
                `Gemini failure analysis attempt ${attempt}/${maxAttempts}...`
            );

            return await ai.models.generateContent({
                model: "gemini-3.1-flash-lite",
                contents: [
                    {
                        inlineData: {
                            mimeType: "image/png",
                            data: screenshotBase64
                        }
                    },
                    {
                        text: prompt
                    }
                ],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "object",
                        properties: {
                            category: {
                                type: "string",
                                enum: [
                                    "Locator Issue",
                                    "Assertion Failure",
                                    "Test Data Issue",
                                    "Application/API Issue",
                                    "Timeout",
                                    "Unknown"
                                ]
                            },
                            rootCause: {
                                type: "string"
                            },
                            evidence: {
                                type: "array",
                                items: {
                                    type: "string"
                                }
                            },
                            suggestedFix: {
                                type: "string"
                            },
                            confidence: {
                                type: "number"
                            }
                        },
                        required: [
                            "category",
                            "rootCause",
                            "evidence",
                            "suggestedFix",
                            "confidence"
                        ]
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

export async function analyzeFailure(
    failureLog: string,
    testCode: string,
    screenshotPath: string
): Promise<FailureAnalysis> {
    const screenshotBase64 = fs.readFileSync(
        screenshotPath,
        { encoding: "base64" }
    );
    const prompt = `
You are an expert Quality Engineering failure-analysis assistant.

Analyze the Playwright test failure below.

APPLICATION:
SauceDemo

TEST CODE:
${testCode}

FAILURE LOG:
${failureLog}

Your job:

1. Identify the most likely failure category.
2. Determine the likely root cause.
3. Provide evidence from the failure log.
4. Suggest a practical fix.
5. Give a confidence value between 0 and 1.

Important:
- Do not invent evidence.
- Base your analysis only on the provided test code and failure log.
- If evidence is insufficient, use "Unknown".
- Do not claim a product defect unless the evidence supports it.
`;

const response =
await analyzeWithRetry(
    prompt,
    screenshotBase64
);

    if (!response.text) {
        throw new Error(
            "Gemini returned an empty response"
        );
    }

    const parsed = JSON.parse(response.text);

    return failureAnalysisSchema.parse(parsed);
}