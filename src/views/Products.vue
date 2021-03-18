
<template>
  <!-- Modal: Add Product -->
  <transition name="fade">
    <Modal v-if="isAdding" @close="closeAddModal">
      <template v-slot:header>
        <h3>Add a Food</h3>
      </template>
      <template v-slot:content>
        <ProductItemForm :product="formNewProduct" :categories="categories" />
      </template>
      <template v-slot:buttons>
        <button class="button button-primary m-2" @click="addProduct()">
          Add
        </button>
      </template>
    </Modal>
  </transition>

  <div class="products p-5 sm:p-10">
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
      <div v-else-if="!products?.length" class="flex m-auto h-32">
        <LoadingSpinner class="m-auto" />
      </div>
      <div v-else>
        <p class="font-medium text-center">
          No Products Yet. Add one using the button below, or import a template.
        </p>
      </div>

      <!-- Actions -->
      <div class="fab-container">
        <button
          @click="showAddModal()"
          type="button"
          class="button-icon button-icon-lg button-rounded button-primary"
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
      isAdding: false,
      formNewProduct: new Product({}),
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
      this.isAdding = true;
      this.formNewProduct = new Product({});
    },

    addProduct() {
      this.products.push(this.formNewProduct);

      this.formNewProduct = new Product({});
      this.isAdding = false;
    },

    removeProduct(index) {
      this.products.splice(index, 1);
    },

    // Modal
    closeAddModal() {
      this.isAdding = false;
      this.formNewProduct = new Product({});
    },
  },
  watch: {},
};
</script>

<style>
</style>