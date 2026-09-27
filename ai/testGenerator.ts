import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import {
    generatedTestSuiteSchema,
    GeneratedTestSuite,
    TestPlan
} from "./schemas";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in .env");
}

const ai = new GoogleGenAI({ apiKey });


async function generateWithRetry(
    prompt: string,
    maxAttempts = 2
) {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(
                `Gemini code generation attempt ${attempt}/${maxAttempts}...`
            );

            return await ai.models.generateContent({
                model: "gemini-3.1-flash-lite",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "object",
                        properties: {
                            fileName: {
                                type: "string"
                            },
                            testCode: {
                                type: "string"
                            }
                        },
                        required: [
                            "fileName",
                            "testCode"
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


export async function generatePlaywrightSuite(
    testPlan: TestPlan
): Promise<GeneratedTestSuite> {

    const testCases = JSON.stringify(
        testPlan,
        null,
        2
    );

    const prompt = `
You are an expert Playwright TypeScript automation engineer.

Generate ONE Playwright test file containing automated tests
for ALL test cases provided below.

APPLICATION:
SauceDemo

FRAMEWORK:
Playwright + TypeScript

AVAILABLE PAGE OBJECT:
LoginPage

LoginPage methods:
- open()
- login(username: string, password: string)
- getErrorMessage()

AVAILABLE TEST DATA:
- userData.validUser.username
- userData.validUser.password
- userData.wrongPasswordUser.username
- userData.wrongPasswordUser.password
- userData.invalidUser.username
- userData.invalidUser.password
- userData.emptyUsernameUser.username
- userData.emptyUsernameUser.password
- userData.emptyPasswordUser.username
- userData.emptyPasswordUser.password

AVAILABLE IMPORTS:
import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import userData from "../../test-data/users.json";

IMPORTANT RULES:

1. Generate valid TypeScript.
2. Generate ONE .spec.ts file.
3. Put ALL provided test cases into that file.
4. Use Playwright's test() and expect().
5. Use the existing LoginPage class.
6. Do not invent Page Object methods.
7. Do not invent application functionality.
8. Do not use Markdown code fences.
9. Keep the tests independent.
10. Use the provided test data wherever appropriate.
11. For invalid-password tests use wrongPasswordUser data.
12. For invalid-username tests use invalidUser data.
13. For empty username tests use emptyUsernameUser data.
14. For empty password tests use emptyPasswordUser data.
15. Do not use hardcoded credentials when matching test data exists.
16. The generated file will be placed inside:
    tests/generated/
17. Therefore imports must use:
    ../../pages/LoginPage
    ../../test-data/users.json

TEST PLAN:
${testCases}
`;

    const response = await generateWithRetry(prompt);

    if (!response.text) {
        throw new Error(
            "Gemini returned an empty response"
        );
    }

    const parsed = JSON.parse(response.text);

    return generatedTestSuiteSchema.parse(parsed);
}