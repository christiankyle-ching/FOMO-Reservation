<template>
  <div>
    <!-- Payment and Order Details -->
    <div class="text-sm sm:text-base mb-3">
      <div
        v-if="order.oid && inProcess"
        class="grid grid-cols-1 sm:grid-cols-2"
      >
        <span class="col-span-1 font-medium">Status: </span>
        <span class="col-span-1 mb-1 sm:mb-0">
          <span v-if="order.payment" class="text-success font-medium"
            >Paid</span
          >
          <span v-else class="text-danger font-medium">Pending</span>
        </span>

        <span class="col-span-1 font-medium">Order #: </span>
        <span class="col-span-1 mb-1 sm:mb-0"> {{ order.oid }}</span>
      </div>

      <div v-if="order.payment" class="grid grid-cols-1 sm:grid-cols-2">
        <span class="col-span-1 font-medium">Paid At: </span>
        <span class="col-span-1 mb-1 sm:mb-0"> {{ order.paidAtDateTime }}</span>

        <span class="col-span-1 font-medium">Payment ID: </span>
        <span class="col-span-1 mb-1 sm:mb-0"> {{ order?.payment.id }}</span>

        <span class="col-span-1 font-medium">Amount Paid: </span>
        <span class="col-span-1 mb-1 sm:mb-0">
          {{ order?.paymentAmount.toLocaleString() }} PHP</span
        >
      </div>
    </div>

    <table class="table-auto w-full text-sm sm:text-base">
      <thead>
        <tr class="text-left">
          <th class="w-full">Item</th>
          <th></th>
          <th>Price</th>
          <th v-if="!inProcess"></th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(product, index) in order.orderList"
          :key="index + product.name"
        >
          <td>{{ product.name }}</td>
          <td class="text-right">
            {{ product.unit_price.toLocaleString() }} PHP x {{ product.qty }}
          </td>
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
          <!-- <th class="text-right">{{ orderTotalQty }} item/s</th>
          <th class="text-right">{{ orderTotalPrice.toLocaleString() }} PHP</th> -->
          <th class="text-right">{{ order.totalQty }} item/s</th>
          <th class="text-right">{{ order.totalPrice }} PHP</th>
          <th v-if="!inProcess"></th>
        </tr>
      </tfoot>
    </table>

    <button class="button button-block button-secondary mt-3">
      <span class="fas fa-print"></span>
      Print
    </button>
  </div>
</template>

<script>
export default {
  name: "Receipt",
  props: { order: Object, inProcess: Boolean },
  inheritAttrs: false,

  methods: {
    removeOrder(index) {
      this.order.orderList.splice(index, 1);
    },
  },
};
</script>

<style>
</style>