import { localeDateTimeOpts, removeUndefined } from "@/utils";

class Order {
  constructor({
    uid,
    oid,
    name,
    phoneNumber,
    email,
    orderList,
    payment,
    isDone,
  }) {
    this.uid = uid ?? null;

    // Generate Random Order ID if there's no existing from DB
    this.oid =
      oid ?? `${new Date().getTime()}${Math.floor(Math.random() * 999) + 100}`;

    this.name = name ?? "";
    this.phoneNumber = phoneNumber ?? "";
    this.email = email ?? "";
    this.orderList = orderList ?? null;
    this.payment = payment ?? null;
    this.isDone = isDone ?? false;
  }

  get firestoreDoc() {
    const firestoreObj = {};

    // Object.assign(firestoreObj, this.uid && { uid: this.uid });
    // Object.assign(firestoreObj, this.oid && { oid: this.oid });
    // Object.assign(firestoreObj, this.name && { name: this.name });
    // Object.assign(firestoreObj, this.email && { email: this.email });
    // Object.assign(
    //   firestoreObj,
    //   this.phoneNumber && { phoneNumber: this.phoneNumber }
    // );
    // Object.assign(firestoreObj, this.payment && { payment: this.payment });
    // Object.assign(firestoreObj, { isDone: this.isDone });
    // Object.assign(
    //   firestoreObj,
    //   this.orderList && { orderList: this.orderList }
    // );

    // return firestoreObj;

    // Filter out undefined and null
    return removeUndefined(this);
  }

  get totalPrice() {
    if (!this.orderList?.length) return 0;

    return (
      this.orderList?.map((o) => o.total_price).reduce((a, c) => a + c) ?? 0
    );
  }

  get totalQty() {
    if (!this.orderList?.length) return 0;

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

  clone() {
    return new Order({ ...this });
  }
}

export { Order };
