import firebase from "@/firebase";
import "firebase/firestore";

class Batch {
  constructor(id, name, created_at, is_active, reserved_users) {
    this.id = id;
    this.name = name;
    this.created_at = created_at || firebase.firestore.Timestamp.now();
    this.is_active = is_active;
    this.reserved_users = reserved_users;
  }

  get dateString() {
    const dateOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour12: "true",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return this.created_at.toDate().toLocaleString("en-US", dateOptions);
  }

  get firestoreDoc() {
    const firestoreObj = {};

    Object.assign(firestoreObj, this.id && { id: this.id });
    Object.assign(firestoreObj, this.name && { id: this.name });
    Object.assign(
      firestoreObj,
      this.created_at && { created_at: this.created_at }
    );
    Object.assign(firestoreObj, this.is_active && { id: this.is_active });
    Object.assign(
      firestoreObj,
      this.reserved_users && { id: this.reserved_users }
    );

    return firestoreObj;
  }
}

export { Batch };
