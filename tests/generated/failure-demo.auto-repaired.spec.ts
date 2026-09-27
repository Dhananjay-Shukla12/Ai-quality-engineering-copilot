import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import userData from "../../test-data/users.json";

test("AI failure analysis demo", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();

    await loginPage.login(
        userData.validUser.username,
        userData.validUser.password
    );

    await expect(page.locator(".title"))
        .toHaveText("Products");
});