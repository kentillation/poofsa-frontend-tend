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
          this.stopPaymentPolling();
          return;
        }
        this.pollAttempts++;
        const statusResult = await this.checkPaymentStatus(intentId);
        if (this.isPaymentComplete) {
          this.stopPaymentPolling();
          if (this.onPaymentSuccess) {
            this.onPaymentSuccess(this.paymentDetails);
          }
        }

        if (this.onStatusUpdate) {
          this.onStatusUpdate(statusResult);
        }
      }, 3000); // Check every 3 seconds
    },

    stopPaymentPolling() {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }
      this.isPollingActive = false;
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

    onStatusUpdate(callback) {
      this.onStatusUpdate = callback;
    },

    onPaymentSuccess(callback) {
      this.onPaymentSuccess = callback;
    },
  },

  getters: {
    qrImageSrc: (s) => s.qrData?.qr_image,
    isPaid: (s) => s.paymentStatus === "succeeded",
    isPending: (s) => ["pending", "processing"].includes(s.paymentStatus),
    isFailed: (s) => ["failed", "cancelled", "error"].includes(s.paymentStatus),
    isPaymentComplete: (s) => s.isPaid || s.isFailed,
  },
});
