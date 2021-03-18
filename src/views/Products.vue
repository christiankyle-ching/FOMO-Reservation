
<template>
  <!-- Modal: Add Product -->
  <transition name="fade">
    <Modal v-if="isAdding" @close="closeAddModal">
      <template v-slot:header>
        <h3>Add a Food</h3>
      </template>
      <template v-slot:content>
        <ProductItemForm :product="formNewProduct" :categories="categories" isAdding />
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
    <Modal v-if="isUsingTemplate" @close="closeTemplateModal">
      <template v-slot:header><h3>Use a Template</h3></template>
      <template v-slot:content>
        <ImportProducts />
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
            class="card"
          >
            <ProductItemForm
              :product="product"
              :categories="categories"
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
          <span class="fas fa-upload"></span>
        </button>
        <button
          @click="showAddModal()"
          type="button"
          class="button-icon button-icon-lg button-rounded button-secondary"
        >
          <span class="fas fa-plus"></span>
        </button>
        <button
          type="submit"
          class="button-icon button-icon-lg button-rounded button-primary"
        >
          <span class="fas fa-save"></span>
        </button>
      </div>
    </form>

    <!-- Use Template CSV -->
    <div id="import-template">
      <ImportProducts />
    </div>
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

      // Modal: Use Template
      isUsingTemplate: false,
    };
  },
  computed: {
    ...mapState({
      products: "products",
      categories(state) {
        return new Set(state.products.map((p) => p.category));
      },
    }),
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
  watch: {},
};
</script>

<style>

</style>