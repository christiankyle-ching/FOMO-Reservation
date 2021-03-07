<template>
  <div>
    <h3 class="text-center">Order</h3>
    <table class="table-auto m-auto">
      <thead>
        <tr>
          <th>Item</th>
          <th>Unit Price</th>
          <th>Quantity</th>
          <th>Total Price</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="o in order" :key="o">
          <td>{{ o.name }}</td>
          <td class="text-right">{{ o.price.toLocaleString() }}</td>
          <td class="text-right">x {{ o.qty }}</td>
          <td class="text-right">{{ getPrice(o).toLocaleString() }} PHP</td>
        </tr>
      </tbody>

      <tfoot class="font-bold">
        <tr>
          <td>TOTAL</td>
          <td class="text-right">{{ order_TotalQty }}</td>
          <td></td>
          <td class="text-right">
            {{ order_TotalPrice.toLocaleString() }} PHP
          </td>
        </tr>
      </tfoot>
    </table>

    <div v-if="isDone">
      <!-- TODO: Implement Print -->
      <button class="button button-block button-primary">Print</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Receipt",
  props: { order: Object, isDone: Boolean },
  inheritAttrs: false,

  data() {
    return {
      order_TotalPrice: 0,
      order_TotalQty: 0,
    };
  },

  methods: {
    getPrice(orderProduct) {
      return orderProduct.qty * orderProduct.price;
    },

    updateTotals() {
      this.order_TotalPrice = this.order
        .map((o) => o.price * o.qty)
        .reduce((acc, cur) => acc + cur);

      this.order_TotalQty = this.order
        .map((o) => o.qty)
        .reduce((a, c) => a + c);
    },
  },

  watch: {
    order() {
      this.updateTotals();
    },
  },

  mounted() {
    this.updateTotals();
  },
};
</script>

<style>
</style>