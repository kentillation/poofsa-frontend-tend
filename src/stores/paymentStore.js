import { defineStore } from "pinia";
import { EWALLET_PAYMENT_API } from "@/api/paymentApi";

export const usePaymentStore = defineStore("payment", {
  state: () => ({
    loading: false,
    error: null,

    qrData: null,
    paymentIntentId: null,
    paymentStatus: null,

    pollInterval: null,
  }),

  actions: {
    async generateQrPh(amount, referenceNumber) {
      this.reset();
      this.loading = true;

      try {
        const res = await EWALLET_PAYMENT_API.generateQrApi(
          amount,
          "qrph",
          referenceNumber
        );

        this.qrData = res;
        this.paymentIntentId = res.payment_intent_id;

        return res;
      } catch (err) {
        this.error = err?.response?.data?.message || "Failed to generate QR";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    startPaymentPolling(onUpdate) {
      if (!this.paymentIntentId) return;

      this.stopPaymentPolling();

      this.pollInterval = setInterval(async () => {
        try {
          const res = await EWALLET_PAYMENT_API.checkPaymentStatusApi(
            this.paymentIntentId
          );

          this.paymentStatus = res;

          if (onUpdate) onUpdate(res);

          if (
            ["succeeded", "failed", "cancelled", "error"].includes(res.status)
          ) {
            this.stopPaymentPolling();
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 3000);
    },

    stopPaymentPolling() {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }
    },

    reset() {
      this.qrData = null;
      this.paymentIntentId = null;
      this.paymentStatus = null;
      this.error = null;
      this.stopPaymentPolling();
    },
  },

  getters: {
    qrImageSrc: (s) => s.qrData?.qr_image,
    isPaid: (s) => s.paymentStatus?.status === "succeeded",
    isPending: (s) =>
      ["pending", "processing"].includes(s.paymentStatus?.status),
  },
});
