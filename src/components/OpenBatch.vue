<template>
  <div class="open-batch card">
    <div class="text-center">
      <h2>Current Batch</h2>
      <p
        v-if="status"
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
        <h5>
          Submitted Orders: {{ pendingOrders.filter((o) => o.order).length }} of
          {{ pendingOrders.length }}
        </h5>

        <!-- Pending Order Item -->
        <div v-for="o in pendingOrders" :key="o" class="mt-4 mb-2">
          <div class="mb-1">
            <h6>{{ o.name }}</h6>
            <div class="text-sm italic">
              <p>{{ o.email }}</p>
              <p>{{ o.phone }}</p>
            </div>
          </div>

          <!-- Order Sent Already -->
          <div v-if="o.order">
            <p>
              Total Items:
              {{ getQty(o.order).toLocaleString() }} items
            </p>
            <p>
              Total Price:
              {{ getTotalPrice(o.order).toLocaleString() }} PHP
            </p>
          </div>

          <!-- <button @click="log">LOG ORDER</button> -->

          <hr class="mx-2 mb-2" />
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
      isOpen: (state) => state.status?.batch == BATCH_STATUS.OPEN,
      isPending: (state) => state.status?.batch == BATCH_STATUS.PENDING,
      isClosed: (state) => state.status?.batch == BATCH_STATUS.CLOSED,
      openBatchDateString: (state) =>
        state.openBatch.created_at
          ?.toDate()
          .toLocaleString("en-PH", localeDateTimeOpts),
    }),
  },
  methods: {
    log() {
      console.log();
      this.pendingOrders.forEach((o) => console.log(o.order));
    },
    ...mapActions({
      closeCurrentBatch: "closeCurrentBatch",
      openNewBatch: "openNewBatch",
      finalizeBatch: "finalizeBatch",
    }),

    // For order_limit
    increment() {
      this.formNewBatch.order_limit++;
    },
    decrement() {
      if (this.formNewBatch.order_limit > 0) this.formNewBatch.order_limit--;
    },

    // Order Items and Total Price
    getQty(order) {
      const _qty = order.map((o) => o.qty).reduce((acc, cur) => acc + cur);
      return _qty;
    },

    getTotalPrice(order) {
      const _price = order
        .map((o) => o.qty * o.unit_price)
        .reduce((acc, cur) => acc + cur);
      return _price;
    },
  },
};
</script>

<style>
</style>