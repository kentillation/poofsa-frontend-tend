<template>
    <v-container style="background-color: #fff7e1;" class="payment-simple-container">
        <v-form ref="transactionForm" @submit.prevent="submitForm" v-model="isFormValid">
            <!-- Header with logout -->
            <div class="d-flex align-center justify-end mb-4">
                <v-btn @click="authStore.logout" size="small" variant="flat" icon>
                    <v-icon>mdi-door-open</v-icon>
                </v-btn>
            </div>

            <!-- Order Details Section (Enabled only after payment success) -->
            <v-card class="pa-6 mb-6" rounded="lg">
                <h3 class="mb-4">Order Details</h3>

                <!-- Order Type -->
                <div class="mb-4">
                    <span class="text-grey">Order type:</span>
                    <div class="ga-2 d-flex justify-space-between mt-2">
                        <div @click="dineIn" :class="{ 'selected': order_type_id === 1 }"
                            class="type-card pa-3 d-flex align-center justify-center flex-column bg-white">
                            <v-icon>mdi-store-marker-outline</v-icon>
                            <p style="font-size: 12px;">Dine-in</p>
                        </div>
                        <div @click="takeOut" :class="{ 'selected': order_type_id === 2 }"
                            class="type-card pa-3 d-flex align-center justify-center flex-column bg-white">
                            <v-icon>mdi-walk</v-icon>
                            <p style="font-size: 12px;">Take-out</p>
                        </div>
                        <div @click="deliveryOrder" :class="{ 'selected': order_type_id === 3 }"
                            class="type-card pa-3 d-flex align-center justify-center flex-column bg-white">
                            <v-icon>mdi-car-outline</v-icon>
                            <p style="font-size: 12px;">Delivery</p>
                        </div>
                    </div>
                </div>

                <!-- Customer Type -->
                <div class="mb-4">
                    <span class="text-grey">Customer type:</span>
                    <div class="ga-2 d-flex justify-space-between mt-2">
                        <div @click="customerRegular" :class="{ 'selected': customer_type_id === 1 }"
                            class="type-card pa-3 d-flex align-center justify-center flex-column bg-white">
                            <v-icon>mdi-account-circle-outline</v-icon>
                            <p style="font-size: 12px;">Regular</p>
                        </div>
                        <div @click="customerPwd" :class="{ 'selected': customer_type_id === 2 }"
                            class="type-card pa-3 d-flex align-center justify-center flex-column bg-white">
                            <v-icon>mdi-wheelchair</v-icon>
                            <p style="font-size: 12px;" class="text-center">W/ Special Needs</p>
                        </div>
                        <div @click="customerSenior" :class="{ 'selected': customer_type_id === 3 }"
                            class="type-card pa-3 d-flex align-center justify-center flex-column bg-white">
                            <v-icon>mdi-human-cane</v-icon>
                            <p style="font-size: 12px;">Elderly</p>
                        </div>
                    </div>
                </div>

                <!-- Input Fields -->
                <div class="mb-4 mt-6">
                    <span class="text-grey">Note (optional)</span>
                    <v-text-field v-model="order_note" variant="outlined" density="compact"
                        placeholder="Enter note"></v-text-field>
                </div>

                <div class="mb-4">
                    <span class="text-grey">Customer name (optional)</span>
                    <v-text-field v-model="customer_name" variant="outlined" density="compact"
                        placeholder="Enter customer name"></v-text-field>
                </div>

                <!-- Cash Render (only for cash payment - hidden for e-wallet) -->
                <div class="mb-4" v-if="payment_method_id === 1">
                    <span class="required-asterisk">*</span><span class="text-grey">Cash render</span>
                    <v-text-field v-model.number="customer_cash" variant="outlined" density="compact" type="number"
                        :rules="[v => parseFloat(v) >= totalAmount || 'Must be greater than or equal to total amount']"
                        placeholder="Enter cash"></v-text-field>
                </div>

                <!-- Amount Summary -->
                <div class="payment-amounts pa-4 mt-4">
                    <div class="d-flex align-center justify-space-between mb-3">
                        <span class="text-grey">Amount</span>
                        <span>₱{{ parseFloat(amountToPay || 0).toFixed(2) }}</span>
                    </div>
                    <div class="d-flex align-center justify-space-between mb-3">
                        <span class="text-grey">Delivery Fee</span>
                        <span>₱{{ order_type_charge }}</span>
                    </div>
                    <div class="d-flex align-center justify-space-between mb-3">
                        <span class="text-grey">Discount</span>
                        <span>₱{{ discount_amount }}</span>
                    </div>
                    <v-divider class="my-2"></v-divider>
                    <div class="d-flex align-center justify-space-between mb-3" v-if="payment_method_id === 1">
                        <span class="text-grey">Change</span>
                        <span>₱{{ customerChange }}</span>
                    </div>
                    <v-divider class="my-2" v-if="payment_method_id === 1"></v-divider>
                    <div class="d-flex align-center justify-space-between">
                        <span style="font-weight: 500; font-size: 18px;">Total</span>
                        <span style="font-weight: 500; font-size: 18px; color: #5c3a21">₱{{ totalAmount.toFixed(2)
                            }}</span>
                    </div>
                </div>

            </v-card>

            <!-- QR Payment Section -->
            <v-card class="pt-6 mb-6" rounded="lg">
                <div class="text-center mb-4">
                    <v-icon size="48" color="#5c3a21">mdi-qrcode-scan</v-icon>
                    <h2 class="mt-2">e-Wallet Payment</h2>
                    <p class="text-grey">Pay via GCash, Maya, or other QRPH supported wallets</p>
                </div>

                <!-- Amount Display -->
                <div class="text-center mb-6">
                    <p>Amount to Pay</p>
                    <div class="d-flex align-center justify-center">
                        <span class="currency-sign">₱</span>
                        <v-text-field v-model="amountToPay" type="number" variant="outlined" density="compact"
                            class="amount-input" :rules="[v => v > 0 || 'Amount must be greater than 0']"
                            placeholder="0.00" hide-details="auto"
                            :disabled="eWalletPaid || (eWalletImgSrc && !paymentCompleted)"></v-text-field>
                    </div>
                </div>

                <!-- Generate QR Button -->
                <div class="text-center">
                    <v-btn @click="generateQRPhCode" :loading="loadingQr"
                        :disabled="!isOnline || amountToPay <= 0 || eWalletPaid || paymentCompleted" color="#5c3a21"
                        size="large" height="50" class="generate-btn mb-6">
                        <v-icon left>mdi-qrcode</v-icon>
                        &nbsp;Generate QR
                    </v-btn>
                </div>

                <!-- QR code -->
                <div v-if="this.selectedEwalletOption === 'qrph'" class="qr-container text-center w-100 pa-4">
                    <div :class="[loadingQr ? 'd-flex' : 'd-none', 'align-center justify-center']">
                        <div style="width: 200px; height: 410px;">
                            <div class="text-center d-flex align-center flex-column">
                                <v-skeleton-loader type="text" width="220"></v-skeleton-loader>
                                <div class="d-flex">
                                    <v-skeleton-loader type="avatar"></v-skeleton-loader>
                                    <v-skeleton-loader type="avatar"></v-skeleton-loader>
                                    <v-skeleton-loader type="avatar"></v-skeleton-loader>
                                    <v-skeleton-loader type="avatar"></v-skeleton-loader>
                                </div>
                                <v-skeleton-loader type="text" width="150"></v-skeleton-loader>
                                <v-skeleton-loader type="image" width="190"></v-skeleton-loader>
                                <v-skeleton-loader type="text" width="300"></v-skeleton-loader>
                                <v-skeleton-loader type="text" width="300"></v-skeleton-loader>
                            </div>
                        </div>
                    </div>

                    <div v-if="eWalletImgSrc">
                        <div class="d-flex align-center justify-center">
                            <p style="font-size: 20px;">Scan</p>
                            <img class="e-wallet mx-1" :src="this.ewalletImageStore.qrphLogo"
                                style="width: 60px; height: 15px;" alt="QRPh Logo" loading="lazy">
                            <p style="font-size: 20px;">code to pay</p>
                        </div>
                        <div class="d-flex align-center justify-space-around ga-2 mt-2 mb-1">
                            <img class="e-wallet" :src="this.ewalletImageStore.gcashLogo"
                                style="width: 50px; height: 13px;" alt="GCash Logo" loading="lazy">
                            <img class="e-wallet" :src="this.ewalletImageStore.mayaLogo"
                                style="width: 30px; height: 13px;" alt="Maya Logo" loading="lazy">
                            <img class="e-wallet" :src="this.ewalletImageStore.bpiLogo"
                                style="width: 25px; height: 13px;" alt="BPI Logo" loading="lazy">
                            <img class="e-wallet" :src="this.ewalletImageStore.gotymeLogo"
                                style="width: 40px; height: 13px;" alt="GoTyme Logo" loading="lazy">
                            <img class="e-wallet" :src="this.ewalletImageStore.homecreditLogo"
                                style="width: 35px; height: 13px;" alt="Home Credit Logo" loading="lazy">
                        </div>
                        <p class="mt-4" style="font-size: 20px;">
                            <strong>₱ {{ this.totalAmount.toFixed(2) }}</strong>
                        </p>
                        <v-img :src="eWalletImgSrc" width="220" height="220" style="border-radius: 15px;"
                            class="mx-auto"></v-img>
                    </div>

                    <!-- Show payment status -->
                    <div class="payment-status">
                        <v-alert v-if="eWalletImgSrc" :type="!eWalletPaid ? 'warning' : 'success'" variant="tonal"
                            style="border-radius: 10px;" class="px-3">
                            <div class="d-flex align-center justify-space-between">
                                <span>{{ !eWalletPaid ? 'Waiting for payment' : 'Payment successful' }}</span>
                                <v-progress-circular v-if="!eWalletPaid" size="20" width="2"
                                    indeterminate></v-progress-circular>
                                <v-icon v-else color="success">mdi-check-circle</v-icon>
                            </div>
                        </v-alert>
                    </div>

                    <div v-if="eWalletImgSrc" class="text-center">
                        <p class="text-caption text-grey">
                            Please don't refresh this page until eWallet payment is succeeded.
                        </p>
                    </div>
                </div>
            </v-card>

            <div class="mb-6 px-2">
                <!-- Submit Button -->
                <v-btn @click="submitForm" :loading="placingOrder" class="place-order-btn" color="#5c3a21"
                    :disabled="!isFormValid || placingOrder || !paymentCompleted || totalAmount <= 0 || !isOnline">
                    Submit
                    <span>&nbsp;&bull;&nbsp;₱{{ totalAmount.toFixed(2) }}</span>
                </v-btn>

                <!-- Reset Button -->
                <v-btn @click="resetAll" class="reset-btn mt-3" color="red" height="50" variant="outlined"
                    :disabled="placingOrder">
                    Reset Transaction
                </v-btn>
            </div>

        </v-form>

    </v-container>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { usePaymentStore } from '@/stores/paymentStore';
