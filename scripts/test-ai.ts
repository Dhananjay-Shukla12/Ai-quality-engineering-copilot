import { askGemini } from "../ai/gemini";

async function main() {
    console.log("Calling Gemini...");

    const response = await askGemini(
        "Give me 3 simple login test cases. Keep each one in a single line."
    );

    console.log("\nGemini response:\n");
    console.log(response);
}

main().catch((error) => {
    console.error("\nAI test failed:");
    console.error(error);
    process.exit(1);
});