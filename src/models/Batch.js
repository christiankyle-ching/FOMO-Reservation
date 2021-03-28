import { Order } from "@/models/Order";
import { AdminSettings } from "@/models/AdminSettings.js";
import { removeUndefined } from "@/utils";
import { firebaseDateToString } from "../utils";

const DEFAULT_ADMIN_SETTINGS = new AdminSettings({});

const fnReducer = (a, c) => a + c;

class Batch {
  constructor({
    id,
    name,
    created_at,
    closed_at,
    locked_at,
    order_limit,
    maxAllowedOrderQty,
    orders,
    isDone,
  }) {
    this.id = id ?? null;
    this.name = name ?? null;
    this.created_at = created_at ?? null;
    this.closed_at = closed_at ?? null;
    this.locked_at = locked_at ?? null;
    this.order_limit = order_limit ?? null;
    this.maxAllowedOrderQty =
      maxAllowedOrderQty ?? DEFAULT_ADMIN_SETTINGS.maxAllowedOrderQty;
    this.orders = orders?.map((o) => new Order({ ...o })) ?? null;
    this.isDone = isDone ?? false;
  }

  get createdAtString() {
    return firebaseDateToString(this.created_at);
  }

  get closedAtString() {
    return firebaseDateToString(this.closed_at);
  }

  get lockedAtString() {
    return firebaseDateToString(this.locked_at);
  }

  get firestoreDoc() {
    const cloneObj = this.clone();
    cloneObj.orders?.map((o) => o.firestoreDoc);

    const firestoreDoc = removeUndefined(cloneObj);
    delete firestoreDoc.id; // exclude for firestore create/updates

    return firestoreDoc;
  }

  get totalQty() {
    if (!this.orders) return 0;

    const paidOrders = this.orders.filter((o) => o.payment);

    if (paidOrders.length <= 0) return 0;

    return paidOrders
      .map((o) => o.orderList)
      .map((order) => order.map((p) => p.qty))
      .map((prices) => prices.reduce(fnReducer))
      .reduce(fnReducer);
  }

  get totalPrice() {
    if (!this.orders) return 0;

    const paidOrders = this.orders.filter((o) => o.payment);

    if (paidOrders.length <= 0) return 0;

    return paidOrders
      .map((o) => o.orderList)
      .map((order) => order.map((p) => p.total_price))
      .map((prices) => prices.reduce(fnReducer))
      .reduce(fnReducer);
  }

  get totalPriceString() {
    return this.totalPrice.toLocaleString() + " PHP";
  }

  clone() {
    return new Batch({ ...this });
  }
}

export { Batch };
