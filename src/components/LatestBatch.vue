<template>
  <transition name="fade">
    <div
      class="modal fixed left-0 top-0 w-screen h-screen flex"
      v-if="showModal"
    >
      <div
        class="modal__backdrop bg-black w-full h-full opacity-60 absolute"
        @click="closeOrderModal"
      ></div>
      <div class="modal__dialog card bg-white m-auto z-10 w-10/12">
        <div class="modal__header mb-3">
          <h3>{{ orderShown.name }}</h3>
        </div>
        <div class="modal__content">
          <p>Email: {{ orderShown.email }}</p>

          <h4>Order:</h4>
          <table class="table-auto w-full">
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total Price</th>
            </tr>

            <tr v-for="o in orderShown.order" :key="o">
              <td>{{ o.product_name }}</td>
              <td class="text-right">{{ o.qty }}</td>
              <td class="text-right">
                {{ o.unit_price.toLocaleString() }} PHP
              </td>
              <td class="text-right">{{ getPrice(o).toLocaleString() }} PHP</td>
            </tr>

            <tr>
              <td>TOTAL</td>
              <td>{{ order_TotalQty }}</td>
              <td></td>
              <td>{{ order_TotalPrice.toLocaleString() }} PHP</td>
            </tr>
          </table>
        </div>
        <div class="modal__buttons" @click="closeOrderModal()"></div>
      </div>
    </div>
  </transition>

  <div class="latest-batch card">
    <h2 class="text-center">Orders to Process</h2>

    <div v-if="latestBatch && latestBatch.isDone == false">
      <h5>{{ latestBatch.name }}</h5>
      <small>
        Created at:
        <span class="italic">{{ latestBatch.createdAtString }}</span>
        <br />
        Closed at: <span class="italic">{{ latestBatch.closedAtString }}</span>
      </small>

      <table class="table-auto w-full">
        <tr>
          <th>Name</th>
          <th>Phone Number</th>
          <th></th>
        </tr>

        <tr v-for="order in latestBatch.orders" :key="order">
          <td>{{ order.name }}</td>
          <td>{{ order.email }}</td>
          <td>
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
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "LatestBatch",
  data() {
    return {
      orderShown: null,
      order_TotalPrice: 0,
      order_TotalQty: 0,

      showModal: false,
    };
  },
  computed: {
    ...mapState({
      latestBatch: "latestBatch",
    }),
  },
  watch: {
    orderShown: function () {
      this.order_TotalPrice = this.orderShown.order
        .map((o) => o.unit_price * o.qty)
        .reduce((acc, cur) => acc + cur);

      this.order_TotalQty = this.orderShown.order
        .map((o) => o.qty)
        .reduce((a, c) => a + c);
    },
  },
  methods: {
    showOrder(order) {
      this.orderShown = order;
      this.showModal = true;

      console.log(this.showModal);
    },
    closeOrderModal() {
      this.showModal = false;
    },

    // Helper Functions
    getPrice(orderProduct) {
      return orderProduct.qty * orderProduct.unit_price;
    },
  },
};
</script>

<style>
</style>