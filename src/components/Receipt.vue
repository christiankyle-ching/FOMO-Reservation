<template>
  <div>
    <table class="table-auto w-full">
      <thead>
        <tr class="text-left">
          <th>Item</th>
          <th></th>
          <th>Price</th>
          <th v-if="!inProcess"></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(product, index) in order" :key="index + product.name">
          <td>{{ product.name }}</td>
          <td class="text-right">{{ product.unit_price.toLocaleString() }} PHP x {{ product.qty }}</td>
          <td class="text-right">
            {{ product.total_price.toLocaleString() }} PHP
          </td>
          <td v-if="!inProcess">
            <button
              type="button"
              @click="removeOrder(index)"
              class="button-icon button-icon-sm button-danger m-auto"
            >
              <span class="fas fa-times"></span>
            </button>
          </td>
        </tr>
      </tbody>

      <tfoot>
        <tr>
          <th class="text-left">TOTAL</th>
          <th class="text-right">{{ orderTotalQty }} item/s</th>
          <th class="text-right">{{ orderTotalPrice.toLocaleString() }} PHP</th>
          <th v-if="!inProcess"></th>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
export default {
  name: "Receipt",
  props: { order: Object, inProcess: Boolean },
  inheritAttrs: false,

  data() {
    return {
      orderTotalQty: 0,
      orderTotalPrice: 0,
    };
  },

  methods: {
    removeOrder(index) {
      this.order.splice(index, 1);
    },
  },

  watch: {
    order: {
      handler: function () {
        if (!this.order.length) {
          this.orderTotalQty = 0;
          this.orderTotalPrice = 0;
          return;
        }

        this.orderTotalQty = this.order
          .map((o) => o.qty)
          .reduce((a, c) => a + c);

        this.orderTotalPrice = this.order
          .map((o) => o.total_price)
          .reduce((a, c) => a + c);
      },
      deep: true,
    },
  },

  mounted() {},
};
</script>

<style>
</style>