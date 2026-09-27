import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import userData from "../../test-data/users.json";

test("AI failure analysis demo", async ({ page }) => {

    test.skip(
        process.env.AI_FAILURE_DEMO !== "true",
        "Only used by the AI failure analyzer"
    );

    const loginPage = new LoginPage(page);

    await loginPage.open();

    await loginPage.login(
        userData.validUser.username,
        userData.validUser.password
    );

    await expect(page.locator(".title"))
        .toHaveText("THIS IS A WRONG TITLE");
});