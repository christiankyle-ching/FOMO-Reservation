<template>
  <div class="batch-history">
    <!-- Search: Jump to Date -->
    <form @submit.prevent="jumpToDate()" class="toolbar">
      <div class="container p-5 mx-auto">
        <label class="p-0">Jump to Date (Closed Reservation Date):</label>
        <input
          type="date"
          v-model="searchDate"
          class="input-suppress-invalid"
          required
        />

        <div class="text-right mt-3">
          <button
            @click="resetSearch()"
            type="button"
            class="button button-secondary"
            :disabled="!searchDate"
          >
            Reset
          </button>
          <button
            type="submit"
            class="button button-primary ml-5"
            :disabled="!searchDate"
          >
            Search Date
          </button>
        </div>
      </div>
    </form>

    <div class="app-container pt-0">
      <div class="app-container__header">
        <h1 class="text-center">
          Batch History
          <span v-if="lastSearchedDateString"
            >({{ lastSearchedDateString }})</span
          >
        </h1>
      </div>

      <!-- a: Loading -->
      <LoadingSpinner v-if="!previousBatches" class="m-auto" />

      <!-- b: Has Previous Batches -->
      <div v-else>
        <!-- ForEach: Batches (Prioritize Searched Batches, then Previous/History)-->
        <div v-if="!!searchBatches">
          <LoadingSpinner v-if="isLoadingSearch" class="m-auto" />

          <div v-if="searchBatches?.length">
            <router-link
              :to="{ name: 'Batch', params: { id: batch.id } }"
              v-for="batch of searchBatches"
              :key="batch"
              class="card mb-5"
            >
              <BatchOrderListItem :batch="batch" />
            </router-link>
          </div>

          <!-- c: No Previous Batches -->
          <p v-else class="text-center font-medium">
            No batch found for
            {{ lastSearchedDateString }}...
          </p>
        </div>

        <div v-else-if="previousBatches?.length">
          <router-link
            :to="{ name: 'Batch', params: { id: batch.id } }"
            v-for="batch of previousBatches"
            :key="batch"
            class="card mb-5"
          >
            <BatchOrderListItem :batch="batch" />
          </router-link>

          <!-- Loading More Batches -->
          <LoadingSpinner v-if="isLoadingMore" class="m-auto" />

          <button
            v-else-if="!!dbBatchesCursor"
            @click="fetchNextBatches()"
            type="button"
            class="button button-block button-secondary mt-3"
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

          <p v-else-if="!dbBatchesCursor && !isLoadingMore" class="text-center">
            No more batches to show.
          </p>
        </div>

        <!-- c: No Previous Batches -->
        <p v-else class="text-center font-medium">No batch to show...</p>
      </div>
    </div>

    <div class="fab-container">
      <transition name="fade">
        <button
          type="button"
          class="button-icon button-icon-lg button-rounded button-primary"
          v-if="showBackToTop"
          @click="scrollToTop"
        >
          <svg
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
        </button>
      </transition>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { Batch } from "@/models/Batch";
import LoadingSpinner from "@/components/LoadingSpinner";
import BatchOrderListItem from "@/components/BatchOrderListItem.vue";

export default {
  name: "BatchHistory",
  components: { LoadingSpinner, BatchOrderListItem },
  data() {
    return {
      searchDate: null,
      lastSearchedDate: null,
      searchBatches: null,
      isLoadingSearch: false,

      isLoadingMore: false,
      showBackToTop: false,
    };
  },
  computed: {
    ...mapState(["previousBatches", "dbBatchesCursor"]),
    lastSearchedDateString() {
      return this.lastSearchedDate
        ? new Date(this.lastSearchedDate).toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "";
    },
  },
  methods: {
    // Batches
    fetchNextBatches() {
      this.isLoadingMore = true;

      this.$store
        .dispatch("fetchNextBatches")
        .then()
        .finally(() => (this.isLoadingMore = false));
    },
    async jumpToDate() {
      this.isLoadingSearch = true;

      const _startDate = new Date(this.searchDate);
      const _endDate = new Date(this.searchDate);
      _endDate.setDate(_endDate.getDate() + 1);

      const _dbBatches = this.$store.state.dbBatches
        .where("closed_at", ">=", _startDate)
        .where("closed_at", "<=", _endDate);

      const _batches = await _dbBatches.get();
      const cacheBatches = [];
      _batches.forEach((batch) => {
        cacheBatches.push(
          new Batch({
            id: batch.id,
            ...batch.data(),
          })
        );
      });

      this.isLoadingSearch = false;
      this.searchBatches = cacheBatches;
      this.lastSearchedDate = new Date(this.searchDate);
    },
    resetSearch() {
      this.searchBatches = null;
      this.searchDate = null;
      this.lastSearchedDate = null;
    },

    handleScroll() {
      this.showBackToTop =
        document.documentElement.scrollTop >= window.innerHeight;
    },
    scrollToTop() {
      window.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    },
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);

    try {
      this.$store.dispatch("fetchBatches");
    } catch (err) {
      console.log(err);

      this.$store.dispatch(
        "alertError",
        "Something went wrong in getting previous batches."
      );
    }
  },
  unmounted() {
    window.removeEventListener("scroll", this.handleScroll);
  },
};
</script>

<style>
</style>