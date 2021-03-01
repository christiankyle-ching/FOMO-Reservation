class Order {
  constructor(uid, orderProductsArr) {
    this.id = uid;
    this.orders = {};

    if (orderProductsArr) this.addOrders(orderProductsArr);
  }

  addOrder(orderProduct) {
    this.orders[orderProduct.id] = orderProduct.qty;
  }

  // For Arrays of OrderProduct
  addOrders(orderProductsArr) {
    orderProductsArr.forEach((p) => {
      this.orders[p.id] = p.qty;
    });
  }

  get firestoreDoc() {
    const tmpOrder = {};
    Object.keys(this.orders).forEach((key) => {
      tmpOrder[key] = this.orders[key];
    });

    return {
      ...tmpOrder,
    };
  }
}

class OrderProduct {
  constructor(id, qty) {
    this.id = id;
    this.qty = qty;
  }
}

export { Order, OrderProduct };
