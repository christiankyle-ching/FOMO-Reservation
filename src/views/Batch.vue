<template>
  <div>
    <LoadingSpinner v-if="batch == null" class="m-auto mt-10" />

    <div v-else>
      <div class="mb-5">
        <h1>Batch Name: {{ batch.name }}</h1>
        <p class="text-sm mt-2"><strong>Batch ID: </strong>{{ id }}</p>
      </div>

      <BatchOrders :batch="batch" />
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
      .catch();
  },
};
</script>

<style>
</style>