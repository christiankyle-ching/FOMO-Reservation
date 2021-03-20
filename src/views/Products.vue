
<template>
  <!-- Modal: Add Product -->
  <transition name="fade">
    <Modal v-if="isAdding" @close="closeAddModal()">
      <template v-slot:header>
        <h3>Add a Food</h3>
      </template>
      <template v-slot:content>
        <ProductItemForm
          :product="formNewProduct"
          :categories="categories"
          isAdding
        />
      </template>
      <template v-slot:buttons>
        <button
          class="button button-primary m-2"
          @click="addProduct()"
          :disabled="!formNewProduct?.name"
        >
          Add
        </button>
      </template>
    </Modal>
  </transition>

  <!-- Modal: Use Template -->
  <transition name="fade">
    <Modal v-if="isUsingTemplate" @close="closeTemplateModal()">
      <template v-slot:header><h3>Use a Template</h3></template>
      <template v-slot:content>
        <ImportProducts @close="closeTemplateModal()" />
      </template>
      <template v-slot:buttons> </template>
    </Modal>
  </transition>

  <div class="products container mx-auto p-5 sm:p-10 p-5 sm:p-10">
    <h2 class="text-center mb-5 sm:mb-10">
      {{ $store.state.clientName }}'s Menu
    </h2>

    <form @submit.prevent="updateProducts" class="my-5">
      <!-- Products ForEach -->
      <div v-if="products != null">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <div
            v-for="(product, index) in products"
            :key="'product' + index"
            class="card w-full"
          >
            <ProductItemForm
              :product="product"
              :categories="categories"
              :count="index + 1"
              @remove="removeProduct(index)"
            />
          </div>
        </div>
      </div>
      <div v-else-if="products == null" class="flex m-auto h-32">
        <LoadingSpinner class="m-auto" />
      </div>
      <div v-else-if="!products?.length">
        <p class="font-medium text-center">
          No Products Yet. Add one using the button below, or import a template.
        </p>
      </div>

      <!-- Actions -->
      <div class="fab-container" v-if="products != null">
        <button
          @click="showTemplateModal()"
          type="button"
          class="button-icon button-icon-lg button-rounded button-secondary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <!-- Icon: cloud-upload-sm -->
            <path
              d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"
            />
            <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
          </svg>
        </button>
        <button
          @click="showAddModal()"
          type="button"
          class="button-icon button-icon-lg button-rounded button-secondary"
        >
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
        <button
          type="submit"
          class="button-icon button-icon-lg button-rounded button-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <!-- Icon: flag-sm -->
            <path
              fill-rule="evenodd"
              d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { Product } from "@/models/Product";
import ImportProducts from "@/components/ImportProducts";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/Modal";
import ProductItemForm from "@/components/ProductItemForm.vue";
import { mapActions, mapState } from "vuex";

export default {
  components: {
    ImportProducts,
    LoadingSpinner,
    ProductItemForm,
    Modal,
  },
  inheritAttrs: false,
  data() {
    return {
      // Modal: Add Product
      isAdding: false,
      formNewProduct: new Product({}),
      categories: new Set(),

      // Modal: Use Template
      isUsingTemplate: false,

      // Categories
      loadedCategories: false,
    };
  },
  computed: {
    ...mapState({
      products: "products",
    }),
  },
  watch: {
    products() {
      if (!this.loadedCategories) {
        this.categories = new Set(this.products?.map((p) => p.category));
      }
    },
  },
  methods: {
    ...mapActions({
      updateProducts: "updateProducts",
    }),
    // Product
    showAddModal() {
      this.formNewProduct = new Product({});
      this.isAdding = true;
    },
    addProduct() {
      this.products.push(this.formNewProduct);

      this.isAdding = false;
      this.formNewProduct = new Product({});
    },
    removeProduct(index) {
      this.products.splice(index, 1);
    },
    closeAddModal() {
      this.isAdding = false;
      this.formNewProduct = new Product({});
    },

    // Template
    showTemplateModal() {
      this.isUsingTemplate = true;
    },
    closeTemplateModal() {
      this.isUsingTemplate = false;
    },
  },
};
</script>

<style>
</style>