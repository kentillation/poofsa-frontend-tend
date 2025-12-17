// src/stores/paymentStore.js
import { defineStore } from "pinia";
import { EWALLET_PAYMENT_API } from "@/api/paymentApi";

export const usePaymentStore = defineStore("payment", {
  state: () => ({
    loading: false,
    error: null,
    paymentModeOptions: [],
    paymentIntent: null,
    redirectUrl: null,
    qrData: null,
    paymentStatus: null,
    paymentPollInterval: null,
  }),

  actions: {
    async startWalletPaymentStore(amountInCentavos, wallet, billing) {
      this.loading = true;
      this.error = null;

      try {
        // 1️⃣ Create intent
        const intent = await this.createPaymentIntentStore(amountInCentavos);

        // 2️⃣ Attach wallet (CONFIRM)
        const response = await this.attachPaymentMethodStore(wallet, billing);

        const redirectUrl = response?.next_action?.redirect?.url;

        if (!redirectUrl) {
          throw new Error("Missing redirect URL from PayMongo");
        }

        return {
          payment_intent_id: intent.payment_intent_id,
          redirect_url: redirectUrl,
        };
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to start wallet payment";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Existing method for creating payment intent
    async createPaymentIntentStore(amountInCentavos) {
      this.loading = true;
      this.error = null;
      try {
        const response = await EWALLET_PAYMENT_API.createPaymentIntentApi(
          amountInCentavos
        );
        this.paymentIntent = response;
        return response;
      } catch (error) {
        this.error = error?.message || "Failed to create payment intent";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Existing method for attaching payment method
    async attachPaymentMethodStore(methodType, billing) {
      this.loading = true;
      this.error = null;
      try {
        if (!this.paymentIntent?.payment_intent_id) {
          throw new Error(
            "No payment intent available. Please create one first."
          );
        }

        const response = await EWALLET_PAYMENT_API.attachPaymentMethodApi(
          this.paymentIntent.payment_intent_id,
          methodType,
          billing
        );

        this.redirectUrl = response?.next_action?.redirect?.url || null;
        return response;
      } catch (error) {
        this.error = error?.message || "Failed to attach payment method";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // New method for generating QR code
    async generateQrPhStore(amount, referenceNumber) {
      this.loading = true;
      this.error = null;

      try {
        const response = await EWALLET_PAYMENT_API.generateQrApi(
          amount,
          "qrph",
          referenceNumber
        );
        this.qrData = response;
        return response;
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to generate QRPh";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    // New method for checking payment status
    async checkPaymentStatusStore(paymentIntentId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await EWALLET_PAYMENT_API.checkPaymentStatusApi(
          paymentIntentId
        );
        this.paymentStatus = response;
        return response;
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to check payment status";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // New method for starting payment polling
    startPaymentPolling(paymentIntentId, onStatusChange) {
      if (this.paymentPollInterval) {
        clearInterval(this.paymentPollInterval);
      }

      this.paymentPollInterval = setInterval(async () => {
        try {
          const status = await this.checkPaymentStatusStore(paymentIntentId);

          // Call the callback function with the new status
          if (onStatusChange && typeof onStatusChange === "function") {
            onStatusChange(status);
          }

          // Stop polling if payment is finalized
          if (
            ["succeeded", "failed", "cancelled", "error"].includes(
              status.status
            )
          ) {
            this.stopPaymentPolling();
          }
        } catch (error) {
          console.error("Payment polling error:", error);
          // Don't stop polling on transient errors
        }
      }, 3000);
    },

    // New method for stopping payment polling
    stopPaymentPolling() {
      if (this.paymentPollInterval) {
        clearInterval(this.paymentPollInterval);
        this.paymentPollInterval = null;
      }
    },

    // New method for resetting payment state
    resetPaymentState() {
      this.qrData = null;
      this.paymentStatus = null;
      this.paymentIntent = null;
      this.redirectUrl = null;
      this.error = null;
      this.stopPaymentPolling();
    },
  },

  getters: {
    isPaymentSuccessful: (state) => {
      return state.paymentStatus?.status === "succeeded";
    },

    isPaymentPending: (state) => {
      return (
        state.paymentStatus?.status === "pending" ||
        state.paymentStatus?.status === "processing"
      );
    },

    isPaymentFailed: (state) => {
      return ["failed", "cancelled", "error"].includes(
        state.paymentStatus?.status
      );
    },

    qrImageSrc: (state) => {
      return state.qrData?.qr_image || state.qrData?.qr_image_url;
    },

    paymentIntentId: (state) =>
    state.paymentIntent?.payment_intent_id ||
    state.qrData?.payment_intent_id ||
    null,

    // Existing getter for payment mode options
    paymentModeItems: (state) => {
      if (state.paymentModeOptions.length === 0) {
        return [
          { paymentmode_id: 1, paymentmode_label: "Cash" },
          { paymentmode_id: 2, paymentmode_label: "e-Wallet" },
        ];
      }
      return state.paymentModeOptions;
    },
  },
});
