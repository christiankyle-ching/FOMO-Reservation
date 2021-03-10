class Product {
  constructor({ name, category, price, variants, addons }) {
    this.name = name ?? "";
    this.category = category ?? "";
    this.price = +price ?? 0;
    this.variants = variants ?? []; // Array of Maps
    this.addons = addons ?? []; // Array of Maps
  }

  addVariant(_name, _price) {
    this.variants.push({ name: _name, price: _price });
  }

  removeVariant(index) {
    this.variants.splice(index, 1);
  }

  addAddOn(_name, _price) {
    this.addons.push({ name: _name, price: _price });
  }

  removeAddOn(index) {
    this.addons.splice(index, 1);
  }

  get firestoreDoc() {
    const firestoreObj = {};

    Object.assign(firestoreObj, this.name && { name: this.name });
    Object.assign(firestoreObj, this.category && { category: this.category });
    Object.assign(firestoreObj, this.price && { price: this.price });
    Object.assign(firestoreObj, this.variants && { variants: this.variants });
    Object.assign(firestoreObj, this.addons && { addons: this.addons });

    console.log(firestoreObj);

    return firestoreObj;
  }
}

export { Product };
