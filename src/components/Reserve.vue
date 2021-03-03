<template>
  <div class="reserve">
    <div v-if="openBatch && !reservationExists">
      <div class="text-center">
        <h2>{{ openBatch.name }}</h2>
        <h4>Reservation is now open for the next batch!</h4>
      </div>

      <button @click="reserve" class="button button-block button-primary mt-3">
        Reserve
      </button>
    </div>

    <div v-else-if="reservationExists">
      <h2 class="text-center">
        Reservation request already sent! Please wait for confirmation if you
        are lucky to get into the limit.
      </h2>
    </div>

    <div v-else-if="!openBatch && !orderDone">
      <h2 class="text-center">Stay tuned for the next batch!</h2>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
export default {
  name: "Reserve",
  components: {},
  methods: {
    log() {
      console.log("Current Batch: ", this.openBatch);
      console.log("Reservation Allowed: ", this.reservationExists);
    },
    ...mapActions({
      reserve: "reserve",
    }),
  },
  computed: {
    ...mapState({
      openBatch: "openBatch",
      orderDone: "orderDone",
      reservationExists: "reservationExists",
    }),
  },
};
</script>

<style>
</style>