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

  <!-- Toolbar: Stats -->
  <div class="toolbar">
    <div class="container cursor-pointer">
      <div class="toolbar__header" @click="toggleToolbar()">
        <h5>Summary</h5>

        <!-- Toggle: Toolbar -->
        <button
          type="button"
          class="button-icon button-icon-sm button-transparent"
        >
          <svg
            v-if="toolbarExpanded"
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
        <div class="grid grid-cols-2 gap-5 pt-5" v-if="toolbarExpanded">
          <ProductStats :products="products" />
          <!-- Actions -->
          <div>
            <h6 class="pb-3">Actions:</h6>
            <button
              @click="clearProducts()"
              type="button"
              class="button button-danger button-block"
            >
              Clear All Products
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>

  <div class="products container mx-auto p-5 sm:p-10 pb-32">
    <h2 class="text-center mb-5 sm:mb-10">
      {{ $store.state.clientName }}'s Menu
    </h2>

    <!-- Search: Products -->
    <div class="input__search">
      <input
        type="search"
        v-model.trim="searchKey"
        placeholder="Search a product's name or category..."
      />
    </div>

    <form @submit.prevent="updateProducts" class="my-5">
      <!-- Products ForEach -->
      <div v-if="products == null" class="flex m-auto h-32">
        <LoadingSpinner class="m-auto" />
      </div>
      <div v-else-if="!products.length">
        <p class="font-medium text-center px-10 pt-5">
          No Products Yet. Add one using the button below, or import a template.
        </p>
      </div>
      <div v-if="!!products">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <div
            v-for="product in filteredProducts"
            :key="product"
            class="card w-full"
          >
            <ProductItemForm
              :product="product"
              :categories="categories"
              @remove="removeProduct(product)"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="fab-container" v-if="!!products">
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
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <!-- Icon: plus -->
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
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
            <!-- Icon: save-sm -->
            <path
              d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"
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
import ProductStats from "@/components/ProductStats";
import Modal from "@/components/Modal";
import ProductItemForm from "@/components/ProductItemForm.vue";
import { mapActions, mapState } from "vuex";

export default {
  components: {
    ImportProducts,
    LoadingSpinner,
    ProductItemForm,
    Modal,
    ProductStats,
  },
  inheritAttrs: false,
  data() {
    return {
      // Search
      searchKey: "",

      // Modal: Add Product
      isAdding: false,
      formNewProduct: new Product({}),
      categories: new Set(),

      // Modal: Use Template
      isUsingTemplate: false,

      // Toolbar
      toolbarExpanded: false,

      // Categories
      loadedCategories: false,
    };
  },
  computed: {
    ...mapState({
      products: "products",
      filteredProducts(state) {
        return state.products?.filter(
          (o) =>
            o.name.toLowerCase().includes(this.searchKey) ||
            o.category.toLowerCase().includes(this.searchKey)
        );
      },
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
      clearProducts: "clearProducts",
    }),

    // Product
    showAddModal() {
      this.formNewProduct = new Product({});
      this.isAdding = true;
    },
    closeAddModal() {
      this.isAdding = false;
      this.formNewProduct = new Product({});
    },
    addProduct() {
      this.products.push(this.formNewProduct);

      this.isAdding = false;
      this.formNewProduct = new Product({});
    },
    removeProduct(product) {
      const index = this.products.indexOf(product);

      if (index > -1) this.products.splice(index, 1);
    },

    // Template
    showTemplateModal() {
      this.isUsingTemplate = true;
    },
    closeTemplateModal() {
      this.isUsingTemplate = false;
    },

    // Toolbar
    toggleToolbar() {
      this.toolbarExpanded = !this.toolbarExpanded;
    },
  },
};
</script>

<style>
</style>