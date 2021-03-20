<template>
  <div class="admin container mx-auto p-5 sm:p-10">
    <h1 class="text-center my-5 sm:my-10">
      Manage {{ $store.state.clientName }}
    </h1>

    <div v-if="status == null" class="flex h-32">
      <LoadingSpinner class="m-auto" />
    </div>
    <LatestBatch v-else-if="isProcessing" />
    <OpenBatch v-else />

    <!-- Admin Actions -->
    <div class="card mt-5">
      <h2 class="pb-5 text-center">More Options</h2>
      <span
        :title="
          isTakingOrders ? 'Cannot adjust prices when taking orders' : null
        "
      >
        <router-link
          :to="isTakingOrders ? {} : { name: 'Products' }"
          :disabled="isTakingOrders"
          tag="button"
          class="button button-primary button-block"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <!-- Icon: flag-sm -->
            <path
              fill-rule="evenodd"
              d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
              clip-rule="evenodd"
            />
          </svg>
          Manage Food Menu
        </router-link>
      </span>

      <router-link
        :to="{ name: 'BatchHistory' }"
        class="button button-primary button-block mt-5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <!-- Icon: collection-sm -->
          <path
            d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
          />
        </svg>
        View Batch History
      </router-link>

      <router-link
        :to="{ name: 'AdminSettings' }"
        class="button button-primary button-block mt-5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <!-- Icon: cog-sm -->
          <path
            fill-rule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clip-rule="evenodd"
          />
        </svg>
        Settings
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { BATCH_STATUS } from "@/models/Batch";

import OpenBatch from "@/components/OpenBatch";
import LatestBatch from "@/components/LatestBatch";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

export default {
  name: "Admin",

  components: { OpenBatch, LatestBatch, LoadingSpinner },
  computed: {
    ...mapState({
      status: "status",
      isTakingOrders(state) {
        return state.status?.batch == BATCH_STATUS.CLOSED;
      },
      isProcessing(state) {
        return (
          state.status?.batch == BATCH_STATUS.PENDING &&
          state.latestBatch?.isDone == false &&
          state.latestBatch?.locked_at != null
        );
      },
    }),
  },
};
</script>

<style>
</style>