<template>
  <div class="import-products">
    <label class="p-0">Select a templated file:</label>
    <input
      type="file"
      accept=".csv"
      @change="onFileChange"
      ref="inputTemplate"
    />

    <!-- Stats Messages -->
    <ProductStats :products="tempProducts" class="mt-5" />

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
        Replace All
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
        Add to Existing
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
import { mapActions, mapState } from "vuex";
import { Product } from "@/models/Product";
import ProductStats from "@/components/ProductStats";

export default {
  emits: ["close"],
  components: { ProductStats },
  data() {
    return {
      tempProducts: [],
      templateUrl: `${process.env.BASE_URL}pricelist_template.xlsx`,
    };
  },
  computed: {
    ...mapState(["products"]),
  },
  methods: {
    async onFileChange(event) {
      const selectedFile = event.target.files[0];

      // If no selected file
      if (!selectedFile) {
        this.tempProducts = [];
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          this.parseCSVToProducts(e.target.result);
        } catch (err) {
          console.error(err);

          this.$store.dispatch("alertError", "Invalid template file.");

          // Reset selected template input
          event.target.value = null;
        }
      };
      reader.readAsText(selectedFile);
    },

    parseCSVToProducts(rawData) {
      const fnTrim = (c) => c.trim(); // Trimmer to remove extra spaces
      const fnFilterEmpty = (c) => c !== ""; // To remove extra cells caused by multiple semicolons ;
      const reMatchNotNumbers = /[^0-9]/g;

      // Load per line, then remove headers (3 rows). Also remove blank lines (one at the end)
      const lines = rawData.split("\n").filter((line) => line !== "");
      lines.splice(0, 3);

      // Load Each Row as Product Data
      const cacheProducts = [];

      lines.forEach((line) => {
        const cells = line.split(",");

        // Validate: Has 7 Columns
        if (cells.length !== 7) {
          throw "invalid_template";
        }

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

        // Validate: Are prices numbers?
        if (variantPrices.some((price) => reMatchNotNumbers.test(price))) {
          throw "invalid_template";
        }

        // Split AddOns and Prices
        const addonsLabels = cells[5]
          .split(";")
          .map(fnTrim)
          .filter(fnFilterEmpty);
        const addonsPrices = cells[6]
          .split(";")
          .map(fnTrim)
          .filter(fnFilterEmpty);

        // Validate: Are prices numbers?
        if (addonsPrices.some((price) => reMatchNotNumbers.test(price))) {
          throw "invalid_template";
        }

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
    },

    // Actions
    ...mapActions({
      replaceProducts(dispatch) {
        dispatch("confirmDanger", {
          title: "Replace All in Menu?",
          message:
            "Are you sure you want to replace all items in the menu with this template?",
          buttonMessage: "Yes",
          callback: () => {
            dispatch("replaceProducts", this.tempProducts);

            // Reset Inputs
            this.$refs.inputTemplate.value = null;
            this.tempProducts = [];
            this.$emit("close");
          },
        });
      },

      appendToProducts(dispatch) {
        dispatch("confirmDanger", {
          title: "Add to Existing in Menu?",
          message:
            "Are you sure you want to add all items in this template to existing products in the menu?",
          buttonMessage: "Yes",
          callback: () => {
            dispatch("appendToProducts", this.tempProducts);

            // Reset Inputs
            this.$refs.inputTemplate.value = null;
            this.tempProducts = [];
            this.$emit("close");
          },
        });
      },
    }),
  },
};
</script>

<style>
</style>