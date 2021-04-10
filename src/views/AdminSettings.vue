<template>
  <div class="app-container">
    <div class="app-container__head">
      <h1>Settings</h1>
    </div>

    <div v-if="!!adminSettings">
      <!-- Batch Defaults -->
      <form @submit.prevent="saveAdminSettings()" class="card my-5">
        <h3>New Batches</h3>

        <!-- Order Limit -->
        <div class="flex items-center mt-2">
          <label class="flex-grow">Default Reservation Limit Per Batch:</label>
          <div class="input__number">
            <button @click="adminSettings.decrementOrderLimit()" type="button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <!-- Icon: minus-sm -->
                <path
                  fill-rule="evenodd"
                  d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <input
              type="number"
              min="1"
              v-model.number="adminSettings.order_limit"
            />
            <button @click="adminSettings.incrementOrderLimit()" type="button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <!-- Icon: plus-sm -->
                <path
                  fill-rule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex items-center mt-2">
          <!-- Max Allowed Order Qty Per Person -->
          <label class="flex-grow"
            >Default Max Allowed Items Per Person / Order:</label
          >
          <div class="input__number">
            <button @click="adminSettings.decrementMaxAllowed()" type="button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <!-- Icon: minus-sm -->
                <path
                  fill-rule="evenodd"
                  d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <input
              type="number"
              min="1"
              v-model.number="adminSettings.maxAllowedOrderQty"
            />
            <button @click="adminSettings.incrementMaxAllowed()" type="button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <!-- Icon: plus-sm -->
                <path
                  fill-rule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="text-right mt-5">
          <button type="submit" class="button button-primary">Save</button>
        </div>
      </form>
    </div>
    <div v-else class="mt-20">
      <LoadingSpinner class="m-auto" />
    </div>
  </div>
</template>

<script>
import LoadingSpinner from "@/components/LoadingSpinner";
import { mapState } from "vuex";

export default {
  name: "AdminSettings",
  components: { LoadingSpinner },
  computed: {
    ...mapState(["adminSettings"]),
  },
  methods: {
    // Admin Settings
    saveAdminSettings() {
      this.$store.dispatch("confirm", {
        title: "Save Settings?",
        message: "Are you sure you want to save these settings?",
        buttonMessage: "Save",
        callback: () => {
          this.$store.dispatch("saveAdminSettings", this.adminSettings);
        },
      });
    },
  },
  mounted() {
    this.$store.dispatch("fetchAdminSettings");
  },
};
</script>

<style>
</style>