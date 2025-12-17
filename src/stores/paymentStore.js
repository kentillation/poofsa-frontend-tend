// src/stores/paymentStore.js
import { defineStore } from 'pinia';
import { EWALLET_PAYMENT_API } from '@/api/paymentApi';

export const usePaymentStore = defineStore('payment', {
    state: () => ({
        loading: false,
        error: null,
        paymentModeOptions: [],
        paymentIntent: null,
        redirectUrl: null, // for GCash/PayMaya checkout page
    }),

    actions: {
        // async fetchAllOptions() {
        //     this.loading = true;
        //     try {
        //         const [paymentModes] = await Promise.all([
        //             this.fetchOptions('/open/payment-mode-option'),
        //         ]);
        //         this.paymentModeOptions = paymentModes;
        //     } catch (error) {
        //         this.error = error;
        //         console.error(error);
        //     } finally {
        //         this.loading = false;
        //     }
        // },

        async createPaymentIntentStore(amountInCentavos) {
            this.loading = true;
            this.error = null;
            try {
                const response = await EWALLET_PAYMENT_API.createPaymentIntentApi(amountInCentavos);
                this.paymentIntent = response;
                return response;
            } catch (error) {
                this.error = error?.message || 'Failed to create payment intent';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        
        async attachPaymentMethod(methodType, billing) {
            this.loading = true;
            this.error = null;
            try {
                if (!this.paymentIntent?.payment_intent_id) {
                    throw new Error('No payment intent available. Please create one first.');
                }

                const response = await EWALLET_PAYMENT_API.attachPaymentMethod(
                    this.paymentIntent.payment_intent_id,
                    methodType,
                    billing
                );

                this.redirectUrl = response?.next_action?.redirect?.url || null;

                return response;
            } catch (error) {
                this.error = error?.message || 'Failed to attach payment method';
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
