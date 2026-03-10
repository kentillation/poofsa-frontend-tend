<template>
    <!-- Checkout -->
    <div class="payment-indication-container">
        <v-btn @click="showSelectedOrderDialog" class="payment-indication d-flex justify-center" color="#0090b6"
            :disabled="totalQuantity === 0">
            Checkout
            <span :class="{ 'd-none': totalQuantity === 0 }"> &bull; ₱{{
                this.ordersStore.currentTotalOrderCharge.toFixed(2) }}
            </span>
            <v-badge :content="totalQuantity" color="error" :class="{ 'd-none': totalQuantity === 0 }"
                class="position-absolute" style="top: 1px; right: 30px; z-index: 1010 !important;"></v-badge>
        </v-btn>
    </div>
    <v-container style="background-color: #e8faff;">

        <v-form ref="transactionForm" @submit.prevent="submitForm" v-model="isFormValid">
            <!-- Search Products -->
            <div class="mb-2 d-flex align-items-center justify-content-center">
                <v-text-field v-model="searchProduct" 
                    class="w-75"
                    placeholder="Search product..."
                    density="compact"
                    variant="outlined">
                </v-text-field>

                <v-btn color="#fff" class="ms-2 d-flex align-items-center" variant="flat" @click="showCategories"
                    size="small" icon>
                    <v-icon size="large">mdi-bell-outline</v-icon>
                </v-btn>
            </div>

            <!-- Categories -->
            <v-slide-group class="my-3 ms-1">
                <v-slide-group-item>
                    <v-chip @click="reloadProducts" :color="!selectedCategory ? '#0090b6' : '#fff'" variant="flat"
                        class="me-1 category-chip">
                        All
                    </v-chip>
                </v-slide-group-item>
                <v-slide-group-item>
                    <v-chip v-for="(category, index) in productsStore.getCategories" :key="index"
                        @click="handleCategorySelect(category)" color="#fff" variant="flat" class="me-1 category-chip">
                        {{ category.label }}
                    </v-chip>
                </v-slide-group-item>
            </v-slide-group>

            <!-- Products -->
            <div v-if="loadingCategories" class="image-section">
                <div v-for="n in 8" :key="n" class="image-section-item">
                    <div class="product-card">
                        <v-skeleton-loader type="text" width="60%" class="mb-2"></v-skeleton-loader>
                        <v-skeleton-loader type="text" width="60%" class="mb-2"></v-skeleton-loader>
                        <v-skeleton-loader type="button" height="120"></v-skeleton-loader>
                        <v-skeleton-loader type="text" width="60%" class="mt-2"></v-skeleton-loader>
                    </div>
                </div>
            </div>

            <v-alert v-else-if="filteredProducts.length === 0" variant="tonal" type="info" class="my-3">
                No available product.
            </v-alert>

            <div v-else class="image-section">
                <div v-for="product in filteredProducts" :key="product.id" @click="selectProduct(product)"
                    class="image-section-item">
                    <div class="product-card">
                        <p class="product-card-text text-truncate">
                            {{ product.product_name }}
                        </p>
                        <p class="product-card-text text-grey">
                            {{ product.size_label }}
                        </p>
                        <v-img :src="WTFImgSrc" class="my-2"></v-img>
                        <p class="text-grey-darken-1">
                            <strong>₱{{ product.base_price }}</strong>
                        </p>
                    </div>
                </div>
            </div>

            <!-- Payment Section and Current Orders Section -->
            <v-row class="mb-15">

                <!-- Current Orders Section -->
                <v-col cols="12">
                    <span class="d-flex align-center justify-space-between mb-1">
                        <h3>Current Orders</h3>
                        <v-btn @click="fetchCurrentOrders" prepend-icon="mdi-refresh" variant="tonal" color="#0090b6">
                            Refresh
                        </v-btn>
                    </span>
                    <v-data-table :headers="headersOrders" :items="currentOrders" :loading="loadingCurrentOrders"
                        density="comfortable" height="300px">

                        <!--eslint-disable-next-line -->
                        <template v-slot:item.table_number="{ item }">
                            <div class="d-flex align-center justify-space-between">
                                <h3># {{ item.order_number }}</h3>
                            </div>
                        </template>

                        <!--eslint-disable-next-line -->
                        <template v-slot:item.actions="{ item }">
                            <div class="d-flex" style="gap: 8px;">
                                <v-chip color="#0090b6" prepend-icon="mdi-eye-outline" size="small" variant="flat"
                                    class="ps-5 pe-4 text-white" @click="toViewOrder(item)">View
                                </v-chip>
                            </div>
                            <ViewOrder :key="selectedReferenceNumber" v-model="viewOrderDialog"
                                @update:modelValue="productEditDialog = $event"
                                :reference-number="selectedReferenceNumber" />
                        </template>

                    </v-data-table>
                </v-col>
            </v-row>

            <!-- Order Sheet -->
            <v-bottom-sheet v-model="selectedOrderDialog">
                <v-card style="background-color: #e8faff;">
                    <v-container class="overflow-auto pb-10" style="height: 700px;">

                        <!-- Orders -->
                        <p class="ms-2 mb-1"><strong>Your order</strong></p>
                        <div class="mb-5 pa-2 overflow-auto"
                            style="height: 350px; border: 1px solid #0090b6; border-radius: 10px; ">
                            <div class="selected-products-container">
                                <v-alert v-if="this.selectedProducts.length === 0" variant="tonal" type="info"
                                    class="my-3">
                                    You have an empty order.
                                </v-alert>
                                <div v-for="selectedProduct in this.selectedProducts" :key="selectedProduct.id">
                                    <div class="selected-products-card">
                                        <div class="d-flex flex-start">
                                            <v-img :src="WTFImgSrc" width="70" height="70"
                                                style="border-radius: 10px !important;">
                                            </v-img>
                                        </div>
                                        <div class="d-flex flex-column w-100 mx-3">
                                            <p class="text-truncate">{{ selectedProduct.product_name }}</p>
                                            <p class="text-grey my-1" style="font-size: 13px;">{{
                                                selectedProduct.size_label }}
                                            </p>
                                            <div class="d-flex align-center justify-space-between">
                                                <p><strong>₱{{ selectedProduct.base_price }}</strong></p>
                                                <div class="">
                                                    <v-btn @click="deductQuantity(selectedProduct)" color="#0090b6"
                                                        class="mini-btn ms-3" variant="flat">
                                                        <v-icon style="font-size: 10px;">mdi-minus</v-icon>
                                                    </v-btn>
                                                    <span class="mx-2">{{ selectedProduct.quantity }}</span>
                                                    <v-btn @click="addQuantity(selectedProduct)" color="#0090b6"
                                                        class="mini-btn mx-1" variant="flat">
                                                        <v-icon style="font-size: 10px;">mdi-plus</v-icon>
                                                    </v-btn>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Order type -->
                        <p class="ms-2 mb-1"><strong>Order type</strong></p>
                        <div class="mb-5 ga-2 d-flex justify-center">
                            <div class="pa-2 d-flex align-center justify-center flex-column bg-white"
                                style="width: 75px; height: 60px; border-radius: 10px; border: 1px solid #0090b6;">
                                <v-icon>mdi-coffee</v-icon>
                                <p style="font-size: 12px;">Dine-in</p>
                            </div>
                            <div class="pa-2 d-flex align-center justify-center flex-column bg-white"
                                style="width: 75px; height: 60px; border-radius: 10px;">
                                <v-icon>mdi-beer-outline</v-icon>
                                <p style="font-size: 12px;">Take-out</p>
                            </div>
                        </div>

                        <!-- Customer type -->
                        <p class="ms-2 mb-1"><strong>Customer type</strong></p>
                        <div class="mb-5 ga-2 d-flex justify-center">
                            <div class="pa-2 d-flex align-center justify-center flex-column bg-white"
                                style="width: 75px; height: 75px; border-radius: 10px; border: 1px solid #0090b6;">
                                <v-icon>mdi-account-circle-outline</v-icon>
                                <p style="font-size: 12px;">Regular</p>
                            </div>
                            <div class="pa-2 d-flex align-center justify-center flex-column bg-white"
                                style="width: 75px; height: 75px; border-radius: 10px;">
                                <v-icon>mdi-wheelchair</v-icon>
                                <p style="font-size: 12px;">PWD</p>
                            </div>
                            <div class="pa-2 d-flex align-center justify-center flex-column bg-white"
                                style="width: 75px; height: 75px; border-radius: 10px;">
                                <v-icon>mdi-human-cane</v-icon>
                                <p style="font-size: 12px;" class="text-center">Senior Citizen</p>
                            </div>
                        </div>

                        <!-- Payment method -->
                        <p class="ms-2 mb-1"><strong>Payment method</strong></p>
                        <div class="mb-5 ga-2 d-flex justify-center">
                            <div :class="{ 'selected' : this.payment_method_id === 1 }" class="pa-2 d-flex align-center justify-center flex-column bg-white"
                                style="width: 160px; height: 80px; border-radius: 10px;">
                                <v-icon>mdi-cash</v-icon>
                                <p @click="cashPayment" class="text-center" style="font-size: 12px;">Cash <br /> (Over-the-counter)</p>
                            </div>
                            <div :class="{ 'selected' : this.payment_method_id === 2 }" class="pa-2 d-flex align-center justify-center flex-column bg-white"
                                style="width: 160px; height: 80px; border-radius: 10px;">
                                <v-icon>mdi-wallet</v-icon>
                                <p @click="generateQRPhCode" :disabled="!isOnline || isNotEwallet || eWalletPaid" class="text-center" style="font-size: 12px;">e-Wallet <br /> (GCash, Maya, etc.)</p>
                            </div>
                        </div>
                        
                        <div v-if="this.selectedEwalletOption === 'qrph'" class="mb-5 qr-container text-center w-100 pa-4">
                            <div v-if="loadingQr" class="d-flex justify-center">
                                <div class="d-flex align-center flex-column" style="width: 200px; height: 200px;">
                                    <p class="text-grey my-3">Generating...</p>
                                    <v-progress-circular color="grey" indeterminate size="50" width="2"></v-progress-circular>
                                </div>
                            </div>
                            
                            <div v-else-if="eWalletImgSrc">
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
                                    <strong>₱ {{ discountedSubtotal.toFixed(2) }}</strong>
                                </p>
                                <v-img :src="eWalletImgSrc" width="250" height="250" class="mx-auto"></v-img>
                            </div>
                            
                            <!-- Show payment status -->
                            <div class="payment-status w-100">
                                <v-alert v-if="eWalletImgSrc" :type="!eWalletPaid ? 'warning' : 'success'" variant="tonal"
                                    style="border-radius: 15px;" class="mt-1 px-3">
                                    <div class="d-flex align-center justify-space-between">
                                        <span>{{ !eWalletPaid ? 'Waiting for payment' : 'Payment successful' }}</span>
                                        <v-progress-circular v-if="!eWalletPaid" size="20" width="2" indeterminate></v-progress-circular>
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

                        <!-- Inputs -->
                        <div class="mb-5">
                            <div class="mb-3">
                                <span class="required-asterisk mt-2">*</span> Cash render
                                <v-text-field v-model.number="customer_cash"
                                    variant="outlined"
                                    density="compact"
                                    type="number"
                                    :disabled="eWalletPaid"
                                    :rules="[v => !isNaN(parseFloat(v)) || 'Required', v => parseFloat(v) >= this.subTotal || 'Must be greater than or equal to total amount']"
                                    @input="e => customer_cash = e.target.value.replace(/[^0-9.]/g, '')"
                                    inputmode="numeric"
                                    placeholder="Enter cash">
                                    
                                </v-text-field>
                            </div>

                            <div class="mb-3">
                                Note (optional)
                                <v-text-field v-model="order_note"
                                    variant="outlined"
                                    density="compact"
                                    type="text"
                                    placeholder="Enter note">
                                </v-text-field>
                            </div>

                            <div class="mb-3">
                                Customer name (optional)
                                <v-text-field v-model="customer_name" 
                                    variant="outlined"
                                    density="compact"
                                    type="text"
                                    placeholder="Enter customer name">
                                </v-text-field>
                            </div>
                        </div>

                        <!-- Amounts -->
                        <div class="mb-5 payment-amounts">
                            <div class="d-flex align-center justify-space-between">
                                <p class="text-grey">Quantity</p>
                                <p>x{{ totalQuantity }}</p>
                            </div>
                            <v-divider class="my-3"></v-divider>
                            <div class="d-flex align-center justify-space-between">
                                <p class="text-grey">Change</p>
                                <p>₱ {{ customerChange }}</p>
                            </div>
                            <v-divider class="my-3"></v-divider>
                            <div class="d-flex align-center justify-space-between">
                                <p class="text-grey">Subtotal</p>
                                <p>₱ {{ subTotal.toFixed(2) }}</p>
                            </div>
                            <v-divider class="my-3"></v-divider>
                            <div class="d-flex align-center justify-space-between">
                                <p style="font-weight: 500; font-size: 18px;">Total</p>
                                <p style="font-weight: 500; font-size: 18px; color: #0090b6">₱ {{ discountedSubtotal.toFixed(2) }}</p>
                            </div>
                        </div>

                        <v-btn @click="submitForm" :loading="placingOrder" class="place-order-btn"
                            color="#0090b6" :disabled="!isFormValid || placingOrder ||
                            (payment_method_id === 2 && !eWalletPaid) ||
                            Number(customer_cash) < subTotal ||
                            Number(customer_change) < 0 ||
                            subTotal <= 0 ||
                            !isOnline">
                            Place order
                            <span>&nbsp;&bull;&nbsp;₱ {{ discountedSubtotal.toFixed(2) }}</span>
                        </v-btn>
                    </v-container>
                </v-card>
            </v-bottom-sheet>
        </v-form>
        <Snackbar ref="snackbarRef" />
        <Alert ref="alertRef" />
    </v-container>
