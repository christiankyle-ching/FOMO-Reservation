<template>
  <div class="batch container card">
    <div v-if="batch">
      <!-- Header -->
      <h3>
        <span v-if="isEditing">Editing "{{ batch.name }}" Batch</span>
        <span v-else>New Batch for {{ batch.name }}</span>
      </h3>
      <!-- Created Time -->
      <p>
        <span class="text-gray-700 italic">Created Time:</span>
        {{ batch.dateString }}
      </p>

      <form @submit.prevent="save">
        <label>Title</label>
        <input v-model="batch.name" type="text" required />

        <label class="checkbox flex items-center cursor-pointer select-none">
          <input v-model="batch.is_active" type="checkbox" class="hidden" />

          <span class="checkmark">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </span>

          Allow Reservations Immediately?
        </label>

        <button type="submit" class="button button-primary button-block mt-3">
          Save
        </button>
        <button
          @click.prevent=""
          class="button button-secondary button-block mt-3"
        >
          Cancel
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { Batch } from "@/models/Batch";

export default {
  name: "Batch",
  data() {
    return {
      batch: null,
      isEditing: false,
    };
  },
  methods: {
    log() {
      // TODO: Remove on Prod
    },
    save() {
      this.$store.dispatch("saveBatch", this.batch);
    },
  },
  mounted() {
    const batchId = this.$route.params.id;
    const existingBatch = this.$store.state.batches.find(
      (b) => b.id === batchId
    );

    if (existingBatch !== undefined) {
      console.log("Batch Clone: ", existingBatch.clone());
      // const batchCopy = new Batch(
      //   existingBatch.id,
      //   existingBatch.name,
      //   null,
      //   existingBatch.is_active,
      //   null,
      // );
      this.batch = batchCopy;
      this.isEditing = true;
    } else {
      this.batch = new Batch(null, "", null, false, [], );
    }
  },
};
</script>

<style>
</style>