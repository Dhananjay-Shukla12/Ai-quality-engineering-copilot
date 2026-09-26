import { Page } from "@playwright/test";

export class ProductPage {
    constructor(private page: Page) {}

    async addBackpackToCart() {
        await this.page
            .getByRole("button", { name: "Add to cart" })
            .first()
            .click();
    }

    async openCart() {
        await this.page.locator(".shopping_cart_link").click();
    }
}