</template>

<script>
import { mapState } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useBranchStore } from '@/stores/branchStore';
import { useProductsStore } from '@/stores/productsStore';
import { useStocksStore } from '@/stores/stocksStore';
import { useOrdersStore } from '@/stores/ordersStore';
import { useTransactStore } from '@/stores/transactionStore';
import { useLoadingStore } from '@/stores/loading';
import { usePaymentStore } from '@/stores/paymentStore';
import { useEWalletImageStore } from '@/stores/eWalletImageStore'
import ViewOrder from './ViewOrder.vue';
import echo from '@/resources/js/echo';
import Snackbar from '@/components/Snackbar.vue';
import Alert from '@/components/Alert.vue';
// import WTFImage from '@/assets/img/jpg/features/WTF.jpg';


export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Cashier',

    components: {
        ViewOrder,
        Snackbar,
        Alert,
    },

    data() {
        return {
            // Products
            products: [],
            selectedProducts: [],
            loadingProducts: false,
            searchProduct: '',
            tempLabel: '',
            sizeLabel: '',

            // Stocks
            stocks: [],
            loadingStocks: false,

            // Categories
            categories: [],
            selectedCategory: '',
            loadingCategories: false,
            categoriesDialog: false,
            progressCircular: false,

            // Payment
            loadingQr: false,
            placingOrder: false,
            selectedOrderDialog: false,
            isFormValid: false,
            eWalletDialog: false,
            eWalletPaid: false,
            eWalletImgSrc: null,
            selectedEwalletOption: '',
            isOnline: navigator.onLine,
            referenceNumber: '',
            total_quantity: '',
            subtotal: null,
            total_amount: 0,
            order_type_id: 1,
            order_type_charge: '0',
            customer_cash: '',
            customer_change: '0',
            discount_amount: '0',
            computed_discount: null,
            payment_method_id: 1,
            table_number: null,
            customer_name: '-',
            order_note: '-',
            orderTypeItems: [
                { ordertype_id: 1, ordertype_label: 'Dine-in' },
                { ordertype_id: 2, ordertype_label: 'Delivery' },
                { ordertype_id: 3, ordertype_label: 'Take-out' },
            ],
            paymentModeItems: [
                { paymentmode_id: 1, paymentmode_label: 'Cash' },
                { paymentmode_id: 2, paymentmode_label: 'e-Wallet' },
            ],
            WTFImgSrc: require('@/assets/img/jpg/features/WTF.jpg'),

            // Orders
            orders: [],
            orderDetails: [],
            loadingCurrentOrders: false,
            viewOrderDialog: false,
            selectedReferenceNumber: null,
            createdAt: '',
            updatedAt: '',
            tableNumber: 'N/A',
            headersDisplay: [
                { title: '', value: 'product_name' },
                { title: '', value: 'base_price' },
            ],
            headersOrders: [
                { title: 'Table Number', value: 'table_number', width: '50%' },
                { title: 'Status', value: 'actions', sortable: false, width: '50%' },
            ],
            headersOrderDetails: [
                { title: '______PRODUCT_NAME______', value: 'product_name' },
                { title: 'Price', value: 'base_price' },
                { title: 'Subtotal', value: 'subtotal' },
            ],
        };
    },

    setup() {
        const authStore = useAuthStore();
        const branchStore = useBranchStore();
        const productsStore = useProductsStore();
        const stocksStore = useStocksStore();
        const ordersStore = useOrdersStore();
        const transactStore = useTransactStore();
        const loadingStore = useLoadingStore();
        const paymentStore = usePaymentStore();
        const ewalletImageStore = useEWalletImageStore()
        const currentDate = new Date().toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
        const formatCurrentDate = currentDate.replace(/,/g, '');
        return {
            authStore,
            branchStore,
            productsStore,
            stocksStore,
            ordersStore,
            transactStore,
            loadingStore,
            paymentStore,
            ewalletImageStore,
            formatCurrentDate
        };
    },

    watch: {
        selectedProducts: {
            handler() {
                if (this.order_type_charge && Number(this.order_type_charge) !== 0) {
                    this.subtotal = Number(this.subTotal) + Number(this.order_type_charge);
                } else {
                    this.subtotal = Number(this.subTotal);
                }
                this.total_amount = this.discountedSubtotal.toFixed(2);
            },
            deep: true
        },

        totalQuantity(newValue) {
            this.ordersStore.crrntTtlOrdrQntty = newValue;
        },

        discountedSubtotal(newValue) {
            this.ordersStore.crrntTtlOrdrChrg = newValue;
        },

        customer_cash() {
            const customerCharge = parseFloat(this.customer_cash) - this.discountedSubtotal;
            this.customer_change = customerCharge.toFixed(2);
            if (this.discountedSubtotal == 0) {
                this.customer_change = 0;
            }
            if (this.customer_cash === '') {
                this.customer_change = 0;
            }
        },

        discount_amount() {
            this.total_amount = Number(this.discountedSubtotal.toFixed(2));
            if (this.customer_cash) {
                const change = parseFloat(this.customer_cash) - parseFloat(this.total_amount);
                this.customer_change = change.toFixed(2);
            }
        },

        order_type_id(newVal) {
            if (Number(newVal) === 1) {
                this.order_type_charge = 0;
            }
        },
        
        eWalletPaid(newVal) {
            if (newVal) {
                setTimeout(() => {
                    this.closeEwalletDialog();
                }, 3000);
            }
        },
    },

    computed: {
        ...mapState(useStocksStore, ['stockNotificationQty']),

        paymentStatus() {
            return this.paymentStore.paymentStatus;
        },

        paymentDetails() {
            return this.paymentStore.paymentDetails;
        },

        isPollingActive() {
            return this.paymentStore.isPollingActive;
        },

        paymentStatusType() {
            const status = this.paymentStatus;
            if (status === 'awaiting_next_action') return 'warning';
            if (status === 'succeeded') return 'success';
            if (status === 'failed' || status === 'cancelled' || status === 'error') return 'error';
            return 'warning';
        },

        paymentStatusText() {
            const status = this.paymentStatus;
            const texts = {
                'awaiting_next_action': 'Waiting for payment',
                'succeeded': 'Payment successful',
                'failed': 'Payment failed',
                'cancelled': 'Payment cancelled',
                'error': 'Error checking status'
            };
            return texts[status] || status;
        },

        isOrderTypeChargeDisabled() {
            return Number(this.order_type_id) === 1;
        },

        isNotEwallet() {
            return Number(this.payment_method_id) !== 2;
        },

        filteredProducts() {
            if (!this.searchProduct) {
                return this.products;
            }
            return this.products.filter(product =>
                product.product_name.toLowerCase().includes(this.searchProduct.toLowerCase())
            );
        },

        totalQuantity() {
            return this.selectedProducts.reduce((sum, p) => sum + p.quantity, 0);
        },

        subTotal() {
            const baseTotal = this.selectedProducts.reduce((sum, p) => sum + (p.base_price * p.quantity), 0);
            const charge = Number(this.order_type_charge) || 0;
            return baseTotal + (charge !== 0 ? charge : 0);
        },

        customerChange() {
            if (this.discountedSubtotal === 0) {
                return 0;
            }
            const newCustomerChange = this.customer_cash - this.discountedSubtotal;
            return newCustomerChange;
        },

        currentOrders() {
            return this.orders;
        },

        totalOrderQuantity() {
            return Array.isArray(this.orderDetails)
                ? this.orderDetails.reduce((sum, item) => sum + (item.quantity || 0), 0)
                : 0;
        },

        itemIndicator() {
            let item_indicator = '';
            if (this.totalOrderQuantity > 1) {
                item_indicator = 'items';
            } else {
                item_indicator = 'item';
            }
            return item_indicator;
        },

        totalOrderAmount() {
            return Array.isArray(this.orderDetails)
                ? this.orderDetails.reduce((sum, item) => sum + (item.base_price * item.quantity || 0), 0)
                : 0;
        },

        discountedSubtotal() {
            let subtotal = this.subTotal;
            if (!this.discount_amount || isNaN(this.discount_amount) || this.discount_amount <= 0) {
                return subtotal;
            }
            return subtotal - parseFloat(this.discount_amount);
        },

    },

    async mounted() {
        await Promise.all([
            this.fetchProducts(),
            this.fetchCurrentOrders(),
            this.generateReferenceNumber(),
            this.fetchCategories(),
        ]);

        window.addEventListener('online', this.onOnline),
            window.addEventListener('offline', this.onOffline),
            echo.private(`payments.${this.referenceNumber}`)
                .listen('.payment.paid', () => {
                    this.eWalletPaid = true;
                    this.submitForm();
                })
    },

    beforeUnmount() {
        if (this.paymentStore) {
            this.paymentStore.resetPaymentState();
        }

        window.removeEventListener('online', this.onOnline);
        window.removeEventListener('offline', this.onOffline);

        echo.leave('newOrderChannel');
        echo.leave('payments');
    },

    methods: {

        onOffline() {
            this.isOnline = false;
            if (!this.eWalletPaid && this.eWalletDialog) {
                this.showTopAlertError("Internet connection disconnected.");
                this.closeEwalletDialog();
            }
        },

        onOnline() {
            this.isOnline = true;
            this.showTopAlertSuccess("Internet connection restored.");
        },

        lowStockAlert() {
            echo.channel('lowStockLevelChannel')
                .listen('LowStockLevel', (e) => {
                    this.showTopAlertError(e.message);
                });
        },

        updateFromBarista() {
            echo.channel('station.1')
                .listen('OrderStatusUpdated', (e) => {
                    console.log(e);
                    if (e.stationId === 1) {
                        this.showTopAlertSuccess(e.message);
                    }
                });
        },

        updateFromKitchen() {
            echo.channel('station.2')
                .listen('OrderStatusUpdated', (e) => {
                    console.log(e);
                    if (e.stationId === 2) {
                        this.showTopAlertSuccess(e.message);
                    }
                });
        },

        async reloadData() {
            this.products = this.productsStore.products;
            this.categories = this.productsStore.categories;
            this.orders = this.transactStore.currentOrders;
        },

        async generateReferenceNumber() {
            const generatedNumber = Math.random().toString().slice(2, 14);
            this.referenceNumber = generatedNumber;
            return this.referenceNumber;
        },

        async fetchProducts() {
            this.loadingProducts = true;
            try {
                await this.productsStore.fetchAllProductsStore();
                this.products = this.productsStore.products;
            } catch (error) {
                console.error('Error fetching products:', error);
                this.showError("Error fetching products!");
            } finally {
                this.loadingProducts = false;
            }
        },

        async fetchCurrentOrders() {
            this.loadingCurrentOrders = true;
            try {
                await this.transactStore.fetchAllCurrentOrdersStore();
                this.orders = this.transactStore.currentOrders;
                this.loadingCurrentOrders = false;
            } catch (error) {
                console.error('Error fetching current orders:', error);
                this.showError("Error fetching current orders!");
            } finally {
                this.loadingCurrentOrders = false;
            }
        },

        async fetchCategories() {
            this.progressCircular = true;
            try {
                await this.productsStore.fetchAllCategoriesStore();
                this.categories = this.productsStore.categories;
            } catch (error) {
                console.error('Error fetching categories:', error);
                this.showError("Error fetching categories!");
                this.progressCircular = false;
            } finally {
                this.progressCircular = false;
            }
        },

        reloadProducts() {
            this.products = this.productsStore.products;
            this.categories = this.productsStore.categories;
        },

        reloadCategories() {
            this.categories = this.productsStore.categories;
        },

        showCategories() {
            this.categories = this.productsStore.categories;
        },

        async handleCategorySelect(category) {
            if (!category || !category.label) {
                this.showTopAlertError("Invalid category selected!");
                return;
            }

            this.loadingCategories = true;

            await this.$nextTick();

            const filtered = this.productsStore.products.filter(
                product => product.category_label === category.label
            );

            this.products = filtered;
            this.selectedCategory = category.label;
            this.searchProduct = '';

            this.loadingCategories = false;
        },

        selectProduct(product) {
            if (!product || !product.product_name || !product.base_price) {
                console.error("Product data is missing!", product);
                return;
            }
            const index = this.selectedProducts.findIndex(p => p.product_id === product.product_id);
            if (index === -1) {
                this.selectedProducts.push({ ...product, quantity: 1 });
            } else {
                this.selectedProducts[index].quantity++;
            }
        },

        deductQuantity(product) {
            const index = this.selectedProducts.findIndex(p => p.product_id === product.product_id);
            if (this.selectedProducts[index].quantity > -1) {
                this.selectedProducts[index].quantity--;
            }
            if (this.selectedProducts[index].quantity === 0) {
                this.selectedProducts.splice(index, 1);
            }
        },

        addQuantity(product) {
            const index = this.selectedProducts.findIndex(p => p.product_id === product.product_id);
            if (this.selectedProducts[index].quantity > -1) {
                this.selectedProducts[index].quantity++;
            }
        },

        cashPayment () {
            this.payment_method_id = 1;
        },

        async generateQRPhCode() {

            if (!this.isOnline) {
                this.showError("No internet connection. Unable to generate QR.");
                return;
            }

            if (this.eWalletPaid) {
                this.showError("Payment already completed.");
                return;
            }

            if (this.discountedSubtotal === 0) {
                this.showError("No product selected.");
                return;
            }

            try {
                this.loadingQr = true;
                this.eWalletImgSrc = null;
                this.payment_mode_id = 2;
                this.selectedEwalletOption = 'qrph';

                await this.generateReferenceNumber();
                
                const amountToPay = this.discountedSubtotal;

                await this.paymentStore.generateQRPhCodeStore(
                    amountToPay,
                    this.selectedEwalletOption,
                    this.referenceNumber
                );

                this.customer_cash = amountToPay;
                this.eWalletImgSrc = this.paymentStore.qrImageSrc;

            } catch (err) {
                this.showError("Failed to generate QR: " + (err.message || 'Unknown error'));
                this.eWalletDialog = false;
            } finally {
                this.loadingQr = false;
            }
        },

        // downloadQR() {
        //     if (!this.eWalletImgSrc) {
        //         this.showError("No QR to download.");
        //         return;
        //     }
        //     const link = document.createElement('a');
        //     link.href = this.eWalletImgSrc;
        //     link.download = 'Poofsa-QR-' + this.referenceNumber + '.png';
        //     document.body.appendChild(link);
        //     link.click();
        //     document.body.removeChild(link);
        // },

        showSelectedOrderDialog() {
            this.selectedOrderDialog = true;
        },

        closeEwalletDialog() {
            this.eWalletDialog = false;
            this.paymentStore.resetPaymentState();
        },

        async submitForm() {
            try {
                this.placingOrder = true;

                if (!this.$refs.transactionForm.validate()) {
                    this.placingOrder = false;
                    return;
                }

                if (Number(this.payment_method_id) === 2) {
                    if (!this.eWalletPaid) {
                        this.showError('Please complete e-Wallet payment first');
                        this.placingOrder = false;
                        return;
                    }
                }

                if (!this.referenceNumber) {
                    this.showError("Error in reference number. Refresh the page!");
                    this.placingOrder = false;
                    return;
                }

                this.computed_discount = this.subTotal * (this.discount_amount / 100);

                const formData = new FormData();
                formData.append("transactions[0][reference_number]", this.referenceNumber);
                formData.append("transactions[0][total_quantity]", this.totalQuantity);
                formData.append("transactions[0][total_amount]", parseFloat(this.discountedSubtotal) || 0);
                formData.append("transactions[0][subtotal]", parseFloat(this.subTotal) || 0);
                formData.append("transactions[0][order_type_id]", Number(this.order_type_id));
                formData.append("transactions[0][order_type_charge]", parseFloat(this.order_type_charge) || 0);
                formData.append("transactions[0][customer_cash]", parseFloat(this.customer_cash) || 0);
                formData.append("transactions[0][customer_change]", parseFloat(this.customer_change) || 0);
                formData.append("transactions[0][discount_amount]", this.computed_discount);
                formData.append("transactions[0][payment_method_id]", Number(this.payment_method_id));
                formData.append("transactions[0][table_number]", Number(this.table_number));
                formData.append("transactions[0][customer_name]", this.customer_name);
                formData.append("transactions[0][order_note]", this.order_note);

                this.selectedProducts.forEach((product, index) => {
                    formData.append(`transactions[0][products][${index}][product_id]`, product.product_id);
                    formData.append(`transactions[0][products][${index}][station_id]`, product.station_id);
                    formData.append(`transactions[0][products][${index}][quantity]`, product.quantity);
                });

                await this.transactStore.submitTransactStore(formData);

                this.$refs.transactionForm.reset();
                this.subTotal = 0;
                this.totalQuantity = 0;
                this.selectedProducts = [];
                this.selectedOrderDialog = false;

                await Promise.all([
                    this.fetchProducts(),
                    this.fetchCurrentOrders(),
                    this.fetchCategories(),
                    this.resetPaymentSection(),
                    this.generateReferenceNumber(),
                ]);

                this.showSuccess("Success! Ready for next customer.");
                this.scrollToTop();

            } catch (error) {
                this.showError(error);
                console.error(error);
            } finally {
                this.placingOrder = false;
            }
        },

        scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        async toViewOrder(item) {
            this.selectedReferenceNumber = item.reference_number;
            this.viewOrderDialog = true;
        },

        resetPaymentSection() {
            this.eWalletPaid = false;
            this.order_type_id = 1;
            this.order_type_charge = 0;
            this.customer_cash = '';
            this.customer_change = 0;
            this.discount_amount = 0;
            this.computed_discount = null;
            this.payment_method_id = 1;
            this.customer_name = '-';
            this.order_note = '-';
        },

        showTopAlertError(message) {
            if (this.$refs.alertRef) {
                this.$refs.alertRef.showSnackbarAlert(message, "error");
            }
        },

        showTopAlertSuccess(message) {
            if (this.$refs.alertRef) {
                this.$refs.alertRef.showSnackbarAlert(message, "success");
            }
        },

        showError(message) {
            if (this.$refs.snackbarRef) {
                this.$refs.snackbarRef.showSnackbar(message, "error");
            }
        },

        showSuccess(message) {
            if (this.$refs.snackbarRef) {
                this.$refs.snackbarRef.showSnackbar(message, "success");
            }
        },

    }
};
</script>

