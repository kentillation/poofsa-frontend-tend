<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <v-container>
        <v-btn @click="this.fetchOrders" color="#0090b6" class="refresh" variant="flat" icon>
            <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <h3>Orders</h3>
        <v-card class="mt-3">
            <v-card-text>
                <div class="d-flex" style="width: 250px;">
                    <v-autocomplete v-model="paymentModeFilter" :items="paymentModeItems" item-value="paymentMode_id"
                        item-title="paymentMode_label" variant="outlined" density="compact" placeholder="Filter by" />
                    <span class="d-flex flex-column">
                        <h4 class="ms-3">Net sale:</h4>
                        <h3 class="ms-3">₱ {{ netSale }}</h3>
                    </span>
                </div>

                <v-data-table :headers="ordersHeaders" :items="filteredOrders" :loading="loadingOrders" density="comfortable"
                    height="400px">

                    <!--eslint-disable-next-line -->
                    <template v-slot:item.payment_mode="{ item }">
                        <v-chip :color="item.payment_mode_id === 1 ? 'green' : 'blue'" size="small" variant="tonal">
                            {{ item.payment_mode }}
                        </v-chip>
                    </template>

                    <template v-slot:no-data>
                        <v-alert type="warning" variant="tonal" class="ma-4">
                            <span>&nbsp; No current orders found.</span>
                        </v-alert>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-container>
    <Alert ref="alertRef" />
</template>

<script>
import { useTransactStore } from '@/stores/transactionStore';
import { useLoadingStore } from '@/stores/loading';
import Alert from '@/components/Alert.vue';

export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Orders',
    components: {
        Alert,
    },

    data() {
        return {
            loadingOrders: false,
            orders: [],
            paymentModeFilter: null,
            netSale: 0,
            ordersHeaders: [
                { title: 'ModeOfPayment', value: 'payment_mode', width: '20%', sortable: true },
                { title: 'GrossSale', value: 'display_total_due', width: '20%', sortable: true },
                { title: 'Reference', value: 'reference_number', width: '20%', sortable: true },
                { title: 'DateUpdated', value: 'updated_at', width: '20%', sortable: true },
            ],
            paymentModeItems: [
                { paymentMode_id: 1, paymentMode_label: 'Cash' },
                { paymentMode_id: 2, paymentMode_label: 'e-Wallet' },
            ],
        }
    },

    setup() {
        const transactStore = useTransactStore();
        const loadingStore = useLoadingStore();
        const currentDate = new Date().toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
        const formatCurrentDate = currentDate.replace(/,/g, '');
        return { transactStore, loadingStore, formatCurrentDate };
    },

    mounted() {
        this.fetchOrders();
    },

    /* eslint-disable */
    computed: {
        filteredOrders() {
            if (!this.paymentModeFilter) {
                this.netSale = this.orders.reduce((sum, o) => sum + parseFloat(o.total_due || 0), 0);
                return this.orders;
            }
            const filtered = this.orders.filter(o =>
                Number(o.payment_mode_id) === Number(this.paymentModeFilter)
            );
            this.netSale = filtered.reduce((sum, o) => sum + parseFloat(o.total_due || 0), 0);
            return filtered;
        }
    },

    methods: {

        async fetchOrders() {
            this.loadingOrders = true;
            this.loadingStore.show('');
            try {
                await this.transactStore.fetchAllCurrentOrdersStore();
                this.orders = this.transactStore.currentOrders;
                if (this.orders && this.orders.length > 0) {
                    this.orders = this.orders.map(order => this.formatOrders(order));
                } else {
                    console.log('No current orders found.');
                }
                this.loadingOrders = false;
            } catch (error) {
                console.error('Error fetching current orders:', error);
                this.showAlert("Error fetching current orders!");
            } finally {
                this.loadingOrders = false;
                this.loadingStore.hide();
            }
        },

        formatOrders(order) {
            const pymnt_mode = this.paymentModeItems.find(p => p.paymentMode_id === Number(order.payment_mode_id));
            return {
                ...order,
                total_due: parseFloat(order.total_due),
                payment_mode: pymnt_mode?.paymentMode_label,
                display_total_due: `₱${parseFloat(order.total_due)}`,
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
        showAlert(message) {
            this.$refs.alertRef.showSnackbarAlert(message, "error");
        },
    }
};
</script>

<style scoped>
.refresh {
    position: fixed;
    bottom: 15px;
    right: 15px;
    z-index: 1;
}
</style>