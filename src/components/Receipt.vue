<template>
  <div>
    <div ref="receipt">
      <!-- Payment and Order Details -->
      <div class="text-sm sm:text-base mb-3">
        <div
          v-if="order.oid && inProcess"
          class="grid grid-cols-1 sm:grid-cols-2"
        >
          <span class="font-medium">Status: </span>
          <span class="mb-1 sm:mb-0">
            <span v-if="order.payment" class="text-success font-medium"
              >Paid</span
            >
            <span v-else class="text-darkDanger font-medium">Pending</span>
          </span>

          <span class="font-medium" v-if="batch != null">Batch: </span>
          <span class="mb-1 sm:mb-0" v-if="batch != null"
            >{{ batch?.closedAtString }} ({{ batch?.name }})</span
          >

          <span class="font-medium">Order #: </span>
          <span class="mb-1 sm:mb-0"> {{ order.oid }}</span>
        </div>

        <div v-if="order.payment" class="grid grid-cols-1 sm:grid-cols-2">
          <span class="font-medium">Paid At: </span>
          <span class="mb-1 sm:mb-0"> {{ order.paidAtDateTime }}</span>

          <span class="font-medium">Payment ID: </span>
          <span class="mb-1 sm:mb-0"> {{ order?.payment.id }}</span>

          <span class="font-medium">Amount Paid: </span>
          <span class="mb-1 sm:mb-0">
            {{ order?.paymentAmount.toLocaleString() }} PHP</span
          >
        </div>
      </div>

      <table class="table-auto w-full text-sm sm:text-base">
        <thead>
          <tr class="text-left">
            <th class="w-full">Item</th>
            <th></th>
            <th>Price</th>
            <th v-if="!inProcess"></th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(product, index) in order.orderList"
            :key="index + product.name"
          >
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
                <span class="fas fa-times"></span>
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
        <span class="fas fa-print"></span>
        Print
      </button>
      <button
        @click="saveAsImage()"
        type="button"
        class="button button-block button-secondary mt-3"
      >
        <span class="fas fa-file-image"></span>
        Save As Image
      </button>
    </div>
  </div>
</template>

<script>
import html2canvas from "html2canvas";
import { ALERT_TYPE } from "../models/Alert";

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
        this.$store.dispatch("alert", {
          message: "Something went wrong in printing.",
          type: ALERT_TYPE.DANGER,
        });
      }
    },

    async generateImageOfReceipt() {
      // Generate Light Mode for Receipt First
      const _originalDarkMode = !!this.$store.state.darkModeEnabled;
      this.$store.dispatch("toggleDarkMode", false);

      const receiptContainer = document.createElement("div");
      receiptContainer.classList.add("p-5", "print-container");
      const receipt = this.$refs.receipt.cloneNode(true);
      receiptContainer.appendChild(receipt);
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