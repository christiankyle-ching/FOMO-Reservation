import firebase from "@/firebase";

class Product {
  constructor(id, name, price, created_at, last_updated) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.created_at = created_at;
    this.last_updated = last_updated;
  }

  get firestoreDoc() {
    const firestoreObj = {
      name: this.name,
      price: +this.price,
      last_updated: firebase.firestore.FieldValue.serverTimestamp(),
    };

    Object.assign(
      firestoreObj,
      this.created_at && { created_at: this.created_at }
    );

    return firestoreObj;
  }

  clone() {
    return new Product(
      this.id,
      this.name,
      this.price,
      this.created_at,
      this.last_updated
    );
  }
}

export { Product };
