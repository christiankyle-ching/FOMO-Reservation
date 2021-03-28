import { dateToString, removeUndefined } from "@/utils";

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
    batchDetails,
  }) {
    this.uid = uid ?? null;

    // Generate Random Order ID if there's no existing from DB
    this.oid = oid ?? Math.floor(Math.random() * Math.pow(10, 15));

    this.name = name ?? "";
    this.phoneNumber = phoneNumber ?? "";
    this.email = email ?? "";
    this.orderList = orderList ?? null;
    this.payment = payment ?? null;
    this.isDone = isDone ?? false;
    this.batchDetails = batchDetails ?? null;
  }

  get firestoreDoc() {
    const firestoreDoc = removeUndefined(this);

    return firestoreDoc;
  }

  get totalPrice() {
    if (!this.orderList?.length) return 0;

    return (
      this.orderList?.map((o) => o.total_price).reduce((a, c) => a + c) ?? 0
    );
  }

  get totalPriceString() {
    return this.totalPrice.toLocaleString() + " PHP";
  }

  get totalQty() {
    if (!this.orderList?.length) return 0;

    return this.orderList?.map((o) => o.qty).reduce((a, c) => a + c) ?? 0;
  }

  get paymentAmount() {
    return this.payment?.amount / 100;
  }

  get paidAtDateTime() {
    return dateToString(new Date(this.payment.paid_at * 1000));
  }

  clone() {
    return new Order({ ...this });
  }
}

export { Order };
