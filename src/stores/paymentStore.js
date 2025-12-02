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
        async fetchAllOptions() {
            this.loading = true;
            try {
                // Fetch all options in parallel (better performance)
                const [paymentModes] = await Promise.all([
                    this.fetchOptions('/open/payment-mode-option'),
                ]);
                this.paymentModeOptions = paymentModes;
            } catch (error) {
                this.error = error;
                console.error(error);
            } finally {
                this.loading = false;
            }
        },

        async createPaymentIntent(amountInCentavos) {
            this.loading = true;
            this.error = null;
            try {
                const response = await EWALLET_PAYMENT_API.createPaymentIntent(amountInCentavos);
                this.paymentIntent = response;
                return response;
            } catch (error) {
                this.error = error?.message || 'Failed to create payment intent';
                throw error;
            } finally {
                this.loading = false;
            }
        },
        /**
         * Attach a payment method (GCash / PayMaya / QRPH)
         * @param {string} methodType - 'gcash' | 'paymaya' | 'qrph'
         * @param {object} billing - { name, email, phone }
         */
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

                // PayMongo usually returns a redirect URL for checkout
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
