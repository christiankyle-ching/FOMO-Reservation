class Alert {
  constructor({ message, type }) {
    this.message = message ?? "";
    this.type = type ?? "info";
  }

  get className() {
    return `alert-${this.type}`;
  }
}

export { Alert };
