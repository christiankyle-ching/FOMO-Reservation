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
        <Receipt :order="pendingOrder" :batch="openBatch" />
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
          <Receipt :order="pendingOrder" :batch="openBatch" />
        </div>
      </div>

      <!-- Default: Show Reservation Module and past Orders -->
      <div v-else>
        <Reserve class="mt-10" :key="_userKey" />

        <!-- History of paid orders from paid-orders -->
        <p class="text-center mt-10">
          If you still have undelivered orders, you can view your past orders
          <router-link :to="{ name: 'PaidOrders' }" class="link"
            >here</router-link
          >.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
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
    ...mapState(["user", "_userKey", "pendingOrder", "openBatch"]),
    ...mapGetters({
      orderAllowed: "customer/orderAllowed",
      orderDone: "customer/orderDone",
    }),
  },
};
</script>
