<template>
  <transition name="fade">
    <!-- TODO: Can implement generic modal component -->
    <div
      class="modal fixed left-0 top-0 w-screen h-screen flex z-10"
      v-if="showModal"
    >
      <div
        class="modal__backdrop bg-black w-full h-full opacity-60 absolute"
        @click="closeOrderModal"
      ></div>
      <div class="modal__dialog card bg-white m-auto w-10/12 z-10">
        <div class="modal__header mb-3">
          <div class="float-right">
            <button @click="closeOrderModal">
              <span class="fas fa-times"></span>
            </button>
          </div>
          <h3>{{ orderShown.name }}</h3>
        </div>
        <div class="modal__content">
          <div class="mt-5">
            <Receipt :order="orderShown.order" in-process />
          </div>
        </div>
        <div class="modal__buttons" @click="closeOrderModal()"></div>
      </div>
    </div>
  </transition>

  <!-- Orders -->
  <div class="latest-batch card" @keyup.esc="closeOrderModal()">
    <h2 class="text-center">Orders to Process</h2>

    <div>
      <h5>{{ latestBatch.name }}</h5>

      <small>
        Created at:
        <span class="italic">{{ latestBatch.createdAtString }}</span>
        <br />
        Closed at: <span class="italic">{{ latestBatch.closedAtString }}</span>
      </small>

      <!-- TODO: Search Feature -->
      <div v-if="latestBatch.orders?.length">
        <div class="input__search flex items-center">
          <input
            type="search"
            class="flex-grow"
            placeholder="Search..."
            v-model="searchKey"
          />
          <span class="fas fa-search text-gray-700"></span>
        </div>

        <table class="table-auto w-full mt-3">
          <thead>
            <tr>
              <th>Order #</th>
              <th class="w-full">Facebook Name</th>
              <th>View</th>
              <th>Done</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(order, index) in filteredOrders" :key="order">
              <td>
                <small>{{ order.oid }}</small>
              </td>
              <td>
                {{ order.name }} <span> | </span>
                <!-- FB Link -->
                <a
                  :href="order.fbLink"
                  target="_blank"
                  class="text-blue-700 icon-md"
                >
                  <span class="fab fa-facebook-square"></span>
                </a>
              </td>

              <td class="text-center">
                <button
                  class="m-auto button-icon button-icon button-primary"
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
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import Receipt from "@/components/Receipt";
export default {
  name: "LatestBatch",
  components: {
    Receipt,
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