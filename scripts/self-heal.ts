import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

import { analyzeFailure } from "../ai/failureAnalyzer";
import { repairPlaywrightTest } from "../ai/testRepairer";

const originalTest =
    "tests/generated/failure-demo.spec.ts";

const failureLogPath =
    "failure.log";

function runCommand(
    command: string,
    args: string[],
    env?: NodeJS.ProcessEnv
) {
    return spawnSync(command, args, {
        encoding: "utf-8",
        env: {
            ...process.env,
            ...env
        }
    });
}

function findLatestScreenshot(directory: string): string | null {

    if (!fs.existsSync(directory)) {
        return null;
    }

    let screenshots: {
        path: string;
        modified: number;
    }[] = [];

    function scan(currentDirectory: string) {

        const entries =
            fs.readdirSync(currentDirectory, {
                withFileTypes: true
            });

        for (const entry of entries) {

            const fullPath =
                path.join(
                    currentDirectory,
                    entry.name
                );

            if (entry.isDirectory()) {
                scan(fullPath);
                continue;
            }

            if (
                entry.isFile() &&
                entry.name.startsWith("test-failed-") &&
                entry.name.endsWith(".png")
            ) {
                screenshots.push({
                    path: fullPath,
                    modified:
                        fs.statSync(fullPath).mtimeMs
                });
            }
        }
    }

    scan(directory);

    if (screenshots.length === 0) {
        return null;
    }

    screenshots.sort(
        (a, b) => b.modified - a.modified
    );

    return screenshots[0].path;
}


async function main() {

    console.log("=================================");
    console.log("     AI QUALITY SELF-HEAL");
    console.log("=================================\n");


    // ------------------------------------------------
    // 1. Run the intentionally failing test
    // ------------------------------------------------

    console.log("1. Running test...\n");

    const testResult = runCommand(
        "npx",
        [
            "playwright",
            "test",
            originalTest,
            "--project=chromium"
        ],
        {
            AI_FAILURE_DEMO: "true"
        }
    );

    const failureLog =
        `${testResult.stdout}\n${testResult.stderr}`;

    fs.writeFileSync(
        failureLogPath,
        failureLog,
        "utf-8"
    );

    if (testResult.status === 0) {
        console.log(
            "Test passed unexpectedly."
        );

        return;
    }

    console.log(
        "Test failed. Starting analysis...\n"
    );


    // ------------------------------------------------
    // 2. Find latest screenshot
    // ------------------------------------------------

    const screenshotPath =
        findLatestScreenshot(
            "test-results"
        );

    if (!screenshotPath) {
        throw new Error(
            "Could not find Playwright failure screenshot."
        );
    }

    console.log(
        "Screenshot:",
        screenshotPath
    );


    // ------------------------------------------------
    // 3. Read test source
    // ------------------------------------------------

    const testCode =
        fs.readFileSync(
            originalTest,
            "utf-8"
        );


    // ------------------------------------------------
    // 4. AI Failure Analysis
    // ------------------------------------------------

    console.log(
        "\n2. Analyzing failure with AI...\n"
    );

    const analysis =
        await analyzeFailure(
            failureLog,
            testCode,
            screenshotPath
        );

    console.log(
        "Category:",
        analysis.category
    );

    console.log(
        "Root cause:",
        analysis.rootCause
    );

    console.log(
        "Suggested fix:",
        analysis.suggestedFix
    );


    // ------------------------------------------------
    // 5. AI Repair
    // ------------------------------------------------

    console.log(
        "\n3. Generating repaired test...\n"
    );

    const repaired =
        await repairPlaywrightTest(
            testCode,
            failureLog,
            analysis.suggestedFix
        );


    // ------------------------------------------------
    // 6. Save repaired test
    // ------------------------------------------------

    const repairedDirectory =
    path.resolve(
        "tests/generated"
    );

    fs.mkdirSync(
        repairedDirectory,
        {
            recursive: true
        }
    );

    const repairedTest =
        path.join(
            repairedDirectory,
            "failure-demo.auto-repaired.spec.ts"
        );

    fs.writeFileSync(
        repairedTest,
        repaired.repairedCode,
        "utf-8"
    );

    console.log(
        "Repaired test:",
        repairedTest
    );


    // ------------------------------------------------
    // 7. TypeScript validation
    // ------------------------------------------------

    console.log(
        "\n4. Validating repaired test...\n"
    );

    const typeCheck =
        runCommand(
            "npx",
            ["tsc", "--noEmit"]
        );

    if (typeCheck.status !== 0) {

        console.error(
            typeCheck.stdout
        );

        console.error(
            typeCheck.stderr
        );

        throw new Error(
            "Repaired test failed TypeScript validation."
        );
    }

    console.log(
        "TypeScript validation passed ✅"
    );


    // ------------------------------------------------
    // 8. Run repaired test
    // ------------------------------------------------

    console.log(
        "\n5. Running repaired test...\n"
    );

    const repairedResult =
        runCommand(
            "npx",
            [
                "playwright",
                "test",
                repairedTest,
                "--project=chromium"
            ]
        );

    console.log(
        repairedResult.stdout
    );

    console.error(
        repairedResult.stderr
    );


    if (repairedResult.status !== 0) {

        throw new Error(
            "AI repaired test still fails."
        );
    }

    console.log(
        "\n================================="
    );

    console.log(
        "AI SELF-HEAL SUCCESS ✅"
    );

    console.log(
        "================================="
    );
}


main().catch((error) => {

    console.error(
        "\nSelf-heal failed:"
    );

    console.error(error);

    process.exit(1);
});
