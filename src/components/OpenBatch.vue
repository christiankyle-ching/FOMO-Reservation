<template>
  <div class="open-batch card">
    <div class="text-center mb-3">
      <h2>Current Batch</h2>
      <p class="capitalize italic">
        {{ statusMessage }}
      </p>
    </div>

    <!-- A: Open a New Batch -->
    <form
      @submit.prevent="openNewBatch"
      v-if="allowOpenNewBatch && !!formNewBatch"
    >
      <label>Batch Name: </label>
      <input
        type="text"
        v-model.trim="formNewBatch.name"
        required
        placeholder="Enter a name for this batch..."
      />

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

      <span
        :title="
          !productsLength ? 'Please add at least one item in the menu.' : ''
        "
      >
        <button
          type="submit"
          class="button button-block button-primary mt-3"
          :disabled="!productsLength"
        >
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
      </span>
    </form>

    <!-- B: Current Ongoing Batch -->
    <div v-else-if="!!openBatch || !!latestBatch">
      <!-- HEADER: OpenBatch -->
      <div class="text-center my-3">
        <h3>
          {{ openBatch?.name ?? latestBatch?.name }}
        </h3>
        <small class="italic">{{
          openBatch?.createdAtString ?? latestBatch?.createdAtString
        }}</small>
      </div>

      <div v-if="!!openBatch">
        <!-- 2: Current Open Batch - Can Close - Stop Reservation -->
        <div v-if="allowCloseBatch">
          <div v-if="!!counters" class="my-3 text-center">
            <h5>Reservations</h5>

            <span
              class="text-2xl"
              :class="{
                'text-success': counters.reservations == openBatch.order_limit,
                'text-danger': counters.reservations > openBatch.order_limit,
              }"
              >{{ counters.reservations }}</span
            >
            <span>/{{ openBatch.order_limit }}</span>
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
          <p>
            If the customers' orders are submitted and paid already, you can
            finalize this batch now to start preparing your orders.
            <span class="text-red-700 font-medium"
              >This would stop accepting orders from unattended or unpaid
              reservations.</span
            >
          </p>

          <div class="mt-5">
            <h5>
              Paid Orders: {{ paidOrders?.length }} of
              {{ openBatchWithOrders?.orders?.length }}
            </h5>

            <!-- Pending Orders -->
            <div class="my-3">
              <BatchOrders :batch="openBatchWithOrders" />
            </div>

            <!-- Finalize Orders -->
            <button
              @click="finalizeBatch()"
              class="button button-primary button-block mt-3"
            >
              Stop Accepting Orders
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="!!latestBatch">
        <!-- 4: Orders to Process - To Open New Batch -->
        <div v-if="allowDoneBatch">
          <BatchOrders :batch="latestBatch" />

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
import { mapActions, mapGetters, mapState } from "vuex";
import BatchOrders from "@/components/BatchOrders";
import { Batch } from "@/models/Batch";

export default {
  name: "OpenBatch",
  components: { BatchOrders },
  computed: {
    ...mapState({
      // Opening New Batch
      adminSettings: "adminSettings",
      formNewBatch: "formNewBatch",

      // Waiting for reservations, or orders & payment
      counters: "counters",
      openBatch: "openBatch",
      openBatchWithOrders(state) {
        return new Batch({
          ...state.openBatch.firestoreDoc,
          orders: state.pendingOrders,
        });
      },
      paidOrders(state) {
        return state.pendingOrders.filter((o) => !!o.payment);
      },

      // Waiting to set batch isDone
      latestBatch: "latestBatch",

      // Status Styling
      statusMessage() {
        if (this.allowOpenNewBatch) return "Ready for another batch...";
        else if (this.allowCloseBatch) return "Waiting for reservations...";
        else if (this.allowFinishBatch) return "Waiting for orders...";
        else if (this.allowDoneBatch) return "Waiting to process all orders...";
        else return "";
      },
    }),
    ...mapGetters({
      allowOpenNewBatch: "admin/allowOpenNewBatch",
      allowCloseBatch: "admin/allowCloseBatch",
      allowFinishBatch: "admin/allowFinishBatch",
      allowDoneBatch: "admin/allowDoneBatch",
      productsLength: "productsLength",
    }),
  },
  methods: {
    ...mapActions({
      openNewBatch(dispatch) {
        dispatch("confirm", {
          title: `Opening Batch: ${this.formNewBatch?.name}`,
          message: `Are you sure you want to open a new batch? You will start receiving reservations, but no orders will be taken yet.
            
            Maximum Reservations:
            ${this.formNewBatch?.order_limit} person/s
            
            Maximum Food Items Per Person:
            ${this.formNewBatch?.maxAllowedOrderQty} per person
            `,
          buttonMessage: "Yes",
          callback: () => dispatch("openNewBatch"),
        });
      },

      closeCurrentBatch(dispatch) {
        dispatch("confirm", {
          title: "Close Reservations?",
          message: `Are you sure you want to stop accepting reservations? Only the first ${this.openBatch.order_limit} person/s will be accepted.
          
          Current Reservation Count: ${this.counters?.reservations}/${this.openBatch?.order_limit}`,
          buttonMessage: "Yes",
          callback: () => dispatch("closeCurrentBatch"),
        });
      },

      finalizeBatch(dispatch) {
        dispatch("confirmDanger", {
          title: "Stop Accepting Orders?",
          message: `Are you sure you want to STOP accepting orders? 
          
          ALL ${
            this.openBatchWithOrders.orders.length - this.paidOrders.length
          } UNPAID ORDER/S WILL BE DELETED!
          
          PAID Orders: ${this.paidOrders.length}
          Total Orders: ${this.openBatchWithOrders.orders.length}
          
          If all orders are not yet paid, you can wait for them to pay first.`,
          buttonMessage: "Yes",
          callback: () => dispatch("finalizeBatch"),
        });
      },

      markLatestBatchAsDone(dispatch) {
        dispatch("confirm", {
          title: `Finish Batch ${this.latestBatch?.name}`,
          message: `Are you sure you want to finish this batch? Mark this batch as done when all orders are delivered, or to be able to open another batch.`,
          buttonMessage: "Yes",
          callback: () => dispatch("markLatestBatchAsDone"),
        });
      },
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