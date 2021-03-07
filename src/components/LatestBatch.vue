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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                class="icon-md"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <h3>{{ orderShown.name }}</h3>
        </div>
        <div class="modal__content">
          <div class="mt-5"><Receipt :order="orderShown.order" is-done /></div>
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
              <a :href="fbLinks[order.uid]" target="_blank">FB</a>
            </td>
            <td class="text-center">
              <button class="button button-primary" @click="showOrder(order)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="text-white icon-sm"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fill-rule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </td>
            <td>
              <!-- Update Done Status -->
              <label class="checkbox" :for="order.uid + '-done'">
                <input
                  type="checkbox"
                  :id="order.uid + '-done'"
                  v-model="latestBatch.orders[index].isDone"
                  @change="updateLatestBatch"
                />

                <span class="checkmark">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
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
        Mark as Done
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