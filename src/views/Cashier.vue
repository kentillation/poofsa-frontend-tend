<template>
    <!-- Checkout -->
    <div class="payment-indication-container">
        <v-btn @click="showSelectedOrderDialog" class="payment-indication d-flex justify-center" color="#0090b6"
            :disabled="totalQuantity === 0">
            Order
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
            <div class="d-flex align-items-center justify-content-center">
                <v-text-field v-model="searchProduct" class="w-75" placeholder="Search product..." density="compact"
                    variant="outlined">
                </v-text-field>

                <v-btn color="#fff" class="ms-2 d-flex align-items-center" variant="flat" @click="showCategories"
                    size="small" icon>
                    <v-icon size="large">mdi-bell-outline</v-icon>
                </v-btn>
            </div>

            <!-- Categories -->
            <v-slide-group class="mb-3 ms-1">
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

            <v-alert v-else-if="filteredProducts.length === 0" variant="tonal" type="info" class="my-4">
                No available product.
            </v-alert>

            <div v-else class="image-section mb-4">
                <div v-for="product in filteredProducts" :key="product.id" @click="selectProduct(product)"
                    class="image-section-item">
                    <div class="product-card"
                        :class="{ 'active' : selectedCard === product.id }"
                        @click="selectedCard = product.id" >
                        <p class="product-card-text text-truncate">
                            {{ product.product_name }}
                        </p>
                        <p class="product-card-text text-grey mb-2">
                            {{ product.size_label }}
                        </p>
                        <!-- <v-img :src="WTFImgSrc" class="my-2"></v-img> -->
                        <svg class="mb-1" height="90px" width="90px" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#01c7fc">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                                <style type="text/css"> .st0{fill:#52d6fc;} </style> 
                                <g>
                                    <path class="st0" d="M302.206,406.028h-214c-13.125,0-23.773,8.471-23.773,18.928v0.552c0,10.472,10.644,18.944,23.773,18.944h214 c13.128,0,23.778-8.471,23.778-18.944v-0.552C325.983,414.499,315.342,406.028,302.206,406.028z"></path>
                                    <path class="st0" d="M57.23,380.53c0.701,0.23,1.319,0.536,1.978,0.973c1.15,0.759,2.434,1.971,3.918,3.665 c1.108,1.25,2.319,2.752,3.73,4.362c2.12,2.408,4.718,5.144,8.372,7.368c1.82,1.104,3.906,2.047,6.183,2.691 c2.28,0.644,4.76,0.981,7.348,0.981c3.001,0.008,5.849-0.452,8.429-1.311c2.258-0.752,4.282-1.786,6.046-2.96 c3.089-2.062,5.378-4.454,7.283-6.601c1.422-1.625,2.641-3.128,3.768-4.4c1.678-1.924,3.089-3.251,4.362-4.01 c0.652-0.383,1.258-0.667,1.986-0.874c0.724-0.192,1.568-0.338,2.71-0.338c1.322,0,2.246,0.185,3.051,0.453 c0.698,0.23,1.319,0.536,1.982,0.973c1.15,0.759,2.434,1.971,3.909,3.665c1.112,1.25,2.323,2.752,3.738,4.362 c2.12,2.408,4.715,5.144,8.372,7.368c1.821,1.112,3.899,2.047,6.187,2.691c2.284,0.644,4.757,0.981,7.344,0.981 c3.002,0.008,5.857-0.452,8.426-1.311c2.262-0.752,4.286-1.786,6.049-2.96c3.093-2.062,5.374-4.454,7.276-6.601 c1.438-1.625,2.652-3.128,3.775-4.4c1.676-1.924,3.094-3.251,4.37-4.01c0.64-0.383,1.253-0.667,1.982-0.874 c0.721-0.192,1.572-0.338,2.706-0.338c1.323,0,2.25,0.185,3.048,0.453c0.702,0.23,1.323,0.536,1.985,0.973 c1.15,0.759,2.434,1.971,3.91,3.665c1.119,1.25,2.327,2.752,3.738,4.362c2.12,2.408,4.714,5.144,8.375,7.368 c1.821,1.112,3.894,2.047,6.183,2.691c2.289,0.644,4.757,0.981,7.345,0.981c3.005,0.008,5.853-0.452,8.433-1.311 c2.254-0.752,4.282-1.786,6.045-2.96c3.09-2.062,5.382-4.454,7.28-6.601c1.426-1.625,2.652-3.128,3.764-4.4 c1.678-1.924,3.097-3.251,4.382-4.01c0.632-0.383,1.253-0.667,1.973-0.874c0.721-0.192,1.572-0.338,2.711-0.338 c1.322,0,2.246,0.185,3.051,0.453c0.706,0.23,1.323,0.536,1.982,0.973c1.153,0.759,2.434,1.971,3.921,3.665 c1.112,1.25,2.319,2.759,3.738,4.362c2.108,2.408,4.714,5.144,8.368,7.368c1.82,1.112,3.902,2.047,6.19,2.691 c2.281,0.644,4.757,0.989,7.341,0.989c3.005,0,5.861-0.46,8.429-1.319c2.254-0.752,4.286-1.786,6.048-2.96 c3.094-2.062,5.382-4.454,7.284-6.601c1.418-1.625,2.645-3.128,3.764-4.4c1.678-1.924,3.097-3.251,4.374-4.01 c0.64-0.383,1.254-0.667,1.981-0.866c0.729-0.2,1.572-0.346,2.714-0.346c4.708,0,8.533-3.825,8.533-8.54 c0-4.714-3.825-8.54-8.533-8.54c-3.009,0-5.856,0.46-8.437,1.318c-2.258,0.744-4.289,1.787-6.045,2.952 c-3.089,2.062-5.378,4.446-7.283,6.608c-1.422,1.618-2.649,3.128-3.768,4.393c-1.672,1.924-3.097,3.25-4.37,4.017 c-0.652,0.383-1.258,0.66-1.978,0.866c-0.728,0.207-1.58,0.338-2.714,0.338c-1.319,0-2.25-0.177-3.055-0.437 c-0.697-0.23-1.314-0.552-1.982-0.988c-1.15-0.751-2.438-1.978-3.913-3.665c-1.112-1.25-2.327-2.744-3.73-4.37 c-2.123-2.392-4.715-5.137-8.376-7.352c-1.828-1.112-3.902-2.047-6.191-2.706c-2.288-0.637-4.757-0.974-7.344-0.974 c-3.006,0-5.853,0.452-8.434,1.318c-2.254,0.744-4.286,1.787-6.045,2.952c-3.089,2.062-5.378,4.446-7.279,6.608 c-1.434,1.618-2.653,3.128-3.772,4.393c-1.679,1.924-3.09,3.25-4.374,4.017c-0.644,0.383-1.254,0.66-1.974,0.866 c-0.721,0.207-1.572,0.338-2.71,0.338c-1.323,0-2.254-0.177-3.051-0.437c-0.701-0.23-1.322-0.552-1.986-0.988 c-1.146-0.751-2.43-1.978-3.91-3.665c-1.112-1.25-2.319-2.744-3.73-4.354c-2.124-2.408-4.714-5.152-8.375-7.368 c-1.829-1.112-3.898-2.047-6.191-2.706c-2.28-0.637-4.761-0.981-7.341-0.974c-3.001-0.008-5.857,0.452-8.433,1.318 c-2.254,0.744-4.286,1.779-6.049,2.952c-3.09,2.062-5.378,4.446-7.28,6.608c-1.426,1.618-2.641,3.128-3.764,4.393 c-1.675,1.924-3.098,3.25-4.374,4.017c-0.64,0.383-1.253,0.66-1.974,0.866c-0.736,0.199-1.579,0.338-2.71,0.338 c-1.322,0-2.254-0.177-3.059-0.437c-0.698-0.23-1.319-0.552-1.974-0.988c-1.157-0.751-2.434-1.978-3.921-3.665 c-1.112-1.258-2.315-2.752-3.734-4.354c-2.112-2.408-4.711-5.152-8.368-7.368c-1.82-1.112-3.91-2.047-6.187-2.706 c-2.281-0.637-4.753-0.981-7.34-0.974c-3.009-0.008-5.853,0.452-8.441,1.318c-2.254,0.744-4.27,1.779-6.034,2.952 c-3.093,2.062-5.382,4.446-7.283,6.608c-1.43,1.61-2.645,3.128-3.764,4.393c-1.679,1.924-3.105,3.25-4.37,4.017 c-0.652,0.383-1.265,0.66-1.986,0.866c-0.721,0.199-1.572,0.33-2.706,0.338c-1.323-0.008-2.25-0.177-3.055-0.437 c-0.697-0.23-1.314-0.552-1.982-0.988c-1.142-0.751-2.434-1.97-3.906-3.665c-1.115-1.258-2.323-2.752-3.733-4.362 c-2.12-2.4-4.719-5.136-8.372-7.368c-1.82-1.104-3.902-2.039-6.186-2.698c-2.286-0.637-4.758-0.981-7.349-0.974 c-4.715,0-8.537,3.826-8.537,8.54c0,4.715,3.822,8.54,8.537,8.54C55.501,380.076,56.428,380.261,57.23,380.53z"></path>
                                    <path class="st0" d="M391.466,125.069l15.156-69.74l54.884-31.87L447.89,0l-65.234,37.872l-18.956,87.197H193.117l1.038,13.562 l7.961,103.442c-2.997-0.146-6.018-0.222-9.058-0.222c-71.24,0-129.888,40.74-137.482,86.163c-0.272,1.641-0.483,2.07-0.64,2.53 c-0.134,0.444-0.211,0.89-0.211,2.56c0,9.729,5.421,14.858,14.823,14.858h247.019c9.388,0,14.819-5.129,14.819-14.858 c0-3.319-0.295-1.824-0.858-5.09c-3.791-22.754-20.416-44.335-45.002-60.22c-7.984-5.159-16.801-9.683-26.292-13.485 c-9.882-3.94-20.485-7.069-31.64-9.199l-7.283-94.864h218.849l-24.1,313.862h-86.469c-3.021-3.702-7.459-5.903-13.673-5.903 h-70.953h-25.265H71.251c-14.14,0-19.081,11.484-19.081,25.621v2.568C52.17,500.531,63.639,512,77.784,512h230.547 c13.156,0,24.019-9.92,25.456-22.708h104.604l27.971-364.223H391.466z M117.361,294.428c-3.757,0-6.816-3.059-6.816-6.83 c0-3.78,3.058-6.846,6.816-6.846c3.783,0,6.842,3.066,6.842,6.846C124.203,291.369,121.145,294.428,117.361,294.428z M144.7,273.928c-3.78,0-6.839-3.059-6.839-6.832c0-3.779,3.059-6.846,6.839-6.846c3.775,0,6.838,3.066,6.838,6.846 C151.538,270.869,148.475,273.928,144.7,273.928z M168.603,294.428c-3.776,0-6.838-3.059-6.838-6.83 c0-3.78,3.062-6.846,6.838-6.846c3.783,0,6.842,3.066,6.842,6.846C175.446,291.369,172.387,294.428,168.603,294.428z M189.103,265.388c-3.775,0-6.842-3.06-6.842-6.832c0-3.763,3.067-6.823,6.842-6.823c3.776,0,6.842,3.06,6.842,6.823 C195.945,262.328,192.879,265.388,189.103,265.388z M271.072,282.461c3.784,0,6.842,3.059,6.842,6.838 c0,3.772-3.059,6.839-6.842,6.839c-3.756,0-6.815-3.067-6.815-6.839C264.257,285.52,267.316,282.461,271.072,282.461z M236.915,260.174c3.783,0,6.842,3.059,6.842,6.823c0,3.795-3.058,6.854-6.842,6.854c-3.772,0-6.816-3.059-6.816-6.854 C230.099,263.234,233.143,260.174,236.915,260.174z M221.555,289.299c0,3.772-3.062,6.839-6.842,6.839 c-3.756,0-6.815-3.067-6.815-6.839c0-3.78,3.058-6.838,6.815-6.838C218.493,282.461,221.555,285.52,221.555,289.299z"></path>
                                </g>
                            </g>
                        </svg>
                    
                        <p class="mt-2">
                            <strong>₱{{ product.base_price }}</strong>
                        </p>
                    </div>
                </div>
            </div>

            <!-- Current Orders Section -->
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
                <v-card class="pa-2" style="background-color: #e8faff; border-radius: 60px 60px 0 0;">
                    <!-- <v-stepper v-model="orderStep" class="pb-4 modern-stepper" elevation="0" alt-labels>
                        <v-stepper-header>
                            <v-stepper-item title="Order" :value="1" complete></v-stepper-item>
                            <v-divider></v-divider>
                            <v-stepper-item title="Checkout" :value="2" complete></v-stepper-item>
                            <v-divider></v-divider>
                            <v-stepper-item title="Place order" :value="3"></v-stepper-item>
                        </v-stepper-header>
                    </v-stepper> -->

                    <v-container class="overflow-auto pb-10" style="height: 700px;">
                        <!-- Orders -->
                        <p class="my-1">Your order:</p>
                        <div class="mb-7 pa-2 overflow-auto"
                            style="height: 350px; border: 1px solid #0090b6; border-radius: 10px; ">
                            <div class="selected-products-container">
                                <v-alert v-if="this.selectedProducts.length === 0" variant="tonal" type="info"
                                    class="my-3">
                                    You have an empty order.
                                </v-alert>
                                <div v-for="selectedProduct in this.selectedProducts" :key="selectedProduct.id">
                                    <div class="selected-products-card">
                                        <div class="d-flex flex-start">
                                           <!-- <v-img :src="WTFImgSrc" width="70" height="70"
                                                style="border-radius: 10px !important;">
                                            </v-img>-->
                                            <svg height="71px" width="71px" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#01c7fc"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:#52d6fc;} </style> <g> <path class="st0" d="M302.206,406.028h-214c-13.125,0-23.773,8.471-23.773,18.928v0.552c0,10.472,10.644,18.944,23.773,18.944h214 c13.128,0,23.778-8.471,23.778-18.944v-0.552C325.983,414.499,315.342,406.028,302.206,406.028z"></path> <path class="st0" d="M57.23,380.53c0.701,0.23,1.319,0.536,1.978,0.973c1.15,0.759,2.434,1.971,3.918,3.665 c1.108,1.25,2.319,2.752,3.73,4.362c2.12,2.408,4.718,5.144,8.372,7.368c1.82,1.104,3.906,2.047,6.183,2.691 c2.28,0.644,4.76,0.981,7.348,0.981c3.001,0.008,5.849-0.452,8.429-1.311c2.258-0.752,4.282-1.786,6.046-2.96 c3.089-2.062,5.378-4.454,7.283-6.601c1.422-1.625,2.641-3.128,3.768-4.4c1.678-1.924,3.089-3.251,4.362-4.01 c0.652-0.383,1.258-0.667,1.986-0.874c0.724-0.192,1.568-0.338,2.71-0.338c1.322,0,2.246,0.185,3.051,0.453 c0.698,0.23,1.319,0.536,1.982,0.973c1.15,0.759,2.434,1.971,3.909,3.665c1.112,1.25,2.323,2.752,3.738,4.362 c2.12,2.408,4.715,5.144,8.372,7.368c1.821,1.112,3.899,2.047,6.187,2.691c2.284,0.644,4.757,0.981,7.344,0.981 c3.002,0.008,5.857-0.452,8.426-1.311c2.262-0.752,4.286-1.786,6.049-2.96c3.093-2.062,5.374-4.454,7.276-6.601 c1.438-1.625,2.652-3.128,3.775-4.4c1.676-1.924,3.094-3.251,4.37-4.01c0.64-0.383,1.253-0.667,1.982-0.874 c0.721-0.192,1.572-0.338,2.706-0.338c1.323,0,2.25,0.185,3.048,0.453c0.702,0.23,1.323,0.536,1.985,0.973 c1.15,0.759,2.434,1.971,3.91,3.665c1.119,1.25,2.327,2.752,3.738,4.362c2.12,2.408,4.714,5.144,8.375,7.368 c1.821,1.112,3.894,2.047,6.183,2.691c2.289,0.644,4.757,0.981,7.345,0.981c3.005,0.008,5.853-0.452,8.433-1.311 c2.254-0.752,4.282-1.786,6.045-2.96c3.09-2.062,5.382-4.454,7.28-6.601c1.426-1.625,2.652-3.128,3.764-4.4 c1.678-1.924,3.097-3.251,4.382-4.01c0.632-0.383,1.253-0.667,1.973-0.874c0.721-0.192,1.572-0.338,2.711-0.338 c1.322,0,2.246,0.185,3.051,0.453c0.706,0.23,1.323,0.536,1.982,0.973c1.153,0.759,2.434,1.971,3.921,3.665 c1.112,1.25,2.319,2.759,3.738,4.362c2.108,2.408,4.714,5.144,8.368,7.368c1.82,1.112,3.902,2.047,6.19,2.691 c2.281,0.644,4.757,0.989,7.341,0.989c3.005,0,5.861-0.46,8.429-1.319c2.254-0.752,4.286-1.786,6.048-2.96 c3.094-2.062,5.382-4.454,7.284-6.601c1.418-1.625,2.645-3.128,3.764-4.4c1.678-1.924,3.097-3.251,4.374-4.01 c0.64-0.383,1.254-0.667,1.981-0.866c0.729-0.2,1.572-0.346,2.714-0.346c4.708,0,8.533-3.825,8.533-8.54 c0-4.714-3.825-8.54-8.533-8.54c-3.009,0-5.856,0.46-8.437,1.318c-2.258,0.744-4.289,1.787-6.045,2.952 c-3.089,2.062-5.378,4.446-7.283,6.608c-1.422,1.618-2.649,3.128-3.768,4.393c-1.672,1.924-3.097,3.25-4.37,4.017 c-0.652,0.383-1.258,0.66-1.978,0.866c-0.728,0.207-1.58,0.338-2.714,0.338c-1.319,0-2.25-0.177-3.055-0.437 c-0.697-0.23-1.314-0.552-1.982-0.988c-1.15-0.751-2.438-1.978-3.913-3.665c-1.112-1.25-2.327-2.744-3.73-4.37 c-2.123-2.392-4.715-5.137-8.376-7.352c-1.828-1.112-3.902-2.047-6.191-2.706c-2.288-0.637-4.757-0.974-7.344-0.974 c-3.006,0-5.853,0.452-8.434,1.318c-2.254,0.744-4.286,1.787-6.045,2.952c-3.089,2.062-5.378,4.446-7.279,6.608 c-1.434,1.618-2.653,3.128-3.772,4.393c-1.679,1.924-3.09,3.25-4.374,4.017c-0.644,0.383-1.254,0.66-1.974,0.866 c-0.721,0.207-1.572,0.338-2.71,0.338c-1.323,0-2.254-0.177-3.051-0.437c-0.701-0.23-1.322-0.552-1.986-0.988 c-1.146-0.751-2.43-1.978-3.91-3.665c-1.112-1.25-2.319-2.744-3.73-4.354c-2.124-2.408-4.714-5.152-8.375-7.368 c-1.829-1.112-3.898-2.047-6.191-2.706c-2.28-0.637-4.761-0.981-7.341-0.974c-3.001-0.008-5.857,0.452-8.433,1.318 c-2.254,0.744-4.286,1.779-6.049,2.952c-3.09,2.062-5.378,4.446-7.28,6.608c-1.426,1.618-2.641,3.128-3.764,4.393 c-1.675,1.924-3.098,3.25-4.374,4.017c-0.64,0.383-1.253,0.66-1.974,0.866c-0.736,0.199-1.579,0.338-2.71,0.338 c-1.322,0-2.254-0.177-3.059-0.437c-0.698-0.23-1.319-0.552-1.974-0.988c-1.157-0.751-2.434-1.978-3.921-3.665 c-1.112-1.258-2.315-2.752-3.734-4.354c-2.112-2.408-4.711-5.152-8.368-7.368c-1.82-1.112-3.91-2.047-6.187-2.706 c-2.281-0.637-4.753-0.981-7.34-0.974c-3.009-0.008-5.853,0.452-8.441,1.318c-2.254,0.744-4.27,1.779-6.034,2.952 c-3.093,2.062-5.382,4.446-7.283,6.608c-1.43,1.61-2.645,3.128-3.764,4.393c-1.679,1.924-3.105,3.25-4.37,4.017 c-0.652,0.383-1.265,0.66-1.986,0.866c-0.721,0.199-1.572,0.33-2.706,0.338c-1.323-0.008-2.25-0.177-3.055-0.437 c-0.697-0.23-1.314-0.552-1.982-0.988c-1.142-0.751-2.434-1.97-3.906-3.665c-1.115-1.258-2.323-2.752-3.733-4.362 c-2.12-2.4-4.719-5.136-8.372-7.368c-1.82-1.104-3.902-2.039-6.186-2.698c-2.286-0.637-4.758-0.981-7.349-0.974 c-4.715,0-8.537,3.826-8.537,8.54c0,4.715,3.822,8.54,8.537,8.54C55.501,380.076,56.428,380.261,57.23,380.53z"></path> <path class="st0" d="M391.466,125.069l15.156-69.74l54.884-31.87L447.89,0l-65.234,37.872l-18.956,87.197H193.117l1.038,13.562 l7.961,103.442c-2.997-0.146-6.018-0.222-9.058-0.222c-71.24,0-129.888,40.74-137.482,86.163c-0.272,1.641-0.483,2.07-0.64,2.53 c-0.134,0.444-0.211,0.89-0.211,2.56c0,9.729,5.421,14.858,14.823,14.858h247.019c9.388,0,14.819-5.129,14.819-14.858 c0-3.319-0.295-1.824-0.858-5.09c-3.791-22.754-20.416-44.335-45.002-60.22c-7.984-5.159-16.801-9.683-26.292-13.485 c-9.882-3.94-20.485-7.069-31.64-9.199l-7.283-94.864h218.849l-24.1,313.862h-86.469c-3.021-3.702-7.459-5.903-13.673-5.903 h-70.953h-25.265H71.251c-14.14,0-19.081,11.484-19.081,25.621v2.568C52.17,500.531,63.639,512,77.784,512h230.547 c13.156,0,24.019-9.92,25.456-22.708h104.604l27.971-364.223H391.466z M117.361,294.428c-3.757,0-6.816-3.059-6.816-6.83 c0-3.78,3.058-6.846,6.816-6.846c3.783,0,6.842,3.066,6.842,6.846C124.203,291.369,121.145,294.428,117.361,294.428z M144.7,273.928c-3.78,0-6.839-3.059-6.839-6.832c0-3.779,3.059-6.846,6.839-6.846c3.775,0,6.838,3.066,6.838,6.846 C151.538,270.869,148.475,273.928,144.7,273.928z M168.603,294.428c-3.776,0-6.838-3.059-6.838-6.83 c0-3.78,3.062-6.846,6.838-6.846c3.783,0,6.842,3.066,6.842,6.846C175.446,291.369,172.387,294.428,168.603,294.428z M189.103,265.388c-3.775,0-6.842-3.06-6.842-6.832c0-3.763,3.067-6.823,6.842-6.823c3.776,0,6.842,3.06,6.842,6.823 C195.945,262.328,192.879,265.388,189.103,265.388z M271.072,282.461c3.784,0,6.842,3.059,6.842,6.838 c0,3.772-3.059,6.839-6.842,6.839c-3.756,0-6.815-3.067-6.815-6.839C264.257,285.52,267.316,282.461,271.072,282.461z M236.915,260.174c3.783,0,6.842,3.059,6.842,6.823c0,3.795-3.058,6.854-6.842,6.854c-3.772,0-6.816-3.059-6.816-6.854 C230.099,263.234,233.143,260.174,236.915,260.174z M221.555,289.299c0,3.772-3.062,6.839-6.842,6.839 c-3.756,0-6.815-3.067-6.815-6.839c0-3.78,3.058-6.838,6.815-6.838C218.493,282.461,221.555,285.52,221.555,289.299z"></path> </g> </g></svg>
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
                        <p class="mb-1">Order type:</p>
                        <div class="mb-7 ga-2 d-flex justify-center">
                            <div @click="dineIn" :class="{ 'selected': this.order_type_id === 1 }"
                                class="order-type-card pa-2 d-flex align-center justify-center flex-column bg-white">
                                <v-icon>mdi-coffee</v-icon>
                                <p style="font-size: 12px;">Dine-in</p>
                            </div>
                            <div @click="takeOut" :class="{ 'selected': this.order_type_id === 2 }"
                                class="order-type-card pa-2 d-flex align-center justify-center flex-column bg-white">
                                <v-icon>mdi-beer-outline</v-icon>
                                <p style="font-size: 12px;">Take-out</p>
                            </div>
                            <div @click="deliveryOrder" :class="{ 'selected': this.order_type_id === 3 }"
                                class="order-type-card pa-2 d-flex align-center justify-center flex-column bg-white">
                                <v-icon>mdi-bicycle</v-icon>
                                <p style="font-size: 12px;">Delivery</p>
                            </div>
                        </div>

                        <!-- Customer type -->
                        <p class="mb-1">Customer type:</p>
                        <div class="mb-7 ga-2 d-flex justify-center">
                            <div @click="customerRegular" :class="{ 'selected': this.customer_type_id === 1 }"
                                class="customer-type-card pa-2 d-flex align-center justify-center flex-column bg-white">
                                <v-icon>mdi-account-circle-outline</v-icon>
                                <p style="font-size: 12px;">Regular</p>
                            </div>
                            <div @click="customerPwd" :class="{ 'selected': this.customer_type_id === 2 }"
                                class="customer-type-card pa-2 d-flex align-center justify-center flex-column bg-white">
                                <v-icon>mdi-wheelchair</v-icon>
                                <p style="font-size: 12px;">PWD</p>
                            </div>
                            <div @click="customerSenior" :class="{ 'selected': this.customer_type_id === 3 }"
                                class="customer-type-card pa-2 d-flex align-center justify-center flex-column bg-white">
                                <v-icon>mdi-human-cane</v-icon>
                                <p style="font-size: 12px;" class="text-center">Senior Citizen</p>
                            </div>
                        </div>

                        <!-- Inputs -->
                        <div class="mb-5">
                            <div class="mb-3">
                                <span class="required-asterisk mt-2">*</span> Cash render
                                <v-text-field v-model.number="customer_cash" variant="outlined" density="compact"
                                    type="number" :disabled="eWalletPaid"
                                    :rules="[v => !isNaN(parseFloat(v)) || 'Required', v => parseFloat(v) >= this.subTotal || 'Must be greater than or equal to total amount']"
                                    @input="e => customer_cash = e.target.value.replace(/[^0-9.]/g, '')"
                                    inputmode="numeric" placeholder="Enter cash">
                                </v-text-field>
                            </div>

                            <div class="mb-3">
                                Note (optional)
                                <v-text-field v-model="order_note" variant="outlined" density="compact" type="text"
                                    placeholder="Enter note">
                                </v-text-field>
                            </div>

                            <div class="mb-3">
                                Customer name (optional)
                                <v-text-field v-model="customer_name" variant="outlined" density="compact" type="text"
                                    placeholder="Enter customer name">
                                </v-text-field>
                            </div>
                        </div>

                        <!-- Payment method -->
                        <p class="mb-1">Payment method:</p>
                        <div class="mb-7 ga-2 d-flex justify-center">
                            <div :class="{ 'selected': this.payment_method_id === 1 }"
                                class="pa-2 d-flex align-center justify-center flex-column bg-white"
                                style="width: 160px; height: 80px; border-radius: 10px;">
                                <v-icon style="font-size: 30px !important;">mdi-cash</v-icon>
                                <p @click="cashPayment" class="text-center" style="font-size: 12px;">Cash <br />
                                    <span class="text-grey-darken-1">(Over-the-counter)</span>
                                </p>
                            </div>
                            <div :class="{ 'selected': this.payment_method_id === 2 }"
                                class="pa-2 d-flex align-center justify-center flex-column bg-white"
                                style="width: 160px; height: 80px; border-radius: 10px;">
                                <v-icon style="font-size: 20px;">mdi-qrcode-scan</v-icon>
                                <p @click="generateQRPhCode" :disabled="!isOnline || isNotEwallet || eWalletPaid"
                                    class="text-center" style="font-size: 12px;">e-Wallet <br /> 
                                    <span class="text-grey-darken-1">(GCash, Maya, etc.)</span>
                                </p>
                            </div>
                        </div>

                        <div v-if="this.selectedEwalletOption === 'qrph'"
                            class="mb-7 qr-container text-center w-100 pa-4">

                            <div
                                :class="[loadingQr ? 'generate-qr-card d-flex' : 'd-none', 'align-center justify-center']">
                                <div style="width: 200px; height: 410px;">
                                    <div class="text-center d-flex align-center flex-column">
                                        <!-- <p class="text-grey my-3">Generating QR...</p>
                                        <v-progress-circular color="grey" size="100"
                                            width="2" indeterminate></v-progress-circular> -->
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
                                    <strong>₱ {{ discountedSubtotal.toFixed(2) }}</strong>
                                </p>
                                <v-img :src="eWalletImgSrc" width="220" height="220" class="mx-auto"></v-img>
                            </div>

                            <!-- Show payment status -->
                            <div class="payment-status w-100">
                                <v-alert v-if="eWalletImgSrc" :type="!eWalletPaid ? 'info' : 'success'" variant="tonal"
                                    style="border-radius: 15px;" class="mt-1 px-3">
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

                        <!-- Amounts -->
                        <div class="mb-5 payment-amounts">
                            <div class="d-flex align-center justify-space-between">
                                <p class="text-grey">Quantity</p>
                                <p>x{{ totalQuantity }}</p>
                            </div>
                            <div :class="this.order_type_charge > 0 ? 'd-block' : 'd-none'">
                                <v-divider class="my-3"></v-divider>
                                <div class="d-flex align-center justify-space-between">
                                    <p class="text-grey">Delivery</p>
                                    <p>₱{{ this.order_type_charge }}</p>
                                </div>
                            </div>
                            <v-divider class="my-3"></v-divider>
                            <div class="d-flex align-center justify-space-between">
                                <p class="text-grey">Change</p>
                                <p>₱{{ customerChange }}</p>
                            </div>
                            <v-divider class="my-3"></v-divider>
                            <div class="d-flex align-center justify-space-between">
                                <p class="text-grey">Subtotal</p>
                                <p>₱{{ subTotal.toFixed(2) }}</p>
                            </div>
                            <v-divider class="my-3"></v-divider>
                            <div class="d-flex align-center justify-space-between">
                                <p style="font-weight: 500; font-size: 18px;">Total</p>
                                <p style="font-weight: 500; font-size: 18px; color: #0090b6">₱ {{
                                    discountedSubtotal.toFixed(2) }}
                                </p>
                            </div>
                        </div>

                        <v-btn @click="submitForm" :loading="checkingOut" class="place-order-btn" color="#0090b6"
                            :disabled="!isFormValid || checkingOut ||
                                (payment_method_id === 2 && !eWalletPaid) ||
                                Number(customer_cash) < subTotal ||
                                Number(customer_change) < 0 ||
                                subTotal <= 0 ||
                                !isOnline">
                            Checkout
                            <span>&nbsp;&bull;&nbsp;₱{{ discountedSubtotal.toFixed(2) }}</span>
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
            selectedCard: null,
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
            orderStep: 3,
            loadingQr: false,
            checkingOut: false,
            placingOrder: false,
            selectedOrderDialog: false,
            isFormValid: false,
            eWalletDialog: false,
            eWalletPaid: false,
            eWalletImgSrc: null,
            selectedEwalletOption: '',
            isOnline: navigator.onLine,
            referenceNumber: '',
            eWalletRef: '',
            total_quantity: '',
            subtotal: null,
            total_amount: 0,
            order_type_id: 1,
            customer_type_id: 1,
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
                { title: 'Order Number', value: 'table_number', width: '50%' },
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
                this.order_type_id = 1;
            }
            if (Number(newVal) === 2) {
                this.order_type_charge = 0;
                this.order_type_id = 2;
            }
            if (Number(newVal) === 3) {
                this.order_type_charge = 5; // Delivery
                this.order_type_id = 3;
            }
        },

        customer_type_id(newVal) {
            if (Number(newVal) === 1) {
                this.customer_type_id = 1;
            }

            if (Number(newVal) === 2) {
                this.customer_type_id = 2;
            }

            if (Number(newVal) === 3) {
                this.customer_type_id = 3;
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
            this.customer_cash = 0;
            this.payment_method_id = 1;
            this.eWalletPaid = false;
            this.loadingQr = false;
            this.eWalletImgSrc = null;
            this.selectedEwalletOption = '';
        },

        addQuantity(product) {
            const index = this.selectedProducts.findIndex(p => p.product_id === product.product_id);
            if (this.selectedProducts[index].quantity > -1) {
                this.selectedProducts[index].quantity++;
            }
            this.customer_cash = 0;
            this.payment_method_id = 1;
            this.eWalletPaid = false;
            this.loadingQr = false;
            this.eWalletImgSrc = null;
            this.selectedEwalletOption = '';
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

        cashPayment() {
            this.payment_method_id = 1;
            this.loadingQr = false;
            this.eWalletImgSrc = null;
            this.selectedEwalletOption = '';
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
                this.payment_method_id = 2;
                this.selectedEwalletOption = 'qrph';
                this.eWalletRef = await this.generateReferenceNumber();

                const amountToPay = this.discountedSubtotal;

                await this.paymentStore.generateQRPhCodeStore(
                    amountToPay,
                    this.selectedEwalletOption,
                    this.eWalletRef
                );

                this.customer_cash = amountToPay;
                this.eWalletImgSrc = this.paymentStore.qrImageSrc;

            } catch (err) {
                this.showError("Failed to generate QR: " + (err.message || 'Unknown error'));
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
                this.checkingOut = true;

                if (!this.$refs.transactionForm.validate()) {
                    this.checkingOut = false;
                    return;
                }

                if (Number(this.payment_method_id) === 2) {
                    if (!this.eWalletPaid) {
                        this.showError('Please complete e-Wallet payment first');
                        this.checkingOut = false;
                        return;
                    }
                }

                if (!this.referenceNumber) {
                    this.showError("Error in reference number. Refresh the page!");
                    this.checkingOut = false;
                    return;
                }

                this.computed_discount = this.subTotal * (this.discount_amount / 100);

                const formData = new FormData();
                formData.append("transactions[0][reference_number]", this.referenceNumber ?? this.eWalletRef);
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
                this.checkingOut = false;
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

.image-section .product-card:active {
    color: #fff !important;
    background-color: #0090b6 !important;
    transition: 0.5s ease;
}

.image-section .product-card:active .text-truncate, .image-section .product-card:active strong {
    color: #fff !important;
}

.image-section .product-card:active .text-grey {
    color: #c2c2c2 !important;
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
    font-weight: normal;
}

.order-type-card {
    width: 75px;
    height: 60px;
    border-radius: 10px;
}

.customer-type-card {
    width: 75px;
    height: 75px;
    border-radius: 10px;
}

.modern-stepper {
    background-color: #e8faff !important;
    border-radius: 0px !important;
    box-shadow: none !important;
    border: none !important;
}

.modern-stepper .v-stepper-header {
    background-color: #e8faff !important;
    box-shadow: none !important;
    border: none !important;
}

.modern-stepper .v-divider {
    opacity: 0.3;
}

.selected {
    color: #fff !important;
    background-color: #0090b6 !important;
}

.selected span{
    color: #dfdfdf !important;
}

.refresh {
    position: fixed;
    bottom: 15px;
    right: 15px;
    z-index: 1;
}
</style>