import { useEWalletImageStore } from '@/stores/eWalletImageStore';
import { useTransactStore } from '@/stores/transactionStore';
import { useToast } from 'vue-toastification'
import echo from '@/resources/js/echo';

export default {
    name: 'SimplePayment',

    components: { },

    data() {
        return {
            // Payment
            loadingQr: false,
            placingOrder: false,
            isFormValid: false,
            eWalletPaid: false,
            paymentCompleted: false,
            eWalletImgSrc: null,
            selectedEwalletOption: '',
            isOnline: navigator.onLine,
            referenceNumber: '',
            eWalletRef: '',
            amountToPay: 0,
            paymentChannel: null,

            // Order Details
            order_type_id: 1,
            order_type: 'Dine-in',
            customer_type_id: 1,
            customer_type: 'Regular',
            order_type_charge: 0,
            customer_cash: '',
            discount_amount: 0,
            payment_method_id: 2, // Default to e-Wallet
            customer_name: '-',
            order_note: '-',
        };
    },

    setup() {
        const toast = useToast();
        const authStore = useAuthStore();
        const paymentStore = usePaymentStore();
        const ewalletImageStore = useEWalletImageStore();
        const transactStore = useTransactStore();
        return {
            toast,
            authStore,
            paymentStore,
            ewalletImageStore,
            transactStore,
        };
    },

    watch: {
        customer_cash() {
            // Trigger change calculation
        },

        order_type_id(newVal) {
            if (Number(newVal) === 1) {
                this.order_type_charge = 0;
                this.order_type = 'Dine-in';
            } else if (Number(newVal) === 2) {
                this.order_type_charge = 0;
                this.order_type = 'Take-out';
            } else if (Number(newVal) === 3) {
                this.order_type_charge = 5;
                this.order_type = 'Delivery';
            }
        },

        customer_type_id(newVal) {
            if (Number(newVal) === 1) {
                this.customer_type = 'Regular';
                this.discount_amount = 0;
            } else if (Number(newVal) === 2) {
                this.customer_type = 'w/ Special needs';
                this.discount_amount = 12;
            } else if (Number(newVal) === 3) {
                this.customer_type = 'w/ Elderly';
                this.discount_amount = 12;
            }
        },

        // Watch for real-time payment status changes
        paymentStatus: {
            handler(newStatus) {
                if (newStatus === 'succeeded') {
                    this.eWalletPaid = true;
                    this.paymentCompleted = true;
                    this.toast.success('Payment received successfully!');
                } else if (newStatus === 'failed') {
                    this.eWalletPaid = false;
                    this.paymentCompleted = false;
                    this.toast.error('Payment failed. Please try again.');
                } else if (newStatus === 'cancelled') {
                    this.eWalletPaid = false;
                    this.paymentCompleted = false;
                    this.toast.error('Payment was cancelled.');
                }
            },
            deep: true
        }
    },

    computed: {
        totalAmount() {
            let total = parseFloat(this.amountToPay || 0);
            total += parseFloat(this.order_type_charge || 0);
            total -= parseFloat(this.discount_amount || 0);
            return total > 0 ? total : 0;
        },

        customerChange() {
            if (this.totalAmount === 0) return 0;
            const change = parseFloat(this.customer_cash || 0) - this.totalAmount;
            return change > 0 ? change.toFixed(2) : 0;
        },

        paymentStatus() {
            return this.paymentStore.paymentStatus;
        },

    },

    async mounted() {
        await this.generateReferenceNumber();
        this.setupRealtimeListeners();

        window.addEventListener('online', this.onOnline);
        window.addEventListener('offline', this.onOffline);
    },

    beforeUnmount() {
        window.removeEventListener('online', this.onOnline);
        window.removeEventListener('offline', this.onOffline);

        if (this.paymentStore) {
            this.paymentStore.resetPaymentState();
        }

        // Leave the real-time channel
        if (this.referenceNumber) {
            echo.leave(`payments.${this.referenceNumber}`);
        }
    },

    methods: {
        setupRealtimeListeners() {
            // Listen for real-time payment updates on the private channel
            echo.private(`payments.${this.referenceNumber}`)
                .listen('.payment.paid', (data) => {
                    console.log('Real-time payment received:', data);
                    this.eWalletPaid = true;
                    this.paymentCompleted = true;
                    this.toast.success('Payment confirmed in real-time!');
                })
                .listen('.payment.failed', (data) => {
                    console.log('Real-time payment failed:', data);
                    this.eWalletPaid = false;
                    this.paymentCompleted = false;
                    this.toast.error('Payment failed. Please try again.');
                });
        },

        onOffline() {
            this.isOnline = false;
            if (!this.eWalletPaid && this.eWalletImgSrc && !this.paymentCompleted) {
                this.toast.error("Internet connection disconnected. Payment status may be delayed.");
            }
        },

        onOnline() {
            this.isOnline = true;
            this.toast.success("Internet connection restored.");
        },

        async generateReferenceNumber() {
            const generatedNumber = Math.random().toString().slice(2, 14);
            this.referenceNumber = generatedNumber;
            return generatedNumber;
        },

        dineIn() {
            this.order_type_id = 1;
        },

        takeOut() {
            this.order_type_id = 2;
        },

        deliveryOrder() {
            this.order_type_id = 3;
        },

        customerRegular() {
            this.customer_type_id = 1;
        },

        customerPwd() {
            this.customer_type_id = 2;
        },

        customerSenior() {
            this.customer_type_id = 3;
        },

        regenerateQR() {
            this.resetPaymentState();
            this.generateQRPhCode();
        },

        resetPaymentState() {
            this.eWalletPaid = false;
            this.paymentCompleted = false;
            this.eWalletImgSrc = null;
            this.selectedEwalletOption = '';
            this.payment_method_id = 2;
            this.loadingQr = false;

            if (this.paymentStore) {
                this.paymentStore.resetPaymentState();
            }
        },

        async generateQRPhCode() {
            this.resetPaymentState();

            if (!this.isOnline) {
                this.toast.error("No internet connection. Unable to generate QR.");
                return;
            }

            if (this.eWalletPaid || this.paymentCompleted) {
                this.toast.error("Payment already completed.");
                return;
            }

            if (this.amountToPay <= 0) {
                this.toast.error("Please enter a valid amount.");
                return;
            }

            try {
                this.loadingQr = true;
                this.payment_method_id = 2;
                this.selectedEwalletOption = 'qrph';

                // Generate new reference for this transaction
                this.eWalletRef = await this.generateReferenceNumber();

                // Setup real-time listener for this new reference
                this.setupRealtimeListeners();

                const amountToPay = this.totalAmount;

                await this.paymentStore.generateQRPhCodeStore(
                    amountToPay,
                    this.selectedEwalletOption,
                    this.eWalletRef
                );

                this.customer_cash = amountToPay;
                this.eWalletImgSrc = this.paymentStore.qrImageSrc;
                this.paymentChannel = this.paymentStore.paymentChannel;

                // Start polling for payment status (fallback mechanism)
                this.startPaymentStatusPolling();

            } catch (err) {
                this.toast.error("Failed to generate QR: " + (err.message || 'Unknown error'));
                this.resetPaymentState();
            } finally {
                this.loadingQr = false;
            }
        },

        startPaymentStatusPolling() {
            // Poll as fallback mechanism in case WebSocket fails
            const pollInterval = setInterval(async () => {
                if (this.paymentCompleted || this.eWalletPaid) {
                    clearInterval(pollInterval);
                    return;
                }

                if (this.eWalletRef) {

                    if (this.paymentStatus === 'succeeded') {
                        this.paymentCompleted = true;
                        this.eWalletPaid = true;
                        clearInterval(pollInterval);
                    }
                }
            }, 5000); // Check every 5 seconds

            // Store interval ID to clear later if needed
            this.pollingInterval = pollInterval;
        },

        async submitForm() {
            try {
                this.placingOrder = true;

                if (!this.$refs.transactionForm.validate()) {
                    this.placingOrder = false;
                    return;
                }

                // Check if payment is completed for e-wallet transactions
                if (this.payment_method_id === 2 && !this.paymentCompleted) {
                    this.toast.error('Please complete e-Wallet payment first');
                    this.placingOrder = false;
                    return;
                }

                if (!this.referenceNumber && !this.eWalletRef) {
                    this.toast.error("Error in reference number. Refresh the page!");
                    this.placingOrder = false;
                    return;
                }

                const formData = new FormData();
                formData.append("transactions[0][reference_number]", this.referenceNumber || this.eWalletRef);
                formData.append("transactions[0][total_quantity]", 1);
                formData.append("transactions[0][total_amount]", parseFloat(this.totalAmount) || 0);
                formData.append("transactions[0][subtotal]", parseFloat(this.amountToPay) || 0);
                formData.append("transactions[0][order_type_id]", Number(this.order_type_id));
                formData.append("transactions[0][order_type_charge]", parseFloat(this.order_type_charge) || 0);
                formData.append("transactions[0][customer_cash]", parseFloat(this.customer_cash) || 0);
                formData.append("transactions[0][customer_change]", parseFloat(this.customerChange) || 0);
                formData.append("transactions[0][discount_amount]", parseFloat(this.discount_amount) || 0);
                formData.append("transactions[0][payment_method_id]", Number(this.payment_method_id));
                formData.append("transactions[0][table_number]", null);
                formData.append("transactions[0][customer_name]", this.customer_name || '-');
                formData.append("transactions[0][order_note]", this.order_note || '-');

                // Add dummy product for transaction requirement
                formData.append(`transactions[0][products][0][product_id]`, 1);
                formData.append(`transactions[0][products][0][station_id]`, 1);
                formData.append(`transactions[0][products][0][quantity]`, 1);

                await this.transactStore.submitTransactStore(formData);

                // Clear polling interval if exists
                if (this.pollingInterval) {
                    clearInterval(this.pollingInterval);
                }

                this.toast.success("Transaction completed successfully!");
                this.scrollToTop();

                // Reset for next transaction after short delay
                setTimeout(() => {
                    this.resetAll();
                }, 3000);

            } catch (error) {
                this.toast.error(error.message || "Transaction failed!");
                console.error(error);
            } finally {
                this.placingOrder = false;
            }
        },

        scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        resetAll() {
            // Clear polling interval
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
            }

            this.eWalletPaid = false;
            this.paymentCompleted = false;
            this.eWalletImgSrc = null;
            this.selectedEwalletOption = '';
            this.order_type_id = 1;
            this.order_type = 'Dine-in';
            this.order_type_charge = 0;
            this.customer_type_id = 1;
            this.customer_type = 'Regular';
            this.customer_cash = '';
            this.discount_amount = 0;
            this.payment_method_id = 2;
            this.customer_name = '-';
            this.order_note = '-';
            this.amountToPay = 0;

            if (this.paymentStore) {
                this.paymentStore.resetPaymentState();
            }

            this.generateReferenceNumber();
        },

    }
};
</script>

