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
          ><span class="fas fa-utensils icon-sm"></span>
          Manage Food Menu
        </router-link>
      </span>

      <router-link
        :to="{ name: 'BatchHistory' }"
        class="button button-primary button-block mt-5"
      >
        <span class="fas fa-history icon-sm"></span>
        View Batch History
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