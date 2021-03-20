<template>
  <div>
    <!-- Header -->
    <div
      class="flex items-center justify-between cursor-pointer"
      v-if="!isAdding"
      @click="toggleCollapse()"
    >
      <h4>{{ count }}: {{ product.category }} | {{ product.name }}</h4>

      <!-- Collapse Button -->
      <button type="button" class="button-icon button-icon-md">
        <div v-if="collapsed">
          <span class="fas fa-chevron-up"></span>
        </div>
        <div v-else>
          <span class="fas fa-chevron-down"></span>
        </div>
      </button>
    </div>

    <transition name="fade" v-show="collapsed">
      <div class="grid grid-cols-2 gap-5">
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
                <input type="text" v-model="variant.price" min="0" required />
              </div>
              <button
                type="button"
                @click="deleteVariant(variantIndex)"
                class="button-icon button-icon-sm button-danger ml-3 mb-1 mt-auto"
              >
                <span class="fas fa-times"></span>
              </button>
            </div>
          </div>

          <button
            type="button"
            @click="addVariant()"
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
              :key="addon"
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
                  <input type="text" v-model="addon.price" min="0" required />
                </div>
                <button
                  type="button"
                  @click="removeAddOn(addonIndex)"
                  class="button-icon button-icon-sm button-danger ml-3 mb-1 mt-auto"
                >
                  <span class="fas fa-times"></span>
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            @click="addAddOn()"
            class="button button-block button-secondary mt-3"
          >
            Add Add-On
          </button>
        </div>

        <!-- Toggle: Variants -->
        <div class="col-span-1">
          <label class="checkbox m-0" :for="product.name + '-enableVariant'">
            <span
              >Use Variants? (for example: Serving sizes, 16oz, 22oz...)</span
            >

            <input
              type="checkbox"
              :id="product.name + '-enableVariant'"
              @change="toggleVariant()"
              :checked="product.variants != null"
            />
          </label>
        </div>

        <!-- Remove Product -->
        <div class="col-span-1 text-right" v-if="!isAdding">
          <button
            class="button button-danger"
            type="button"
            @click="$emit('remove')"
          >
            <span class="fas fa-trash"></span>
            Remove Item
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: { product: Object, categories: Set, isAdding: Boolean, count: Number },
  emits: ["remove"],
  inheritAttrs: false,
  data() {
    return {
      collapsed: false,
    };
  },
  methods: {
    // Variants
    addVariant() {
      this.product.addVariant("", 0);
    },
    deleteVariant(variantIndex) {
      this.product.removeVariant(variantIndex);
    },
    toggleVariant() {
      const product = this.product;

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
    addAddOn() {
      this.product.addAddOn("", 0);
    },
    removeAddOn(addonsIndex) {
      this.product.removeAddOn(addonsIndex);
    },

    // Toggle: collapsed
    toggleCollapse() {
      this.collapsed = !this.collapsed;
    },
  },
  mounted() {
    this.collapsed = this.isAdding;
  },
};
</script>

<style>
</style>