<style scoped>
/* .v-text-field {
    padding-top: 7px !important;
}

.v-input--density-compact {
    --v-input-padding-top: 0 !important;
}

.search-product-input .v-input__details {
    display: flex !important;
} */

/* .v-text-field {
    background-color: #fff !important;
    padding-left: 15px !important;
    border-radius: 10px !important;
} */

.category-chip:hover {
    background-color: #0090b6 !important;
    color: #fff !important;
    transition: 0.5s ease-in-out;
}

.v-icon--size-default {
    font-size: 20px !important;
}

.v-btn--size-default {
    --v-btn-height: 22px;
}

.v-data-table {
    border-radius: 0 0 10px 10px !important;
}

::v-deep(.hover-table .v-data-table__tr) {
    transition: background-color 0.5s ease-in-out;
    cursor: pointer;
}

::v-deep(.hover-table .v-data-table__tr:hover) {
    animation: backgroundFade 2s infinite;
}

@keyframes backgroundFade {
    0% {
        background-color: rgba(224, 247, 250, 0);
    }

    50% {
        background-color: rgba(117, 62, 62, 0.442);
    }

    100% {
        background-color: rgba(224, 247, 250, 0);
    }
}

.mini-btn {
    font-size: 13px;
    width: 20px !important;
    height: 25px !important;
}

