<template>
  <div class="order">
    <h3>Prepare Your Next Order!</h3>

    <!-- Order Quantities -->
    <form @submit.prevent="saveOrder">
      <div v-for="product in products" :key="product.id">
        <label :for="product.id">{{ product.name }}</label>
        <input
          :id="product.id"
          type="number"
          min="0"
          v-model="order[product.id]"
        />
      </div>

      <button type="submit">Save Order</button>
      <button @click="resetOrder">Reset</button>
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
  }),
  methods: {
    ...mapActions({
      resetOrder: "resetOrder",
      saveOrder: "saveOrder"
    }),
    
  },
};
</script>

<style>
</style>