import { defineStore } from 'pinia';

export const useOrdersStore = defineStore('orders', {
    state: () => ({
        crrntTtlOrdrQntty: 0,
        crrntTtlOrdrChrg: 0,
    }),

    getters: {
        currentTotalOrderQuantity: (state) => state.crrntTtlOrdrQntty,
        currentSubTotal: (state) => state.crrntTtlOrdrChrg,
    },
});