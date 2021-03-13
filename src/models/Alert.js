const ALERT_TYPE = Object.freeze({
  INFO: "info",
  SUCCESS: "success",
  DANGER: "danger",
});

class Alert {
  constructor({ message, type, isPermanent }) {
    this.message = message ?? "";
    this.type = type ?? ALERT_TYPE.INFO;
    this.isPermanent = isPermanent ?? false;
  }

  get className() {
    return `alert-${this.type}`;
  }
}

export { Alert, ALERT_TYPE };
