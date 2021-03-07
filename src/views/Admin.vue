<template>
  <div class="admin container">
    <h1 class="text-center py-10">Manage FOMO</h1>

    <LatestBatch v-if="isProcessing" class="m-5" />
    <OpenBatch v-else class="m-5" />

    <!-- TODO: Implement Router-View last batches with pagination -->

    <Products class="m-5" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import { BATCH_STATUS } from "@/models/Batch";

import Products from "@/components/Products.vue";
import Batches from "@/components/Batches.vue";
import OpenBatch from "@/components/OpenBatch";
import LatestBatch from "@/components/LatestBatch";

export default {
  name: "Admin",

  components: { Products, Batches, OpenBatch, LatestBatch },
  computed: {
    ...mapState({
      isProcessing: (state) => {
        console.log(state.status.batch);
        console.log(state.latestBatch?.locked_at);
        console.log(state.latestBatch?.isDone);

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