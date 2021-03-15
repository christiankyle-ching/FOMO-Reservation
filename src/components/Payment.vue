<template>
  <div>
    <div class="text-center mt-3" v-if="$route.query.status == 'auth'">
      <h6 class="font-medium text-success">
        Please wait while we process your order transaction...
      </h6>

      <div class="text-sm">
        <p class="mt-3">
          You will not be charged until the status below becomes
          <span class="text-success">Paid</span>.
        </p>

        <p class="mt-3">
          If you are charged but has not received your
          <strong>Payment ID</strong>, please contact us on
          <a href="" class="link">Facebook</a> to verify your payment.
          <!-- TODO -->
        </p>
      </div>

      <!-- FIXME: What to do if it takes long, and not yet charged. -->
      <!-- Problem: Might get double charged -->
      <!-- <p>If this takes too long, but you are not yet charged, Please click here to reload the page and try to pay again.</p> -->
    </div>

    <div v-else>
      <h2 class="text-center pb-5">Pay With</h2>

      <div class="flex items-center justify-around">
        <button @click="payWithEwallet('gcash')" class="button button-primary">
          Pay with GCash
        </button>
        <span>or</span>
        <button
          @click="payWithEwallet('grab_pay')"
          class="button button-primary"
        >
          Pay with GrabPay
        </button>
      </div>

      <p
        class="font-medium text-danger text-center mt-3"
        v-if="$route.query.status == 'fail'"
      >
        Payment aborted or unsuccessful. Please try again.
      </p>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { ALERT_TYPE } from "../models/Alert";

export default {
  computed: {
    redirectUrl() {
      // TODO: Replace redirect url
      return `${location.origin}${this.$router.resolve({ name: "Home" }).path}`;
    },
    ...mapState({
      pendingOrder: "pendingOrder",
    }),
  },
  methods: {
    async payWithEwallet(sourceType) {
      const url = "https://90868428.loca.lt/api/payment";

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: this.pendingOrder.uid,
          name: this.pendingOrder.name,
          email: this.pendingOrder.email,
          totalPrice: this.pendingOrder.totalPrice,
          sourceType: sourceType,
        }),
      };

      try {
        const response = await fetch(url, options);

        if (!response.ok) throw new Error(response.body);

        const result = await response.json();

        // Open Fetched Link Link
        open(result.checkout_url, "_self");
      } catch (err) {
        this.$store.dispatch("alert", {
          message:
            "Something went wrong in generating your link. Please reload the page and try again.",
          type: ALERT_TYPE.DANGER,
        });
      }
    },
  },
};
</script>

<style>
</style>