<template>
  <div>
    <!-- Header -->
    <div
      class="flex items-center justify-between cursor-pointer"
      v-if="!isAdding"
      @click="toggleCollapse()"
    >
      <div>
        <h4>{{ product.name }}</h4>
        <p>{{ product.category }}</p>
      </div>

      <!-- Collapse Button -->
      <button type="button" class="button-icon button-icon-md">
        <div v-if="collapsed">
          <svg
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
        </div>
        <div v-else>
          <svg
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
        <div v-if="!!product.variants" class="col-span-2">
          <!-- Variants ForEach -->
          <h6>Variants</h6>
          <div
            v-for="(variant, variantIndex) in product.variants"
            :key="variant"
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <!-- Icon: x-sm -->
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
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
          <input
            type="number"
            v-model.number="product.price"
            min="0"
            required
          />
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <!-- Icon: x-sm -->
                    <path
                      fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
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
              :checked="!!product.variants"
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <!-- Icon: trash-sm -->
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            Remove Item
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: { product: Object, categories: Set, isAdding: Boolean },
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