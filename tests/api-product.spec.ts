import { test, expect } from "@playwright/test";
import { ProductApi } from "../api/ProductApi";

test.describe("Product API Tests", () => {

    test("get product by id", async ({ request }) => {

        const productApi = new ProductApi(request);

        const response = await productApi.getProduct(1);

        expect(response.status()).toBe(200);

        const body = await response.json();

        expect(body.id).toBe(1);
        expect(body.title).toBeTruthy();
        expect(body.price).toBeGreaterThan(0);
    });


    test("search products", async ({ request }) => {

        const productApi = new ProductApi(request);

        const response =
            await productApi.searchProducts("phone");

        expect(response.status()).toBe(200);

        const body = await response.json();

        expect(body.products.length).toBeGreaterThan(0);
    });


    test("create product", async ({ request }) => {

        const productApi = new ProductApi(request);

        const response =
            await productApi.createProduct("Test Product");

        expect(response.status()).toBe(201);

        const body = await response.json();

        expect(body.title).toBe("Test Product");
        expect(body.id).toBeTruthy();
    });

});