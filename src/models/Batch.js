import "firebase/firestore";
import { localeDateTimeOpts } from "../utils";

const BATCH_STATUS = Object.freeze({
  OPEN: "open",
  CLOSED: "closed",
  PENDING: "pending",
});

class Batch {
  constructor(
    id,
    name,
    created_at,
    closed_at,
    locked_at,
    order_limit,
    orders,
    isDone
  ) {
    this.id = id;
    this.name = name;
    this.created_at = created_at;
    this.closed_at = closed_at;
    this.locked_at = locked_at;
    this.order_limit = order_limit;
    this.orders = orders;
    this.isDone = isDone;
  }

  get createdAtString() {
    return this.created_at.toDate().toLocaleString("en-US", localeDateTimeOpts);
  }

  get closedAtString() {
    return this.closed_at.toDate().toLocaleString("en-US", localeDateTimeOpts);
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

  clone() {
    // TODO: Implement for editing
    return {};
  }
}

export { Batch, BATCH_STATUS };
