<template>
  <!-- Modal: Receipt -->
  <transition name="fade">
    <Modal v-if="showModal" @close="closeOrderModal">
      <template v-slot:header>
        <div class="flex items-center justify-start">
          <h3 class="font-medium">{{ orderShown.name }}</h3>
          <!-- FB Link -->
          <a
            :href="orderShown.fbLink"
            target="_blank"
            class="button-icon button-icon-md text-blue-700"
          >
            <span class="fab fa-facebook-square"></span>
          </a>
        </div>
      </template>
      <template v-slot:content>
        <Receipt :order="orderShown" in-process />
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
      <span class="fas fa-search"></span>
    </div>

    <!-- Table: Orders -->
    <table class="table-auto w-full mt-3" v-if="batch?.orders?.length">
      <thead>
        <tr>
          <th class="hidden md:table-cell">Order #</th>
          <th>Facebook Name</th>
          <th>Amount</th>
          <th>View</th>
          <th>Done</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(order, index) in filteredOrders" :key="order">
          <td class="hidden md:table-cell">
            <small>{{ order.oid }}</small>
          </td>
          <td class="w-full">
            <div class="flex items-center justify-between">
              <span>{{ order.name }}</span>

              <!-- FB Link -->
              <a
                :href="order.fbLink"
                target="_blank"
                class="button-icon button-icon-md text-blue-700"
              >
                <span class="fab fa-facebook-square"></span>
              </a>
            </div>
          </td>

          <td>{{ order.totalPrice?.toLocaleString() }} PHP</td>

          <td>
            <!-- Show Modal: Receipt -->
            <button
              class="button-icon button-icon-md button-primary m-auto"
              @click="showOrder(order)"
            >
              <span class="fas fa-receipt"></span>
            </button>
          </td>
          <td class="text-center">
            <!-- Update Done Status -->
            <label
              class="checkbox inline-block m-auto"
              :for="order.uid + '-done'"
            >
              <input
                type="checkbox"
                :id="order.uid + '-done'"
                v-model="batch.orders[index].isDone"
                @change="updateLatestBatch"
              />
            </label>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else class="text-center my-5 font-medium text-darkDanger">
      No orders to process for this batch
    </p>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import Receipt from "@/components/Receipt";
import Modal from "@/components/Modal";

export default {
  props: { batch: Object },
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
        .filter((o) => o.payment)
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
    }),
  },
};
</script>

<style>
</style>