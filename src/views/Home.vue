<template>
  <div class="home container mx-auto p-5 sm:p-10">
    <h1 class="text-center my-5 sm:mb-10">
      {{ $store.state.clientName }}'s Waitlist
    </h1>
    <div v-if="!!user">
      <!-- a: Order Allowed -->
      <Order v-if="orderAllowed" />

      <!-- b: Order Done, Wait for Payment -->
      <div v-else-if="orderDone">
        <Payment class="mb-10" />
        <Receipt :order="pendingOrder" :batch="latestBatch" inProcess />
      </div>

      <!-- c: Payment Done - Details -->
      <div v-else-if="pendingOrder?.payment">
        <h4 class="text-center">
          <span class="text-success"> We received your payment.</span>
          Please wait for our confirmation on
          <a :href="$store.state.clientUrl" class="link" target="_blank"
            >Facebook</a
          >. Thank You!
        </h4>
        <div class="pt-10">
          <h3 class="text-center pb-5">Payment Details</h3>
          <Receipt :order="pendingOrder" :batch="latestBatch" inProcess />
        </div>
      </div>

      <!-- d: Latest Batch is not done. Check if you are included -->
      <div v-else-if="!!orderFromLatestBatch" class="card">
        <h3 class="text-center">
          Batch "{{ latestBatch?.name }}" is in process.
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 my-3">
          <span class="font-medium">Batch Date (Closed Reservations):</span>
          <span> {{ latestBatch.closedAtString }}</span>
        </div>

        <h5 class="text-center mb-3">Your Order</h5>
        <Receipt :order="orderFromLatestBatch" :batch="latestBatch" inProcess />
      </div>

      <!-- Default: Show Reservation Module -->
      <Reserve v-else class="mt-10" :key="_userKey" />

      <!-- Phone Number Registration -->
      <div class="card mt-20">
        <div class="mb-5">
          <h3>Your Profile, {{ user.displayName }}</h3>
          <p>{{ user.email }}</p>
        </div>
        <LinkPhoneNumber />
      </div>
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
import LinkPhoneNumber from "@/components/LinkPhoneNumber.vue";

export default {
  name: "Home",
  components: {
    Order,
    Reserve,
    Payment,
    Receipt,
    LoadingSpinner,
    LinkPhoneNumber,
  },
  data() {
    return { orderFromLatestBatch: null };
  },
  computed: {
    ...mapState({
      user: "user",
      _userKey: "_userKey",
      pendingOrder: "pendingOrder",
      orderAllowed: "orderAllowed",
      orderDone: "orderDone",
      latestBatch: "latestBatch",
    }),
  },
  watch: {
    latestBatch() {
      if (this.latestBatch != null && !this.latestBatch.isDone) {
        return (this.orderFromLatestBatch =
          this.latestBatch.orders?.find(
            (o) => o.email === this.$store.state.user.email
          ) ?? null);
      }

      this.orderFromLatestBatch = null;
    },
  },
};
</script>
