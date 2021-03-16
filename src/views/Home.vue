<template>
  <div class="home container p-5 sm:p-10">
    <h1 class="text-center pb-10">{{ $store.state.clientName }}'s Waitlist</h1>
    <div v-if="user">
      <!-- a: Order Allowed -->
      <Order v-if="orderAllowed" />

      <!-- b: Order Done, Wait for Payment -->
      <div v-else-if="orderDone">
        <Payment class="mb-10" />
        <Receipt :order="pendingOrder" inProcess />
      </div>

      <!-- c: Payment Done - Details -->
      <div v-else-if="pendingOrder?.payment">
        <h4 class="text-center">
          <span class="text-success"> We received your payment.</span> Please
          wait for our confirmation on
          <a :href="$store.state.clientLink" class="link">Facebook</a>. Thank
          You!
        </h4>
        <div class="pt-10">
          <h3 class="text-center pb-5">Payment Details</h3>
          <Receipt :order="pendingOrder" inProcess />
        </div>
      </div>

      <!-- d: Latest Batch is not done. Check if you are included -->
      <div v-else-if="orderFromLatestBatch != null" class="card">
        <h3 class="text-center">
          Batch "{{ latestBatch?.name }}" is in process.
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 my-3">
          <span class="font-medium">Started Processing:</span>
          <span> {{ latestBatch.lockedAtString }}</span>
        </div>

        <h5 class="text-center mb-3">Your Order</h5>
        <Receipt :order="orderFromLatestBatch" inProcess />
      </div>

      <Reserve v-else />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Order from "@/components/Order.vue";
import Receipt from "@/components/Receipt.vue";
import Reserve from "@/components/Reserve.vue";
import Payment from "@/components/Payment.vue";

export default {
  name: "Home",
  components: { Order, Reserve, Payment, Receipt },
  computed: {
    ...mapState({
      user: "user",
      pendingOrder: "pendingOrder",
      orderAllowed: "orderAllowed",
      orderDone: "orderDone",
      latestBatch: "latestBatch",
      orderFromLatestBatch(state) {
        if (state.latestBatch != null && !state.latestBatch.isDone) {
          return (
            state.latestBatch.orders?.find(
              (o) => o.email === state.user.email
            ) ?? null
          );
        }

        return null;
      },
    }),
  },
  methods: {},
};
</script>