<style scoped>
.payment-simple-container {
    max-width: 600px;
    margin: 0 auto;
}

:deep(.v-card) {
    box-shadow: none;
}

:deep(.v-img) {
    border-radius: 70px !important;
}

.generate-btn {
    font-size: 16px !important;
    border-radius: 30px !important;
    padding: 0 30px !important;
}

.amount-input {
    max-width: 200px;
}

.amount-input :deep(.v-field__input) {
    font-size: 32px;
    text-align: center;
}

.currency-sign {
    font-size: 32px;
    font-weight: bold;
    margin-right: 8px;
    color: #5c3a21;
}

.type-card {
    width: 100px;
    height: 70px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid #e0e0e0;
}

.type-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.qr-container {
    background: #fffcfc;
    border-radius: 15px;
}

.payment-amounts {
    background-color: #f5f5f5;
    border-radius: 10px;
}

.place-order-btn {
    width: 100% !important;
    height: 50px !important;
    border-radius: 30px !important;
    font-size: 16px !important;
}

.reset-btn {
    width: 100% !important;
    border-radius: 30px !important;
}

.selected {
    color: #fff !important;
    background-color: #5c3a21 !important;
    border-color: #5c3a21 !important;
}

.selected span {
    color: #fff !important;
}

.required-asterisk {
    color: red;
    font-weight: bold;
    margin-right: 4px;
}

.e-wallet {
    object-fit: contain;
}

.payment-status {
    font-size: 14px;
    font-weight: normal;
    margin: 15px 0;
}

.payment-status.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}
</style>