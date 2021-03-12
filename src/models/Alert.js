class Alert {
  constructor({ message, type, isPermanent }) {
    this.message = message ?? "";
    this.type = type ?? "info";
    this.isPermanent = isPermanent ?? false;
  }

  get className() {
    return `alert-${this.type}`;
  }
}

export { Alert };
