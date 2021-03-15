import "firebase/firestore";
import { localeDateTimeOpts } from "../utils";

const BATCH_STATUS = Object.freeze({
  OPEN: "open",
  CLOSED: "closed",
  PENDING: "pending",
});

const fnReducer = (a, c) => a + c;

class Batch {
  constructor({
    id,
    name,
    created_at,
    closed_at,
    locked_at,
    order_limit,
    orders,
    isDone,
  }) {
    this.id = id ?? null;
    this.name = name ?? null;
    this.created_at = created_at ?? null;
    this.closed_at = closed_at ?? null;
    this.locked_at = locked_at ?? null;
    this.order_limit = order_limit ?? null; // TODO: Get default in DB Options
    this.orders = orders ?? null;
    this.isDone = isDone ?? false;
  }

  get createdAtString() {
    return this.created_at.toDate().toLocaleString("en-US", localeDateTimeOpts);
  }

  get closedAtString() {
    return this.closed_at.toDate().toLocaleString("en-US", localeDateTimeOpts);
  }

  get lockedAtString() {
    return this.locked_at.toDate().toLocaleString("en-US", localeDateTimeOpts);
  }

  get firestoreDoc() {
    const firestoreObj = {};

    Object.assign(firestoreObj, this.name && { name: this.name });
    Object.assign(
      firestoreObj,
      this.created_at && { created_at: this.created_at }
    );
    Object.assign(
      firestoreObj,
      this.closed_at && { closed_at: this.closed_at }
    );
    Object.assign(
      firestoreObj,
      this.locked_at && { locked_at: this.locked_at }
    );
    Object.assign(
      firestoreObj,
      this.order_limit && { order_limit: this.order_limit }
    );
    Object.assign(firestoreObj, this.orders && { orders: this.orders });
    Object.assign(firestoreObj, { isDone: this.isDone });

    return firestoreObj;
  }

  get totalQty() {
    const paidOrders = this.orders.filter((o) => o.payment);

    if (paidOrders.length <= 0) return 0;

    return paidOrders
      .map((o) => o.orderList)
      .map((order) => order.map((p) => p.qty))
      .map((prices) => prices.reduce(fnReducer))
      .reduce(fnReducer);
  }

  get totalPrice() {
    const paidOrders = this.orders.filter((o) => o.payment);

    if (paidOrders.length <= 0) return 0;

    return paidOrders
      .map((o) => o.orderList)
      .map((order) => order.map((p) => p.total_price))
      .map((prices) => prices.reduce(fnReducer))
      .reduce(fnReducer);
  }

  clone() {
    // TODO: Implement for editing
    return {};
  }
}

export { Batch, BATCH_STATUS };
