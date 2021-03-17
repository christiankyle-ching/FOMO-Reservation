
<template>
  <div class="products">
    <h2 class="text-center mb-5 sm:mb-10">
      {{ $store.state.clientName }}'s Menu
    </h2>

    <form @submit.prevent="updateProducts" class="my-5">
      <!-- Products ForEach -->
      <div v-if="products != null">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div
            v-for="(product, index) in products"
            :key="'product' + index"
            class="card grid grid-cols-2 gap-5"
          >
            <h4 class="col-span-2">{{ product.name }}</h4>
            <!-- Name & Category -->
            <div class="col-span-1">
              <label>Name: </label>
              <input
                type="text"
                v-model="product.name"
                placeholder="Enter menu item..."
                required
              />
            </div>
            <div class="col-span-1">
              <label>Category: </label>
              <input
                list="product-categories"
                autocomplete=""
                v-model="product.category"
                placeholder="Enter category, or choose one..."
                required
              />

              <datalist id="product-categories">
                <option
                  v-for="category in categories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </option>
              </datalist>
            </div>

            <!-- Price or Variants? -->
            <div v-if="product.variants != null" class="col-span-2">
              <!-- Variants ForEach -->
              <h6>Variants</h6>
              <div
                v-for="(variant, variantIndex) in product.variants"
                :key="'variant' + variantIndex"
                class="grid grid-cols-2 gap-5"
              >
                <div class="col-span-1">
                  <label>Variant Label:</label>
                  <input
                    type="text"
                    v-model="variant.name"
                    placeholder="i.e. 22 oz, Large, Family Size"
                    required
                  />
                </div>

                <div class="col-span-1 flex">
                  <div class="flex-grow">
                    <label>Price:</label>
                    <input
                      type="text"
                      v-model="variant.price"
                      min="0"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    @click="deleteVariant(index, variantIndex)"
                    class="button-icon button-icon-sm button-danger ml-3 mt-auto"
                  >
                    <span class="fas fa-times"></span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                @click="addVariant(index)"
                class="button button-secondary button-block my-3"
              >
                Add Variant
              </button>
            </div>
            <div v-else class="col-span-2">
              <label>Price:</label>
              <input type="number" v-model="product.price" min="0" required />
            </div>

            <!-- Any Additionals -->
            <div class="col-span-2">
              <h6>Add-Ons</h6>
              <div v-if="product.addons">
                <div
                  v-for="(addon, addonIndex) in product.addons"
                  :key="index + product + addon"
                  class="grid grid-cols-2 gap-5"
                >
                  <div class="col-span-1">
                    <label>Add-On Label:</label>
                    <input
                      type="text"
                      v-model="addon.name"
                      placeholder="i.e. Extra Rice, Nata..."
                      required
                    />
                  </div>

                  <div class="col-span-1 flex">
                    <div class="flex-grow">
                      <label>Price:</label>
                      <input
                        type="text"
                        v-model="addon.price"
                        min="0"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      @click="removeAddOn(index, addonIndex)"
                      class="button-icon button-icon-sm button-danger ml-3 mt-auto"
                    >
                      <span class="fas fa-times"></span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                @click="addAddOn(index)"
                class="button button-block button-secondary mt-3"
              >
                Add Add-On
              </button>
            </div>

            <!-- Toggle: Variants -->
            <div class="col-span-1">
              <label
                class="checkbox m-0"
                :for="index + product.name + '-enableVariant'"
              >
                <span
                  >Use Variants? (for example: Serving sizes, 16oz,
                  22oz...)</span
                >

                <input
                  type="checkbox"
                  :id="index + product.name + '-enableVariant'"
                  @change="toggleVariant(index)"
                  :checked="product.variants != null"
                />
              </label>
            </div>

            <!-- Remove Product -->
            <div class="col-span-1 text-right">
              <button
                class="button button-danger"
                type="button"
                @click="removeProduct(index)"
              >
                <span class="fas fa-trash"></span>
                Remove Item
              </button>
            </div>
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
          @click="addProduct()"
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
import { mapActions, mapState } from "vuex";

export default {
  components: {
    ImportProducts,
    LoadingSpinner,
  },
  data() {
    return {
      categories: [],
    };
  },
  computed: {
    ...mapState({
      products: "products",
    }),
  },
  methods: {
    ...mapActions({
      updateProducts: "updateProducts",
    }),
    // Product
    addProduct() {
      this.products.push(new Product({}));
    },
    removeProduct(index) {
      this.products.splice(index, 1);
    },
    // Variants
    addVariant(index) {
      this.products[index].addVariant("", 0);
    },
    deleteVariant(index, variantIndex) {
      this.products[index].removeVariant(variantIndex);
    },
    toggleVariant(index) {
      const product = this.products[index];

      if (product.variants) {
        product._tmpVariants = JSON.parse(JSON.stringify(product.variants)); // temporary save

        product.variants = null;
        product.price = product._tmpPrice ?? 0;
      } else {
        product._tmpPrice = product.price; // temporary save

        product.price = null;
        product.variants = product._tmpVariants ?? [];
      }
    },
    // AddOns
    addAddOn(index) {
      this.products[index].addAddOn("", 0);
    },
    removeAddOn(index, addonsIndex) {
      this.products[index].removeAddOn(addonsIndex);
    },
  },
  watch: {
    products: function () {
      this.categories = new Set(
        this.$store.state.products.map((p) => p.category)
      );
    },
  },
};
</script>

<style>
</style>