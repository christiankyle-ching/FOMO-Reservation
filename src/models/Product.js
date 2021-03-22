import { removeUndefined } from "@/utils";

class Product {
  constructor({ name, category, price, variants, addons }) {
    this.name = name ?? "";
    this.category = category ?? "";
    this.price = price !== undefined ? +price : 0;
    this.variants = variants ?? null; // Array of Maps
    this.addons = addons ?? null; // Array of Maps
  }

  addVariant(_name, _price) {
    if (this.variants == null) this.variants = [];

    this.variants.push({ name: _name, price: +_price });
  }

  removeVariant(index) {
    this.variants.splice(index, 1);
  }

  addAddOn(_name, _price) {
    if (this.addons == null) this.addons = [];

    this.addons.push({ name: _name, price: +_price });
  }

  removeAddOn(index) {
    this.addons.splice(index, 1);
  }

  get firestoreDoc() {
    return removeUndefined(this);
  }

  clone() {
    return new Product({ ...this });
  }
}

export { Product };
