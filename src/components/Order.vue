<template>
  <div>
    <!-- Order List -->
    <div class="order card">
      <h3 class="text-center">You have been chosen! Please send your order.</h3>

      <!-- Order Quantities -->
      <form v-if="order" @submit.prevent="saveOrder()">
        <div class="mt-5 mb-3">
          <Receipt :order="order" :batch="openBatch" isOrdering />
        </div>

        <button
          type="submit"
          class="button button-block button-primary"
          :disabled="!order.orderList.length"
        >
          Send Order
        </button>
      </form>
    </div>

    <!-- Add Order -->
    <div class="card mt-10 mb-20">
      <h3 class="text-center mb-3">Select an item in the menu</h3>
      <form v-if="orderRemainingAllowed" @submit.prevent="addNewOrder">
        <!-- 1: Select Category -->
        <label>Category:</label>
        <select v-model="formCategory">
          <option
            v-for="category in categories"
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>

        <!-- 2: Select Product -->
        <div v-if="formCategory">
          <label>Choose a menu item:</label>
          <select v-model="formProduct">
            <option
              v-for="product in filteredProducts"
              :key="product"
              :value="product"
            >
              {{ product.name }}
            </option>
          </select>
        </div>

        <!-- 3: If has variants -->
        <div v-if="formProduct.variants?.length">
          <label>Choose a variant (i.e. size):</label>
          <select v-model="formVariant">
            <option
              v-for="variant in formProduct.variants"
              :key="variant"
              :value="variant.name"
            >
              {{ variant.name }}
            </option>
          </select>
        </div>

        <!-- 4: Show Prices, AddOns & Show Add To Order Button -->
        <div v-if="formUnitPrice">
          <!-- Quantity -->
          <label class="block">Quantity</label>
          <div class="input__number">
            <button type="button" @click="decrement()">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <!-- Icon: minus-sm -->
                <path
                  fill-rule="evenodd"
                  d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <input
              type="number"
              :min="orderRemainingAllowed == 0 ? 0 : 1"
              :max="orderRemainingAllowed"
              placeholder="0"
              v-model.number="formQty"
            />
            <button type="button" @click="increment()">
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
          </div>

          <!-- Add Ons -->
          <div v-if="formProduct.addons">
            <label>Add-Ons:</label>
            <div v-for="addon in formProduct.addons" :key="addon">
              <label class="checkbox">
                <input type="checkbox" v-model="addon.selected" />
                <span>
                  {{ addon.name }} -
                  {{ addon.price.toLocaleString() }} PHP</span
                >
              </label>
            </div>
          </div>

          <!-- Prices -->
          <table class="my-5 w-full">
            <thead>
              <tr>
                <th>Unit Price</th>
                <th>Add-Ons</th>
                <th>Quantity</th>
                <th>Total Price</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>{{ formUnitPrice.toLocaleString() }} PHP</td>
                <td>{{ formAddOns.toLocaleString() }} PHP</td>
                <td>x{{ formQty }}</td>
                <td class="font-medium">
                  {{ formTotalPrice.toLocaleString() }} PHP
                </td>
              </tr>
            </tbody>
          </table>

          <button type="submit" class="button button-block button-primary">
            Add to Order
          </button>
        </div>
      </form>
      <p v-else class="text-center my-5">
        You reached the maximum allowed number of order in the menu ({{
          openBatch.maxAllowedOrderQty
        }}
        items).
        <br />
        Please remove some from your order to add more.
      </p>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Receipt from "@/components/Receipt";
import { Order } from "@/models/Order";

export default {
  name: "Order",
  components: { Receipt },
  data() {
    return {
      order: new Order({ orderList: [] }),

      // Form: Add Product in Order
      filteredProducts: [],
      formCategory: "",
      formProduct: {},
      formVariant: "",
      formUnitPrice: 0,
      formQty: 0,
      formAddOns: 0,
      formTotalPrice: 0,
    };
  },
  computed: {
    ...mapState({
      products: "products",
      openBatch: "openBatch",
      categories: (state) => [
        ...new Set(
          state.products.map((p) => (p.category ? p.category : "Uncategorized"))
        ),
      ],
    }),

    selectedAddOns() {
      return this.formProduct.addons
        ? this.formProduct.addons.filter((a) => a.selected)
        : [];
    },
    // Counters
    orderRemainingAllowed() {
      return this.openBatch?.maxAllowedOrderQty - this.order.totalQty;
    },
  },
  methods: {
    // Order Functions
    addNewOrder() {
      const newOrder = {
        name: `${this.formCategory}: ${this.formProduct.name} ${this.formVariant}`,
        unit_price: this.formUnitPrice + this.formAddOns,
        qty: this.formQty,
        total_price: this.formTotalPrice,
      };

      // Append Add-Ons
      if (this.selectedAddOns.length)
        newOrder.name += ` w/ ${this.selectedAddOns
          .map((a) => a.name)
          .sort()
          .join(", ")}`;

      const existingOrder =
        this.order.orderList.find((o) => o.name === newOrder.name) ?? null;

      // If same item is in list, just add
      if (existingOrder) {
        existingOrder.qty += newOrder.qty;
        existingOrder.total_price += newOrder.total_price;
      } else {
        this.order.orderList.push(newOrder);
      }

      this.resetNewOrder("all");
    },

    saveOrder() {
      this.$store.dispatch("confirm", {
        title: "Send Order",
        message:
          "Are you sure you want to send this order? Please review your order before submitting. You CANNOT edit this after submitting it.",
        buttonMessage: "Send",
        callback: () => {
          this.$store.dispatch("saveOrder", this.order.orderList);

          // Remove query params for payment
          this.$router.replace(this.$route.path);
        },
      });
    },

    // Input Functions
    increment() {
      if (this.formQty < this.orderRemainingAllowed) this.formQty++;
    },
    decrement() {
      if (this.formQty > 1) this.formQty--;
    },

    // Helper/Updater Functions
    updateUnitPrice() {
      // Compute Add-Ons
      let addonsPrice = 0;

      if (this.formProduct.addons) {
        if (this.selectedAddOns.length)
          addonsPrice = this.selectedAddOns
            .map((a) => +a.price)
            .reduce((a, c) => a + c);
      }

      // Get Unit Price with Add-Ons
      if (this.formProduct.variants && this.formVariant) {
        this.formUnitPrice = +this.formProduct.variants.find(
          (v) => v.name == this.formVariant
        ).price;
      } else {
        this.formUnitPrice = this.formProduct.price;
      }

      // Set Total Price based on Qty
      this.formTotalPrice = (this.formUnitPrice + addonsPrice) * this.formQty;
      this.formAddOns = addonsPrice;
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
      this.formAddOns = 0;
      this.formTotalPrice = 0;

      this.clearSelectedAddOns();
    },

    clearSelectedAddOns() {
      if (this.formProduct.addons) {
        this.formProduct.addons.forEach((a) => (a.selected = false));
      }
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
      this.clearSelectedAddOns();
    },
    formProduct: function () {
      if (this.formProduct.name) this.resetNewOrder();

      this.updateUnitPrice();
    },
    formQty: function () {
      this.updateUnitPrice();
    },
    selectedAddOns: {
      handler() {
        this.updateUnitPrice();
      },
      deep: true,
    },
  },
  mounted() {
    this.$store.dispatch("fetchProducts");
  },
};
</script>

<style>
</style>