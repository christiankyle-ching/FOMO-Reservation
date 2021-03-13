<template>
  <!-- Modal -->
  <transition name="fade">
    <Modal v-if="showModal" @close="closeOrderModal">
      <template v-slot:header>
        <h3>{{ orderShown.name }}</h3>
        <small>Order #${{ orderShown.oid }}</small>
      </template>
      <template v-slot:content>
        <Receipt :order="orderShown?.order" in-process />
      </template>
      <template v-slot:buttons>
        <!-- TODO: Print -->
        <button type="button" class="button button-secondary">Print</button>
        <button type="button" class="button button-primary">Close</button>
      </template>
    </Modal>
  </transition>

  <!-- Orders -->
  <div class="latest-batch card" @keyup.esc="closeOrderModal()">
    <h2 class="text-center">Orders to Process</h2>

    <!-- Header -->
    <div class="mb-5">
      <h5>{{ latestBatch.name }}</h5>

      <small>
        Created at:
        <span class="italic">{{ latestBatch.createdAtString }}</span>
        <br />
        Closed at: <span class="italic">{{ latestBatch.closedAtString }}</span>
      </small>
    </div>

    <div v-if="latestBatch.orders?.length">
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
      <table class="table-auto w-full mt-3">
        <thead>
          <tr>
            <th class="hidden md:table-cell">Order #</th>
            <th>Facebook Name</th>
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

            <td>
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
                  v-model="latestBatch.orders[index].isDone"
                  @change="updateLatestBatch"
                />
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-center my-5 font-medium text-danger">
      No orders to process for this batch
    </p>

    <button
      @click="markLatestBatchAsDone"
      class="button button-block button-primary mt-3"
    >
      <span class="fas fa-check"></span>
      Mark Batch as Done
    </button>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import Receipt from "@/components/Receipt";
import Modal from "@/components/Modal";

export default {
  name: "LatestBatch",
  components: {
    Receipt,
    Modal,
  },
  inheritAttrs: false,
  data() {
    return {
      searchKey: "",

      orderShown: null,
      showModal: false,

      fbLinks: {},
    };
  },
  computed: {
    ...mapState({
      latestBatch: "latestBatch",
      filteredOrders(state) {
        return state.latestBatch.orders.filter(
          (o) =>
            o.name.toLowerCase().includes(this.searchKey) ||
            o.oid.toLowerCase().includes(this.searchKey)
        );
      },
    }),
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
      markLatestBatchAsDone: "markLatestBatchAsDone",
    }),
  },
  mounted() {},
};
</script>

<style>
</style>