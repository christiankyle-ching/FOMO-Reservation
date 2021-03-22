<template>
  <div>
    <div ref="receipt">
      <!-- Payment and Order Details -->
      <div class="text-sm sm:text-base mb-3">
        <div class="print-only">
          <h1 class="text-center pb-5">Gringo's</h1>

          <div
            v-if="order.oid && inProcess"
            class="grid grid-cols-1 sm:grid-cols-2"
          >
            <b>Customer: </b>
            <span class="mb-1 sm:mb-0">
              {{ order?.name }}
            </span>

            <b>Contact Number:</b>
            <span class="mb-1 sm:mb-0">{{ order?.phoneNumber }}</span>
          </div>
        </div>

        <div
          v-if="order.oid && inProcess"
          class="grid grid-cols-1 sm:grid-cols-2"
        >
          <b>Status: </b>
          <span class="mb-1 sm:mb-0">
            <span v-if="order.payment" class="text-success font-medium"
              >Paid</span
            >
            <span v-else class="text-danger font-medium">Pending</span>
          </span>

          <b class="font-medium" v-if="!!batch">Batch: </b>
          <span class="mb-1 sm:mb-0" v-if="!!batch"
            >{{ batch?.closedAtString }} ({{ batch?.name }})</span
          >

          <b>Order #: </b>
          <span class="mb-1 sm:mb-0"> {{ order.oid }}</span>
        </div>

        <div v-if="order.payment" class="grid grid-cols-1 sm:grid-cols-2">
          <b>Paid At: </b>
          <span class="mb-1 sm:mb-0"> {{ order.paidAtDateTime }}</span>

          <b>Payment ID: </b>
          <span class="mb-1 sm:mb-0"> {{ order?.payment.id }}</span>

          <b>Amount Paid: </b>
          <span class="mb-1 sm:mb-0">
            {{ order?.paymentAmount.toLocaleString() }} PHP</span
          >
        </div>
      </div>

      <table class="table-auto w-full text-sm sm:text-base">
        <thead>
          <tr class="text-left">
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th v-if="!inProcess"></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(product, index) in order.orderList" :key="product">
            <td>{{ product.name }}</td>
            <td class="text-right">
              {{ product.unit_price.toLocaleString() }} PHP x{{ product.qty }}
            </td>
            <td class="text-right">
              {{ product.total_price.toLocaleString() }} PHP
            </td>
            <td v-if="!inProcess">
              <button
                type="button"
                @click="removeOrder(index)"
                class="button-icon button-icon-sm button-danger m-auto"
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
            </td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <th class="text-left">TOTAL</th>
            <th class="text-right">{{ order.totalQty }} item/s</th>
            <th class="text-right">{{ order.totalPrice }} PHP</th>
            <th v-if="!inProcess"></th>
          </tr>
        </tfoot>
      </table>
    </div>

    <div v-if="order.payment">
      <button
        @click="print()"
        type="button"
        class="button button-block button-secondary mt-3"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <!-- Icon: printer-sm -->
          <path
            fill-rule="evenodd"
            d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
            clip-rule="evenodd"
          />
        </svg>
        Print
      </button>
      <button
        @click="saveAsImage()"
        type="button"
        class="button button-block button-secondary mt-3"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <!-- Icon: save-sm -->
          <path
            d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"
          />
        </svg>
        Save As Image
      </button>
    </div>
  </div>
</template>

<script>
import html2canvas from "html2canvas";
import { ALERT_TYPE } from "@/models/Alert";

export default {
  name: "Receipt",
  props: { order: Object, batch: Object, inProcess: Boolean },
  inheritAttrs: false,

  methods: {
    removeOrder(index) {
      this.order.orderList.splice(index, 1);
    },
    async saveAsImage() {
      try {
        const imageData = await this.generateImageOfReceipt();

        if (imageData === "") throw new Error("noImageData");

        // Download using a.href
        const downloadLink = document.createElement("a");
        downloadLink.href = imageData;
        downloadLink.setAttribute("download", `Order #${this.order.oid}.png`);
        downloadLink.click();

        this.$store.dispatch("alert", {
          message: `Downloaded receipt for Order #${this.order.oid}.`,
          type: ALERT_TYPE.SUCCESS,
        });
      } catch {
        this.$store.dispatch("alert", {
          message: "Something went wrong in saving your image.",
          type: ALERT_TYPE.DANGER,
        });
      }
    },

    async print() {
      try {
        const imageData = await this.generateImageOfReceipt();

        if (imageData === "") throw new Error("noImageData");

        // Open a new Window, Add img with src of imageData, then window.print
        const printWindow = window.open(
          "",
          `${this.$store.state.clientName} - Order #${this.order.oid}`
        );
        printWindow.document.write(`<img src="${imageData}" />`);
        setTimeout(() => {
          printWindow.print();
        }, 250);
      } catch (err) {
        console.error(err);
      }
    },

    async generateImageOfReceipt() {
      // Generate Light Mode for Receipt First
      const _originalDarkMode = !!this.$store.state.darkModeEnabled;
      this.$store.dispatch("toggleDarkMode", false);

      // Clone Receipt
      const receipt = this.$refs.receipt.cloneNode(true);

      // Add padding
      const receiptContainer = document.createElement("div");
      receiptContainer.classList.add("p-5", "print-container");
      receiptContainer.appendChild(receipt);

      // Show print-only elements
      receipt
        .querySelectorAll(".print-only")
        .forEach((e) => e.classList.remove("print-only"));

      // Append to document to be referenced
      document.body.appendChild(receiptContainer);

      window.scrollTo(0, 0); // html2canvas Bug: Image Cropped when window is scrolled
      const options = {};
      let imageData = "";
      try {
        const canvas = await html2canvas(receiptContainer, options);
        imageData = canvas.toDataURL("image/png");
      } catch (err) {
        throw err;
      } finally {
        // Return Dark Mode to Original State
        this.$store.dispatch("toggleDarkMode", _originalDarkMode);

        receiptContainer.remove();
      }

      return imageData;
    },
  },
};
</script>

<style>
</style>