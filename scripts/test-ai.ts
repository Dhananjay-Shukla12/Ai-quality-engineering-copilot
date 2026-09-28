import { generateStructuredJson } from "../ai/gemini";

async function main() {

    const prompt = `
Give me exactly 3 simple login test cases.
Return them as JSON:
{
  "tests": [
    "test 1",
    "test 2",
    "test 3"
  ]
}
`;

    const response = await generateStructuredJson(
        prompt,
        {
            type: "object",
            properties: {
                tests: {
                    type: "array",
                    items: {
                        type: "string"
                    }
                }
            },
            required: ["tests"]
        }
    );

    console.log(
        JSON.stringify(response, null, 2)
    );
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});