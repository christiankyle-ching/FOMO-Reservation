<template>
  <div class="batches card">
    <h2 class="text-center">Batches</h2>

    <div v-for="batch in batches" :key="batch.id" class="mt-5">
      <router-link
        :to="{ name: 'Batch', params: { id: batch.id } }"
        class="float-right"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="icon-md text-gray-600"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      </router-link>

      <div>
        <h5>{{ batch.name }}</h5>
        <p class="italic">{{ batch.dateString }}</p>
      </div>

      <hr class="mt-5 mx-5"/>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "Batches",
  computed: {
    ...mapState({
      batches: "batches",
    }),
  },
};
</script>

<style>
</style>