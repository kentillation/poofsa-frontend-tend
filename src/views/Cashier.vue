<template>
    <v-container>
        <v-btn @click="this.reloadData" color="#0090b6" class="refresh" variant="flat" icon>
            <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-form ref="transactionForm" @submit.prevent="submitForm" v-model="isFormValid">
            <v-row>
                <!-- Main Section -->
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
                        <template v-slot:item.product_price="{ item }">
                            <span class="small">₱{{ item.product_price }}</span>
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
                            <v-data-table :headers="headersSelected" :items="selectedProducts" density="comfortable"
                                height="400px">
                                <template v-slot:item.product_name="{ item }">
                                    <div class="d-flex align-center justify-space-between">
                                        <span>
                                            {{ item.product_name }}{{ item.temp_label }}{{ item.size_label }} x {{ item.quantity }}</span>
                                        <span>&nbsp;&nbsp;₱{{ item.product_price }}</span>
                                    </div>
                                </template>
                                <template v-slot:item.actions="{ item }">
                                    <v-btn @click="minusQuan(item)" color="#0090b6" class="mini-btn ms-3"
                                        variant="tonal">
                                        <v-icon>mdi-minus</v-icon>
                                    </v-btn>
                                    <v-btn @click="addQuan(item)" color="#0090b6" class="mini-btn mx-1" variant="tonal">
                                        <v-icon>mdi-plus</v-icon>
                                    </v-btn>
                                    <v-btn @click="removeProduct(item)" color="#ff0d0d" class="mini-btn"
                                        variant="tonal">
                                        <v-icon>mdi-delete</v-icon>
                                    </v-btn>
                                </template>
                            </v-data-table>
                        </v-col>

                        <!--Payment Section  -->
                        <v-col cols="12">
                            <h3>Payment Section</h3>
                            <div class="payment-section mt-3">
                                <v-text-field class="payment-section-item me-2 mt-2" v-model="customer_charge"
                                    label="Sub total" variant="outlined" density="compact" type="number"
                                    :model-value="subTotal.toFixed(2)" prepend-inner-icon="mdi-cash" readonly />

                                <v-text-field class="payment-section-item me-2 mt-2" v-model="total_due"
                                    label="Total due" variant="outlined" density="compact" type="number"
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
                                    label="*Cash render" variant="outlined" density="compact" type="number"
                                    :rules="[v => !isNaN(parseFloat(v)) || 'Required', v => parseFloat(v) >= this.subTotal || 'Must be greater than or equal to total charge']"
                                    @input="e => customer_cash = e.target.value.replace(/[^0-9.]/g, '')"
                                    inputmode="numeric" prepend-inner-icon="mdi-cash-plus"
                                    placeholder="Enter cash amount" />

                                <v-text-field class="payment-section-item me-2 mt-2" v-model="customer_change"
                                    label="Change" variant="outlined" density="compact"
                                    prepend-inner-icon="mdi-cash-refund" readonly />

                                <v-text-field class="payment-section-item me-2 mt-2" v-model="customer_discount"
                                    label="*Discount" variant="outlined"
                                    @input="e => customer_discount = e.target.value.replace(/[^0-9.]/g, '')"
                                    inputmode="numeric" type="number" density="compact"
                                    prepend-inner-icon="mdi-cash-minus" />

                                <v-file-input class="payment-section-item me-2 mt-2" v-model="id_image_file"
                                    label="Attach ID" variant="outlined" density="compact" prepend-icon=""
                                    capture="environment" accept="image/*" @change="previewIdImage"
                                    :disabled="isIdEvidenceDisabled" chips>
                                </v-file-input>

                                <span class="mt-2">
                                    <img v-if="idImgSrc" :src="idImgSrc" width="160" height="220"
                                        style="border: 1px solid #ccc ;border-radius: 10px;"
                                        alt="Customer ID Evidence" />
                                </span>
                            </div>

                            <div class="payment-section d-flex">
                                <v-autocomplete class="me-2 mt-2" v-model="payment_mode_id"
                                    :items="paymentModeItems" item-title="paymentmode_label" item-value="paymentmode_id"
                                    label="Mode of payment" variant="outlined" density="compact" />
                                <v-btn @click="eWalletDialog = true" :disabled="isEwalletEvidenceDisabled" prepend-icon="mdi-qrcode" height="37" color="green" class="me-2 mt-2">Generate QR</v-btn>
                            </div>

                            <div class="payment-section">
                                <v-text-field class="payment-section-item me-2 mt-2" v-model="table_number"
                                    label="*Table number" variant="outlined" density="compact" type="text"
                                    :rules="[v => !!v || 'Required']" prepend-inner-icon="mdi-table-chair"
                                    inputmode="numeric" placeholder="Enter table number" />

                                <v-text-field class="payment-section-item me-2 mt-2" v-model="customer_name"
                                    label="*Customer name" variant="outlined" density="compact" type="text"
                                    :rules="[v => !!v || 'Required']" prepend-inner-icon="mdi-account"
                                    placeholder="Enter customer name" />

                                <v-text-field class="payment-section-item me-2 mt-2" v-model="order_note" label="Note"
                                    variant="outlined" density="compact" type="text" prepend-inner-icon="mdi-note"
                                    placeholder="Enter note" />
                            </div>

                            <div class="d-flex justify-end me-2 ms-1">
                                <v-btn class="bg-red-lighten-2 d-flex w-50 py-6 mt-3" variant="flat"
                                    prepend-icon="mdi-refresh" @click="resetPaymentSection" :disabled="loading">
                                    Reset
                                </v-btn>&nbsp;
                                <v-btn class="d-flex w-50 py-6 mt-3" color="#0090b6" variant="flat"
                                    append-icon="mdi-send" type="submit" :loading="loading"
                                    :disabled="!isFormValid || 
                                    loading || 
                                    (payment_mode_id === 2 && !eWalletPaid) ||
                                    Number(customer_cash) < subTotal ||
                                    Number(customer_change) < 0 || 
                                    Number(customer_charge) === 0.00 || 
                                    subTotal <= 0">
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

            <v-dialog v-model="eWalletDialog" width="500" height="500" class="rounded-10">
                <v-btn @click="eWalletDialog = false" color="#0090b6" class="position-absolute" size="small"
                    style="top: -17px; left: -17px; z-index: 10;" icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-card class="d-flex align-center justify-center pa-6">
                    <h5 class="text-center my-3">Generate QR-code from the following</h5>
                    <v-btn @click="selectEwallet('gcash')" v-model="gcash" color="blue" prepend-icon="mdi-qrcode" height="40" class="w-100 mb-2" >GCash</v-btn>
                    <v-btn @click="selectEwallet('paymaya')" v-model="paymaya" color="green" prepend-icon="mdi-qrcode" height="40" class="w-100 mb-2" >Maya</v-btn>
                    <v-btn @click="selectEwallet('qrph')" v-model="qrph" color="red" prepend-icon="mdi-qrcode" height="40" class="w-100 mb-2" >QRPh</v-btn>
                    <h3>Total Due: ₱ {{ discountedSubtotal }}</h3>
                    <div v-if="eWalletImgSrc" class="text-center mt-4">
                        <v-img :src="eWalletImgSrc" width="200" height="200"></v-img>
                    </div>
                    <v-card v-else class="border" width="200" height="200"></v-card>
                </v-card>
            </v-dialog>
        </v-form>
        <Snackbar ref="snackbarRef" />
        <Alert ref="alertRef" />
    </v-container>
