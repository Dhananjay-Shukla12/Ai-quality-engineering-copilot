import { generateStructuredFromContents } from "./gemini";
import { z } from "zod";
import * as fs from "node:fs";

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
- Use the screenshot as additional visual evidence when relevant.
- If evidence is insufficient, use "Unknown".
- Do not claim a product defect unless the evidence supports it.
`;

    const response =
        await generateStructuredFromContents(
            [
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
            {
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
        );

    return failureAnalysisSchema.parse(response);
}