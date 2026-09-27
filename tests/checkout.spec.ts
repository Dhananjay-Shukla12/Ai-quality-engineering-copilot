import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ProductPage } from "../pages/ProductPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import userData from "../test-data/users.json";

test("user can complete checkout @smoke @regression", async ({ page }) => {

    const loginPage = new LoginPage(page);
    const productPage = new ProductPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.open();

    await loginPage.login(
        userData.validUser.username,
        userData.validUser.password
    );

    await productPage.addBackpackToCart();
    await productPage.openCart();

    await checkoutPage.startCheckout();

    await checkoutPage.enterCustomerDetails(
        userData.validUser.username,
        userData.validUser.lastName,
        userData.validUser.postalCode
    );

    await checkoutPage.finishOrder();

    await expect(
        page.getByText("Thank you for your order!")
    ).toBeVisible();
});