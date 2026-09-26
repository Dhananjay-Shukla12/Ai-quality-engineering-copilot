import { test as base, expect, Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import userData from "../test-data/users.json";

type Fixtures = {
    loggedInPage: Page;
};

export const test = base.extend<Fixtures>({
    loggedInPage: async ({ page }, use) => {

        const loginPage = new LoginPage(page);

        await loginPage.open();

        await loginPage.login(
            userData.validUser.username,
            userData.validUser.password
        );

        await use(page);
    }
});

export { expect };