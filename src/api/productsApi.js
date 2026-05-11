import apiClient from '../axios';
import { useAuthStore } from '@/stores/auth';

export const PRODUCTS_API = {
    ENDPOINTS: {
        FETCH_PRODUCTS: 'v1/cashier/products',
        FETCH_CATEGORIES: 'v1/cashier/product-category-option',
    },

    async fetchAllProductsApi() {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }

            const authStore = useAuthStore();
            const shop_id = authStore.shopId;
            const branch_id = authStore.branchId;
            const params = {
                shop_id: shop_id,
                branch_id: branch_id,
            };

            const config = {
                params: params,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
            };
            const response = await apiClient.get(
                `${this.ENDPOINTS.FETCH_PRODUCTS}`,
                config
            );

            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[PRODUCTS_API] Error fetching products:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch products'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async fetchAllCategoriesApi() {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }

            const authStore = useAuthStore();
            const shop_id = authStore.shopId;
            const params = {
                shop_id: shop_id,
            };

            const config = {
                params: params,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
            };
            const response = await apiClient.get(
                this.ENDPOINTS.FETCH_CATEGORIES,
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[API] Error fetching stocks:', error);

            const enhancedError = new Error('Failed to fetch categpries');
            throw enhancedError;
        }
    },
};