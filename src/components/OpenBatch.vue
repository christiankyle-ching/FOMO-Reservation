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
      <input type="text" v-model="formNewBatch.name" />

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
        <p v-if="counters">Reservations: {{ counters.reservations }}</p>
      </div>
    </div>

    <!-- Finish Batch -->
    <div v-if="allowFinishBatch">
      <h3>Finalize Batch "{{ latestBatch.name }}"</h3>
      <p>
        If the customers' orders are submitted already, you can finalize this
        batch now to start preparing your orders.
        <span class="text-red-800 font-medium"
          >This would stop accepting orders from unattended reservations.</span
        >
      </p>

      <div class="mt-3">
        <h5>
          Submitted Orders: {{ pendingOrders.filter((o) => o.order).length }} of
          {{ pendingOrders.length }}
        </h5>

        <div class="flex justify-between">
          <p>Total Food Items:</p>
          <strong>{{ batchTotalQty }}</strong>
        </div>

        <div class="flex justify-between">
          <p>Total Amount:</p>
          <strong>{{ batchTotalPrice.toLocaleString() }} PHP</strong>
        </div>

        <!-- Pending Order Item -->
        <div
          v-for="o in pendingOrders"
          :key="o"
          class="my-4 flex justify-between"
        >
          <div>
            <h6>{{ o.name }}</h6>
            <div class="text-sm italic">
              <p>{{ o.email }}</p>
              <p>{{ o.phone }}</p>
            </div>
          </div>

          <!-- Order Sent Already -->
          <div v-if="o.order">
            <p>
              {{ getQty(o.order).toLocaleString() }} items <br />
              {{ getTotalPrice(o.order).toLocaleString() }} PHP
            </p>
          </div>
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
import LatestBatch from "@/components/LatestBatch";
import { localeDateTimeOpts } from "@/utils";
import { BATCH_STATUS } from "@/models/Batch";

const fnReducer = (a, c) => a + c;

export default {
  name: "OpenBatch",
  components: { LatestBatch },
  data() {
    return {
      batchTotals: {},
    };
  },
  computed: {
    ...mapState({
      formNewBatch: "formNewBatch",
      openBatch: "openBatch",
      latestBatch: "latestBatch",
      pendingOrders: "pendingOrders",
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
            return "text-green-800";
          case BATCH_STATUS.CLOSED:
            return "text-blue-800";
          case BATCH_STATUS.PENDING:
            return "text-red-800";
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

      // Totals
      batchTotalQty(state) {
        const withOrders = state.pendingOrders.filter(
          (o) => o.order !== undefined
        );

        if (withOrders.length <= 0) return 0;

        return withOrders
          .map((o) => o.order)
          .map((order) => order.map((p) => p.qty))
          .map((prices) => prices.reduce(fnReducer))
          .reduce(fnReducer);
      },

      batchTotalPrice(state) {
        const withOrders = state.pendingOrders.filter(
          (o) => o.order !== undefined
        );

        if (withOrders.length <= 0) return 0;

        return withOrders
          .map((o) => o.order)
          .map((order) => order.map((p) => p.total_price))
          .map((prices) => prices.reduce(fnReducer))
          .reduce(fnReducer);
      },
    }),
  },
  methods: {
    ...mapActions({
      openNewBatch: "openNewBatch",
      closeCurrentBatch: "closeCurrentBatch",
      finalizeBatch: "finalizeBatch",
    }),

    // Get Overall Totals
    getBatchTotals() {
      const fnReducer = (a, c) => a + c;

      if (this.pendingOrders.length <= 0)
        return (this.batchTotals = { qty: 0, price: 0 });

      const _orders = this.pendingOrders.map((o) => o.order);

      this.batchTotals.qty = _orders
        .map((order) => order.map((p) => p.qty))
        .map((qtys) => qtys.reduce(fnReducer))
        .reduce(fnReducer);

      this.batchTotals.price = _orders
        .map((order) => order.map((p) => p.qty * p.price))
        .map((prices) => prices.reduce(fnReducer))
        .reduce(fnReducer);
    },

    // Input: For order_limit
    increment() {
      this.formNewBatch.order_limit++;
    },
    decrement() {
      if (this.formNewBatch.order_limit > 0) this.formNewBatch.order_limit--;
    },

    // Helper Functions: Order Items and Total Price
    getQty(order) {
      const _qty = order.map((o) => o.qty).reduce((acc, cur) => acc + cur);
      return _qty;
    },

    getTotalPrice(order) {
      const _price = order
        .map((o) => o.total_price)
        .reduce((acc, cur) => acc + cur);
      return _price;
    },
  },
};
</script>

<style>
</style>