<template>
  <div>
    <!-- Order List -->
    <div class="order card">
      <h3 class="text-center">You have been chosen! Please send your order.</h3>

      <!-- Order Quantities -->
      <form v-if="order" @submit.prevent="saveOrder">
        <div class="my-5">
          <Receipt :order="order" />
        </div>

        <button
          type="submit"
          class="button button-block button-primary"
          :disabled="!order.length"
        >
          Send Order
        </button>
      </form>
    </div>

    <!-- Add Order -->
    <div class="card">
      <h3 class="text-center mb-3">Select an item in the menu</h3>
      <form @submit.prevent="addNewOrder">
        <!-- 1: Select Category -->
        <label>Category:</label>
        <select v-model="formCategory">
          <option
            v-for="(category, index) in categories"
            :key="index + category"
            :value="category"
            class="active:ring-yellow-700"
          >
            {{ category }}
          </option>
        </select>

        <!-- 2: Select Product -->
        <div v-if="formCategory">
          <label>Choose a menu item:</label>
          <select v-model="formProduct">
            <option
              v-for="(product, index) in filteredProducts"
              :key="index + product.name"
              :value="product"
            >
              {{ product.name }}
            </option>
          </select>
        </div>

        <!-- 3: If has variants -->
        <div v-if="formProduct.variants">
          <label>Choose a variant (i.e. size):</label>
          <select v-model="formVariant">
            <option
              v-for="(variant, index) in formProduct.variants"
              :key="index + variant.name"
              :value="variant.name"
            >
              {{ variant.name }}
            </option>
          </select>
        </div>

        <!-- 4: Show Prices & Show Add Button -->
        <div v-if="formUnitPrice">
          <!-- Quantity -->
          <label class="block">Quantity</label>
          <div class="input__number">
            <button type="button" @click="decrement()">
              <span class="fas fa-minus"></span>
            </button>
            <input
              type="number"
              min="1"
              placeholder="0"
              v-model="formQty"
              @input="onInputNumber"
            />
            <button type="button" @click="increment()">
              <span class="fas fa-plus"></span>
            </button>
          </div>

          <!-- Prices -->
          <table class="my-5 w-full">
            <thead>
              <tr>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th>Total Price</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>{{ formUnitPrice.toLocaleString() }} PHP</td>
                <td>x {{ formQty }}</td>
                <td class="font-medium">{{ formTotalPrice.toLocaleString() }} PHP</td>
              </tr>
            </tbody>
          </table>

          <button type="submit" class="button button-block button-primary">
            Add to Order
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import Receipt from "@/components/Receipt";

export default {
  name: "Order",
  components: { Receipt },
  data() {
    return {
      order: [],

      // Form: Add Product in Order
      filteredProducts: [],
      formCategory: "",
      formProduct: {},
      formVariant: "",
      formUnitPrice: 0,
      formQty: 0,
      formTotalPrice: 0,
    };
  },
  computed: mapState({
    products: "products",
    categories: (state) => [
      ...new Set(
        state.products.map((p) => (p.category ? p.category : "Uncategorized"))
      ),
    ],
  }),
  methods: {
    // Order Functions
    addNewOrder() {
      const newOrder = {
        name: `${this.formCategory}: ${this.formProduct.name} ${this.formVariant}`,
        unit_price: this.formUnitPrice,
        qty: this.formQty,
        total_price: this.formTotalPrice,
      };

      const existingOrder =
        this.order.find((o) => o.name === newOrder.name) ?? null;

      // If same item is in list, just add
      if (existingOrder) {
        existingOrder.qty += newOrder.qty;
        existingOrder.total_price += newOrder.total_price;
      } else {
        this.order.push(newOrder);
      }

      this.resetNewOrder("all");
    },

    saveOrder() {
      this.$store.dispatch("saveOrder", this.order);
    },

    // Input Functions
    increment() {
      // TODO: Compute remaining available order
      if (true) this.formQty++;
    },
    decrement() {
      if (this.formQty > 1) this.formQty--;
    },

    // Helper/Updater Functions
    updateUnitPrice() {
      // Get Unit Price
      if (this.formProduct.variants && this.formVariant) {
        this.formUnitPrice = this.formProduct.variants.find(
          (v) => v.name == this.formVariant
        ).price;
      } else {
        this.formUnitPrice = this.formProduct.price;
      }

      // Set Total Price based on qty * unit_price
      this.formTotalPrice = this.formUnitPrice * this.formQty;
    },

    resetNewOrder(field) {
      switch (field) {
        case "all":
          this.formCategory = "";
          this.formProduct = {};
          break;
        case "category":
          this.formProduct = {};
          break;
      }

      this.formVariant = "";
      this.formUnitPrice = 0;
      this.formQty = 1;
      this.formTotalPrice = 0;
    },
  },

  watch: {
    formCategory: function () {
      this.resetNewOrder("category");

      // Filter Products
      this.filteredProducts = this.$store.state.products.filter(
        (p) => p.category === this.formCategory
      );
    },
    formVariant: function () {
      this.formQty = 1;

      this.updateUnitPrice();
    },
    formProduct: function () {
      this.resetNewOrder();

      this.updateUnitPrice();
    },
    formQty: function () {
      this.updateUnitPrice();
    },
  },
};
</script>

<style>
</style>