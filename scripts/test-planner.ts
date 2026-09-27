import { generateTestPlan } from "../ai/testPlanner";

async function main() {

    const userStory = `
    As a user,
    I want to login using my username and password
    so that I can access my account.
    `;

    console.log("Generating test plan...\n");

    const result = await generateTestPlan(userStory);

    console.log(
        JSON.stringify(result, null, 2)
    );
}

main().catch((error) => {
    console.error("Test planner failed:");
    console.error(error);
    process.exit(1);
});