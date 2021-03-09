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

      <table v-if="latestBatch.orders?.length" class="table-auto w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>FB Link</th>
            <th>View</th>
            <th>Done</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(order, index) in latestBatch.orders" :key="order">
            <td>{{ order.name }}</td>
            <td>
              <a :href="order.fbLink" target="_blank" class="text-blue-700 icon-md">
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

      <p v-else class="text-center">No orders to process for this batch</p>

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
      orderShown: null,
      showModal: false,

      fbLinks: {},
    };
  },
  computed: {
    ...mapState({
      latestBatch: "latestBatch",
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

    // Helper Function
    async getFBLink(uid) {
      const links = (await this.$store.state.dbUserLinks.doc(uid).get()).data();

      return links.fb;
    },

    ...mapActions({
      updateLatestBatch: "updateLatestBatch",
      markLatestBatchAsDone: "markLatestBatchAsDone",
    }),
  },
  mounted() {
    if (!this.latestBatch.orders === undefined) {
      this.latestBatch.orders.forEach(async (order) => {
        this.fbLinks[order.uid] = await this.getFBLink(order.uid);
      });
    }
  },
};
</script>

<style>
</style>