<template>
  <div class="open-batch card">
    <div class="text-center mb-3">
      <h2>Current Batch</h2>
      <p v-if="status" class="capitalize italic">
        {{ statusMessage }}
      </p>
    </div>

    <!-- Open New Batch -->
    <form @submit.prevent="openNewBatch" v-if="allowOpenNewBatch">
      <label>Name</label>
      <input type="text" v-model="formNewBatch.name" required />

      <label># of Reservations to Accept (Limit):</label>
      <div class="input__number">
        <button type="button" @click="decrementOrderLimit()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <!-- Icon: minus-sm -->
            <path
              fill-rule="evenodd"
              d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <input
          type="number"
          min="1"
          placeholder="0"
          v-model="formNewBatch.order_limit"
          required
        />
        <button type="button" @click="incrementOrderLimit()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <!-- Icon: plus-sm -->
            <path
              fill-rule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <label>Maximum allowed number of items per person:</label>
      <div class="input__number">
        <button type="button" @click="decrementMaxAllowed()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <!-- Icon: minus-sm -->
            <path
              fill-rule="evenodd"
              d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <input
          type="number"
          min="1"
          placeholder="0"
          v-model="formNewBatch.maxAllowedOrderQty"
          required
        />
        <button type="button" @click="incrementMaxAllowed()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <!-- Icon: plus-sm -->
            <path
              fill-rule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <button type="submit" class="button button-block button-primary mt-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <!-- Icon: clock-sm -->
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clip-rule="evenodd"
          />
        </svg>
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
        @click="closeCurrentBatch()"
        class="button button-danger button-block"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <!-- Icon: lock-sm -->
          <path
            fill-rule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clip-rule="evenodd"
          />
        </svg>
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
          @click="finalizeBatch()"
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
    incrementOrderLimit() {
      this.formNewBatch.order_limit++;
    },
    decrementOrderLimit() {
      if (this.formNewBatch.order_limit > 1) this.formNewBatch.order_limit--;
    },

    // Input: Max Allowed Order Qty
    incrementMaxAllowed() {
      this.formNewBatch.maxAllowedOrderQty++;
    },
    decrementMaxAllowed() {
      if (this.formNewBatch.maxAllowedOrderQty > 1)
        this.formNewBatch.maxAllowedOrderQty--;
    },
  },
};
</script>

<style>
</style>