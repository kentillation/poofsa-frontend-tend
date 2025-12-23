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

    pollInterval: null,
    maxPollAttempts: 60, // 3 minutes at 3s intervals
    pollAttempts: 0,
    isPollingActive: false,

    // Callback handlers
    _onStatusUpdate: null,
    _onPaymentSuccess: null,
  }),

  actions: {
    async generateQrPh(amount, referenceNumber) {
      this.resetPaymentState();
      this.loading = true;

      try {
        const res = await EWALLET_PAYMENT_API.generateQrApi(
          amount,
          "qrph",
          referenceNumber
        );

        this.qrData = res;
        this.paymentIntentId = res.payment_intent_id;

        if (this.paymentIntentId) {
          this.startPaymentPolling(this.paymentIntentId);
        }

        return res;
      } catch (err) {
        this.error = err?.response?.data?.message || "Failed to generate QR";
        throw err;
      } finally {
        this.loading = false;
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

    startPaymentPolling(intentId) {
      if (!intentId) return;
      this.stopPaymentPolling();
      this.isPollingActive = true;
      this.pollAttempts = 0;

      this.pollInterval = setInterval(async () => {
        if (this.pollAttempts >= this.maxPollAttempts) {
          this.isPollingActive = false;
          this.stopPaymentPolling();
          return;
        }

        this.pollAttempts++;
        const statusResult = await this.checkPaymentStatus(intentId);

        // Trigger status update callback
        if (this._onStatusUpdate) this._onStatusUpdate(statusResult);

        // Stop polling if payment is complete
        if (this.isPaymentComplete) {
          this.stopPaymentPolling();
          this.isPollingActive = this.isPaid;

          // Trigger success callback if paid
          if (this.isPaid && this._onPaymentSuccess) {
            this._onPaymentSuccess(this.paymentDetails);
          }
        }
      }, 3000);
    },

    stopPaymentPolling() {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }
      
      if (this.paymentStatus !== 'succeeded') {
        this.isPollingActive = false;
      }
    },

    resetPaymentState() {
      this.qrData = null;
      this.paymentIntentId = null;
      this.paymentStatus = null;
      this.paymentDetails = null;
      this.error = null;
      this.pollAttempts = 0;
      this.stopPaymentPolling();
    },

    // Setters for callbacks
    setStatusUpdateCallback(callback) {
      this._onStatusUpdate = callback;
    },

    setPaymentSuccessCallback(callback) {
      this._onPaymentSuccess = callback;
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
