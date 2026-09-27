import { generateTestPlan } from "../ai/testPlanner";
import { generatePlaywrightSuite } from "../ai/testGenerator";
import * as fs from "fs";
import * as path from "path";

async function main() {

    const userStory = `
    As a user,
    I want to login using my username and password
    so that I can access the SauceDemo application.
    `;

    console.log("Generating AI test plan...\n");

    const testPlan = await generateTestPlan(userStory);

    console.log(
        `Generated ${testPlan.testCases.length} test cases.`
    );

    console.log("\nGenerating Playwright test suite...\n");

    const generatedSuite =
        await generatePlaywrightSuite(testPlan);

    const outputDirectory =
        path.resolve("tests/generated");

    fs.mkdirSync(outputDirectory, {
        recursive: true
    });

    const safeFileName =
        path.basename(generatedSuite.fileName);

    if (!safeFileName.endsWith(".spec.ts")) {
        throw new Error(
            "Generated file must have a .spec.ts extension"
        );
    }

    const outputPath =
        path.join(
            outputDirectory,
            safeFileName
        );

    fs.writeFileSync(
        outputPath,
        generatedSuite.testCode,
        "utf-8"
    );

    console.log("Generated Playwright suite:");
    console.log(outputPath);
}

main().catch((error) => {
    console.error("\nAI pipeline failed:");
    console.error(error);
    process.exit(1);
});