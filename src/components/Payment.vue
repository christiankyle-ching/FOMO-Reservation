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
          <strong
            >If you are charged but has not received your Payment ID</strong
          >, please contact us on
          <a :href="$store.state.clientUrl" class="link" target="_blank"
            >Facebook</a
          >
          to verify your payment.
        </p>
      </div>

      <!-- FIXME: What to do if it takes long, and not yet charged. -->
      <!-- Problem: Might get double charged -->
    </div>

    <div v-else>
      <div v-if="!fetchingLink">
        <h2 class="text-center pb-3">Payment Options</h2>

        <div
          class="flex justify-center items-center mx-auto flex-col sm:flex-row"
        >
          <!-- GCash -->
          <button
            @click="payWithEwallet('gcash')"
            class="button overflow-hidden p-0 my-2 mx-5 shadow-md"
          >
            <img src="@/assets/icons/gcash.png" alt="GCash" class="w-32" />
          </button>
          <!-- GrabPay -->
          <button
            @click="payWithEwallet('grab_pay')"
            class="button overflow-hidden p-0 my-2 mx-5 shadow-md"
          >
            <img src="@/assets/icons/grabpay.png" alt="GrabPay" class="w-32" />
          </button>
        </div>

        <p
          class="font-medium text-danger text-center mt-3"
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
      return `${location.origin}${this.$router.resolve({ name: "Home" }).path}`;
    },
    ...mapState({
      pendingOrder: "pendingOrder",
    }),
  },
  methods: {
    async payWithEwallet(sourceType) {
      const url = `${process.env.VUE_APP_BACKEND_URL}/api/payment`;
      const redirectBaseUrl =
        window.location.origin + this.$router.resolve({ name: "Home" }).path;

      // Redirect Url Params
      const successQueryParams = new URLSearchParams({
        status: "auth",
      }).toString();
      const failedQueryParams = new URLSearchParams({
        status: "fail",
      }).toString();

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: this.pendingOrder.uid,
          name: this.pendingOrder.name,
          email: this.pendingOrder.email,
          phoneNumber: this.pendingOrder.phoneNumber,
          totalPrice: this.pendingOrder.totalPrice,
          sourceType: sourceType,
          redirect: {
            successUrl: `${redirectBaseUrl}?${successQueryParams}`,
            failedUrl: `${redirectBaseUrl}?${failedQueryParams}`,
          },
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
        this.$store.dispatch(
          "alertError",
          "Something went wrong in generating your link. Please reload the page and try again."
        );
      } finally {
        this.fetchingLink = false;
      }
    },
  },
};
</script>

<style>
</style>