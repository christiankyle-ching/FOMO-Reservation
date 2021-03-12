<template>
  <div class="import-products card">
    <h6>Select a templated file:</h6>
    <input
      type="file"
      accept=".csv"
      @change="onFileChange"
      ref="inputTemplate"
    />

    <div v-if="tempProducts.length" class="px-5 mt-5">
      <div v-for="(message, index) in statsMessages" :key="index + message">
        <p class="flex justify-between">
          <span class="font-medium">{{ message.category }}: </span>
          <span>{{ message.count }}</span>
        </p>
      </div>
    </div>

    <div class="flex justify-around mt-5">
      <button
        @click="replaceProducts(tempProducts)"
        class="button button-primary"
        :disabled="!tempProducts.length"
      >
        Replace All in Menu
      </button>
      <button
        @click="appendToProducts(tempProducts)"
        class="button button-primary"
        :disabled="!tempProducts.length"
      >
        Add to Existing Menu
      </button>
    </div>

    <a
      :href="templateUrl"
      class="button button-secondary button-block mt-5"
      download
    >
      <span class="fas fa-download"></span>
      Download Template
    </a>
  </div>
</template>

<script>
import { Product } from "@/models/Product";
import { mapState } from "vuex";

export default {
  data() {
    return {
      search: "",

      tempProducts: [],
      statsMessages: [],

      templateUrl: `${process.env.BASE_URL}pricelist_template.xlsx`,
    };
  },
  computed: {
    ...mapState({
      products: "products",
    }),
  },
  methods: {
    async onFileChange(event) {
      const selectedFile = event.target.files[0];

      if (!selectedFile) {
        this.tempProducts = [];
        this.updateMessage();
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.parseCSVToProducts(e.target.result);
      };
      reader.readAsText(selectedFile);
    },

    parseCSVToProducts(rawData) {
      const fnTrim = (c) => c.trim(); // Trimmer to remove extra spaces
      const fnFilterEmpty = (c) => c !== ""; // To remove extra cells caused by multiple semicolons ;

      // Load per line, then remove headers (3 rows)
      const lines = rawData.split("\n");
      lines.splice(0, 3);

      // Load Each Row as Product Data
      const cacheProducts = [];
      lines.forEach((line) => {
        const cells = line.split(",").map(fnTrim);

        // Discard empty rows
        if (cells.every((c) => c === "")) return;

        const productObj = {
          name: cells[0],
          category: cells[1],
        };

        // Split Variants and Prices
        const variantLabels = cells[3]
          .split(";")
          .map(fnTrim)
          .filter(fnFilterEmpty);
        const variantPrices = cells[4]
          .split(";")
          .map(fnTrim)
          .filter(fnFilterEmpty);

        // Split AddOns and Prices
        const addonsLabels = cells[5]
          .split(";")
          .map(fnTrim)
          .filter(fnFilterEmpty);
        const addonsPrices = cells[6]
          .split(";")
          .map(fnTrim)
          .filter(fnFilterEmpty);

        // Assign Price: Fixed or Variants?
        if (cells[2].length) {
          Object.assign(productObj, { price: cells[2] });
        } else {
          const mappedVariants = variantLabels.map((variantLabel, index) => ({
            name: variantLabel,
            price:
              variantPrices[index] !== undefined ? +variantPrices[index] : 0,
          }));

          Object.assign(productObj, { variants: mappedVariants });
        }

        // Map Addons
        if (cells[5]) {
          const mappedAddons = addonsLabels.map((addonLabel, index) => ({
            name: addonLabel,
            price: addonsPrices[index] !== undefined ? +addonsPrices[index] : 0,
          }));

          Object.assign(productObj, { addons: mappedAddons });
        }

        const product = new Product(productObj);
        cacheProducts.push(product);
      });

      this.tempProducts = cacheProducts;

      // Message about template statistics
      this.updateMessage();
    },

    updateMessage() {
      let statsMessage = [];

      const categories = new Set(this.tempProducts.map((p) => p.category));
      categories.forEach((c) => {
        statsMessage.push({
          category: c,
          count: this.tempProducts.filter((_c) => _c.category == c).length,
        });
      });

      statsMessage.push({ category: "Total", count: this.tempProducts.length });

      this.statsMessages = statsMessage;
    },

    // Actions
    replaceProducts() {
      this.$store.dispatch("replaceProducts", this.tempProducts);
      this.$refs.inputTemplate.value = null;
      this.tempProducts = [];
    },
    appendToProducts() {
      this.$store.dispatch("appendToProducts", this.tempProducts);
      this.$refs.inputTemplate.value = null;
      this.tempProducts = [];
    },
  },
};
</script>

<style>
</style>