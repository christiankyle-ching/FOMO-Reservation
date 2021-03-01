<template>
  <div class="products card">
    <div class="flex relative justify-center items-center">
      <h2 class="text-center">Food Menu</h2>

      <button
        @click="startEditing"
        v-if="!isEditing"
        class="text-gray-700 p-2 absolute right-0"
      >
        <!-- Edit Icon -->
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
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      </button>

      <button
        @click="cancelEditing"
        v-else
        class="text-gray-700 p-2 absolute right-0"
      >
        <!-- Cancel Icon -->
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <form ref="productForm" @change="onFormChange">
      <div
        v-for="(product, index) in formProducts"
        :key="product.id"
        :data-pid="product.id"
        class="grid grid-cols-7"
      >
        <div class="col-span-3 p-2">
          <label :for="product.name">Name</label>
          <input
            type="text"
            v-model="product.name"
            :disabled="!isEditing"
            required
          />
        </div>

        <div class="col-span-3 p-2">
          <label :for="product.name">Price</label>
          <input
            type="number"
            v-model="product.price"
            :disabled="!isEditing"
            required
          />
        </div>

        <div class="col-span-1 flex p-2">
          <button
            class="mt-auto mx-auto button button-danger h-10"
            @click.prevent="remove(index)"
            :disabled="!isEditing"
          >
            <!-- Delete Icon -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="icon-sm"
            >
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </form>

    <button
      @click="add"
      class="button icon-button button-secondary button-block mt-3"
      :disabled="!isEditing"
    >
      Add
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="icon-sm mx-2"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <button
      @click="save"
      class="button icon-button button-primary button-block mt-3"
      :disabled="disableSave"
    >
      Save
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="icon-sm mx-2"
      >
        <path
          d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"
        />
      </svg>
    </button>
  </div>
</template>

<script>
import { nextTick } from "vue";
import { mapState } from "vuex";

export default {
  name: "Products",
  data() {
    return {
      isEditing: false,
      disableSave: true,
    };
  },
  watch: {
    isEditing: function (value) {
      this.disableSave = !value;
    },
  },
  computed: {
    ...mapState({
      formProducts: "formProducts",
    }),
  },
  methods: {
    add() {
      this.$store.dispatch("addFormProduct")
      this.onFormChange();
    },
    remove(index) {
      this.$store.dispatch("removeFormProduct", index)
      this.onFormChange();
    },
    startEditing() {
      this.isEditing = true;
    },
    cancelEditing() {
      const isLeaving = confirm("Discard your changes?");

      if (isLeaving) {
        this.isEditing = false;
        this.$store.dispatch("fetchProducts");
      }
    },
    save() {
      this.$store.dispatch("updateProducts");
      this.isEditing = false;
    },
    onFormChange() {
      nextTick(() => {
        const isFormValid =
          this.$refs.productForm.querySelectorAll("input:required:invalid")
            .length <= 0;
        this.disableSave = !isFormValid;
      });
    },
  },
};
</script>

<style>
</style>