<template>
  <div>
    <div class="text-center mt-3" v-if="$route.query.status == 'auth'">
      <h6 class="font-medium text-darkSuccess">
        Please wait while we process your order transaction...
      </h6>

      <div class="text-sm">
        <p class="mt-3">
          You will not be charged until the status below becomes
          <span class="text-darkSuccess">Paid</span>.
        </p>

        <p class="mt-3">
          <strong
            >If you are charged but has not received your Payment ID</strong
          >, please contact us on
          <a :href="$store.state.clientLink" class="link">Facebook</a> to verify
          your payment.
          <!-- TODO: Get Gringo's Link -->
        </p>
      </div>

      <!-- FIXME: What to do if it takes long, and not yet charged. -->
      <!-- Problem: Might get double charged -->
      <!-- <p>If this takes too long, but you are not yet charged, Please click here to reload the page and try to pay again.</p> -->
    </div>

    <div v-else>
      <div v-if="!fetchingLink">
        <h2 class="text-center pb-5">Pay With</h2>

        <div class="flex items-center justify-around">
          <button
            @click="payWithEwallet('gcash')"
            class="button button-primary"
          >
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
          class="font-medium text-darkDanger text-center mt-3"
          v-if="$route.query.status == 'fail'"
        >
          Payment aborted or unsuccessful. Please try again.
        </p>
      </div>

      <LoadingSpinner v-else class="m-auto" />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { ALERT_TYPE } from "@/models/Alert";
import LoadingSpinner from "@/components/LoadingSpinner";

export default {
  components: { LoadingSpinner },
  data() {
    return {
      fetchingLink: false,
    };
  },
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
      const url = `${process.env.VUE_APP_BACKEND_URL}/api/payment`;

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
        this.fetchingLink = true;

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
      } finally {
        this.fetchingLink = false;
      }
    },
  },
};
</script>

<style>
</style>