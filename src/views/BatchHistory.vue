<template>
  <div class="batch-history">
    <h1 class="text-center mb-5 sm:mb-10">Batch History</h1>

    <!-- a: Loading -->
    <LoadingSpinner v-if="previousBatches == null" class="m-auto" />

    <!-- b: Has Previous Batches -->
    <div v-else>
      <!-- Search: Jump to Date -->
      <form @submit.prevent="jumpToDate()" class="card mb-5 sticky top-2 py-2">
        <label class="p-0">Jump to Date (Started Processing):</label>
        <input type="date" v-model="searchDate" required />

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
      </form>

      <!-- ForEach: Batches (Prioritize Searched Batches, then Previous/History)-->
      <div v-if="searchBatches != null">
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
          {{
            new Date(searchDate).toLocaleString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          }}...
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

        <LoadingSpinner v-if="isLoadingMore" class="m-auto" />

        <button
          v-else-if="dbBatchesCursor != null"
          @click="fetchNextBatches()"
          type="button"
          class="button button-block button-secondary mt-3"
        >
          <span class="fas fa-sync-alt"></span>
          Load More...
        </button>
      </div>

      <!-- c: No Previous Batches -->
      <p v-else class="text-center font-medium">No batch to show...</p>
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
      searchBatches: null,
      isLoadingSearch: false,

      isLoadingMore: false,
    };
  },
  computed: {
    ...mapState({
      previousBatches: "previousBatches",
      dbBatchesCursor: "dbBatchesCursor",
    }),
  },
  methods: {
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
        .where("locked_at", ">=", _startDate)
        .where("locked_at", "<=", _endDate);

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
    },
    resetSearch() {
      this.searchBatches = null;
      this.searchDate = null;
    },
  },
};
</script>

<style>
</style>