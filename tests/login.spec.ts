import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import userData from "../test-data/users.json";

test.describe("Login Tests", () => {

    test("valid login @smoke @regression", async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.open();

        await loginPage.login(
            userData.validUser.username,
            userData.validUser.password
        );

        await expect(page.locator(".title"))
            .toHaveText("Products");
    });


    test("login with wrong password @regression", async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.open();

        await loginPage.login(
            userData.wrongPasswordUser.username,
            userData.wrongPasswordUser.password
        );

        await expect(
            loginPage.getErrorMessage()
        ).toContainText("Username and password do not match");
    });


    test("login with invalid username @regression", async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.open();

        await loginPage.login(
            userData.invalidUser.username,
            userData.invalidUser.password
        );

        await expect(
            loginPage.getErrorMessage()
        ).toContainText("Username and password do not match");
    });


    test("login with empty username @regression", async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.open();

        await loginPage.login(
            userData.emptyUsernameUser.username,
            userData.emptyUsernameUser.password
        );

        await expect(
            loginPage.getErrorMessage()
        ).toContainText("Username is required");
    });


    test("login with empty password @regression", async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.open();

        await loginPage.login(
            userData.emptyPasswordUser.username,
            userData.emptyPasswordUser.password
        );

        await expect(
            loginPage.getErrorMessage()
        ).toContainText("Password is required");
    });

});