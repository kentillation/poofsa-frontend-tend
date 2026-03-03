import { defineStore } from "pinia";
import { EWALLET_PAYMENT_API } from "@/api/paymentApi";

export const usePaymentStore = defineStore("payment", {
  state: () => ({
    loading: false,
    error: null,

    qrData: null,
    paymentIntentId: null,
    paymentStatus: null,
    paymentDetails: null,

    pollingInterval: null,
    maxPollingAttempts: 60, // 3 minutes at 3s intervals
    pollingAttempts: 0,
    isPollingActive: false,

    // Callback handlers
    _onStatusUpdate: null,
    _onPaymentSuccess: null,
  }),

  actions: {

    async generateQRPhCodeStore(amountToPay, selectedEWallet, referenceNumber) {
      if (!amountToPay || !selectedEWallet || !referenceNumber) return;

      this.resetPaymentState();

      this.loading = true;

      try {
        const response = await EWALLET_PAYMENT_API.generateQRPhCodeApi(
          amountToPay,
          selectedEWallet,
          referenceNumber
        );

        this.qrData = response;
        this.paymentIntentId = response.payment_intent_id;

        if (this.paymentIntentId) {
          this.startPaymentPolling(this.paymentIntentId);
        }

        return response;
      } catch (err) {
        this.error = err?.response?.data?.message || "Failed to generate QR";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async startPaymentPolling(paymentIntentId) {
      if (!paymentIntentId) return;

      await this.stopPaymentPolling();

      this.isPollingActive = true;
      this.pollingAttempts = 0;

      const poll = async () => {
        if (!this.isPollingActive) return;

        if (this.pollingAttempts >= this.maxPollingAttempts) {
          this.isPollingActive = false;
          return;
        }

        this.pollingAttempts++;

        try {
          const statusResult = await this.checkPaymentStatus(paymentIntentId);

          if (this._onStatusUpdate) {
            this._onStatusUpdate(statusResult);
          }

          if (this.isPaymentComplete) {
            this.isPollingActive = false;

            if (this.isPaid && this._onPaymentSuccess) {
              this._onPaymentSuccess(this.paymentDetails);
            }

            return; // STOP polling
          }

        } catch (error) {
          console.error("Polling error:", error);
        }

        // Schedule next poll ONLY after request finishes
        if (this.isPollingActive) {
          this.pollingTimeout = setTimeout(poll, 1000);
        }
      };

      poll();
    },

    async stopPaymentPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }

      if (this.paymentStatus !== 'succeeded') {
        this.isPollingActive = false;
      }
    },

    async checkPaymentStatus(intentId) {
      try {
        const res = await EWALLET_PAYMENT_API.checkPaymentStatusApi(intentId);

        if (res.ok) {
          this.paymentStatus = res.original_status;
          this.paymentDetails = res;
        } else {
          this.paymentStatus = "error";
        }

        return res;
      } catch (error) {
        console.error("Error checking payment status:", error);
        this.paymentStatus = "error";
        return { ok: false, status: "error" };
      }
    },

    // Setters for callbacks
    setStatusUpdateCallback(callback) {
      this._onStatusUpdate = callback;
    },

    setPaymentSuccessCallback(callback) {
      this._onPaymentSuccess = callback;
    },

    resetPaymentState() {
      this.qrData = null;
      this.paymentIntentId = null;
      this.paymentStatus = null;
      this.paymentDetails = null;
      this.error = null;
      this.pollingAttempts = 0;
      this.stopPaymentPolling();
    },

  },

  getters: {
    qrImageSrc: (state) => state.qrData?.qr_image,
    isPaid: (state) => state.paymentStatus === "succeeded",
    isPending: (state) =>
      ["pending", "processing"].includes(state.paymentStatus),
    isFailed: (state) =>
      ["failed", "cancelled", "error"].includes(state.paymentStatus),
    isPaymentComplete: (state) => state.isPaid || state.isFailed,
  },
});
