import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { testPlanSchema, TestPlan } from "./schemas";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in .env");
}

const ai = new GoogleGenAI({ apiKey });


async function generateWithRetry(
    ai: GoogleGenAI,
    prompt: string,
    maxAttempts = 4
) {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`Gemini attempt ${attempt}/${maxAttempts}...`);

            return await ai.models.generateContent({
                model: "gemini-3.8-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "object",
                        properties: {
                            testCases: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "string"
                                        },
                                        title: {
                                            type: "string"
                                        },
                                        type: {
                                            type: "string",
                                            enum: [
                                                "Positive",
                                                "Negative",
                                                "Edge"
                                            ]
                                        },
                                        priority: {
                                            type: "string",
                                            enum: [
                                                "High",
                                                "Medium",
                                                "Low"
                                            ]
                                        },
                                        steps: {
                                            type: "array",
                                            items: {
                                                type: "string"
                                            }
                                        },
                                        expectedResult: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "id",
                                        "title",
                                        "type",
                                        "priority",
                                        "steps",
                                        "expectedResult"
                                    ]
                                }
                            }
                        },
                        required: ["testCases"]
                    }
                }
            });

        } catch (error: any) {

            lastError = error;

            const status = error?.status;

            if (status !== 503 && status !== 429) {
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


export async function generateTestPlan(
    userStory: string
): Promise<TestPlan> {

    const prompt = `
    You are an expert QA engineer working on the SauceDemo web application.
    
    APPLICATION CONTEXT:
    - Application: SauceDemo
    - Login page is available
    - Product listing is available after successful login
    - Users can add products to cart
    - Users can complete checkout
    - Users can logout
    - There is no user registration flow
    - There is no account dashboard
    - Do not invent functionality that is not listed above
    
    TEST DATA:
    - Valid username: standard_user
    - Valid password: secret_sauce
    
    USER STORY:
    ${userStory}
    
    TASK:
    Generate practical and executable test cases based ONLY on:
    1. The user story
    2. The application context
    3. The available test data
    
    Generate:
    - Positive test cases
    - Negative test cases
    - Edge cases
    
    RULES:
    - Do not invent unavailable features.
    - Do not generate tests requiring user registration.
    - Do not generate tests requiring a dashboard.
    - Do not assume backend functionality that is not provided.
    - Keep every test case executable against the described application.
    `;

    const response = await generateWithRetry(ai, prompt);

    if (!response.text) {
        throw new Error("Gemini returned an empty response");
    }

    const parsed = JSON.parse(response.text);

    return testPlanSchema.parse(parsed);
}