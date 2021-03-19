import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js/mobile";

class UserProfile {
  constructor({ uid, fbLink, phoneNumber }) {
    this.uid = uid ?? "";
    this.fbLink = fbLink ?? "";
    this.phoneNumber = phoneNumber ?? "";
  }

  get firestoreDoc() {
    const firestoreObj = {};

    Object.assign(firestoreObj, this.fbLink && { fbLink: this.fbLink });
    Object.assign(
      firestoreObj,
      this.phoneNumber && { phoneNumber: this.formattedPhoneNumber }
    );

    return firestoreObj;
  }

  clone() {
    return new UserProfile({ ...this });
  }

  get isPhoneValid() {
    return isValidPhoneNumber(this.phoneNumber, "PH");
  }

  get formattedPhoneNumber() {
    try {
      return parsePhoneNumber(this.phoneNumber, "PH").formatNational();
    } catch (err) {
      return "";
    }
  }
}

export { UserProfile };
