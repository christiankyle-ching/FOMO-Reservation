class Order {
  constructor(uid, name, order) {
    this.uid = uid;
    this.name = name;
    this.orderProducts = order;
  }

  parseOrderProducts(products) {
    const _order = [];

    Object.keys(this.orderProducts).forEach((id) => {
      const product = products.find((p) => p.id == id);

      _order.push({
        name: product.name,
        price: product.price,
        qty: this.orderProducts[id],
      });
    });

    return _order;
  }

  get firestoreDoc() {
    const doc = {};

    Object.assign(doc, this.uid && { uid: this.uid });
    Object.assign(doc, this.name && { name: this.name });

    return doc;
  }

  resetOrder() {
    Object.keys(this.orderProducts).forEach(
      (key) => (this.orderProducts[key] = 0)
    );
  }

  getOrderProductsDoc(products) {
    return { order: this.parseOrderProducts(products) };
  }
}

export { Order };
