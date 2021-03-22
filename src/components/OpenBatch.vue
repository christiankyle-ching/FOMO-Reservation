<template>
  <div class="open-batch card">
    <div class="text-center mb-3">
      <h2>Current Batch</h2>
      <p v-if="status" class="capitalize italic">
        {{ statusMessage }}
      </p>
    </div>

    <!-- 1: Open New Batch -->
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
          v-model.number="formNewBatch.order_limit"
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
          v-model.number="formNewBatch.maxAllowedOrderQty"
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

    <div v-else-if="!!openBatch || !!latestBatch">
      <!-- 2: Current Open Batch - Can Close - Stop Reservation -->
      <div v-if="allowCloseBatch">
        <h3 class="text-center mt-3">Open Batch</h3>

        <div class="my-3">
          <h4>{{ openBatch.name }}</h4>
          <p class="italic text-sm">{{ openBatch.createdAtString }}</p>
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

      <!-- 3: Finish Batch - Can Lock / Finalize - Stop Orders and Payments -->
      <div v-else-if="allowFinishBatch">
        <h3>Finalize Batch "{{ openBatch.name }}"</h3>
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
            {{ openBatchWithOrders?.orders?.length }}
          </h5>

          <!-- Pending Orders -->
          <div class="my-5">
            <BatchOrders :batch="openBatchWithOrders" />
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

      <!-- 4: TODO: Orders to Process - To Open New Batch -->
      <div v-else-if="allowDoneBatch">
        <div class="latest-batch">
          <h2 class="text-center">Orders to Process</h2>

          <!-- Header -->
          <div class="my-5">
            <h5>Batch: {{ latestBatch.name }}</h5>

            <small>
              Created at:
              <span class="italic">{{ latestBatch.createdAtString }}</span>
              <br />
              Closed at:
              <span class="italic">{{ latestBatch.closedAtString }}</span>
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
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import BatchOrders from "@/components/BatchOrders";
import { Batch } from "@/models/Batch";
import { BATCH_STATUS } from "@/models/Batch";

export default {
  name: "OpenBatch",
  components: { BatchOrders },
  computed: {
    ...mapState({
      formNewBatch: "formNewBatch",

      openBatch: "openBatch",
      openBatchWithOrders(state) {
        return new Batch({
          ...state.openBatch.firestoreDoc,
          orders: state.pendingOrders,
        });
      },
      latestBatch: "latestBatch",

      paidOrders(state) {
        return state.pendingOrders.filter((o) => !!o.payment);
      },

      status: "status",
      counters: "counters",

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
          !state.openBatch &&
          state.status?.batch == BATCH_STATUS.PENDING &&
          !state.latestBatch
        );
      },
      allowCloseBatch(state) {
        return (
          !!state.openBatch &&
          !!state.openBatch.created_at &&
          !state.openBatch.closed_at &&
          !state.openBatch.locked_at &&
          !state.openBatch.isDone &&
          state.status?.batch == BATCH_STATUS.OPEN
        );
      },
      allowFinishBatch(state) {
        return (
          !!state.openBatch &&
          !!state.openBatch.created_at &&
          !!state.openBatch.closed_at &&
          !state.openBatch.locked_at &&
          !state.openBatch.isDone &&
          state.status?.batch == BATCH_STATUS.CLOSED
        );
      },
      allowDoneBatch(state) {
        return (
          !!state.latestBatch &&
          !state.latestBatch.isDone &&
          state.status?.batch == BATCH_STATUS.PENDING
        );
      },
    }),
  },
  methods: {
    ...mapActions({
      openNewBatch: "openNewBatch",
      closeCurrentBatch: "closeCurrentBatch",
      finalizeBatch: "finalizeBatch",
      markLatestBatchAsDone: "markLatestBatchAsDone",
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