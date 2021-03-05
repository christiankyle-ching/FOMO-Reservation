class Order {
  constructor(uid, name, email, phone, order) {
    this.id = uid;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.orderProducts = order;
  }

  parseOrderProducts(products) {
    const _order = [];

    Object.keys(this.orderProducts).forEach((id) => {
      const product = products.find(p => p.id == id)

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

    Object.assign(doc, this.name && { name: this.name });
    Object.assign(doc, this.email && { email: this.email });
    Object.assign(doc, this.phone && { name: this.phone });

    return doc;
  }

  getOrderProductsDoc(products) {
    return { order: this.parseOrderProducts(products) };
  }
}

export { Order };
