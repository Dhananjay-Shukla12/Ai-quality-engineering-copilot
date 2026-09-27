import { z } from "zod";

export const testCaseSchema = z.object({
    id: z.string(),
    title: z.string(),
    type: z.enum(["Positive", "Negative", "Edge"]),
    priority: z.enum(["High", "Medium", "Low"]),
    steps: z.array(z.string()),
    expectedResult: z.string()
});

export const testPlanSchema = z.object({
    testCases: z.array(testCaseSchema)
});

export type TestPlan = z.infer<typeof testPlanSchema>;

export const generatedTestSchema = z.object({
    fileName: z.string(),
    testCode: z.string()
});

export type GeneratedTest = z.infer<typeof generatedTestSchema>;

export const generatedTestSuiteSchema = z.object({
    fileName: z.string(),
    testCode: z.string()
});

export type GeneratedTestSuite = z.infer<
    typeof generatedTestSuiteSchema
>;