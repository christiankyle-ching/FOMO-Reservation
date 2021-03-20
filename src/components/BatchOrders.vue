<template>
  <!-- Modal: Receipt -->
  <transition name="fade">
    <Modal v-if="showModal" @close="closeOrderModal">
      <template v-slot:header>
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-medium">{{ orderShown.name }}</h3>
            <p>Phone: {{ orderShown.phoneNumber }}</p>
          </div>
          <!-- FB Link -->
          <a
            :href="orderShown.fbLink"
            target="_blank"
            class="button-icon button-icon-md button-transparent mx-5"
          >
            <span class="fab fa-facebook-square"></span>
          </a>
        </div>
      </template>
      <template v-slot:content>
        <Receipt :order="orderShown" :batch="batch" inProcess />
      </template>
    </Modal>
  </transition>

  <div>
    <div class="grid grid-cols-2 mb-3">
      <span>Total Food Items:</span>
      <strong class="sm:text-right">{{ batch?.totalQty }} item/s</strong>

      <span>Total Amount Received:</span>
      <strong class="sm:text-right"
        >{{ batch?.totalPrice.toLocaleString() }} PHP</strong
      >
    </div>

    <!-- Search -->
    <div class="input__search">
      <input
        type="search"
        placeholder="Search for Payment ID, Order ID, or Name..."
        v-model="searchKey"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <!-- Icon: Search-sm -->
        <path
          fill-rule="evenodd"
          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <!-- Table: Orders -->
    <table class="table-auto w-full mt-3" v-if="batch?.orders?.length">
      <thead>
        <tr>
          <th class="hidden lg:table-cell">Order #</th>
          <th>Facebook Name</th>
          <th class="hidden md:table-cell">Phone Number</th>
          <th>Amount</th>
          <th>View</th>
          <th>Paid</th>
          <th>Done</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="order in filteredOrders" :key="order">
          <!-- OID -->
          <td class="hidden lg:table-cell">
            <small>{{ order.oid }}</small>
          </td>
          <!-- Facebook Name & Link -->
          <td class="w-full">
            {{ order.name }}
          </td>
          <!-- Phone Number -->
          <td class="whitespace-nowrap hidden md:table-cell">
            {{ order.phoneNumber }}
          </td>
          <!-- Amount -->
          <td>{{ order.totalPrice?.toLocaleString() }} PHP</td>
          <!-- Receipt -->
          <td>
            <!-- Show Modal: Receipt -->
            <button
              class="button-icon button-icon-md button-primary m-auto"
              @click="showOrder(order)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <!-- Icon: Clipboard List-sm -->
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fill-rule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </td>
          <!-- Paid Status -->
          <td class="text-center">
            <label
              class="checkbox inline-block m-auto"
              :for="order.uid + '-paid'"
            >
              <input
                type="checkbox"
                :id="order.uid + '-paid'"
                :checked="!!order.payment"
                @click.prevent
                style="cursor: default !important"
              />
            </label>
          </td>
          <!-- Done Status -->
          <td class="text-center">
            <label
              class="checkbox inline-block m-auto"
              :for="order.uid + '-done'"
            >
              <input
                type="checkbox"
                :id="order.uid + '-done'"
                v-model="order.isDone"
                @change="
                  isFinalized ? updateLatestBatch() : updatePendingOrder(order)
                "
              />
            </label>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else class="text-center my-5 font-medium text-danger">
      No orders to process for this batch
    </p>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import Receipt from "@/components/Receipt";
import Modal from "@/components/Modal";

export default {
  props: { batch: Object, isFinalized: Boolean },
  components: { Receipt, Modal },
  data() {
    return {
      searchKey: "",

      orderShown: null,
      showModal: false,
    };
  },

  computed: {
    filteredOrders() {
      return this.batch.orders
        .filter((o) => o.orderList)
        .filter(
          (o) =>
            o.name.toLowerCase().includes(this.searchKey) ||
            o.oid.toLowerCase().includes(this.searchKey) ||
            o.payment.id.toLowerCase().includes(this.searchKey)
        );
    },
  },
  methods: {
    showOrder(order) {
      this.orderShown = order;
      this.showModal = true;
    },
    closeOrderModal() {
      this.showModal = false;
    },
    ...mapActions({
      updateLatestBatch: "updateLatestBatch",
      updatePendingOrder: "updatePendingOrder",
    }),
  },
};
</script>

<style>
</style>