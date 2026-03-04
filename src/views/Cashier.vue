<template>
    
    <v-container>
        <!-- <v-btn @click="this.reloadData" color="#0090b6" class="refresh" variant="flat" icon>
            <v-icon>mdi-refresh</v-icon>
        </v-btn> -->

        <div class="payment-indication pa-2 text-white">
            <h3 class="me-13 text-white">Quantity: <span>{{ totalQuantity }}</span></h3>
            <h3 class="ms-15 text-white">Charge: ₱ <span>{{ subTotal.toFixed() }}</span></h3>
        </div>
        <v-form ref="transactionForm" @submit.prevent="submitForm" v-model="isFormValid">
            <v-row>
                <!-- Main Section -->
                <v-container class="image-section">
                    <!-- Products -->
                    <div v-for="product in this.products" :key="product.id" @click="selectProduct(product)"
                        class="image-section-item">
                        <v-card class="product-card">
                            <v-img :src="WTFImgSrc"></v-img>
                            <div class="mt-2">
                                <p style="font-size: 14px;" class="text-truncate">{{ product.product_name }}</p>
                                <p style="font-size: 14px;">{{ product.temp_label }} {{ product.size_label }}</p>
                                <p><strong>₱ {{ product.base_price }}</strong></p>
                            </div>
                        </v-card>
                    </div>
                </v-container>

                <v-col cols="12" lg="6" md="6" sm="12" xs="12">
                    <div class="d-flex align-items-center flex-column">
                        <div class="indication pa-2 text-white">
                            <h3 class="me-13 text-white">Quantity: <span>{{ totalQuantity }}</span></h3>
                            <h3 class="ms-15 text-white">Charge: ₱ <span>{{ subTotal.toFixed() }}</span></h3>
                        </div>
                        <div class="d-flex align-items-center justify-content-center mt-2">
                            <v-text-field v-model="searchProduct" class="find-product-input w-75"
                                placeholder="FIND PRODUCT..." density="compact">
                            </v-text-field>
                            <div class="d-flex justify-center mt-10" style="z-index: 1;">
                                <template v-if="this.selectedCategory">
                                    <v-chip color="#696969" variant="flat" class="position-absolute" style="top: 105px;"
                                        size="small">
                                        {{ this.selectedCategory }}
                                    </v-chip>
                                    <v-icon @click="closeSelectedCategory" class="position-absolute" style="top: 95px;">
                                        mdi-close</v-icon>
                                </template>
                            </div>
                            <v-btn color="#0090b6" class="category-btn ms-2 d-flex align-items-center" variant="flat"
                                @click="showCategoriesDialog" large>
                                <v-icon>mdi-tune-variant</v-icon>
                            </v-btn>
                        </div>
                    </div>
                    <v-data-table v-if="this.products.length > 0" :headers="headersDisplay" :items="filteredProducts"
                        :loading="loadingProducts" :items-per-page="-1" height="400px"
                        @click:row="(event, { item }) => selectProduct(item)" density="comfortable"
                        class="hover-table mt-2">
                        <!-- eslint-disable vue/valid-v-slot -->
                        <template v-slot:item.product_name="{ item }">
                            <span class="small">
                                {{ item.product_name }}{{ item.temp_label }}{{ item.size_label }}
                            </span>&nbsp;
                        </template>
                        <template v-slot:item.base_price="{ item }">
                            <span class="small">₱{{ item.base_price }}</span>
                        </template>
                    </v-data-table>
                    <v-container v-else class="text-center">
                        <p style="font-size: 15px;">No available products. <span @click="reloadProducts"
                                class="text-primary" style="cursor: pointer;">Tap to reload</span> </p>
                    </v-container>
                </v-col>

                <!-- Selected & Payment Section -->
                <v-col cols="12" lg="6" md="6" sm="12" xs="12">
                    <v-row>
                        <!-- Selected Products -->
                        <v-col cols="12">
                            <h3>Selected Products</h3>
                            <v-data-table :headers="headersSelected" :loading="loadingProducts"
                                :items="selectedProducts" density="comfortable" height="400px">
                                <template v-slot:item.product_name="{ item }">
                                    <div class="d-flex align-center justify-space-between">
                                        <span>
                                            {{ item.product_name }}{{ item.temp_label }}{{ item.size_label }} x {{
                                                item.quantity }}</span>
                                        <span>&nbsp;&nbsp;₱{{ item.base_price }}</span>
                                    </div>
                                </template>
                                <template v-slot:item.actions="{ item }">
                                    <v-btn @click="minusQuan(item)" color="#0090b6" class="mini-btn ms-3"
                                        variant="flat">
                                        <v-icon>mdi-minus</v-icon>
                                    </v-btn>
                                    <v-btn @click="addQuan(item)" color="#0090b6" class="mini-btn mx-1" variant="flat">
                                        <v-icon>mdi-plus</v-icon>
                                    </v-btn>
                                    <v-btn @click="removeProduct(item)" color="#ff0d0d" class="mini-btn" variant="flat">
                                        <v-icon>mdi-delete</v-icon>
                                    </v-btn>
                                </template>
                            </v-data-table>
                        </v-col>

                        <!--Payment Section  -->
                        <v-col cols="12">
                            <h3>Payment Section</h3>
                            <div class="payment-section mt-3">
                                <v-text-field class="payment-section-item me-2 mt-2" v-model="subtotal"
                                    label="Sub total" variant="outlined" density="compact" type="number"
                                    :model-value="subTotal.toFixed(2)" prepend-inner-icon="mdi-cash" readonly />

                                <v-text-field class="payment-section-item me-2 mt-2" v-model="total_amount"
                                    label="Total amount" variant="outlined" density="compact" type="number"
                                    :model-value="discountedSubtotal.toFixed(2)" prepend-inner-icon="mdi-cash"
                                    readonly />

                                <v-autocomplete class="payment-section-item me-2 mt-2" v-model="order_type_id"
                                    :items="orderTypeItems" item-title="ordertype_label" item-value="ordertype_id"
                                    label="Order type" variant="outlined" density="compact" />

                                <v-text-field class="payment-section-item me-2 mt-2" v-model="order_type_charge"
                                    label="Order type charge" variant="outlined" :disabled="isOrderTypeChargeDisabled"
                                    @input="e => order_type_charge = e.target.value.replace(/[^0-9.]/g, '')"
                                    inputmode="numeric" type="number" density="compact"
                                    prepend-inner-icon="mdi-cash-plus" />

                                <v-text-field class="payment-section-item me-2 mt-2" v-model.number="customer_cash"
                                    variant="outlined" density="compact" type="number" :disabled="eWalletPaid"
                                    :rules="[v => !isNaN(parseFloat(v)) || 'Required', v => parseFloat(v) >= this.subTotal || 'Must be greater than or equal to total charge']"
                                    @input="e => customer_cash = e.target.value.replace(/[^0-9.]/g, '')"
                                    inputmode="numeric" prepend-inner-icon="mdi-cash-plus" placeholder="Enter cash">
                                    <template #label>
                                        <span class="required-asterisk">*</span> Cash render
                                    </template>
                                </v-text-field>

                                <v-text-field class="payment-section-item me-2 mt-2" v-model="customer_change"
                                    label="Change" variant="outlined" density="compact" :model-value="customerChange"
                                    prepend-inner-icon="mdi-cash-refund" readonly />

                                <v-text-field class="payment-section-item me-2 mt-2" v-model.number="discount_amount"
                                    variant="outlined" density="compact" type="number" :rules="[v => !!v || 'Required']"
                                    prepend-inner-icon="mdi-cash-minus"
                                    @input="e => discount_amount = e.target.value.replace(/[^0-9.]/g, '')"
                                    inputmode="numeric">
                                    <template #label>
                                        <span class="required-asterisk">*</span> Discount (₱)
                                    </template>
                                </v-text-field>

                                <v-text-field class="payment-section-item me-2 mt-2" v-model="order_note"
                                    variant="outlined" density="compact" type="text" :rules="[v => !!v || 'Required']"
                                    prepend-inner-icon="mdi-note" placeholder="Enter note">
                                    <template #label>
                                        <span class="required-asterisk">*</span> Note
                                    </template>
                                </v-text-field>

                                <v-text-field class="payment-section-item me-2 mt-2" v-model="customer_name"
                                    variant="outlined" density="compact" type="text" :rules="[v => !!v || 'Required']"
                                    prepend-inner-icon="mdi-account" placeholder="Enter customer name">
                                    <template #label>
                                        <span class="required-asterisk">*</span> Customer name
                                    </template>
                                </v-text-field>

                                <v-text-field class="payment-section-item me-2 mt-2" v-model="table_number"
                                    variant="outlined" density="compact" type="text" :rules="[v => !!v || 'Required']"
                                    prepend-inner-icon="mdi-table-chair" inputmode="numeric"
                                    placeholder="Enter table number">
                                    <template #label>
                                        <span class="required-asterisk">*</span> Table number
                                    </template>
                                </v-text-field>

                            </div>

                            <div class="payment-section d-flex">
                                <v-autocomplete class="me-2 mt-2" v-model="payment_method_id" variant="outlined"
                                    density="compact" prepend-inner-icon="mdi-cash"
                                    :disabled="!table_number || eWalletPaid" :items="paymentModeItems"
                                    item-title="paymentmode_label" item-value="paymentmode_id"
                                    label="Mode of payment" />
                                <v-btn @click="generateQRPhCode"
                                    :disabled="!isOnline || isNotEwallet || !table_number || eWalletPaid"
                                    prepend-icon="mdi-qrcode" height="37" color="green"
                                    class="ewallet-btn me-2 mt-2">Generate
                                    QR</v-btn>
                            </div>

                            <div class="d-flex justify-end me-2 ms-1">
                                <v-btn class="bg-red-lighten-2 d-flex w-50 py-6 mt-3" variant="flat"
                                    prepend-icon="mdi-refresh" @click="resetPaymentSection"
                                    :disabled="loading || eWalletPaid">
                                    Reset
                                </v-btn>&nbsp;
                                <v-btn class="d-flex w-50 py-6 mt-3" color="#0090b6" variant="flat"
                                    append-icon="mdi-send" type="submit" :loading="loading" :disabled="!isFormValid || loading ||
                                        (payment_method_id === 2 && !eWalletPaid) ||
                                        Number(customer_cash) < subTotal ||
                                        Number(customer_change) < 0 ||
                                        subTotal <= 0 || !isOnline">
                                    Submit
                                </v-btn>
                            </div>

                        </v-col>

                        <!-- Current Orders Section -->
                        <v-col cols="12">
                            <span class="d-flex align-center justify-space-between mb-1">
                                <h3>Current Orders</h3>
                                <v-btn @click="fetchCurrentOrders" prepend-icon="mdi-refresh" variant="tonal"
                                    color="#0090b6">
                                    Refresh
                                </v-btn>
                            </span>
                            <v-data-table :headers="headersOrders" :items="currentOrders"
                                :loading="loadingCurrentOrders" density="comfortable" height="300px">
                                <template v-slot:item.table_number="{ item }">
                                    <div class="d-flex align-center justify-space-between">
                                        <h3># {{ item.table_number }}</h3>
                                    </div>
                                </template>

                                <!--eslint-disable-next-line -->
                                <template v-slot:item.actions="{ item }">
                                    <div class="d-flex" style="gap: 8px;">
                                        <v-chip color="#0090b6" prepend-icon="mdi-eye-outline" size="small"
                                            variant="flat" class="ps-5 pe-4 text-white" @click="toViewOrder(item)">View
                                        </v-chip>
                                    </div>
                                    <ViewOrder :key="selectedReferenceNumber" v-model="viewOrderDialog"
                                        @update:modelValue="productEditDialog = $event"
                                        :reference-number="selectedReferenceNumber" />
                                </template>

                            </v-data-table>
                        </v-col>
                    </v-row>
                </v-col>

            </v-row>

            <!-- Categories -->
            <v-dialog v-model="categoriesDialog" width="500" height="500" class="rounded-10">
                <v-btn @click="categoriesDialog = false" color="#0090b6" class="position-absolute" size="small"
                    style="top: -17px; left: -17px; z-index: 10;" icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-card>
                    <h3 class="bg-grey-lighten-4 position-fixed pa-2 w-100"
                        style="z-index: 2; border-radius: 3px 3px 0 0;">
                        <p class="ms-3">Categories</p>
                    </h3>
                    <div class="d-flex align-center flex-column pa-8 mt-6">
                        <v-list-item v-for="(category, i) in productsStore.getCategories" :key="i"
                            :prepend-icon="category.icon" class="text-white mt-2 w-100"
                            style="border-radius: 20px !important; background: #0090b6;"
                            @click="handleCategorySelect(category)">
                            <span>{{ category.label }}</span>
                        </v-list-item>
                    </div>
                    <v-sheet v-if="productsStore.getCategories.length === 0" class="mt-5 text-center">
                        <p style="font-size: 15px;">No categories found. <span @click="reloadCategories"
                                class="text-primary" style="cursor: pointer;">Tap to reload</span> </p>
                    </v-sheet>
                </v-card>
            </v-dialog>

            <!-- e-Wallet Payment -->
            <v-dialog v-model="eWalletDialog" width="500" class="qr-dialog" transition="dialog-bottom-transition"
                persistent scrollable>
                <v-btn @click="closeEwalletDialog" color="#0090b6" class="position-absolute" size="small"
                    style="top: -17px; left: -17px; z-index: 10;" icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-card class="d-flex flex-column align-center pa-6">
                    <div class="d-flex flex-column w-100 mb-2" style="gap: 10px;">
                        <v-btn @click="generateQRPhCode" :disabled="paymentStore.loading"
                            class="ewallet-btn regenerate w-100" height="48">
                            <v-icon start>mdi-qrcode</v-icon>
                            Regenerate QR
                        </v-btn>
                    </div>

                    <div v-if="selectedEwalletOption === 'qrph'" class="qr-container text-center w-100 pa-2">
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
                                <strong>₱ {{ discountedSubtotal.toFixed(2) }}</strong>
                            </p>
                            <v-img :src="eWalletImgSrc" width="250" height="250" class="mx-auto"></v-img>
                            <!-- <v-chip @click="downloadQR" color="#0090b6" size="small" variant="flat" prepend-icon="mdi-download">Download QR</v-chip> -->
                            <p class="text-center mt-2">
                                QR will expire in {{ qrTimerDisplay }}
                            </p>
                        </div>

                        <div v-else class="d-flex justify-center">
                            <div class="d-flex align-center flex-column" style="width: 200px; height: 200px;">
                                <p class="text-grey my-3">Generating...</p>
                                <v-progress-circular color="grey" indeterminate size="50"
                                    width="2"></v-progress-circular>
                            </div>
                        </div>
                    </div>

                    <!-- Show payment status -->
                    <div class="payment-status w-100">
                        <v-alert v-if="paymentStore.isPollingActive || eWalletPaid" :type="paymentStatusType"
                            variant="tonal" style="border-radius: 15px;" class="mt-1 px-3">
                            <div class="d-flex align-center justify-space-between">
                                <span v-if="!paymentStatus">Waiting for Payment</span>
                                <span v-else>{{ paymentStatusText }}</span>
                                <v-progress-circular v-if="paymentStore.isPollingActive && !eWalletPaid" indeterminate
                                    size="20" width="2"></v-progress-circular>
                                <v-icon v-else-if="eWalletPaid" color="success">mdi-check-circle</v-icon>
                            </div>
                        </v-alert>
                    </div>

                    <div v-if="eWalletImgSrc" class="text-center">
                        <p class="text-caption text-grey">
                            Please don't refresh this page until e-Wallet payment is succeeded.
                        </p>
                    </div>
                </v-card>
            </v-dialog>
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
            isFormValid: false,
            eWalletDialog: false,
            eWalletPaid: false,
            eWalletImgSrc: null,
            qrTimer: 180, // 3 minutes
            qrTimerInterval: null,
            qrTimerDisplay: "03:00",
            selectedEwalletOption: 'qrph',
            isOnline: navigator.onLine,
            onPaymentSuccessCallback: null,
            onStatusUpdateCallback: null,
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
            redirectUrl: '',
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
            totalQuan: 0,
            createdAt: '',
            updatedAt: '',
            tableNumber: 'N/A',
            loading: false,
            headersDisplay: [
                { title: '', value: 'product_name' },
                { title: '', value: 'base_price' },
            ],
            headersSelected: [
                { title: '', value: 'product_name', width: '50%' },
                { title: '', value: 'actions', sortable: false, width: '50%' },
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

    beforeUnmount() {
        if (this.paymentStore) {
            this.paymentStore._onStatusUpdate = null;
            this.paymentStore._onPaymentSuccess = null;
            this.paymentStore.stopPaymentPolling();
            this.paymentStore.resetPaymentState();
        }

        echo.leave('newOrderChannel');

        window.removeEventListener('online', this.onOnline);
        window.removeEventListener('offline', this.onOffline);
    },

    setup() {
        const authStore = useAuthStore();
        const branchStore = useBranchStore();
        const productsStore = useProductsStore();
        const stocksStore = useStocksStore();
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
            transactStore,
            loadingStore,
            paymentStore,
            ewalletImageStore,
            formatCurrentDate
        };
        // paymentModeItems: computed(() => paymentStore.paymentModeOptions), };
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
            // return 'info';
        },

        paymentStatusText() {
            const status = this.paymentStatus;
            const texts = {
                'awaiting_next_action': 'Waiting for Payment',
                'succeeded': 'Payment Successful',
                'failed': 'Payment Failed',
                'cancelled': 'Payment Cancelled',
                'error': 'Error Checking Status'
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
            // this.fetchCurrentOrders(),
            // this.fetchCategories(),
            window.addEventListener('online', this.onOnline),
            window.addEventListener('offline', this.onOffline)
        ]);
    },

    methods: {

        onOffline() {
            this.isOnline = false;

            // Stop polling immediately
            this.paymentStore.stopPaymentPolling();

            // If payment not yet completed
            if (!this.eWalletPaid && this.eWalletDialog) {
                this.showError("Internet connection disconnected.");
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
            return generatedNumber;
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

        // async fetchOrderStatus() {
        //     try {
        //         await this.transactStore.fetchAllOrderStatusStore();
        //         this.order_statuses = this.transactStore.orderStatuses;
        //     } catch (error) {
        //         console.error('Error fetching order status:', error);
        //         this.showError("Error fetching order status!");
        //     }
        // },

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
            this.loadingCategories = true;
            this.progressCircular = true;
            try {
                await this.productsStore.fetchAllCategoriesStore();
                this.categories = this.productsStore.categories;
            } catch (error) {
                console.error('Error fetching categories:', error);
                this.showError("Error fetching categories!");
                this.progressCircular = false;
            } finally {
                this.loadingCategories = false;
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

        showCategoriesDialog() {
            this.categoriesDialog = true;
            this.categories = this.productsStore.categories;
        },

        handleCategorySelect(category) {
            this.categoriesDialog = false;
            if (!category || !category.label) {
                this.showError("Invalid category selected!");
                return;
            }
            this.products = this.productsStore.products.filter(
                product => product.category_label === category.label
            );
            this.selectedCategory = category.label;
            if (this.products.length === 0) {
                this.showError(`No products in ${category.label} category`);
            } else {
                this.searchProduct = '';
            }
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

        minusQuan(product) {
            const index = this.selectedProducts.findIndex(p => p.product_id === product.product_id);
            if (this.selectedProducts[index].quantity > -1) {
                this.selectedProducts[index].quantity--;
            }
            if (this.selectedProducts[index].quantity === 0) {
                this.selectedProducts.splice(index, 1);
            }
        },

        addQuan(product) {
            const index = this.selectedProducts.findIndex(p => p.product_id === product.product_id);
            if (this.selectedProducts[index].quantity > -1) {
                this.selectedProducts[index].quantity++;
            }
        },

        removeProduct(product) {
            this.selectedProducts = this.selectedProducts.filter(p => p.product_id !== product.product_id);
        },

        capitalizeFirstLetter(text) {
            if (!text) return '';
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
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

            if (this.payment_method_id !== 2) {
                this.showError("Please select e-Wallet payment.");
                return;
            }

            if (this.discountedSubtotal === 0) {
                this.showError("No product selected.");
                return;
            }

            this.eWalletImgSrc = null;
            this.eWalletDialog = true;

            try {
                this.setupPaymentCallbacks();

                const referenceNumber = await this.generateReferenceNumber();

                const amountToPay = this.discountedSubtotal;

                const selectedEWallet = this.selectedEwalletOption;

                await this.paymentStore.generateQRPhCodeStore(
                    amountToPay,
                    selectedEWallet,
                    referenceNumber
                );
                this.referenceNumber = referenceNumber;
                this.customer_cash = amountToPay;
                this.eWalletImgSrc = this.paymentStore.qrImageSrc;
                this.startQrTimer();

            } catch (err) {
                this.showError("Failed to generate QR: " + (err.message || 'Unknown error'));
                this.eWalletDialog = false;
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

        setupPaymentCallbacks() {
            this.paymentStore._onStatusUpdate = (statusResult) => {
                console.log('Payment status update:', statusResult);
                this.handlePaymentStatus(statusResult);
            };
            this.paymentStore._onPaymentSuccess = (details) => {
                console.log('Payment success! Details:', details);
                this.handlePaymentSuccess();
            };
        },

        handlePaymentStatus(statusResult) {
            if (!statusResult?.ok) {
                this.showError("Error checking payment status.");
                return;
            }

            switch (statusResult.original_status) {
                case 'awaiting_next_action':
                    // waiting for user scan — do nothing
                    break;

                case 'succeeded':
                    this.eWalletPaid = true;
                    this.showSuccess("e-Wallet payment received successfully!");
                    setTimeout(() => {
                        this.closeEwalletDialog();
                    }, 1000);
                    this.submitForm();
                    break;

                case 'failed':
                case 'cancelled':
                    this.showError("Payment failed. Please try again.");
                    this.closeEwalletDialog();
                    break;
            }
        },

        handlePaymentSuccess() {
            this.eWalletPaid = true;
        },

        startQrTimer() {
            this.qrTimer = 180; // 3 minutes
            this.updateQrTimerDisplay();

            if (this.qrTimerInterval) clearInterval(this.qrTimerInterval);

            this.qrTimerInterval = setInterval(() => {
                if (!this.isOnline) {
                    this.stopQrTimer();
                    this.showError("QR expired due to lost connection.");
                    this.closeEwalletDialog();
                    return;
                }

                if (this.qrTimer > 0) {
                    this.qrTimer--;
                    this.updateQrTimerDisplay();
                } else {
                    this.stopQrTimer();
                    this.showError("QR expired. You can regenerate again!");
                    this.closeEwalletDialog();
                }
            }, 1000);
        },

        stopQrTimer() {
            if (this.qrTimerInterval) {
                clearInterval(this.qrTimerInterval);
                this.qrTimerInterval = null;
            }
        },

        updateQrTimerDisplay() {
            const minutes = Math.floor(this.qrTimer / 60).toString().padStart(2, "0");
            const seconds = (this.qrTimer % 60).toString().padStart(2, "0");
            this.qrTimerDisplay = `${minutes}:${seconds}`;
        },

        closeEwalletDialog() {
            this.eWalletDialog = false;
            this.stopQrTimer();
            this.paymentStore.resetPaymentState();
        },

        async submitForm() {
            try {
                this.loadingStore.show("Submitting...");

                if (!this.$refs.transactionForm.validate()) {
                    this.loadingStore.hide();
                    return;
                }

                if (Number(this.payment_method_id) === 2) {
                    if (!this.eWalletPaid) {
                        this.showError('Please complete e-Wallet payment first');
                        this.loadingStore.hide();
                        return;
                    }
                }

                const refNumber = await this.generateReferenceNumber();
                if (!refNumber) {
                    this.showError("Error in reference number. Refresh the page!");
                    this.loadingStore.hide();
                    return;
                }

                this.computed_discount = this.subTotal * (this.discount_amount / 100);

                const formData = new FormData();
                formData.append("transactions[0][reference_number]", refNumber);
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

                await Promise.all([
                    this.fetchProducts(),
                    this.fetchCurrentOrders(),
                    this.fetchCategories(),
                    this.resetPaymentSection(),

                ]);

                this.showSuccess("Success! Ready for next customer.");
                this.scrollToTop();

            } catch (error) {
                this.showError(error);
                console.error(error);
            } finally {
                this.loadingStore.hide();
            }
        },

        scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        async toViewOrder(item) {
            this.selectedReferenceNumber = item.reference_number;
            this.viewOrderDialog = true;
        },

        closeSelectedCategory() {
            this.selectedCategory = '';
            this.products = this.productsStore.products;
        },

        formatOrder(order) {
            return {
                ...order,
                product_name: order.product_name || '',
                base_price: order.base_price ? parseFloat(order.base_price) : 0,
                subtotal: order.subtotal ? parseFloat(order.subtotal) : 0,
                quantity: order.quantity ? parseInt(order.quantity, 10) : 0,
                temp_label: order.temp_label || '',
                size_label: order.size_label || '',
                total_quantity: order.total_quantity ? parseInt(order.total_quantity, 10) : 0,
                total_amount: order.total_amount ? parseFloat(order.total_amount) : 0,
                customer_cash: order.customer_cash ? parseFloat(order.customer_cash) : 0,
                customer_change: order.customer_change ? parseFloat(order.customer_change) : 0,
                table_number: order.table_number || 'N/A',
                created_at: order.created_at ? this.formatDateTime(order.created_at) : 'N/A',
                updated_at: order.updated_at ? this.formatDateTime(order.updated_at) : 'N/A',
            };
        },

        formatDateTime(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Manila'
            });
        },

        resetPaymentSection() {
            this.eWalletPaid = false;
            this.order_type_id = 1;
            this.order_type_charge = '0';
            this.customer_cash = '';
            this.customer_change = '0';
            this.discount_amount = '0';
            this.computed_discount = null;
            this.payment_method_id = 1;
            this.table_number = null;
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
.v-text-field input {
    margin-left: 0 !important;
}

.find-product-input {
    border-radius: 10px;
}

.category-btn {
    padding: 20px;
    border-radius: 8px;
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

::v-deep .v-input__details {
    display: none;
}

.indication {
    display: flex;
    justify-content: space-between;
    position: sticky;
    border-radius: 8px !important;
    background: #696969;
}

.v-container div.payment-indication {
    position: fixed;
    bottom: 20px;
    height: 70px;
    width: 90%;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 8px !important;
    background-color: #0090b6;
}

.mini-btn {
    font-size: 15px;
    width: 35px !important;
    height: 27px !important;
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
    width: 185px;
    min-width: 100px;
}

.image-section .v-card {
    margin: 5px;
    padding: 16px;
    cursor: pointer;
}

.image-section .v-card:hover {
    background-color: rgb(228, 243, 255) !important;
    transition: 0.5s ease;
}

.image-section .v-img {
    border-radius: 10px;
}

.text-truncate {
    width: 130px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.v-input__details {
    display: none;
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

.refresh {
    position: fixed;
    bottom: 15px;
    right: 15px;
    z-index: 1;
}
</style>
