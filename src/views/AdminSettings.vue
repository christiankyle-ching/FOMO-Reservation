<template>
  <div class="container p-5 sm:p-10 mx-auto">
    <h1 class="mb-10">Settings</h1>

    <div v-if="!!formAdminSettings">
      <!-- Batch Defaults -->
      <form @submit.prevent="saveAdminSettings()" class="card my-5">
        <h3>New Batches</h3>

        <!-- Order Limit -->
        <div class="flex items-center mt-2">
          <label class="flex-grow">Default Reservation Limit Per Batch:</label>
          <div class="input__number">
            <button
              @click="formAdminSettings.decrementOrderLimit()"
              type="button"
            >
              <span class="fas fa-minus"></span>
            </button>
            <input
              type="number"
              min="1"
              v-model="formAdminSettings.order_limit"
            />
            <button
              @click="formAdminSettings.incrementOrderLimit()"
              type="button"
            >
              <span class="fas fa-plus"></span>
            </button>
          </div>
        </div>

        <div class="flex items-center mt-2">
          <!-- Max Allowed Order Qty Per Person -->
          <label class="flex-grow"
            >Default Max Allowed Items Per Person / Order:</label
          >
          <div class="input__number">
            <button
              @click="formAdminSettings.decrementMaxAllowed()"
              type="button"
            >
              <span class="fas fa-minus"></span>
            </button>
            <input
              type="number"
              min="1"
              v-model="formAdminSettings.maxAllowedOrderQty"
            />
            <button
              @click="formAdminSettings.incrementMaxAllowed()"
              type="button"
            >
              <span class="fas fa-plus"></span>
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
import { AdminSettings } from "../models/AdminSettings";

export default {
  name: "AdminSettings",
  components: { LoadingSpinner },
  data() {
    return {
      formAdminSettings: null,
    };
  },
  computed: {
    ...mapState({
      adminSettings: "adminSettings",
    }),
  },
  methods: {
    // Admin Settings
    saveAdminSettings() {
      this.$store.dispatch("saveAdminSettings", this.formAdminSettings);
    },
  },
  async mounted() {
    const adminSettings = await this.$store.state.dbAdminSettings.get();

    this.formAdminSettings = new AdminSettings({ ...adminSettings.data() });
  },
};
</script>

<style>
</style>