import "firebase/firestore";
import { localeDateTimeOpts } from "@/utils";
import { Order } from "@/models/Order";
import { AdminSettings } from "@/models/AdminSettings.js";
import { removeUndefined } from "@/utils";

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
    return (
      this.created_at?.toDate().toLocaleString("en-US", localeDateTimeOpts) ??
      ""
    );
  }

  get closedAtString() {
    return (
      this.closed_at?.toDate().toLocaleString("en-US", localeDateTimeOpts) ?? ""
    );
  }

  get lockedAtString() {
    return (
      this.locked_at?.toDate().toLocaleString("en-US", localeDateTimeOpts) ?? ""
    );
  }

  get firestoreDoc() {
    const firestoreDoc = removeUndefined(this);

    delete firestoreDoc.id; // exclude for firestore create/updates
    firestoreDoc.orders = this.orders.map((o) => o.firestoreDoc); // Object to JSON

    return firestoreDoc;
  }

  get totalQty() {
    if (this.orders == null) return 0;

    const paidOrders = this.orders.filter((o) => o.payment);

    if (paidOrders.length <= 0) return 0;

    return paidOrders
      .map((o) => o.orderList)
      .map((order) => order.map((p) => p.qty))
      .map((prices) => prices.reduce(fnReducer))
      .reduce(fnReducer);
  }

  get totalPrice() {
    if (this.orders == null) return 0;

    const paidOrders = this.orders.filter((o) => o.payment);

    if (paidOrders.length <= 0) return 0;

    return paidOrders
      .map((o) => o.orderList)
      .map((order) => order.map((p) => p.total_price))
      .map((prices) => prices.reduce(fnReducer))
      .reduce(fnReducer);
  }

  get totalPriceString() {
    this.totalPrice.toLocaleString() + " PHP";
  }

  clone() {
    return new Batch({ ...this });
  }
}

export { Batch };
