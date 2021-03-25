<template>
  <div class="app-container">
    <!-- Search -->
    <form @submit.prevent="search()" class="card">
      <input
        type="search"
        v-model.trim="searchTerm"
        placeholder="Search an Order #, Batch, or ordered food"
      />
      <div class="text-right mt-3">
        <button
          type="button"
          class="button button-secondary"
          @click="resetSearch()"
          :disabled="!lastSearchTerm"
        >
          Reset
        </button>
        <button
          type="submit"
          class="button button-primary ml-3"
          :disabled="!searchTerm"
        >
          Search
        </button>
      </div>
    </form>

    <h1 class="text-center my-5">
      <span v-if="!!lastSearchTerm"
        >Search Results for "{{ lastSearchTerm }}"</span
      >
      <span v-else>Past Orders</span>
    </h1>

    <div v-if="!!pastPaidOrders">
      <!-- ForEach: Past Paid Order -->
      <div class="card" v-for="order in searchedOrders" :key="order">
        <div
          @click="order._collapsed = !order._collapsed"
          class="flex justify-between items-center cursor-pointer"
        >
          <div>
            <h5>Order #{{ order.oid }} ({{ order.totalPriceString }})</h5>
            <small>Paid At: {{ order.paidAtDateTime }}</small>
          </div>

          <!-- Toggle: Collapse -->
          <button type="button" class="button-icon button-icon-md">
            <svg
              v-if="order._collapsed"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <!-- Icon: chevron-up-sm -->
              <path
                fill-rule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <!-- Icon: chevron-down-sm -->
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <transition name="fade">
          <div v-show="order._collapsed" class="mt-3">
            <Receipt :order="order" />
          </div>
        </transition>
      </div>

      <p v-if="!searchedOrders.length && !!lastSearchTerm" class="text-center">
        No results for that search.
      </p>

      <!-- Load More -->
      <div class="mt-5">
        <LoadingSpinner v-if="isLoadingMore" class="m-auto" />
        <button
          v-if="!!dbPaidOrdersCursor"
          @click="fetchMore()"
          type="button"
          class="button button-block button-secondary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <!-- Icon: refresh-sm -->
            <path
              fill-rule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clip-rule="evenodd"
            />
          </svg>
          Load More...
        </button>
        <p
          v-else-if="!dbPaidOrdersCursor && !isLoadingMore && !lastSearchTerm"
          class="text-center"
        >
          No more orders to show.
        </p>
      </div>
    </div>

    <div v-else>
      <LoadingSpinner class="my-5 mx-auto" />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import Receipt from "@/components/Receipt.vue";

export default {
  name: "PaidOrders",
  components: { LoadingSpinner, Receipt },
  data() {
    return {
      searchTerm: "",
      lastSearchTerm: "",
      isLoadingMore: false,
      searchedOrders: [],
    };
  },
  computed: {
    ...mapState(["pastPaidOrders", "dbPaidOrdersCursor"]),
  },
  methods: {
    fetchMore() {
      this.isLoadingMore = true;

      try {
        this.$store.dispatch("fetchNextPastOrders");
      } catch (err) {
        console.error(err);

        dispatch("alertError", "Something went wrong in loading more orders.");
      } finally {
        this.isLoadingMore = false;
      }
    },

    search() {
      console.log(this.searchTerm);
      this.searchedOrders = this.pastPaidOrders.filter((o) => {
        return (
          o.oid.toString().includes(this.searchTerm) ||
          o.batch?.name?.toLowerCase().includes(this.searchTerm) ||
          o.orderList.map((p) => p.name.toLowerCase()).includes(this.searchTerm)
        );
      });

      this.lastSearchTerm = this.searchTerm;
    },

    resetSearch() {
      this.searchTerm = "";
      this.lastSearchTerm = "";
      this.searchedOrders = this.pastPaidOrders;
    },
  },
  async mounted() {
    try {
      await this.$store.dispatch("fetchPastOrders");
      this.searchedOrders = this.pastPaidOrders;
    } catch (err) {
      console.error(err);

      this.$store.dispatch(
        "alertError",
        "Something went wrong in getting past orders."
      );
    }
  },
};
</script>

<style>
</style>