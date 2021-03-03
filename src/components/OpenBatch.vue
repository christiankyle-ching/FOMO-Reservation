<template>
  <div class="open-batch card">
    <div class="text-center">
      <h2>Current Batch</h2>
      <p
        v-if="status.batch"
        class="capitalize italic font-bold"
        :class="{
          'text-green-800': isOpen,
          'text-blue-800': isClosed,
          'text-red-800': isPending,
        }"
      >
        {{ status.batch }}
      </p>
    </div>

    <!-- Current Open Batch -->
    <div v-if="openBatch">
      <h3 class="text-center mt-3">Open Batch</h3>
      <button
        @click="closeCurrentBatch"
        class="button button-danger float-right"
      >
        Close Batch
      </button>

      <div>
        <h4>{{ openBatch.name }}</h4>
        <p class="italic text-sm">{{ openBatchDateString }}</p>
      </div>
    </div>

    <!-- Open New Batch -->
    <form @submit.prevent="openNewBatch" v-if="!openBatch && isPending">
      <label>Name</label>
      <input type="text" v-model="formNewBatch.name" />

      <label># of Orders (Limit)</label>
      <div class="input__number">
        <button @click.prevent="decrement()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="icon-sm"
          >
            <path
              fillRule="evenodd"
              d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <input
          type="number"
          min="0"
          placeholder="0"
          v-model="formNewBatch.order_limit"
        />
        <button @click.prevent="increment()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            class="icon-sm"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </div>

      <button type="submit" class="button button-block button-primary mt-3">
        Open a New Batch
      </button>
    </form>

    <!-- Finish Batch -->
    <div v-if="isClosed && latestBatch">
      <h2>Finalize Batch "{{ latestBatch.name }}"</h2>
      <p>
        If the customers' orders are submitted already, you finalize this batch
        now to start preparing your orders.
      </p>

      <div class="mt-3">
        <h5>Submitted Orders:</h5>
        <div v-for="o in pendingOrders" :key="o.id">
          <h6>{{ o.name }}</h6>
          <p>Total Items: {{ o.order.reduce((acc, cur) => acc.qty + cur.qty ) }} items</p>
          <p>Total Price: {{ (o.order.reduce((acc, cur) => (acc.unit_price * acc.qty) + (cur.unit_price * cur.qty) )).toLocaleString() }} PHP</p>
        </div>
      </div>
    </div>

    <!-- <button class="button button-secondary" @click="log">LOG</button> -->
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { localeDateTimeOpts } from "../utils";
import { BATCH_STATUS } from "@/models/Batch";

export default {
  name: "OpenBatch",
  computed: {
    ...mapState({
      formNewBatch: "formNewBatch",
      batches: "batches",
      openBatch: "openBatch",
      latestBatch: "latestBatch",
      pendingOrders: "pendingOrders",
      status: "status",
      isOpen: (state) => state.status.batch == BATCH_STATUS.OPEN,
      isPending: (state) => state.status.batch == BATCH_STATUS.PENDING,
      isClosed: (state) => state.status.batch == BATCH_STATUS.CLOSED,
      openBatchDateString: (state) =>
        state.openBatch.created_at
          .toDate()
          .toLocaleString("en-PH", localeDateTimeOpts),
    }),
  },
  methods: {
    log() {
      console.log(this.pendingOrders);
    },
    ...mapActions({
      closeCurrentBatch: "closeCurrentBatch",
      openNewBatch: "openNewBatch",
    }),
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