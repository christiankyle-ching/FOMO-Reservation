import { removeUndefined } from "@/utils";

class AdminSettings {
  constructor({ order_limit, maxAllowedOrderQty }) {
    this.order_limit = order_limit ?? 20; // Safety default to prevent null values
    this.maxAllowedOrderQty = maxAllowedOrderQty ?? 8; // Safety default to prevent null values
  }

  // Input: For order_limit
  incrementOrderLimit() {
    this.order_limit++;
  }

  decrementOrderLimit() {
    if (this.order_limit > 1) this.order_limit--;
  }

  // Input: Max Allowed Order Qty
  incrementMaxAllowed() {
    this.maxAllowedOrderQty++;
  }

  decrementMaxAllowed() {
    if (this.maxAllowedOrderQty > 1) this.maxAllowedOrderQty--;
  }

  get firestoreDoc() {
    // const firestoreObj = {};

    // Object.assign(
    //   firestoreObj,
    //   this.order_limit && { order_limit: this.order_limit }
    // );
    // Object.assign(
    //   firestoreObj,
    //   this.maxAllowedOrderQty && { maxAllowedOrderQty: this.maxAllowedOrderQty }
    // );

    // return firestoreObj;

    return removeUndefined(this);
  }

  clone() {
    return new AdminSettings({ ...this });
  }
}

export { AdminSettings };