.required-asterisk {
    color: red;
    font-weight: bold;
}

.payment-section {
    display: flex;
    flex-wrap: wrap;
}

.payment-section-item {
    width: 200px;
}

.image-section {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

.image-section-item {
    width: 20%;
    min-width: 140px;
}

@media (max-width: 880px) {
    .image-section-item {
        width: 30%;
    }
}

@media (max-width: 620px) {
    .image-section-item {
        width: 50%;
    }
}

.image-section .product-card {
    margin: 5px;
    padding: 8px;
    cursor: pointer;
    background-color: #fff;
    border-radius: 10px;
    display: flex;
    align-items: center;
    flex-direction: column;
}

.image-section .product-card:hover {
    background-color: rgb(225, 232, 237) !important;
    transition: 0.5s ease;
}

.image-section .v-img {
    border-radius: 10px;
    width: 75%;
}

.product-card-text {
    font-size: 14px;
}

.selected-products-container {
    display: flex;
    flex-direction: column;
}

.selected-products-container .selected-products-card {
    padding: 10px;
    display: flex;
    align-items: center;
    border-radius: 10px;
    margin-bottom: 5px;
    background-color: #fff;
}

.product-card .text-truncate {
    width: 145px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
}

.v-bottom-sheet .payment-amounts {
    background-color: #fff;
    border-radius: 10px;
    padding: 14px;
}

/* QR Dialog Styles */
.qr-dialog .v-card {
    border-radius: 15px !important;
    overflow: hidden;
}

.qr-container {
    background: #fffcfc;
    border-radius: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ewallet-btn {
    text-transform: none !important;
    letter-spacing: 0.5px !important;
    background: linear-gradient(135deg, #0b0069 0%, #c62828 100%) !important;
    color: white !important;
}

.ewallet-btn.regenerate {
    border-radius: 15px;
}

.v-alert {
    padding: 10px !important;
}

.v-alert--density-default {
    padding-top: 10px !important;
    padding-bottom: 10px !important;
}

.payment-status {
    font-size: 14px;
    font-weight: normal;
    border-radius: 15px;
    margin: 5px 0;
}

.payment-status.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.place-order-btn {
    width: 100% !important;
    height: 50px !important;
    margin: auto !important;
    padding: 0 13px !important;
    align-items: center !important;
    border-radius: 30px !important;
    font-size: 16px !important;
}

.selected {
    border: 1px solid #0090b6;
}

.refresh {
    position: fixed;
    bottom: 15px;
    right: 15px;
    z-index: 1;
}
</style>
