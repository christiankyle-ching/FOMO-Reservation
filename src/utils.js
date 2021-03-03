import firebase from "@/firebase"
import "firebase/functions"

const localeDateTimeOpts = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour12: "true",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

export { localeDateTimeOpts };
