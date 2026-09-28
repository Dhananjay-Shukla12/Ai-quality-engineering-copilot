import { generateStructuredJson } from "./gemini";
import { z } from "zod";

const repairedTestSchema = z.object({
    repairedCode: z.string()
});

export type RepairedTest = z.infer<
    typeof repairedTestSchema
>;

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

    const response = await generateStructuredJson(
        prompt,
        {
            type: "object",
            properties: {
                repairedCode: {
                    type: "string"
                }
            },
            required: ["repairedCode"]
        }
    );

    return repairedTestSchema.parse(response);
}