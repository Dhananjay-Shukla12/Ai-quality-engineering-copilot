import { test, expect } from "../fixtures/test-fixtures";

test("product page is visible", async ({ loggedInPage }) => {

    await expect(
        loggedInPage.locator(".title")
    ).toHaveText("Products");

});