</template>

<script>
import { mapState } from 'pinia';
// import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useBranchStore } from '@/stores/branchStore';
import { useProductsStore } from '@/stores/productsStore';
import { useStocksStore } from '@/stores/stocksStore';
import { useTransactStore } from '@/stores/transactionStore';
import { useLoadingStore } from '@/stores/loading';
import { usePaymentStore } from '@/stores/paymentStore';
import ViewOrder from './ViewOrder.vue';
import echo from '@/resources/js/echo';
import Snackbar from '@/components/Snackbar.vue';
import Alert from '@/components/Alert.vue';

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
            eWalletDialog: false,
            selectedEwalletOption: '',
            isFormValid: false,
            referenceNumber: '',
            total_quantity: '',
            customer_charge: 0,
            total_due: 0,
            order_type_id: 1,
            order_type_charge: 0,
            customer_cash: '',
            customer_change: '',
            customer_discount: 0,
            computed_discount: 0,
            id_image_file: null,
            idImgSrc: null,
            payment_mode_id: 1,
            eWalletImgSrc: null,
            table_number: '',
            customer_name: '-',
            order_note: '',
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

            // Orders
            orders: [],
            order_statuses: [],
            orderDetails: [],
            loadingCurrentOrders: false,
            viewOrderDialog: false,
            selectedReferenceNumber: null,
            defaultStatusMeta: {
                color: 'grey',
                icon: 'mdi-help-circle',
                name: 'Loading...',
                hasAnimation: false,
                animationClass: '',
                showSmoke: false
            },
            selectedTableNumber: null,
            customerName: '',
            totalAmount: 0,
            totalQuan: 0,
            totalItems: 0,
            customerCash: 0,
            customerChange: 0,
            createdAt: '',
            updatedAt: '',
            tableNumber: 'N/A',
            loading: false,
            headersDisplay: [
                { title: '', value: 'product_name' },
                { title: '', value: 'product_price' },
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
                { title: 'Price', value: 'product_price' },
                { title: 'Subtotal', value: 'subtotal' },
            ],
        };
    },

    beforeUnmount() {
        if (this.idImgSrc) {
            URL.revokeObjectURL(this.idImgSrc);
        }
        echo.leave('newOrderChannel');
    },

    setup() {
        const authStore = useAuthStore();
        const branchStore = useBranchStore();
        const productsStore = useProductsStore();
        const stocksStore = useStocksStore();
        const transactStore = useTransactStore();
        const loadingStore = useLoadingStore();
        const paymentStore = usePaymentStore();
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
            formatCurrentDate
        };
        // paymentModeItems: computed(() => paymentStore.paymentModeOptions), };
    },

    watch: {
        selectedProducts: {
            handler() {
                if (this.order_type_charge && Number(this.order_type_charge) !== 0) {
                    this.customer_charge = Number(this.subTotal) + Number(this.order_type_charge);
                } else {
                    this.customer_charge = Number(this.subTotal);
                }
                this.total_due = this.discountedSubtotal.toFixed(2);
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

        customer_discount() {
            this.total_due = Number(this.discountedSubtotal.toFixed(2));
            if (this.customer_cash) {
                const change = parseFloat(this.customer_cash) - parseFloat(this.total_due);
                this.customer_change = change.toFixed(2);
            }
        },

        order_type_id(newVal) {
            if (Number(newVal) === 1) {
                this.order_type_charge = 0;
            }
        },

        id_image_file() {
            if (this.id_image_file === '') {
                this.idImgSrc = null;
            }
        },
    },

    computed: {
        ...mapState(useStocksStore, ['stockNotificationQty']),

        isOrderTypeChargeDisabled() {
            return Number(this.order_type_id) === 1;
        },

        isIdEvidenceDisabled() {
            return Number(this.customer_discount) === 0;
        },

        isEwalletEvidenceDisabled() {
            return Number(this.payment_mode_id) !== 2;
        },

        newRefNumber() {
            return this.generateReferenceNumber();
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
            const baseTotal = this.selectedProducts.reduce((sum, p) => sum + (p.product_price * p.quantity), 0);
            const charge = Number(this.order_type_charge) || 0;
            return baseTotal + (charge !== 0 ? charge : 0);
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
                ? this.orderDetails.reduce((sum, item) => sum + (item.product_price * item.quantity || 0), 0)
                : 0;
        },

        discountedSubtotal() {
            let subtotal = this.subTotal;
            if (!this.customer_discount || isNaN(this.customer_discount) || this.customer_discount <= 0) {
                return subtotal;
            }
            return subtotal - parseFloat(this.customer_discount);
        }
    },

    async mounted() {
        this.reloadData();
    },

    methods: {

        lowStockAlert() {
            echo.channel('lowStockLevelChannel')
                .listen('LowStockLevel', (e) => {
                    this.showAlert(e.message);
                });
        },

        updateFromBarista() {
            echo.channel('station.1')
                .listen('OrderStatusUpdated', (e) => {
                    console.log(e);
                    if (e.stationId === 1) {
                        this.showNewOrderAlert(e.message);
                    }
                });
        },

        updateFromKitchen() {
            echo.channel('station.2')
                .listen('OrderStatusUpdated', (e) => {
                    console.log(e);
                    if (e.stationId === 2) {
                        this.showNewOrderAlert(e.message);
                    }
                });
        },

        async reloadData() {
            this.loadingStore.show("");
            this.fetchProducts();
            this.fetchCurrentOrders();
            this.lowStockAlert();
            this.updateFromBarista();
            this.updateFromKitchen();
            this.loadingStore.hide();
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

        async fetchOrderStatus() {
            try {
                await this.transactStore.fetchAllOrderStatusStore();
                this.order_statuses = this.transactStore.orderStatuses;
            } catch (error) {
                console.error('Error fetching order status:', error);
                this.showError("Error fetching order status!");
            }
        },

        async fetchCurrentOrders() {
            this.fetchOrderStatus();
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
                this.loadingCategories = false;
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
            this.loadingStore.show("");
            this.fetchProducts();
            this.loadingStore.hide();
        },

        reloadCategories() {
            this.categoriesDialog = false;
            this.loadingStore.show("");
            this.fetchCategories();
            this.loadingStore.hide();
            this.categoriesDialog = true;
        },

        showCategoriesDialog() {
            this.categoriesDialog = true;
            this.fetchCategories();
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
            if (!product || !product.product_name || !product.product_price) {
                console.error("Product data is missing!", product);
                return;
            }
            const index = this.selectedProducts.findIndex(p => p.product_id === product.product_id);
            if (index === -1) {
                this.selectedProducts.push({ ...product, quantity: 1 });
            } else {
                this.selectedProducts[index].quantity++;
            }
            this.customer_cash = '';
            this.customer_change = '';
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

        previewIdImage() {
            if (this.id_image_file && this.id_image_file instanceof File) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.idImgSrc = e.target.result;
                };
                reader.readAsDataURL(this.id_image_file);
            } else {
                this.idImgSrc = null;
            }
        },

        async compressImage(file, targetSizeKB = 25) {
            const img = new Image();
            img.src = URL.createObjectURL(file);

            return new Promise((resolve) => {
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxWidth = 1024;
                    const scale = Math.min(maxWidth / img.width, 1);
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    let quality = 0.9; // start high
                    const step = 0.05; // reduce quality step by step
                    function tryCompress() {
                        canvas.toBlob((blob) => {
                            if (!blob) return;
                            // check size
                            const sizeKB = blob.size / 1024;
                            if (sizeKB <= targetSizeKB || quality <= 0.1) {
                                // done, return file
                                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                            } else {
                                // lower quality and try again
                                quality -= step;
                                tryCompress();
                            }
                        }, 'image/jpeg', quality);
                    }
                    tryCompress();
                };
            });
        },

        selectEwallet(option) {
            this.selectedEwalletOption = option;
            this.generateQrForEwallet();
        },

        async generateQrForEwallet() {
            if (!this.selectedEwalletOption) return;
            try {
                const amountInCentavos = Math.round(this.discountedSubtotal * 100);
                const res = await this.$api.post('/paymongo/generate-qr', {
                    amount: amountInCentavos,
                    wallet: this.selectedEwalletOption,
                });
                this.eWalletImgSrc = res.data.qr_url;
                this.pollEwalletPayment(res.data.payment_intent_id);
            } catch (error) {
                console.error(error);
                this.showAlert('Failed to generate e-Wallet QR. Try again.');
            }
        },

        pollEwalletPayment(paymentIntentId) {
            this.eWalletPaid = false;
            const interval = setInterval(async () => {
                try {
                    const res = await this.$api.get(`/paymongo/payment-intents/${paymentIntentId}`);
                    if (res.data.status === 'succeeded') {
                        clearInterval(interval);
                        this.eWalletPaid = true;
                        this.showSuccess('Payment received!');
                    }
                } catch (err) {
                    console.error(err);
                }
            }, 3000);
        },

        async submitForm() {
            try {
                this.loadingStore.show("Submitting...");
                if (!this.$refs.transactionForm.validate()) {
                    this.loadingStore.hide();
                    return;
                }
                let refNumber = typeof this.newRefNumber === "function" || typeof this.newRefNumber?.then === "function"
                    ? await this.newRefNumber
                    : this.newRefNumber;
                if (!refNumber) {
                    this.showError("Error in reference number. Refresh the page!");
                    this.loadingStore.hide();
                    return;
                }
                this.computed_discount = this.subTotal * (this.customer_discount / 100);
                const formData = new FormData();
                formData.append("transactions[0][reference_number]", refNumber);
                formData.append("transactions[0][total_quantity]", this.totalQuantity);
                formData.append("transactions[0][customer_charge]", parseFloat(this.subTotal) || 0);
                formData.append("transactions[0][total_due]", parseFloat(this.discountedSubtotal) || 0);
                formData.append("transactions[0][order_type_id]", Number(this.order_type_id));
                formData.append("transactions[0][order_type_charge]", parseFloat(this.order_type_charge) || 0);
                formData.append("transactions[0][customer_cash]", parseFloat(this.customer_cash) || 0);
                formData.append("transactions[0][customer_change]", parseFloat(this.customer_change) || 0);
                formData.append("transactions[0][customer_discount]", Number(this.customer_discount));
                formData.append("transactions[0][computed_discount]", this.computed_discount);
                formData.append("transactions[0][payment_mode_id]", Number(this.payment_mode_id));
                formData.append("transactions[0][table_number]", Number(this.table_number));
                formData.append("transactions[0][customer_name]", this.customer_name);
                formData.append("transactions[0][order_note]", this.order_note);

                if (this.id_image_file) {
                    const IdImageFile = Array.isArray(this.id_image_file) ? this.id_image_file[0] : this.id_image_file;
                    const compressedFile = await this.compressImage(IdImageFile);
                    formData.append("idcard_evidence", compressedFile);
                }


                this.selectedProducts.forEach((product, index) => {
                    formData.append(`transactions[0][products][${index}][product_id]`, product.product_id);
                    formData.append(`transactions[0][products][${index}][station_id]`, product.station_id);
                    formData.append(`transactions[0][products][${index}][quantity]`, product.quantity);
                });

                // ✅ Only send formData (don’t pass orderedProducts separately)
                await this.transactStore.submitTransactStore(formData);

                // Success actions
                this.fetchCurrentOrders();
                this.$refs.transactionForm.reset();
                this.resetPaymentSection();
                this.subTotal = 0;
                this.totalQuantity = 0;
                this.selectedProducts = [];
                this.showSuccess("Success! Ready for next customer.");
            } catch (error) {
                this.showError(error);
                console.error(error);
            } finally {
                this.loadingStore.hide();
            }
        },

        async toViewOrder(item) {
            this.selectedReferenceNumber = item.reference_number;
            this.viewOrderDialog = true;
        },

        changeStatus(order) {
            if (!order || !order.reference_number) {
                this.showError("Invalid order data!");
                return;
            }
            const currentStatusIndex = this.order_statuses.findIndex(
                status => Number(status.order_status_id) === Number(order.order_status_id)
            );

            if (currentStatusIndex === -1) {
                this.showError("Current order status not found!");
                return;
            }
            const nextStatusIndex = (currentStatusIndex + 1) % this.order_statuses.length;
            const newStatus = Number(this.order_statuses[nextStatusIndex].order_status_id);

            if (isNaN(newStatus)) {
                this.showError("Next order status is invalid!");
                return;
            }
            this.loadingStore.show("Updating status...");
            this.transactStore.updateOrderStatusStore(order.reference_number, newStatus)
                .then(() => {
                    const statusName = this.getStatusName(newStatus);
                    this.showSuccess(`Table# ${order.table_number} is ${statusName}`);
                    order.order_status_id = newStatus;
                    this.lowStockAlert();
                })
                .catch(error => {
                    console.error(error);
                    this.showError(error);
                })
                .finally(() => {
                    this.loadingStore.hide();
                });
        },

        getStatusName(statusId) {
            const status = this.order_statuses.find(s => Number(s.order_status_id) === Number(statusId));
            return status ? status.order_status : 'Unknown';
        },

        closeSelectedCategory() {
            this.selectedCategory = '';
            this.products = [];
            this.fetchProducts();
        },

        formatOrder(order) {
            return {
                ...order,
                product_name: order.product_name || '',
                product_price: order.product_price ? parseFloat(order.product_price) : 0,
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
            this.order_type_id = 1;
            this.order_type_charge = 0;
            this.customer_cash = 0;
            this.customer_discount = 0;
            this.id_image_file = '';
            this.idImgSrc = '';
            this.payment_mode_id = 1;
            this.table_number = '';
            this.customer_name = '-';
            this.order_note = '';
        },

        showError(message) {
            this.$refs.snackbarRef.showSnackbar(message, "error");
        },

        showAlert(message) {
            this.$refs.alertRef.showSnackbarAlert(message, "error");
        },

        showNewOrderAlert(message) {
            this.$refs.alertRef.showSnackbarAlert(message, "success");
        },

        showSuccess(message) {
            this.$refs.snackbarRef.showSnackbar(message, "success");
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

.pdct-txt .v-input__details {
    display: none !important;
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

.mini-btn {
    font-size: 15px;
    width: 35px !important;
    height: 27px !important;
}

.payment-section {
    display: flex;
    flex-wrap: wrap;
}

.payment-section-item {
    width: 200px;
}

.v-input__details {
    display: none;
}

.refresh {
    position: fixed;
    bottom: 15px;
    right: 15px;
    z-index: 1;
}
</style>
