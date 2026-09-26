import { APIRequestContext } from "@playwright/test";

export class ProductApi {
    constructor(private request: APIRequestContext) {}

    async getProduct(productId: number) {
        return await this.request.get(
            `https://dummyjson.com/products/${productId}`
        );
    }

    async searchProducts(query: string) {
        return await this.request.get(
            "https://dummyjson.com/products/search",
            {
                params: {
                    q: query
                }
            }
        );
    }

    async createProduct(title: string) {
        return await this.request.post(
            "https://dummyjson.com/products/add",
            {
                data: {
                    title
                }
            }
        );
    }
}