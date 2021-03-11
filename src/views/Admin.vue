<template>
  <div class="admin container">
    <h1 class="text-center mt-10 mb-8">Manage FOMO</h1>

    <LatestBatch v-if="isProcessing" class="m-5" />
    <OpenBatch v-else class="m-5" />

    <!-- Admin Actions -->
    <div class="card m-5">
      <h2 class="pb-5 text-center">Actions</h2>
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

      <!-- TODO: Implement Router-View last batches with pagination -->
      <router-link
        :to="{ name: 'Products' }"
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

import Batches from "@/components/Batches.vue";
import OpenBatch from "@/components/OpenBatch";
import LatestBatch from "@/components/LatestBatch";

export default {
  name: "Admin",

  components: { Batches, OpenBatch, LatestBatch },
  computed: {
    ...mapState({
      isTakingOrders: (state) => state.status.batch == BATCH_STATUS.CLOSED,
      isProcessing: (state) => {
        return (
          state.status.batch == BATCH_STATUS.PENDING &&
          // FIXME: undefined onChange
          // state.latestBatch?.locked_at &&
          state.latestBatch?.isDone == false
        );
      },
    }),
  },
};
</script>

<style>
</style>