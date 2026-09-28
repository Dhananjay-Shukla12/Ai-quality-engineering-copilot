import { generateStructuredJson } from "./gemini";
import { testPlanSchema, TestPlan } from "./schemas";

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

    const response = await generateStructuredJson(
        prompt,
        {
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
    );

    return testPlanSchema.parse(response);
}