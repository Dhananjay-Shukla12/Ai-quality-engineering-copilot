import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { analyzeFailure } from "../ai/failureAnalyzer";

async function main() {

    const testPath =
        "tests/generated/failure-demo.spec.ts";

    console.log("Running Playwright failure demo...\n");

    const result = spawnSync(
        "npx",
        [
            "playwright",
            "test",
            testPath,
            "--project=chromium"
        ],
        {
            encoding: "utf-8",
            env: {
                ...process.env,
                AI_FAILURE_DEMO: "true"
            }
        }
    );

    const failureLog =
        `${result.stdout}\n${result.stderr}`;

    fs.writeFileSync(
        "failure.log",
        failureLog,
        "utf-8"
    );

    if (result.status === 0) {
        console.log("Test unexpectedly passed.");
        process.exit(0);
    }

    console.log("Test failed as expected.\n");

    const testResultsDir =
        path.resolve("test-results");

    const screenshotFiles: string[] = [];

    function findScreenshots(directory: string) {

        if (!fs.existsSync(directory)) {
            return;
        }

        const entries =
            fs.readdirSync(directory, {
                withFileTypes: true
            });

        for (const entry of entries) {

            const fullPath =
                path.join(directory, entry.name);

            if (entry.isDirectory()) {
                findScreenshots(fullPath);
            }

            if (
                entry.isFile() &&
                entry.name.startsWith("test-failed-") &&
                entry.name.endsWith(".png")
            ) {
                screenshotFiles.push(fullPath);
            }
        }
    }

    findScreenshots(testResultsDir);

    if (screenshotFiles.length === 0) {
        throw new Error(
            "No Playwright failure screenshot found."
        );
    }

    const screenshotPath =
        screenshotFiles[screenshotFiles.length - 1];

    console.log("Screenshot found:");
    console.log(screenshotPath);

    const testCode =
        fs.readFileSync(
            testPath,
            "utf-8"
        );

    console.log("\nSending failure to Gemini...\n");

    const analysis =
        await analyzeFailure(
            failureLog,
            testCode,
            screenshotPath
        );

    console.log(
        "\n=== AI FAILURE ANALYSIS ===\n"
    );

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