<template>
  <!-- Orders -->
  <div class="latest-batch card" @keyup.esc="closeOrderModal()">
    <h2 class="text-center">Orders to Process</h2>

    <!-- Header -->
    <div class="my-5">
      <h5>Batch: {{ latestBatch.name }}</h5>

      <small>
        Created at:
        <span class="italic">{{ latestBatch.createdAtString }}</span>
        <br />
        Closed at: <span class="italic">{{ latestBatch.closedAtString }}</span>
      </small>
    </div>

    <BatchOrders :batch="latestBatch" />

    <button
      @click="markLatestBatchAsDone"
      class="button button-block button-primary mt-3"
    >
      <span class="fas fa-check"></span>
      Mark Batch as Done
    </button>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import BatchOrders from "@/components/BatchOrders";

export default {
  name: "LatestBatch",
  components: { BatchOrders },
  inheritAttrs: false,
  data() {
    return {
      searchKey: "",

      orderShown: null,
      showModal: false,
    };
  },
  computed: {
    ...mapState({
      latestBatch: "latestBatch",
    }),
  },
  methods: {
    ...mapActions({
      markLatestBatchAsDone: "markLatestBatchAsDone",
    }),
  },
};
</script>

<style>
</style>