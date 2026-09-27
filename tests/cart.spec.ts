import { test, expect } from "../fixtures/test-fixtures";
import { ProductPage } from "../pages/ProductPage";
import { CartPage } from "../pages/CartPage";

test("user can add product to cart @regression", async ({ loggedInPage }) => {

    const productPage = new ProductPage(loggedInPage);
    const cartPage = new CartPage(loggedInPage);

    await productPage.addBackpackToCart();
    await productPage.openCart();

    const productVisible =
        await cartPage.verifyProduct("Sauce Labs Backpack");

    expect(productVisible).toBeTruthy();
});