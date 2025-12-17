// src/api/paymentApi.js
import apiClient from '../axios';

export const EWALLET_PAYMENT_API = {
    ENDPOINTS: {
        CREATE_PAYMENT_INTENT: '/payment-intents',
        ATTACH_PAYMENT_METHOD: '/payment-intents/attach', // new backend endpoint
    },

    async createPaymentIntentApi(amountInCentavos) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) throw new Error('No authentication token found');

            const response = await apiClient.post(
                this.ENDPOINTS.CREATE_PAYMENT_INTENT,
                { amount: amountInCentavos },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            return response.data;
        } catch (error) {
            console.error('PaymentIntent API error:', error);
            throw error;
        }
    },

    async attachPaymentMethod(paymentIntentId, methodType, billing) {
        try {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) throw new Error('No authentication token found');

            const response = await apiClient.post(
                this.ENDPOINTS.ATTACH_PAYMENT_METHOD,
                {
                    payment_intent_id: paymentIntentId,
                    type: methodType, // e.g., 'gcash', 'paymaya', 'qrph'
                    billing,          // { name, email, phone }
                },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            return response.data;
        } catch (error) {
            console.error('AttachPaymentMethod API error:', error);
            throw error;
        }
    },
};
