<template>
  <div class="open-batch card">
    <div class="text-center mb-3">
      <h2>Current Batch</h2>
      <p v-if="status" class="capitalize font-medium" :class="statusColorClass">
        {{ statusMessage }}
      </p>
    </div>

    <!-- Open New Batch -->
    <form @submit.prevent="openNewBatch" v-if="allowOpenNewBatch">
      <label>Name</label>
      <input type="text" v-model="formNewBatch.name" required />

      <label># of Orders (Limit)</label>
      <div class="input__number">
        <button type="button" @click="decrement()">
          <span class="fas fa-minus"></span>
        </button>
        <input
          type="number"
          min="1"
          placeholder="0"
          v-model="formNewBatch.order_limit"
          required
        />
        <button type="button" @click="increment()">
          <span class="fas fa-plus"></span>
        </button>
      </div>

      <button type="submit" class="button button-block button-primary mt-3">
        <span class="fas fa-clock"></span>
        Open a New Batch
      </button>
    </form>

    <!-- Current Open Batch -->
    <div v-else-if="openBatch">
      <h3 class="text-center mt-3">Open Batch</h3>

      <div class="my-3">
        <h4>{{ openBatch.name }}</h4>
        <p class="italic text-sm">{{ openBatchDateString }}</p>
        <p v-if="counters">Reservations: {{ counters.reservations }}</p>
      </div>

      <button
        @click="closeCurrentBatch"
        class="button button-danger button-block"
      >
        <span class="fas fa-door-closed"></span>
        Close Batch
      </button>
    </div>

    <!-- Finish Batch -->
    <div v-else-if="allowFinishBatch">
      <h3>Finalize Batch "{{ latestBatch.name }}"</h3>
      <p>
        If the customers' orders are submitted and paid already, you can
        finalize this batch now to start preparing your orders.
        <span class="text-red-700 font-medium"
          >This would stop accepting orders from unattended or unpaid
          reservations.</span
        >
      </p>

      <div class="mt-3">
        <h5>
          Paid Orders: {{ paidOrders?.length }} of
          {{ latestBatch?.orders?.length }}
        </h5>

        <!-- Pending Orders -->
        <div class="my-5">
          <BatchOrders :batch="latestBatch" />
        </div>

        <!-- Finalize Orders -->
        <button
          @click="finalizeBatch"
          class="button button-primary button-block mt-3"
        >
          Stop Accepting Orders (Finalize)
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import BatchOrders from "@/components/BatchOrders";
import { Batch } from "@/models/Batch";
import { localeDateTimeOpts } from "@/utils";
import { BATCH_STATUS } from "@/models/Batch";

export default {
  name: "OpenBatch",
  components: { BatchOrders },
  computed: {
    ...mapState({
      formNewBatch: "formNewBatch",
      openBatch: "openBatch",
      latestBatch(state) {
        return new Batch({
          ...state.latestBatch.firestoreDoc,
          orders: state.pendingOrders,
        });
      },
      paidOrders(state) {
        return state.pendingOrders.filter((o) => o.payment != null);
      },
      status: "status",
      counters: "counters",
      openBatchDateString(state) {
        return state.openBatch.created_at
          ?.toDate()
          .toLocaleString("en-PH", localeDateTimeOpts);
      },

      // Status Styling
      statusMessage() {
        switch (this.status.batch) {
          case BATCH_STATUS.OPEN:
            return "Waiting for reservations...";
          case BATCH_STATUS.CLOSED:
            return "Waiting for orders...";
          case BATCH_STATUS.PENDING:
            return "Ready for another batch...";
        }
      },
      statusColorClass() {
        switch (this.status.batch) {
          case BATCH_STATUS.OPEN:
            return "text-darkSuccess";
          case BATCH_STATUS.CLOSED:
            return "text-darkInfo";
          case BATCH_STATUS.PENDING:
            return "text-red-darkDanger";
        }
      },

      // Allow Actions based on Status of Current Batch
      allowOpenNewBatch(state) {
        return (
          !(state.openBatch ?? false) &&
          state.status?.batch == BATCH_STATUS.PENDING
        );
      },
      allowFinishBatch(state) {
        return state.latestBatch && state.status?.batch == BATCH_STATUS.CLOSED;
      },
    }),
  },
  methods: {
    ...mapActions({
      openNewBatch: "openNewBatch",
      closeCurrentBatch: "closeCurrentBatch",
      finalizeBatch: "finalizeBatch",
    }),

    // Input: For order_limit
    increment() {
      this.formNewBatch.order_limit++;
    },
    decrement() {
      if (this.formNewBatch.order_limit > 0) this.formNewBatch.order_limit--;
    },
  },
};
</script>

<style>
</style>