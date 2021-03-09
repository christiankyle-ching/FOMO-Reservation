class Order {
  constructor({ uid, name, fbLink, order }) {
    this.uid = uid ?? null;
    this.name = name ?? "";
    this.fbLink = fbLink ?? "";
    this.order = order ?? null;
  }

  get firestoreDoc() {
    const firestoreObj = {};

    Object.assign(firestoreObj, this.uid && { uid: this.uid });
    Object.assign(firestoreObj, this.name && { name: this.name });
    Object.assign(firestoreObj, this.fbLink && { fbLink: this.fbLink });
    Object.assign(firestoreObj, this.order && { order: this.order });

    return firestoreObj;
  }
}

export { Order };
