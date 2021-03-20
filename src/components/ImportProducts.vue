<template>
  <div class="import-products">
    <label>Select a templated file:</label>
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
        class="button button-primary button-block mx-2"
        :disabled="!tempProducts.length"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <!-- Icon: Refresh-sm -->
          <path
            fill-rule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clip-rule="evenodd"
          />
        </svg>
        Replace All in Menu
      </button>
      <button
        @click="appendToProducts(tempProducts)"
        class="button button-primary button-block mx-2"
        :disabled="!tempProducts.length"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <!-- Icon: view-grid-add-sm -->
          <path
            d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"
          />
        </svg>
        Add to Existing Menu
      </button>
    </div>

    <a
      :href="templateUrl"
      class="button button-secondary button-block mt-5"
      download
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <!-- Icon: cloud-download-sm -->
        <path
          fill-rule="evenodd"
          d="M2 9.5A3.5 3.5 0 005.5 13H9v2.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 15.586V13h2.5a4.5 4.5 0 10-.616-8.958 4.002 4.002 0 10-7.753 1.977A3.5 3.5 0 002 9.5zm9 3.5H9V8a1 1 0 012 0v5z"
          clip-rule="evenodd"
        />
      </svg>

      Download Template
    </a>
  </div>
</template>

<script>
import { Product } from "@/models/Product";
import { mapState } from "vuex";
import { ALERT_TYPE } from "@/models/Alert";

export default {
  emits: ["close"],
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

      // If no selected file
      if (!selectedFile) {
        this.tempProducts = [];
        this.updateMessage();
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          this.parseCSVToProducts(e.target.result);
        } catch (err) {
          this.$store.dispatch("alert", {
            message: "Invalid template file.",
            type: ALERT_TYPE.DANGER,
          });

          event.target.value = null;
        }
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

    // Message: Stats about Selected Template
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
      this.$emit("close");
    },

    appendToProducts() {
      this.$store.dispatch("appendToProducts", this.tempProducts);
      this.$refs.inputTemplate.value = null;
      this.tempProducts = [];
      this.$emit("close");
    },
  },
};
</script>

<style>
</style>