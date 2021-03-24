<template>
  <div class="home app-container">
    <div class="app-container__header">
      <h1 class="text-center">{{ $store.state.clientName }}'s Waitlist</h1>
    </div>
    <div v-if="!!user">
      <!-- a: Order Allowed -->
      <Order v-if="orderAllowed" />

      <!-- b: Order Done, Wait for Payment -->
      <div v-else-if="orderDone">
        <Payment class="mb-10" />
        <Receipt :order="pendingOrder" :batch="openBatch" inProcess />
      </div>

      <!-- c: Payment Done - Details -->
      <div v-else-if="!!pendingOrder?.payment">
        <h4 class="text-center">
          <span class="text-success"> We received your payment.</span>
          Please wait for our confirmation on
          <a :href="$store.state.clientUrl" class="link" target="_blank"
            >Facebook</a
          >. Thank You!
        </h4>
        <div class="pt-10">
          <h3 class="text-center pb-5">Payment Details</h3>
          <Receipt :order="pendingOrder" :batch="openBatch" inProcess />
        </div>
      </div>

      <!-- TODO: d: Check history of paid orders from paid-orders -->

      <!-- Default: Show Reservation Module -->
      <Reserve v-else class="mt-10" :key="_userKey" />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Order from "@/components/Order.vue";
import Receipt from "@/components/Receipt.vue";
import Reserve from "@/components/Reserve.vue";
import Payment from "@/components/Payment.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

export default {
  name: "Home",
  components: {
    Order,
    Reserve,
    Payment,
    Receipt,
    LoadingSpinner,
  },
  computed: {
    ...mapState([
      "user",
      "_userKey",
      "pendingOrder",
      "orderAllowed",
      "orderDone",
      "openBatch",
    ]),
  },
};
</script>
