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
        product_name: product.name,
        unit_price: product.price,
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

  get orderDoc() {}
}

class FinalOrder {
  constructor(username, fb_link, order, products_list) {
    this.username = username;
    this.fb_link = fb_link;
    this.order = [];

    // For Reference Only
    this.products_list = products_list;

    // Order is Map, Converts to Array
    this.addOrders(order);
  }

  addOrders(_order) {
    Object.keys(_order).forEach((id) => {
      const productDetails = this.products_list.find((p) => p.id == id);
      this.order.push({
        product_name: productDetails.name,
        price: productDetails.price,
        qty: _order[id],
      });
    });
  }
}

export { Order, FinalOrder };
