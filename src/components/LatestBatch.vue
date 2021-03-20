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

    <BatchOrders :batch="latestBatch" isFinalized />

    <button
      @click="markLatestBatchAsDone()"
      class="button button-block button-primary mt-3"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <!-- Icon: check-sm -->
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
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