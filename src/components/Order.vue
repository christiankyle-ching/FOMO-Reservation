<template>
  <div class="order card">
    <h3 class="text-center">You have been chosen! Please send your order.</h3>

    <!-- Order Quantities -->
    <form v-if="order" @submit.prevent="saveOrder">
      <div
        v-for="product in products"
        :key="product"
        class="grid grid-cols-1 md:grid-cols-3 p-5"
      >
        <div class="col-span-1 md:col-span-2">
          <!-- TODO: Use individual images or 1 image for menu? -->
          IMAGE
        </div>

        <div class="col-span-1 text-center md:text-left">
          <label class="block pb-3">{{ product.name }}</label>
          <div class="input__number">
            <button @click.prevent="decrement(product.id)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="icon-sm"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <input
              :id="product.id"
              type="number"
              min="0"
              placeholder="0"
              :value="order.orderProducts[product.id]"
            />
            <button @click.prevent="increment(product.id)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                class="icon-sm"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Report of Order -->
      <Receipt :order="orderList" class="pt-3" />

      <div class="m-3">
        <button
          type="submit"
          class="button button-block button-primary"
          :disabled="isEmpty"
        >
          Finalize Order
        </button>
      </div>
    </form>

    <!-- <button class="button button-secondary" @click="log">LOG</button> -->
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import Receipt from "@/components/Receipt";

export default {
  name: "Order",
  components: { Receipt },
  computed: mapState({
    products: "products",
    order: "order",
    isEmpty: (state) =>
      Object.values(state.order.orderProducts).reduce((a, c) => a + c) <= 0,
    orderList: (state) => {
      const orderList = [];

      const orderProducts = state.order.orderProducts;

      Object.keys(orderProducts).forEach((pid) => {
        const productDetails = state.products.find((p) => p.id == pid);

        orderList.push({
          name: productDetails.name,
          price: productDetails.price,
          qty: orderProducts[pid],
          total: productDetails.price * orderProducts[pid],
        });
      });

      return orderList;
    },
  }),

  methods: {
    log() {
      console.log(this.order);
    },
    increment(pid) {
      // TODO: Get Max Quantity in Database
      const totalQuantity = Object.values(this.order.orderProducts).reduce(
        (a, c) => a + c
      );
      if (totalQuantity < 10) this.order.orderProducts[pid]++;
    },
    decrement(pid) {
      if (this.order.orderProducts[pid] > 0) this.order.orderProducts[pid]--;
    },
    ...mapActions({
      saveOrder: "saveOrder",
    }),
  },
};
</script>

<style>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  display: none;
}
</style>