import { analyzeFailure } from "../ai/failureAnalyzer";
import * as fs from "fs";

async function main() {

    const failureLog =
        fs.readFileSync(
            "failure.log",
            "utf-8"
        );

    const testCode =
        fs.readFileSync(
            "tests/generated/failure-demo.spec.ts",
            "utf-8"
        );

    console.log("Analyzing Playwright failure...\n");

    const screenshotPath =
    "test-results/generated-failure-demo-AI-failure-analysis-demo-chromium/test-failed-1.png";

    const analysis =
    await analyzeFailure(
        failureLog,
        testCode,
        screenshotPath
    );

    console.log("\n=== AI FAILURE ANALYSIS ===\n");

    console.log(
        JSON.stringify(
            analysis,
            null,
            2
        )
    );
}

main().catch((error) => {

    console.error(
        "\nFailure analysis failed:"
    );

    console.error(error);

    process.exit(1);
});