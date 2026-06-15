import apiClient from '../axios';

export const ORDERS_API = {
    ENDPOINTS: {
        SUBMIT_ORDER: 'v1/cashier/submit-transaction',
        SAVE_VOID_ORDER: 'v1/cashier/save-void',
        UPDATE_ORDER_STATUS: 'v1/cashier/update-order-status',
        FETCH_CURRENT_ORDERS: 'v1/cashier/current-orders',
        FETCH_ORDER_STATUS: 'v1/cashier/order-status',
        FETCH_ORDER_DETAILS: 'v1/cashier/order-details',
        FETCH_ORDER_TEMP: 'v1/cashier/order-details-temp',
        FETCH_QR_CODE: 'v1/cashier/get-qr-code',
        FETCH_VOID_ORDERS: 'v1/cashier/void-orders',
    },

    async fetchAllCurrentOrdersApi() {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
            };
            const response = await apiClient.get(
                `${this.ENDPOINTS.FETCH_CURRENT_ORDERS}`,
                config
            );

            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[ORDERS_API] Error fetching current orders:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch current orders'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async fetchAllOrderStatusApi() {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
            };
            const response = await apiClient.get(
                `${this.ENDPOINTS.FETCH_ORDER_STATUS}`,
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[ORDERS_API] Error fetching order status:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch order status'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async updateOrderStatusApi(referenceNumber, orderStatus) {
        if (!referenceNumber || !orderStatus) {
            throw new Error('Invalid referenceNumber or orderStatus');
        }
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            };
            const response = await apiClient.put(
                `${this.ENDPOINTS.UPDATE_ORDER_STATUS}`,
                { referenceNumber, orderStatus }, // Send direct payload without transactions wrapper
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[ORDERS_API] Error updating order orderStatus:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to update order orderStatus'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async submitTransactionApi(formData) {
        if (!(formData instanceof FormData)) {
            throw new Error("submitTransactionApi requires FormData");
        }
        try {
            const authToken = localStorage.getItem("auth_token");
            if (!authToken) {
                throw new Error("No authentication token found");
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "multipart/form-data", // ✅ important
                },
            };
            const response = await apiClient.post(this.ENDPOINTS.SUBMIT_ORDER, formData, config);
            if (!response.data) {
                throw new Error("Invalid response from server");
            }
            return response.data;
        } catch (error) {
            console.error("[ORDERS_API] Error submitting data:", error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to submit transaction data";
            const enhancedError = new Error(errorMessage);
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async fetchOrderDetailsApi(referenceNumber) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'multipart/form-data'
                },
            };
            const response = await apiClient.get(
                `${this.ENDPOINTS.FETCH_ORDER_DETAILS}/${referenceNumber}`,
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[ORDERS_API] Error fetching order status:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch order status'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async fetchOrderDetailsTempApi(referenceNumber) {
        try {
            const response = await apiClient.get(
                `${this.ENDPOINTS.FETCH_ORDER_TEMP}/${referenceNumber}`,
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[ORDERS_API] Error fetching order status:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch order status'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async fetchOrderQRcodeTempApi(referenceNumber) {
        try {
            const config = {
                responseType: 'blob',
            };
            const response = await apiClient.get(
                `${this.ENDPOINTS.FETCH_QR_CODE}/${referenceNumber}`,
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[ORDERS_API] Error fetching order status:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch order status'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async fetchVoidOrderApi() {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
            };
            const response = await apiClient.get(
                `${this.ENDPOINTS.FETCH_VOID_ORDERS}`,
                config
            );

            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[ORDERS_API] Error fetching void orders:', error);
            const enhancedError = new Error(
                error.response?.data?.message ||
                error.message ||
                'Failed to fetch void orders'
            );
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

    async saveVoidOrderApi(payload) {
        if (!payload || !payload.reference_number || !payload.table_number) {
            throw new Error('Invalid void data');
        }
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                throw new Error('No authentication token found');
            }
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            };
            const response = await apiClient.post(
                this.ENDPOINTS.SAVE_VOID_ORDER,
                payload,
                config
            );
            if (!response.data) {
                throw new Error('Invalid response from server');
            }
            return response.data;
        } catch (error) {
            console.error('[ORDERS_API] Error saving data:', error);
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Failed to save void data';
            const enhancedError = new Error(errorMessage);
            enhancedError.response = error.response;
            enhancedError.status = error.response?.status;
            throw enhancedError;
        }
    },

};