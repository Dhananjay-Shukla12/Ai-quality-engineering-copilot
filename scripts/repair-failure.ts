import { repairPlaywrightTest } from "../ai/testRepairer";
import * as fs from "node:fs";
import * as path from "node:path";

async function main() {

    const testPath =
        "tests/generated/failure-demo.spec.ts";

    const failureLog =
        fs.readFileSync(
            "failure.log",
            "utf-8"
        );

    const testCode =
        fs.readFileSync(
            testPath,
            "utf-8"
        );

    const suggestedFix = `
Change the incorrect expected title
from "THIS IS A WRONG TITLE"
to "Products".
`;

    console.log(
        "Generating repaired Playwright test...\n"
    );

    const result =
        await repairPlaywrightTest(
            testCode,
            failureLog,
            suggestedFix
        );

    const repairDirectory =
        path.resolve("tests/generated");

    fs.mkdirSync(
        repairDirectory,
        { recursive: true }
    );

    const outputPath =
        path.join(
            repairDirectory,
            "failure-demo.repaired.spec.ts"
        );

    fs.writeFileSync(
        outputPath,
        result.repairedCode,
        "utf-8"
    );

    console.log(
        "Repaired test created:"
    );

    console.log(outputPath);
}

main().catch((error) => {
    console.error(
        "\nRepair failed:"
    );

    console.error(error);

    process.exit(1);
});