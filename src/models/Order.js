import { localeDateTimeOpts } from "@/utils";

class Order {
  constructor({ uid, oid, name, email, fbLink, orderList, payment, isDone }) {
    const rgxOnlyNums = /\D/g;

    this.uid = uid ?? null;

    // Generate Random Order ID if there's no existing from DB
    this.oid =
      oid ??
      new Date()
        .toISOString()
        .replaceAll(rgxOnlyNums, "")
        .concat(Math.floor(Math.random() * 999) + 100);

    this.name = name ?? "";
    this.email = email ?? "";
    this.fbLink = fbLink ?? "";
    this.orderList = orderList ?? null;
    this.payment = payment ?? null;
    this.isDone = isDone ?? false;
  }

  get firestoreDoc() {
    const firestoreObj = {};

    Object.assign(firestoreObj, this.uid && { uid: this.uid });
    Object.assign(firestoreObj, this.oid && { oid: this.oid });
    Object.assign(firestoreObj, this.name && { name: this.name });
    Object.assign(firestoreObj, this.email && { email: this.email });
    Object.assign(firestoreObj, this.fbLink && { fbLink: this.fbLink });
    Object.assign(firestoreObj, this.payment && { payment: this.payment });
    Object.assign(firestoreObj, { isDone: this.isDone });
    Object.assign(
      firestoreObj,
      this.orderList && { orderList: this.orderList }
    );

    return firestoreObj;
  }

  get totalPrice() {
    if (!this.orderList.length) return 0;

    return (
      this.orderList?.map((o) => o.total_price).reduce((a, c) => a + c) ?? 0
    );
  }

  get totalQty() {
    if (!this.orderList.length) return 0;

    return this.orderList?.map((o) => o.qty).reduce((a, c) => a + c) ?? 0;
  }

  get paymentAmount() {
    return this.payment?.amount / 100;
  }

  get paidAtDateTime() {
    return new Date(this.payment.paid_at * 1000).toLocaleString(
      "en-US",
      localeDateTimeOpts
    );
  }
}

export { Order };
