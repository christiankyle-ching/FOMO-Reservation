<template>
  <div class="app-container">
    <LoadingSpinner v-if="batch == null" class="m-auto mt-10" />

    <div v-else>
      <div class="app-container__header">
        <h1>Batch Name: {{ batch.name }}</h1>

        <div class="grid grid-cols-1 sm:grid-cols-2 mt-3">
          <b>Batch ID: </b>
          <span class="mb-1 sm:mb-0">{{ id }}</span>

          <b>Created At: </b>
          <span class="mb-1 sm:mb-0">{{ batch.createdAtString }}</span>

          <b>Closed At: </b>
          <span class="mb-1 sm:mb-0">{{ batch.closedAtString }}</span>

          <b>Started Processing At: </b>
          <span class="mb-1 sm:mb-0">{{ batch.lockedAtString }}</span>
        </div>
      </div>

      <BatchOrders :batch="batch" :isFinalized="!!batch.locked_at" />
    </div>
  </div>
</template>

<script>
import LoadingSpinner from "@/components/LoadingSpinner";
import BatchOrders from "@/components/BatchOrders";
import { Batch } from "@/models/Batch";

export default {
  name: "Batch",
  components: { LoadingSpinner, BatchOrders },
  props: ["id"],
  data() {
    return {
      batch: null,
    };
  },
  mounted() {
    const dbBatches = this.$store.state.dbBatches;
    const bId = this.$route.params.id;

    dbBatches
      .doc(bId)
      .get()
      .then((doc) => {
        const data = doc.data();

        this.batch = new Batch({
          id: doc.id,
          ...data,
        });
      })
      .catch((err) => console.error("Batch mounted: ", err));
  },
};
</script>

<style>
</style>