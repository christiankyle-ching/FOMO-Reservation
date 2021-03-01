<template>
  <div class="reserve">
    <div v-if="latestBatch">
      <h2 class="text-center">Reservation is now open for the Next Batch!</h2>
      <button @click="reserve" class="button button-block button-primary mt-3">
        Reserve
      </button>
    </div>

    <div v-else>
      <h2 class="text-center">Stay tuned for the next batch!</h2>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "Reserve",
  components: {},
  methods: {},
  computed: {
    ...mapState({
      latestBatch: "latestBatch",
    }),
  },
};
</script>

<style>
</style>