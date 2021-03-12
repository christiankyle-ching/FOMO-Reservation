class Order {
  constructor({ uid, oid, name, fbLink, order }) {
    this.uid = uid ?? null;

    this.name = name ?? "";
    this.fbLink = fbLink ?? "";
    this.order = order ?? null;

    let rgxOnlyNums = /\D/g;
    this.oid =
      oid ??
      new Date()
        .toISOString()
        .replaceAll(rgxOnlyNums, "")
        .concat(Math.floor(Math.random() * 100 + 1));
  }

  get firestoreDoc() {
    const firestoreObj = {};

    Object.assign(firestoreObj, this.uid && { uid: this.uid });
    Object.assign(firestoreObj, this.oid && { oid: this.oid });
    Object.assign(firestoreObj, this.name && { name: this.name });
    Object.assign(firestoreObj, this.fbLink && { fbLink: this.fbLink });
    Object.assign(firestoreObj, this.order && { order: this.order });

    return firestoreObj;
  }
}

export { Order };
