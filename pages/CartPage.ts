import { Page } from "@playwright/test";

export class CartPage {
    constructor(private page: Page) {}

    async verifyProduct(productName: string) {
        return this.page.getByText(productName).isVisible();
    }
}