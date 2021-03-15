<template>
  <!-- Modal: Receipt -->
  <transition name="fade">
    <Modal v-if="showModal" @close="closeOrderModal">
      <template v-slot:header>
        <span class="text-2xl font-medium">{{ orderShown.name }}</span>
        <a
          :href="orderShown.fbLink"
          target="_blank"
          class="button-icon button-icon-md text-blue-700 inline ml-2"
        >
          <span class="fab fa-facebook-square"></span>
        </a>
      </template>
      <template v-slot:content>
        <Receipt :order="orderShown" in-process />
      </template>
    </Modal>
  </transition>

  <div>
    <div class="grid grid-cols-2 mb-3">
      <span class="col-span-1">Total Food Items:</span>
      <strong>{{ batch.totalQty }} item/s</strong>

      <span class="col-span-1">Total Amount Received:</span>
      <strong>{{ batch.totalPrice.toLocaleString() }} PHP</strong>
    </div>

    <!-- Search -->
    <div class="input__search flex items-center border-2 rounded-lg">
      <input
        type="search"
        class="flex-grow border-0 m-0"
        placeholder="Search..."
        v-model="searchKey"
      />
      <span class="fas fa-search text-gray-700 mr-3"></span>
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

          <td>{{ order.totalPrice.toLocaleString() }} PHP</td>

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
      return this.batch.orders.filter(
        (o) =>
          o.name.toLowerCase().includes(this.searchKey) ||
          o.oid.toLowerCase().includes(this.searchKey)
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