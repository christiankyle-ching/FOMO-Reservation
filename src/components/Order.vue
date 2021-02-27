<template>
  <div class="order m-10 card">
    <h3 class="text-center">Prepare Your Next Order!</h3>

    <!-- Order Quantities -->
    <form @submit.prevent="saveOrder">
      <div
        v-for="product in products"
        :key="product.id"
        class="grid grid-cols-3 p-3"
      >
        <div class="col-span-2">IMAGE</div>
        <div class="col-span-1">
          <label :for="product.id" class="block pb-3">{{ product.name }}</label>
          <div class="quantity">
            <button @click.prevent="decrement(product.id)" class="px-2 py-1">
              -
            </button>
            <input
              :id="product.id"
              type="number"
              min="0"
              placeholder="0"
              :value="order[product.id]"
              class="w-6 text-center"
            />
            <button @click.prevent="increment(product.id)" class="px-2 py-1">
              +
            </button>
          </div>
        </div>
      </div>

      <div class="m-3">
        <button type="submit" class="block w-full button button-primary">
          Save Order
        </button>
        <button
          @click="resetOrder"
          class="block w-full button button-secondary mt-3"
        >
          Reset
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "Order",
  computed: mapState({
    products: "products",
    order: "order",
    totalQuantity: (state) =>
      Object.values(state.order).reduce((acc, cur) => acc + cur),
  }),
  methods: {
    increment(pid) {
      // TODO: Get Max Quantity in Database
      if (this.totalQuantity < 8) this.order[pid]++;
    },
    decrement(pid) {
      if (this.order[pid] > 0) this.order[pid]--;
    },
    ...mapActions({
      resetOrder: "resetOrder",
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