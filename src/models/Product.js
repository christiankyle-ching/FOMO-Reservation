class Product {
  constructor({ name, category, price, variants }) {
    this.name = name ?? "";
    this.category = category ?? "";
    this.price = price ?? 0;
    this.variants = variants ?? null; // Array of Maps
  }

  addVariant(_name, _price) {
    this.variants.push({ name: _name, price: _price });
  }

  removeVariant(index) {
    this.variants.splice(index, 1);
  }

  get firestoreDoc() {
    const firestoreObj = {};

    Object.assign(firestoreObj, this.name && { name: this.name });
    Object.assign(firestoreObj, this.category && { category: this.category });
    Object.assign(firestoreObj, this.price && { price: this.price });
    Object.assign(firestoreObj, this.variants && { variants: this.variants });

    console.log(firestoreObj);

    return firestoreObj;
  }
}

export { Product };
